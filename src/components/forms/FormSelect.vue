<template>
  <div ref="select">
    <input-label />

    <form-input
      v-bind="filteredProps"
      slot="reference"
      ref="textfield"
      :value="localValue"
      :extension="true"
      :label="false"
      :readonly="!multiple"
      :inputClass="!searchable ? 'cursor-default' : ''"
      @extensionOpened="isOpen = true"
      @extensionClosed="isOpen = false"
      @keydown.native.prevent.up="traverse('up')"
      @keydown.native.prevent.down="traverse('down')"
      @keydown.native.prevent.enter="toggleOption(focusedEntry)"
      @updated="localValue = $event"
    >
      <template v-slot:extension>
        <div class="pad-xs">
          <form-select-entry
            v-for="option in filteredOptions"
            :key="option.value"
            :option="option"
            :value="cValue"
            :focused="isFocused(option)"
            @select="toggleOption"
          />
        </div>
      </template>
      <template v-slot:afterInput>
        <transition name="fade">
          <div class="pui-select-button align-vh" :class="!multiple ? 'no-pointer-events' : ''">
            <tico
              :name="selectionIcon(isOpen)"
              :color="isOpen ? 'primary' : 'muted'"
              :size="isOpen && multiple ? 'xl' : 'l'"
              :thin="true"
              class="inline pointer"
              @click.native.prevent="clearSelection"
            />
          </div>
        </transition>
      </template>
    </form-input>

    <div class="push-up-s">
      <div
        class="pui-select-value-item inline size-s light-bg dark pad-v-xs pad-h-s push-right-s push-down-s rounded"
        v-for="item in selectedOptions"
        :key="item.value"
      >
        {{ item.text }}
        <tico
          name="close"
          color="dark"
          size="m"
          class="pui-pui-select-remove-item float-right push-left-s tween pointer"
          :thin="true"
          @click.native.prevent="toggleOption(item)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import { FieldMixin } from '@c/forms/mixins'
import FormInput from './FormInput'
import { Tico } from '@c/ui'
import { InputLabel, FormSelectEntry } from '@c/forms/partials'

@Component({
  components: {
    FormInput,
    Tico,
    InputLabel,
    FormSelectEntry
  }
})
export default class FormSelect extends Mixins(FieldMixin) {
  isOpen = false
  localValue = ''
  focusedEntry = null

  @Prop({
    type: [String, Boolean],
    default: null
  })
  label

  @Prop({
    type: Boolean,
    default: true
  })
  searchable

  @Prop({
    type: Boolean,
    default: true
  })
  multiple

  @Prop({
    type: String,
    default: 'Select...'
  })
  placeholder

  /**
   * Expected is an array with objects that contain a value and text field.
   * The value is what we normally save to the database, while the text is what we display in the UI.
   * @example
   * [
   *   {
   *     value: 'a',
   *     text: 'Aardvark'
   *   },
   *   ...
   * ]
   */
  @Prop({
    type: Array,
    default: () => []
  })
  options

  /**
   * Set the first options entry as focused if the focused variable is empty and the options have been updated.
   *
   * @param {Array} options
   */
  @Watch('options', {
    immediate: true
  })
  onOptionsChanged(options) {
    if (!this.focusedEntry) {
      if (options && options[0]) this.focusedEntry = options[0]
    }
  }

  /**
   * Get the props for the input component, but exclude the ones that relate to the select component.
   */
  get filteredProps() {
    const { name, searchable, multiple, options, ...filteredProps } = this.$props
    return filteredProps
  }

  /**
   * Extract only the filtered options.
   */
  get filteredOptions() {
    if (this.searchable) {
      return this.options.filter(e => e.text.toLowerCase().includes(this.localValue.toLowerCase()))
    }
    return this.options
  }

  /**
   * Extract only the selected options.
   */
  get selectedOptions() {
    if (this.cValue && this.cValue.constructor === Array) {
      return this.options
        .map(entry => (this.cValue.includes(entry.value) ? entry : null))
        .filter(Boolean)
    }
    return []
  }

  /**
   * Add the clicked option to the value list or remove if it already exists.
   *
   * @param {Object} selection
   * @return {void}
   */
  toggleOption(selection) {
    const getValue = (val, prev, multiple) => {
      if (multiple) {
        if (prev && prev.constructor === Array) {
          return !prev.find(item => item === val) // If the value hasn't already been added...
            ? [...prev, val] // ...merge the new and existing values
            : prev.filter(item => item !== val) // ...or remove selected value from selection
        }
        return [val] // Create a new array that contains only the selected value
      }
      return prev === val ? '' : val // Either add the selected value or remove it
    }

    const value = getValue(selection.value, this.cValue, this.multiple)

    // If multi-select is disabled, update the localValue with the selection
    if (!this.multiple) {
      const selected = this.options.find(item => item.value === value)
      this.localValue = selected ? selected.text : ''
    }

    this.updateValue(value)
  }

  /**
   * Determine if a particular select entry is currently focused.
   *
   * @param {Object} selection
   * @return {Boolean}
   */
  isFocused(selection) {
    return selection === this.focusedEntry
  }

  /**
   * Traverse through the select dropdown entries.
   *
   * @param {String} dir
   * @return {Boolean}
   */
  traverse(dir) {
    const o = this.options
    const index = o.findIndex(item => item === this.focusedEntry)

    const shiftDown = (i, o) => (o[i + 1] ? o[i + 1] : o[0])
    const shiftUp = (i, o) => (o[i - 1] ? o[i - 1] : o[o.length - 1])

    this.focusedEntry = dir === 'down' ? shiftDown(index, o) : shiftUp(index, o)
  }

  /**
   * Clear the selected date value.
   *
   * @return {void}
   */
  clearSelection() {
    if (this.multiple) {
      this.localValue = null
    }
  }

  /**
   * Display an icon depending on context; Either an arrow or a search icon.
   *
   * @param {Boolean} isFocused
   * @return {String}
   */
  selectionIcon(isFocused) {
    if (this.searchable) {
      return isFocused ? 'search-alt' : 'chevron-down'
    }
    return isFocused ? 'chevron-up' : 'chevron-down'
  }
}
</script>

<style lang="stylus">
.pui-select-button
  position absolute
  top 0
  right 0
  bottom 0
  width 40px

.pui-select-remove-item
  opacity 0.6

.pui-select-remove-item:hover
  opacity 1
</style>
