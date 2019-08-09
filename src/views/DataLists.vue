<template>
  <div>
    <h3 class="size-l bold push-down-l">Data lists</h3>

    <form-checkbox name="filter_gmail" :switch="true" @updated="setGmailFilter" class="push-down">
      Display only gmail addresses
    </form-checkbox>

    <data-table
      class="push-down"
      :head="table.head"
      :body="table.body"
      :config="config"
      :custom-filter="customFilter"
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
import FormCheckbox from '@c/forms/FormCheckbox'
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import DataListEdit from './partials/DataListEdit'

dayjs.extend(LocalizedFormat)

@Component({
  components: {
    FormCheckbox,
    DataTable
  }
})
export default class DataListsPage extends Vue {
  filterByGmail = false

  config = {
    itemsPerPage: 10,
    paginationSpread: 1,
    showAllItemsButton: true,
    currentPage: 1,
    showSearch: true,
    updated: null
  }

  table = {
    head: {
      id: {
        text: 'ID',
        searchable: false,
        sortDir: 'asc',
        active: false,
        include: null,
        exclude: null,
        type: 'number',
        editable: false
      },
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
        editable: true,
        mask: date => {
          return dayjs(date).format('L')
        }
      },
      actions: {
        text: 'Actions',
        component: DataListEdit,
        thClass: 'align-right',
        tdClass: 'align-right'
      }
    },
    body: []
  }

  loading = true

  setGmailFilter(value) {
    this.filterByGmail = value

    // To let the datalist know that it should update now, we fill the "updated" property inside of the config object
    // with the current timestamp. Since config is being observed, an update will be forced.
    this.config.updated = Date.now()
  }

  saveHeadData(data) {
    this.table.head = data
  }

  updateConfig(config) {
    this.config = config
  }

  async updateEntry({ key, col, value }) {
    this.table.body[key][col] = value
  }

  customFilter(item) {
    if (this.filterByGmail) {
      return item.email.includes('gmail')
    }
    return true
  }

  mounted() {
    setTimeout(() => {
      this.table.body = createSampleUsers(29)
      this.loading = false
    }, 1000)
  }
}
</script>
