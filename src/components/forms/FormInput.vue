<template>
  <div class="input-container" :class="inputContainerClass" ref="container">
    <input-label />

    <div class="input-block relative" :class="inputBlockClass">
      <popper
        trigger="click"
        :disabled="!extension"
        :visible-arrow="false"
        :options="extensionOptions"
        :force-show="isFocused || isExtensionOpen"
        transition="popper-fade"
        @show="openExtension"
        @hide="closeExtension"
        v-click-outside="closeExtension"
      >
        <input
          class="input"
          :class="inputClass"
          :type="type"
          :value="dynValue"
          :id="cId"
          :name="name"
          :placeholder="placeholder"
          :required="required"
          :disabled="disabled"
          :readonly="readonly"
          @input="updateValue"
          @keydown="keyDown"
          @keydown.enter="beforeSubmit"
          @keydown.esc="escape"
          @blur="onBlur"
          @focus="onFocus"
          @wheel="onMouseWheel"
          ref="input"
          slot="reference"
        />

        <div class="popper" ref="popper" v-show="extension">
          <div class="popper-inner white-bg shadow-m">
            <slot name="extension" />
          </div>
        </div>
      </popper>

      <slot
        name="afterInput"
        :updateValue="updateValue"
        :cValue="cValue"
        :isExtensionOpen="isExtensionOpen"
      />
    </div>

    <slot name="afterInputContainer" />

    <input-errors />

    <input-notice />
  </div>
</template>

<script>
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { FieldMixin } from '@c/forms/mixins'
import { InputLabel, InputErrors, InputNotice } from '@c/forms/partials'
import Popper from 'vue-popperjs'
import ClickOutside from 'vue-click-outside'

@Component({
  components: {
    InputLabel,
    InputErrors,
    InputNotice,
    Popper
  },
  directives: {
    ClickOutside
  }
})
export default class FormInput extends Mixins(FieldMixin) {
  @Prop(String) type

  @Prop(Boolean) readonly

  @Prop(String) inputBlockClass

  @Prop(String) inputClass

  @Prop({
    type: Boolean,
    default: true
  })
  preventSubmit

  @Prop(Boolean) extension

  @Prop(Function) mask

  @Prop(Function) transform

  @Prop(Function) beforeKeyPress

  isExtensionOpen = false
  extensionPlacementClass = ''

  extensionOptions = {
    placement: 'bottom',
    modifiers: {
      flip: {
        behavior: ['bottom', 'top']
      },
      shift: {
        fn: data => {
          data.styles.maxWidth = this.$refs.container.offsetWidth + 'px'
          this.setExtensionPlacementClass(data.placement)
          return data
        }
      }
    }
  }

  isFocused = false

  /**
   * If the mask or transform prop was provided, the dynamic value will display the mutated value whenever the input
   * field is in focus (masked) or generally (transform). Otherwise, the regular cValue will be shown.
   * @return Object
   */
  get dynValue() {
    if (this.mask && this.readonly) return this.mask(this.cValue)

    if (this.transform) {
      return this.transform(this.cValue)
    }

    if (this.mask) {
      return this.isFocused ? this.cValue : this.mask(this.cValue)
    }

    return this.cValue
  }

  /**
   * Set proper classes for the input element depending on the state of the popper dropdown extension.
   * @return string
   */
  get cInputClass() {
    let c = [this.inputClass]

    if (this.extension && this.isExtensionOpen) {
      c.push('extension-open')
    }

    return c.join(' ')
  }

  /**
   * Set proper classes for the input container depending on the state of the popper dropdown extension.
   * @return string
   */
  get inputContainerClass() {
    return this.extension && this.isExtensionOpen ? 'placement-' + this.extensionPlacementClass : ''
  }

  /**
   * Open the popper dropdown extension.
   */
  openExtension() {
    this.isExtensionOpen = true
    this.$emit('extensionOpened')
  }

  /**
   * Close the popper dropdown extension.
   */
  closeExtension() {
    this.isExtensionOpen = false
    this.$emit('extensionClosed')
  }

  /**
   * Input fields don't submit the form by default unless the preventSubmit prop is set to false.
   */
  beforeSubmit(e) {
    if (this.preventSubmit) {
      e.preventDefault()
    }
  }

  /**
   * Save the placement of the popper dropdown extension for use in the container class.
   */
  setExtensionPlacementClass(dir) {
    this.extensionPlacementClass = dir
  }

  /**
   * Emit an escape event when the esc key is pressed.
   */
  escape() {
    this.$emit('escape')
  }

  /**
   * onFocus event.
   */
  onFocus() {
    this.isFocused = true
  }

  /**
   * onBlur event.
   */
  onBlur() {
    this.isFocused = false
    this.$emit('blur', this.$refs.input.value, this.cValue)
  }

  /**
   * Emit the corresponding mouse wheel event.
   */
  onMouseWheel(e) {
    if (document.activeElement === this.$refs.input) {
      e.deltaY < 0 ? this.$emit('wheelUp', e) : this.$emit('wheelDown', e)
    }
  }

  /**
   * Trigger the beforeKeyPress function if it was defined.
   */
  keyDown(e) {
    if (this.beforeKeyPress && !this.beforeKeyPress(e)) {
      e.preventDefault()
    }
  }
}
</script>

<style lang="stylus">
.input.extension-open
  position relative
  z-index 200001
</style>
