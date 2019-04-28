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

  resortComplete = false

  @Prop({
    default: {
      itemsPerPage: 8,
      paginationSpread: 3,
      currentPage: 1,
      search: ''
    }
  })
  config
  @Prop(Object) head
  @Prop(Array) body

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
  }

  /**
   * Whenever the body data changes we call updateListConstraints, as well as trigger a reorder.
   * Since this method changes the body data, it would normally call itself recursively, leading to an infinite loop.
   * In order to avoid this, we check whether the old and new body data are identical first. If yes, we also check
   * whether the first and last items within the old and new body data are the same. If yes, we assume that the data
   * has not been changed and as such no update is necessary.
   *
   * @returns void
   */
  @Watch('body', {
    immediate: true,
    deep: true
  })
  onBodyChanged() {
    if (!this.resortComplete) {
      this.attemptResort()
    } else {
      this.resortComplete = false
    }

    this.updateListConstraints()
  }

  /**
   * This method checks whether the active column has changed and if so uses it to reorder the entries.
   *
   * @returns void
   */
  attemptResort(head, old) {
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

    this.resortComplete = true
  }

  /**
   * Changes the order of the entries.
   *
   * @param {string} column
   * @param {string} dir
   * @returns boolean
   */
  resort(column, dir) {
    function compare(a, b) {
      if (a[column] < b[column]) return dir === 'asc' ? -1 : 1
      if (a[column] > b[column]) return dir === 'asc' ? 1 : -1
      return 0
    }

    this.body.sort(compare)
  }

  /**
   * The updateListConstraints method loops over all entries in the body and determines which of them should
   * be displayed.
   *
   * @returns void
   */
  updateListConstraints() {
    // Cache the indexes of all filtered entries
    const filteredEntries = []

    // Cache the indexes of all active (visible) entries
    let activeEntries = []

    // We loop through all entries and cache the index of the ones that pass our filters.
    for (let i = 0, len = this.body.length; i < len; i++) {
      // Check if this entry meets the filter requirements
      if (this.filterDataset(this.body[i])) {
        filteredEntries.push(i)
      }
    }

    // Pick the entries that we want to display as determined by pagination constraints.
    if (this.config.itemsPerPage) {
      // Determine the starting index for active entries.
      const minIndex = (this.config.currentPage - 1) * this.config.itemsPerPage

      // We loop through all entries and cache the index of the ones that should be displayed.
      for (let i = 0, len = filteredEntries.length; i < len; i++) {
        if (i >= minIndex) activeEntries.push(i)
        if (activeEntries.length >= this.config.itemsPerPage) break
      }
    } else {
      // If the itemsPerPage option isn't set, we assume that all filtered entries should be shown.
      activeEntries = filteredEntries
    }

    this.entriesData = {
      all: this.body,
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

    return this.config.strictSearch
      ? value.includes(this.config.search)
      : value.toLowerCase().includes(this.config.search.toLowerCase())
  }

  /**
   * Runs the provided dataset through all active filters.
   *
   * @param {object} item
   * @returns boolean
   */
  filterDataset(item) {
    if (!item) return false

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
