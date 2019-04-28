<template>
  <form-container
    :name="'datalist_edit_' + currentColumn"
    :class="{ active: editingColumn === currentColumn }"
    ref="editingForm"
    @submit="($event, form) => toggleColumnEdit($event, form, { row, col: colName, key: rowKey })"
  >
    <button v-if="editingColumn !== currentColumn" class="full align-left pad-0" type="submit">
      {{ column }} &nbsp;
    </button>

    <form-input
      v-show="editingColumn === currentColumn"
      ref="editingInput"
      name="value"
      :value="column"
      :label="false"
      :prevent-submit="false"
      class="pui-edit-input"
      input-class="v-xs h-s"
      @beforeSubmit="submitEdit('enter')"
      @keydown.native.tab="submitEdit('tab')"
      @escape="cancelEditing"
    />

    <form-submit class="pui-edit-column tween" spinner-class="border-primary">
      <tico :name="editingColumn === currentColumn ? 'check' : 'edit'" color="primary" size="xl" />
    </form-submit>
  </form-container>
</template>

<script>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { FormContainer, FormInput, FormSubmit } from '@c/forms'
import { Tico } from '@c/ui'

@Component({
  components: {
    FormContainer,
    FormInput,
    FormSubmit,
    Tico
  }
})
export default class EditableDataColumnPartial extends Vue {
  @Prop(Object) entriesData
  @Prop(Object) head
  @Prop(Number) rowKey
  @Prop(Object) row
  @Prop(String) colName
  @Prop() column
  @Prop(String) editingColumn
  @Prop(Function) updateEditingColumn
  @Prop(Function) updateEntry

  nextColumn = null

  get currentColumn() {
    return this.rowKey + '_' + this.colName
  }

  /**
   * Focus on the currently entry that has been set to editable.
   *
   * @returns void
   */
  @Watch('editingColumn', {
    immediate: true
  })
  onEditingChanged(val) {
    const name = this.rowKey + '_' + this.colName

    if (name && val && val === name) {
      this.$nextTick(() => {
        if (this.$refs.editingInput) {
          setTimeout(() => {
            this.$refs.editingInput.$refs.input.focus()
          }, 50)
        }
      })
    }
  }

  /**
   * Either activates the editable state for a particular column or saves and deactivates it.
   *
   * @returns void
   */
  async toggleColumnEdit({ value }, { setLoading }, { row, col, key }) {
    const name = key + '_' + col

    if (name === this.editingColumn) {
      // If this field was already active, attempt to save it
      setLoading(true)

      if (this.updateEntry) {
        await this.updateEntry({ key, col, row, value })
      }

      setLoading(false)

      // If the next column has been determined, set it to active
      if (this.nextColumn) {
        this.updateEditingColumn(this.nextColumn)
        this.nextColumn = null
      } else {
        this.updateEditingColumn(null)
      }
    } else {
      // Otherwise just activate the input field
      this.updateEditingColumn(name)
    }
  }

  /**
   * When the editing form is submitted, the next visible entry becomes editable.
   * Submitting via the enter key selects the same column of the next row, while submitting via tab selects the
   * next column (or the first column of the next row).
   *
   * @param {string} key
   * @returns void
   */
  submitEdit(key) {
    if (this.entriesData.activeEntries) {
      const { activeEntries } = this.entriesData
      let nextEntry = null

      if (key === 'tab') {
        // Get the next column in the same row
        nextEntry = this.getNextCol(activeEntries, this.head, this.colName)

        // If the next column exists, select it
        if (nextEntry) {
          this.nextColumn = this.rowKey + '_' + nextEntry
        } else {
          // Otherwise, select the first column of the next row
          nextEntry = this.getNextRow(activeEntries, this.rowKey)
          this.nextColumn = nextEntry + '_' + Object.keys(this.head)[0]
        }
        // Since the tab key does not submit the form automatically, we have to force it
        this.$refs.editingForm.submit()
      } else {
        nextEntry = this.getNextRow(activeEntries, this.rowKey)

        if (nextEntry) {
          this.nextColumn = nextEntry + '_' + this.colName
        }
      }
    }
  }

  getNextCol(activeEntries, row, currentCol) {
    function getNextCol(obj, key) {
      let keys = Object.keys(obj)
      let i = keys.indexOf(key)
      const next = i !== -1 && keys[i + 1] ? obj[keys[i + 1]] : null

      if (next) return next.editable ? keys[i + 1] : getNextCol(obj, keys[i + 1])

      return null
    }

    return getNextCol(row, currentCol)
  }

  getNextRow(activeEntries, currentRow) {
    const currentRowIndex = activeEntries.findIndex(item => item === currentRow)
    return activeEntries[currentRowIndex + 1]
  }

  /**
   * Deactivates the editable state for a particular column.
   *
   * @returns void
   */
  cancelEditing() {
    this.updateEditingColumn(null)
  }
}
</script>

<style lang="stylus" scoped>
.pui-edit-column
  position absolute
  top 7px
  right 15px
  cursor pointer
  opacity 0

.pui-datatable-column:hover .pui-edit-column,
.pui-datatable-column .active .pui-edit-column
  opacity 1

.pui-edit-input
  width calc(100% - 50px)
</style>
