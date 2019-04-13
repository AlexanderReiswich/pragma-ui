<template>
  <div class="input-container" :class="inputContainerClass" ref="container">
    <input-label />

    <div class="input-block relative" :class="inputBlockClass">
      <popper
        trigger="custom"
        :disabled="!extension"
        :visible-arrow="false"
        :options="extensionOptions"
        :force-show="isExtensionOpen"
        transition="popper-slide"
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

      <slot name="afterInput" :updateValue="updateValue" :cValue="cValue" />
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
import ClickOutside from 'vue-click-outside'

@Component({
  components: {
    InputLabel,
    InputErrors,
    InputNotice,
    Popper: () => import('@c/ui/Popper')
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

  @Prop({
    type: Boolean,
    default: false
  })
  isExtensionOpen

  @Prop(Function) mask

  @Prop(Function) transform

  @Prop(Function) beforeKeyPress

  @Prop(Function) toggleExtension

  extensionClass = ''
  extensionWidthMaps = {
    xs: 300,
    s: 400,
    m: 500
  }

  extensionOptions = {
    placement: 'bottom',
    modifiers: {
      flip: {
        behavior: ['bottom', 'top']
      },
      shift: {
        fn: data => {
          const w = this.$refs.container.offsetWidth

          data.styles.maxWidth = w + 'px'
          this.setExtensionClass(data.placement, w)

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
    return this.extensionClass
  }

  /**
   * Close the popper dropdown extension.
   */
  closeExtension() {
    if (this.isExtensionOpen) {
      this.toggleExtension ? this.toggleExtension(false) : null
    }
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
   * Add useful css classes to the popper dropdown extension depending on its state.
   *
   * @param {string} dir
   * @param {int} w
   */
  setExtensionClass(dir, w) {
    const placement = 'placement-' + dir
    const maps = this.extensionWidthMaps
    let wC = 'popper-l'

    if (w < maps.xs) {
      wC = 'popper-xs'
    } else if (w < maps.s) {
      wC = 'popper-s'
    } else if (w < maps.m) {
      wC = 'popper-m'
    }

    this.extensionClass = placement + ' ' + wC
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
    this.toggleExtension ? this.toggleExtension(true) : null
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
