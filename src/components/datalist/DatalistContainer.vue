<template>
  <div>
    <slot
      :columns="head"
      :setSearch="setSearch"
      :filterEntry="filterEntry"
      :sortBy="sortBy"
      :entriesData="entriesData"
    />
  </div>
</template>

<script>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import clone from 'lodash.clonedeep'

@Component
export default class DatalistContainer extends Vue {
  entriesData = {
    all: [],
    filteredEntries: [],
    activeEntries: []
  }

  isResorting = false

  localBodyData = []

  @Prop({
    default: {
      itemsPerPage: 8,
      paginationSpread: 1,
      currentPage: 1,
      search: ''
    }
  })
  config

  @Prop(Object) head

  @Prop(Array) body

  @Prop(Function) customFilter

  /**
   * Whenever the config data changes, we initiate the updateListConstraints method so that only the desired entries
   * get displayed.
   *
   * @returns void
   */
  @Watch('config', {
    immediate: true,
    deep: true
  })
  onConfigChanged() {
    this.updateListConstraints()
  }

  /**
   * We observe the head array for changes and initiate a resort whenever the active state or the
   * sort direction changes.
   *
   * This approach allows us to automatically react to changes in the head configuration.
   *
   * @param {array} head
   * @param {array} old
   * @returns void
   */
  @Watch('head', {
    immediate: true,
    deep: true
  })
  onHeadChanged(head, old) {
    this.attemptResort(head, old)
    this.updateListConstraints()
    this.isResorting = false
  }

  /**
   * Whenever the body data changes we call updateListConstraints and trigger a reorder.
   * Since this method changes the body data, it would normally call itself recursively, leading to an infinite loop.
   * In order to avoid this, we first check if a resort is currently taking place.
   *
   * @returns void
   */
  @Watch('body', {
    immediate: true,
    deep: true
  })
  onBodyChanged(data) {
    if (!this.isResorting) {
      this.localBodyData = clone(data)
      this.attemptResort()
      this.updateListConstraints()
      this.isResorting = false
    }
  }

  /**
   * This method checks whether the active column has changed and if so uses it to reorder the entries.
   *
   * @returns void
   */
  attemptResort(head, old) {
    this.isResorting = true

    if (!head) head = this.head

    for (const [name, column] of Object.entries(head)) {
      // First, let's find the active column
      if (column.active) {
        // Assume that a resort is unnecessary before continuing
        let initResort = false

        // Check whether the active column has been changed
        if (!(old && old[name].active)) {
          initResort = true
        } else {
          // If the column didn't change...
          // ...check whether the sort direction of the active column changed
          initResort = column.sortDir !== old[name].sortDir
        }

        // If a resort has been determined to be necessary, initiate it
        if (initResort) {
          this.resort(name, column.sortDir)
        }
      }
    }
  }

  /**
   * Changes the order of the entries based on localized comparison.
   *
   * @param {string} column
   * @param {string} dir
   * @returns boolean
   */
  resort(column, dir) {
    const type = this.head[column].type

    function compare(a, b) {
      if (type === 'string' && typeof a[column] === 'string' && typeof b[column] === 'string') {
        return dir === 'asc'
          ? a[column].localeCompare(b[column])
          : b[column].localeCompare(a[column])
      }

      if (type === 'number' || type === 'date') {
        if (a[column] < b[column]) return dir === 'asc' ? -1 : 1
        if (a[column] > b[column]) return dir === 'asc' ? 1 : -1
        return 0
      }
    }

    this.localBodyData.sort(compare)
  }

  /**
   * The updateListConstraints method loops over all entries in the body and determines which of them should
   * be displayed.
   *
   * @returns void
   */
  updateListConstraints() {
    const c = this.config

    // Cache the indexes of all filtered entries
    const filteredEntries = []

    // Cache the indexes of all active (visible) entries
    let activeEntries = []

    // We loop through all entries and cache the index of the ones that pass our filters.
    for (let i = 0, len = this.localBodyData.length; i < len; i++) {
      // Check if this entry meets the filter requirements
      if (this.filterDataset(this.localBodyData[i])) {
        filteredEntries.push(i)
      }
    }

    // Pick the entries that we want to display as determined by pagination constraints.
    if (c.itemsPerPage) {
      // Determine the starting index for active entries.
      const minIndex = (c.currentPage - 1) * c.itemsPerPage

      // We loop through all entries and cache the index of the ones that should be displayed.
      for (let i = 0, len = filteredEntries.length; i < len; i++) {
        if (i >= minIndex) activeEntries.push(filteredEntries[i])
        if (activeEntries.length >= c.itemsPerPage) break
      }
    } else {
      // If the itemsPerPage option isn't set, we assume that all filtered entries should be shown.
      activeEntries = filteredEntries
    }

    // The pagination is affected when entries are filtered out, which is why here we ensure that the last
    // possible pagination index is limited by the total pagination count.
    if (c.currentPage !== 1) {
      const pageCount = c.itemsPerPage ? Math.ceil(filteredEntries.length / c.itemsPerPage) : 1

      if (c.currentPage > pageCount) {
        this.$emit('configUpdated', { ...this.config, currentPage: pageCount })
      }
    }

    this.entriesData = {
      all: this.localBodyData,
      filteredEntries,
      activeEntries
    }
  }

  /**
   * Set the local search value from event data.
   *
   * @param {Event} e
   * @returns void
   */
  setSearch(e) {
    this.$emit('configUpdated', { ...this.config, search: e.target.value })
  }

  /**
   * Checks whether the provided column value passes the search query.
   * Upper- and lowercase differences are ignored by default, but this can be changed by setting strictSearch
   * to true from within the config object.
   *
   * @param {string} value
   * @returns boolean
   */
  doesSearchMatch(value) {
    if (!this.config.search) return true

    const val = '' + value

    return this.config.strictSearch
      ? val.includes(this.config.search)
      : val.toLowerCase().includes(this.config.search.toLowerCase())
  }

  /**
   * Runs the provided dataset through all active filters.
   *
   * @param {object} item
   * @returns boolean
   */
  filterDataset(item) {
    if (!item) return false

    if (this.customFilter) {
      const check = this.customFilter(item)

      if (!check) return false
    }

    for (const [name, column] of Object.entries(this.head)) {
      if (column.searchable) {
        if (item[name] && this.doesSearchMatch(item[name])) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Checks whether a particular entry is within the array of active entries in order to decide whether to
   * display it or not.
   *
   * @param {number} index
   * @returns boolean
   */
  filterEntry(index) {
    return this.entriesData.activeEntries.includes(index)
  }

  /**
   * Set the column by which the entries should be ordered.
   *
   * @param {number} index
   * @returns void
   */
  sortBy(index) {
    const newHeadData = clone(this.head)

    // If this column is already active...
    if (this.head[index].active) {
      // ...then simply invert the sort direction
      newHeadData[index].sortDir = this.head[index].sortDir === 'asc' ? 'desc' : 'asc'
    } else {
      // Otherwise, deactivate the active column first...
      for (const k of Object.keys(this.head)) {
        if (this.head[k].active) newHeadData[k].active = false
      }
      // ...and then activate the selected column
      newHeadData[index].active = true
    }

    // Finally, emit an event with the new head data as payload, so that it can be updated by the parent component
    this.$emit('headUpdated', newHeadData)
  }
}
</script>
