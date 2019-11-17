<template>
  <div ref="select">
    <input-label />

    <form-input
      v-bind="filteredProps"
      slot="reference"
      ref="textfield"
      :value="localValue"
      :extension="true"
      :isExtensionOpen="isOpen"
      :toggleExtension="toggleExtension"
      :label="false"
      :readonly="!searchable"
      :inputClass="!searchable ? 'cursor-default' : ''"
      :disable-autocomplete="true"
      @focus="onInputFocus"
      @keydown.native.prevent.up="traverse('up')"
      @keydown.native.prevent.down="traverse('down')"
      @keydown.native.enter="toggleOption"
      @updated="localValue = $event"
    >
      <template v-slot:extension>
        <div class="pad-xs">
          <template v-if="filteredOptions && filteredOptions.length">
            <form-select-partial
              v-for="option in filteredOptions"
              :key="option.value"
              :option="option"
              :value="cValue"
              :focused="isFocused(option)"
              @select="toggleOption"
            />
          </template>
          <template v-else>
            <div class="pui-select-no-results pad center muted">
              {{ config.selectNoResults }}
            </div>
          </template>
        </div>
      </template>
      <template v-slot:afterInput>
        <transition name="fade">
          <div class="pui-select-button align-vh no-pointer-events">
            <tico
              :name="selectionIcon(isOpen)"
              :color="isOpen ? 'primary' : 'muted'"
              :size="isOpen && multiple ? 'xl' : 'l'"
              :thin="true"
              class="inline pointer"
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
        <div class="align-v">
          <div class="inline pui-select-item-text">
            {{ item.text }}
          </div>
          <tico
            name="close"
            color="dark"
            size="m"
            class="pui-select-remove-item push-left-s tween pointer"
            :thin="true"
            v-show="empty ? true : cValue.length > 1"
            @click.native.prevent="toggleOption(null, item)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import { FieldMixin } from '@c/forms/mixins'
import FormInput from './FormInput'
import { Tico } from '@c/ui'
import { InputLabel, FormSelectPartial } from '@c/forms/partials'

@Component({
  components: {
    FormInput,
    Tico,
    InputLabel,
    FormSelectPartial
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
    default: ''
  })
  placeholder

  @Prop({
    type: Boolean,
    default: true
  })
  empty

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
   * Update the local value whenever the cValue is changed.
   */
  @Watch('cValue', {
    immediate: true
  })
  onValueChanged(val) {
    this.setLocalValue(val)
  }

  /**
   * Get the props for the input component, but exclude the ones that relate to the select component.
   */
  get filteredProps() {
    const { name, searchable, multiple, options, ...filteredProps } = this.$props

    filteredProps.placeholder = this.$props.placeholder
      ? this.$props.placeholder
      : this.config.selectPlaceholderText

    return filteredProps
  }

  /**
   * Open or close the dropdown extension.
   *
   * @param {boolean} state
   * @return {void}
   */
  toggleExtension(state) {
    this.isOpen = typeof state === 'undefined' ? !this.isOpen : state
  }

  /**
   * Extract only the filtered options.
   */
  get filteredOptions() {
    if (this.searchable && !this.multiple) {
      // When searchable and single selection are active, we only want to filter when the user typed something
      // in the search field (localValue)
      if (!this.localValue) {
        return this.options
      } else {
        // Additionally, we don't want to filter the results if the search value is equal to the selected value
        if (this.cValue) {
          const selected = this.options.find(item => item.value === this.cValue)

          if (selected && selected.text === this.localValue) {
            return this.options
          }
        }
      }
    }

    if (this.searchable && this.localValue) {
      const val = typeof this.localValue === 'string' ? this.localValue.toLowerCase() : null
      return this.options.filter(e => e.text.toLowerCase().includes(val))
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
   * @param {Object} e
   * @param {Object} value
   * @return {void}
   */
  toggleOption(e, value) {
    const selection = value ? value : this.focusedEntry

    if (selection) {
      if (e) e.preventDefault()

      const getValue = (val, prev, multiple, empty) => {
        if (multiple) {
          if (prev && prev.constructor === Array) {
            // If the value hasn't already been added...
            if (!prev.find(item => item === val)) {
              // ...merge the new and existing values
              return [...prev, val]
            } else {
              // If empty option is false and only one value is left, do nothing
              if (!empty && prev.length === 1) {
                return [val]
              }
              // Otherwise remove selected value from selection
              return prev.filter(item => item !== val)
            }
          }
          return [val] // Create a new array that contains only the selected value
        }
        if (!empty) {
          return val // If empty option is false, change nothing
        }
        return prev === val ? '' : val // Either add the selected value or remove it
      }

      const value = getValue(selection.value, this.cValue, this.multiple, this.empty)

      this.setLocalValue(value)
      this.updateValue(value)
    }
  }

  /**
   *  Update the localValue variable with the text value of the selected option.
   *
   * @param {Object} value
   * @return {Boolean}
   */
  setLocalValue(value) {
    if (!this.multiple) {
      const selected = value ? this.options.find(item => item.value === value) : null

      if (selected) {
        this.localValue = selected.text
      } else {
        const defaultValue = this.options.find(item => item.value === this.defaultValue)
        this.localValue = defaultValue ? defaultValue.text : ''
      }
    }
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

  onInputFocus() {
    if (this.searchable && !this.multiple) {
      this.localValue = ''
    }
  }

  /**
   * Update the local value whenever the cValue is changed.
   */
  @Watch('isOpen', {
    immediate: true
  })
  onIsOpenChanged(isOpen) {
    if (!isOpen) {
      if (this.searchable && !this.multiple) {
        this.setLocalValue(this.cValue)
      }
    }
  }

  mounted() {
    // If the empty option is false and no value was set, make sure to set the first option
    if (!this.cValue && !this.empty && this.options) {
      this.toggleOption(null, this.options[0])
    }
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
