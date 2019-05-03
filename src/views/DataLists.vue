<template>
  <div>
    <h3 class="size-l bold push-down-l">Data lists</h3>
    <data-table
      class="push-down"
      :head="table.head"
      :body="table.body"
      :config="config"
      :save-head-data="saveHeadData"
      :update-config="updateConfig"
      :update-entry="updateEntry"
      :loading="loading"
    />
  </div>
</template>

<script>
import { Vue, Component } from 'vue-property-decorator'
import { DataTable } from '@c/datalist'
import createSampleUsers from '@c/helpers/createSampleUsers'

@Component({
  components: {
    DataTable
  }
})
export default class DataListsPage extends Vue {
  config = {
    itemsPerPage: 10,
    paginationSpread: 1,
    showAllItemsButton: true,
    currentPage: 1,
    searchText: 'Search'
  }

  table = {
    head: {
      username: {
        text: 'Username',
        searchable: true,
        searchValue: '',
        sortDir: 'asc',
        active: true,
        include: null,
        exclude: null,
        type: 'string',
        editable: true
      },
      email: {
        text: 'E-mail',
        searchable: true,
        searchValue: '',
        sortDir: 'asc',
        active: false,
        include: null,
        exclude: null,
        type: 'string',
        editable: true
      },
      joinDate: {
        text: 'Join date',
        searchable: true,
        searchValue: '',
        sortDir: 'asc',
        active: false,
        include: null,
        exclude: null,
        type: 'date',
        editable: true
      }
    },
    body: []
  }

  loading = true

  saveHeadData(data) {
    this.table.head = data
  }

  updateConfig(config) {
    this.config = config
  }

  async updateEntry({ key, col, value }) {
    this.table.body[key][col] = value
  }

  mounted() {
    setTimeout(() => {
      this.table.body = createSampleUsers(988)
      this.loading = false
    }, 1000)
  }
}
</script>
