<template>
  <datalist-container
    :head="head"
    :body="body"
    :config="config"
    :customFilter="customFilter"
    @headUpdated="saveHeadData ? saveHeadData($event) : () => {}"
    @configUpdated="updateConfig ? updateConfig($event) : () => {}"
  >
    <template slot-scope="{ columns, entriesData, setSearch, filterEntry, sortBy }">
      <div v-if="loading" class="center push-h-auto push-v-xl">
        <div class="spinner-3xl" />
      </div>

      <template v-if="!loading">
        <template v-if="config.showSearch">
          <label
            class="pui-label block muted small bold push-down-xs"
            for="data-list"
            v-text="config.searchLabelText"
          />
          <input
            id="data-list"
            class="narrow push-down"
            type="text"
            :placeholder="config.searchPlaceholderText"
            @input="setSearch"
            @keydown.enter="setSearch"
          />
        </template>

        <div class="pui-datatable-container">
          <table>
            <thead>
              <tr>
                <th v-for="(column, key) in columns" :key="key" :class="column.thClass">
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
                  <template v-for="(column, name) in columns">
                    <td class="pui-datatable-column relative" :key="name" :class="column.tdClass">
                      <template v-if="head[name] && head[name].editable">
                        <datalist-editable-partial
                          :activeEntries="entriesData.activeEntries"
                          :head="head"
                          :rowKey="rowKey"
                          :row="row"
                          :colName="name"
                          :content="getContent(name, row)"
                          :editingEntry="editingEntry"
                          :updateEditingEntry="updateEditingEntry"
                          :updateEntry="updateEntry"
                        />
                      </template>
                      <template v-else>
                        {{ getContent(name, row) }}
                        <component
                          v-if="head[name]"
                          :is="head[name].component"
                          :row="row"
                          :head="head"
                        />
                      </template>
                    </td>
                  </template>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <pagination-partial
          :config="config"
          :entries-data="entriesData"
          @configUpdated="updateConfig"
        />
      </template>
    </template>
  </datalist-container>
</template>

<script>
import { Component, Vue, Prop } from 'vue-property-decorator'
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
  @Prop(Function) customFilter
  @Prop(Boolean) loading

  editingEntry = null

  updateEditingEntry(val) {
    this.editingEntry = val
  }

  getContent(name, row) {
    return this.head[name].mask ? this.head[name].mask(row[name]) : row[name]
  }
}
</script>

<style lang="stylus" scoped>
.pui-datatable-container
  overflow auto

.pui-datatable-container table
  min-width 800px
</style>
