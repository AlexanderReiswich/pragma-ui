<template>
  <div>
    <div
      class="pui-all-loaded center small muted push-up-l"
      v-text="lConfig.allEntriesLoadedText"
      v-if="showingAllItems && showAllLoadedText"
    />
    <button
      :class="lConfig.showAllItemsButtonClass"
      v-text="lConfig.showAllText"
      v-if="lConfig.showAllItemsButton && !showingAllItems"
      @click.prevent="showAll"
    />
    <ul v-if="pageCount && !showingAllItems" class="pui-pagination push-up push-right">
      <li v-for="p in structure" :key="p.index" :class="{ active: p.isActive }">
        <button
          v-text="p.isNumber ? p.index : '...'"
          :class="p.isActive ? lConfig.paginationBtnActiveClass : lConfig.paginationBtnClass"
          @click.prevent="p.isNumber ? goToPage(p.index) : expandPagination"
        />
      </li>
      <!--<template v-if="lConfig.paginationSpread && lConfig.paginationSpread < pageCount">
        <li v-if="lConfig.currentPage > 2">
          <button :class="lConfig.paginationBtnClass" v-text="1" @click.prevent="goToPage(1)" />
        </li>
        <li v-if="lConfig.currentPage > 3">
          <button
            :class="lConfig.paginationBtnClass"
            v-text="'...'"
            @click.prevent="expandPagination"
          />
        </li>
        <li v-if="hasPrev">
          <button
            :class="lConfig.paginationBtnClass"
            v-text="lConfig.currentPage - 1"
            @click.prevent="goToPage(lConfig.currentPage - 1)"
          />
        </li>
        <li class="active">
          <button
            :class="lConfig.paginationBtnActiveClass"
            v-text="lConfig.currentPage"
            @click.prevent="goToPage(lConfig.currentPage)"
          />
        </li>
        <li v-if="hasNext">
          <button
            :class="lConfig.paginationBtnClass"
            v-text="lConfig.currentPage + 1"
            @click.prevent="goToPage(lConfig.currentPage + 1)"
          />
        </li>
        <li v-if="pageCount > lConfig.paginationSpread && lConfig.currentPage < pageCount - 2">
          <button
            :class="lConfig.paginationBtnClass"
            v-text="'...'"
            @click.prevent="expandPagination"
          />
        </li>
        <li v-if="pageCount > lConfig.paginationSpread + 1 && lConfig.currentPage < pageCount - 1">
          <button
            :class="lConfig.paginationBtnClass"
            v-text="pageCount"
            @click.prevent="goToPage(pageCount)"
          />
        </li>
      </template>
      <template v-else>
        <li
          v-for="index in pageCount"
          :key="index"
          :class="{ active: index === lConfig.currentPage }"
        >
          <button
            v-text="index"
            :class="
              index === lConfig.currentPage
                ? lConfig.paginationBtnActiveClass
                : lConfig.paginationBtnClass
            "
            @click.prevent="goToPage(index)"
          />
        </li>
      </template>-->
    </ul>
  </div>
</template>

<script>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

@Component
export default class PaginationPartial extends Vue {
  @Prop(Object) config
  @Prop(Object) entriesData
  @Prop({ type: Boolean, default: true }) showAllLoadedText

  defaultConfig = {
    itemsPerPage: 8,
    paginationSpread: 1,
    currentPage: 1,
    showAllItemsButton: true,
    search: '',
    showAllItemsButtonClass: 'float-right btn light-bg narrow rounded-s muted bold small',
    paginationBtnClass:
      'pui-pagination-btn pad-v-s pad-h-l size-l subtle secondary light-bg rounded-s primary-on-hover tween',
    paginationBtnActiveClass:
      'pui-pagination-btn-active pad-v-s pad-h-l size-l primary-bg white rounded-s',
    showAllText: 'Show all entries',
    allEntriesLoadedText: '— All entries loaded —'
  }
  lConfig = {}

  /**
   * Update the local instance of the configuration whenever the config prop is changed.
   *
   * @returns void
   */
  @Watch('config', {
    immediate: true,
    deep: true
  })
  onConfigChanged(config) {
    // Merge the default config with the config prop
    this.lConfig = { ...this.defaultConfig, ...config }
  }

  get pageCount() {
    if (this.lConfig.itemsPerPage && this.entriesData) {
      return Math.ceil(this.entriesData.filteredEntries.length / this.lConfig.itemsPerPage)
    }
    return 1
  }

  get hasPrev() {
    return this.lConfig.currentPage > 1
  }

  get hasNext() {
    return this.lConfig.currentPage < this.pageCount
  }

  get showingAllItems() {
    if (this.pageCount === 1 && this.entriesData) {
      if (this.entriesData.activeEntries.length >= this.entriesData.all.length) return true
      return !this.lConfig.itemsPerPage
    }
    return false
  }

  /**
   * Build the pagination structure.
   *
   * @returns array
   */
  get structure() {
    const res = []
    const first = 1
    const last = this.pageCount
    const current = this.lConfig.currentPage
    const spread = this.lConfig.paginationSpread

    function pushIndex(index, isActive = false, isNumber = true) {
      res.push({ index, isActive, isNumber })
    }

    // First, we determine the visible page indexes to the left of the active index (based on the spread size)
    const left = []

    if (current !== first) {
      for (let i = current - 1; i >= current - spread; i--) {
        if (i >= first) {
          left.push(i)
        }
      }

      // Ensure that the discovered indexes are sorted properly
      left.sort((a, b) => a - b)

      // Since the first page index should always be visible, we push it to the results straight away,
      // assuming that its not already included in the indexes to the left of center
      if (!left.includes(first)) {
        pushIndex(first)

        // If the lowest index on the left is higher than the first index plus one, we display a padded block
        if (left[0] > first + 1) pushIndex('leftPad', false, false)
      }

      // Add all the indexes on the left to the results
      if (left.length) {
        left.forEach(index => {
          pushIndex(index)
        })
      }
    }

    // We know that the next index must be the currently selected one
    pushIndex(current, true)

    // Next, we determine the indexes to the right of the current page (based on the spread size)
    const right = []

    if (current !== last) {
      for (let i = current + 1; i <= current + spread; i++) {
        if (i <= last) {
          right.push(i)
        }
      }

      if (right.length) {
        right.forEach(index => {
          pushIndex(index)
        })
      }

      // Since the last page index should always be visible, we push it to the results at the end,
      // assuming that its not already included in the indexes to the right of center
      if (!right.includes(last)) {
        // If the last index is larger than the current index plus spread, we display a padded block
        if (last > current + spread) pushIndex('rightPad', false, false)

        pushIndex(last)
      }
    }

    return res
  }

  expandPagination() {
    this.$emit('configUpdated', { ...this.lConfig, paginationSpread: 0 })
  }

  showAll() {
    this.$emit('configUpdated', { ...this.lConfig, itemsPerPage: 0 })
  }

  goToPage(page) {
    this.$emit('configUpdated', { ...this.lConfig, currentPage: page })
  }
}
</script>

<style lang="stylus" scoped>
ul.pui-pagination
  list-style: none

ul.pui-pagination li
  display inline-block
  margin 0 10px 10px 0

ul.pui-pagination li button
  display inline-block
  line-height 1

ul.pui-pagination li.active button
  cursor default
</style>
