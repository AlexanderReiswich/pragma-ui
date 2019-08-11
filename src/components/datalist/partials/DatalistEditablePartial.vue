<template>
  <div>
    <div
      class="full relative align-left pad-0"
      :class="{ 'opacity-0': editingEntry === currentEntry }"
      @click="toggleEditableEntry"
    >
      {{ content }}
      <component :is="row.component" :row="row" v-if="row.component" />
    </div>
    <div class="pui-edit-entry tween" spinner-class="border-primary" @click="toggleEditableEntry">
      <tico :name="editingEntry === currentEntry ? 'check' : 'edit'" color="primary" size="xl" />
    </div>
    <transition v-on:after-enter="afterEnter">
      <form-container
        :name="'datalist_edit_' + currentEntry"
        class="pui-edit-form"
        :class="{ active: editingEntry === currentEntry }"
        ref="editingForm"
        v-if="editingEntry === currentEntry"
        @submit="
          ($event, form) => submitEditableEntry($event, form, { row, col: colName, key: rowKey })
        "
      >
        <form-input
          v-show="editingEntry === currentEntry"
          ref="editingInput"
          name="value"
          :value="content"
          :label="false"
          :prevent-submit="false"
          class="pui-edit-input"
          input-class="v-xs h-s"
          @beforeSubmit="leaveEditableEntry('enter')"
          @keydown.native.tab="leaveEditableEntry('tab')"
          @escape="leaveEditableEntry('escape')"
          @blur="leaveEditableEntry('blur')"
        />
      </form-container>
    </transition>
  </div>
</template>

<script>
import { Component, Vue, Prop } from 'vue-property-decorator'
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
export default class DatalistEditablePartial extends Vue {
  @Prop(Array) activeEntries
  @Prop(Object) head
  @Prop(Number) rowKey
  @Prop(Object) row
  @Prop(String) colName
  @Prop() content
  @Prop(String) editingEntry
  @Prop(Function) updateEditingEntry
  @Prop(Function) updateEntry

  nextEditingEntry = null
  editClickable = true

  get currentEntry() {
    return this.rowKey + '_' + this.colName
  }

  /**
   * Focus on the input field whenever an editable entry is selected.
   *
   * @returns void
   */
  afterEnter() {
    const input = this.$refs.editingInput.$refs.input
    if (input) {
      input.focus()
      input.select()
    }
  }

  /**
   * Either activates the editable state for a particular entry or saves and deactivates it.
   *
   * @returns void
   */
  toggleEditableEntry() {
    if (this.editClickable) {
      const name = this.rowKey + '_' + this.colName
      this.editingEntry === name ? this.$refs.editingForm.submit() : this.updateEditingEntry(name)
    }
  }

  /**
   * Saves the currently edited entry and closes it.
   *
   * @returns void
   */
  async submitEditableEntry({ value }, { setLoading }, { row, col, key }) {
    // If this field was already active, attempt to save it
    setLoading(true)

    if (this.updateEntry) {
      await this.updateEntry({ key, col, row, value })
    }

    setLoading(false)

    // If the next entry has been determined, set it to active
    if (this.nextEditingEntry) {
      this.updateEditingEntry(this.nextEditingEntry)
      this.nextEditingEntry = null
    } else {
      this.updateEditingEntry(null)
    }
  }

  /**
   * Depending on how the input field of the editable entry is left, different things need to happen.
   * The input can be left through a mouse click in some other place (blur), by pressing enter or the tab key.
   * The value is saved in all three cases, but in the latter two, the next entry becomes editable.
   *
   * @param {string} key
   * @returns void
   */
  leaveEditableEntry(key) {
    const actions = {
      tab: () => {
        this.jumpToNextCol(this.activeEntries, this.head, this.rowKey, this.colName)

        // Since the tab key does not submit the form automatically, we have to force it
        this.$refs.editingForm.submit()
      },
      enter: () => {
        this.jumpOneRowDown(this.activeEntries, this.rowKey, this.colName)
      },
      blur: () => {
        // Simply submit the form on blur
        this.$refs.editingForm.submit()

        // Since the blur takes place immediately, it becomes impossible to click the save button.
        // To prevent usability issues, the save button is disabled and only enabled after a small delay.
        this.editClickable = false

        setTimeout(() => {
          this.editClickable = true
        }, 300)
      },
      escape: () => {
        this.updateEditingEntry(null)
      }
    }

    if (this.activeEntries) {
      actions[key]()
    }
  }

  /**
   * Jumping one row down is simple, since the column stays the same and we don't have to check
   * whether it is editable or not.
   *
   * @param {array} activeEntries An array with indexes of all active entries.
   * @param {int} currentRow The index of the currently active entry.
   * @param {string} currentCol The name of the currently active column.
   * @returns {void}
   */
  jumpOneRowDown(activeEntries, currentRow, currentCol) {
    const currentRowIndex = activeEntries.findIndex(item => item === currentRow)
    const nextEditingEntry = activeEntries[currentRowIndex + 1]
    this.setNextEditingEntry(nextEditingEntry, currentCol)
  }

  /**
   * Unlike jumping to the next row, jumping to the next column is quite complex, as it's necessary to
   * determine whether the next column is editable and also to switch to the next row if there are no more
   * columns left in the current row.
   *
   * @param {array} activeEntries An array with indexes of all active entries.
   * @param {object} colSchema The column schema (datalist head).
   * @param {int} currentRow The index of the currently active entry.
   * @param {string} currentCol The name of the currently active column.
   * @returns {int}
   */
  jumpToNextCol(activeEntries, colSchema, currentRow, currentCol) {
    function getNextEditableCol(schema, col) {
      let keys = Object.keys(schema)
      let i = keys.indexOf(col)
      const next = keys[i + 1] ? schema[keys[i + 1]] : null

      if (next) return next.editable ? keys[i + 1] : getNextEditableCol(schema, keys[i + 1])

      return null
    }

    // Find the next editable column
    let nextCol = getNextEditableCol(colSchema, currentCol)

    // If no editable column exists, switch to the next row
    if (!nextCol) {
      // Get the index of the next row
      const currentRowKey = activeEntries.findIndex(i => i === currentRow)
      const nextRow = activeEntries[currentRowKey + 1]

      // Find the first editable column in the schema
      const firstEditableCol = getNextEditableCol(colSchema)

      if (nextRow) {
        this.setNextEditingEntry(nextRow, firstEditableCol)
      }
    } else {
      this.setNextEditingEntry(currentRow, nextCol)
    }
  }

  /**
   * Set the nextEditingEntry property so that we know which row and column should become editable next.
   *
   * @returns void
   */
  setNextEditingEntry(row, col) {
    this.nextEditingEntry = row !== null ? row + '_' + col : null
  }
}
</script>

<style lang="stylus" scoped>
.pui-edit-entry
  position absolute
  top 0
  bottom 0
  right 15px
  display flex
  align-items center
  cursor pointer
  opacity 0

.pui-datatable-column:hover .pui-edit-entry,
.pui-datatable-column .active .pui-edit-entry
  opacity 1

.pui-edit-form
  position absolute
  top 0
  bottom 0
  right 50px
  left 0

.pui-edit-input
  position relative
  width 100%
  top 50%
  transform translateY(-50%)
</style>
