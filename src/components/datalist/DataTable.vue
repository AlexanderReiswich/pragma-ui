<template>
  <datalist-container
    :head="head"
    :body="body"
    :config="lConfig"
    @headUpdated="saveHeadData"
    @configUpdated="updateConfig"
  >
    <template slot-scope="{ columns, entriesData, setSearch, filterEntry, sortBy }">
      <div v-if="loading" class="center push-h-auto push-v-xl">
        <div class="spinner-3xl" />
      </div>

      <template v-if="!loading">
        <label
          class="pui-label block muted small bold push-down-xs"
          for="data-list"
          v-text="lConfig.searchLabelText"
        />
        <input
          id="data-list"
          class="narrow"
          type="text"
          :placeholder="lConfig.searchPlaceholderText"
          @input="setSearch"
          @keydown.enter="setSearch"
        />
        <div class="pui-datatable-container">
          <table class="push-up">
            <thead>
              <tr>
                <th v-for="(column, key) in columns" :key="key">
                  <sort-arrow-partial
                    :class="{ 'align-right': column.name === 'joinDate' }"
                    :direction="column.sortDir"
                    :active="column.active"
                    @toggle="sortBy(key)"
                  >
                    {{ column.text }}
                  </sort-arrow-partial>
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(row, rowKey) in entriesData.all">
                <tr v-if="filterEntry(rowKey)" :key="rowKey">
                  <td
                    v-for="(column, colName) in row"
                    :key="colName"
                    class="pui-datatable-column relative"
                  >
                    <template v-if="head[colName] && head[colName].editable">
                      <datalist-editable-partial
                        :activeEntries="entriesData.activeEntries"
                        :head="head"
                        :rowKey="rowKey"
                        :row="row"
                        :colName="colName"
                        :content="column"
                        :editingEntry="editingEntry"
                        :updateEditingEntry="updateEditingEntry"
                        :updateEntry="updateEntry"
                      />
                    </template>
                    <template v-else>
                      {{ column }}
                    </template>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <pagination-partial
          :config="lConfig"
          :entries-data="entriesData"
          @configUpdated="updateConfig"
        />
      </template>
    </template>
  </datalist-container>
</template>

<script>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { DatalistContainer, PaginationPartial, SortArrowPartial, DatalistEditablePartial } from './'

@Component({
  components: {
    DatalistContainer,
    PaginationPartial,
    SortArrowPartial,
    DatalistEditablePartial
  }
})
export default class DataTable extends Vue {
  @Prop(Object) config
  @Prop(Object) head
  @Prop(Array) body
  @Prop(Function) saveHeadData
  @Prop(Function) updateConfig
  @Prop(Function) updateEntry
  @Prop(Boolean) loading

  editingEntry = null
  defaultConfig = {
    searchLabelText: 'Search',
    searchPlaceholderText: 'Search...'
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

  updateEditingEntry(val) {
    this.editingEntry = val
  }
}
</script>

<style lang="stylus" scoped>
.pui-datatable-container
  overflow auto

.pui-datatable-container table
  min-width 800px
</style>
