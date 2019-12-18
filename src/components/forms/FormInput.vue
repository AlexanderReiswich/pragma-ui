<template>
  <div class="input-container" :class="inputContainerClass" ref="container">
    <input-label />

    <div class="input-block relative" :class="inputBlockClass">
      <popper
        trigger="custom"
        :disabled="!extension"
        :visible-arrow="false"
        :options="extensionOptions"
        :force-show="isExtensionOpen || isFocused"
        :before-hide="onPopperHide"
        @opened="onPopperShow"
        v-click-outside="closeExtension"
      >
        <input
          class="input"
          :class="cInputClass"
          :type="type"
          :value="dynValue"
          :id="cId"
          :name="name"
          :placeholder="placeholder"
          :required="required"
          :disabled="disabled"
          :readonly="readonly"
          :autocomplete="disableAutocomplete ? 'disabled' : 'autocomplete'"
          @input="cUpdateValue"
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
          <div class="popper-inner white-bg shadow-m" ref="popperInner">
            <slot name="extension" />
          </div>
        </div>

        <template slot="extra">
          <slot name="afterInput" :updateValue="updateValue" :cValue="cValue" />
        </template>
      </popper>
    </div>

    <slot name="afterInputContainer" />

    <input-errors />

    <input-notice />
  </div>
</template>

<script>
import { Component, Prop, Mixins, Watch } from 'vue-property-decorator'
import { FieldMixin } from '@c/forms/mixins'
import { InputLabel, InputErrors, InputNotice } from '@c/forms/partials'
import ClickOutside from 'vue-click-outside'
import anime from 'animejs'

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

  @Prop(Boolean) disableAutocomplete

  extensionWidthMaps = {
    xs: 300,
    s: 400,
    m: 500
  }

  extensionData = {
    class: null,
    position: null,
    width: null
  }

  extensionOptions = {
    placement: 'bottom-end',
    modifiers: {
      flip: {
        behavior: ['bottom', 'top']
      },
      preventOverflow: {
        boundariesElement: 'window'
      },
      shift: {
        fn: data => {
          const w = this.$refs.container ? this.$refs.container.offsetWidth : 0

          if (data.styles && data.offsets) {
            data.styles.maxWidth = w + 'px'
            this.setExtensionData(data.offsets.popper, data.placement, w)
          }

          return data
        }
      }
    }
  }

  isFocused = false

  /**
   * Ensure that the extension stays open so long as the input field is in focus.
   */
  @Watch('isExtensionOpen')
  ensureExtensionIsOpen(open) {
    if (!open && this.isFocused) {
      this.toggleExtension(true)
    }
  }

  /**
   * This function optimizes the popper position when the size of its content changes.
   */
  updatePopper() {
    const isTop = this.extensionData.position ? this.extensionData.position.includes('top') : false
    const el = this.$refs.popperInner
    const popperH = this.extensionData.height

    if (isTop) {
      if (el && el.style) {
        this.$nextTick(() => {
          anime.set(el, {
            translateY: popperH - el.offsetHeight
          })
        })
      }
    } else {
      anime.set(el, {
        translateY: 0
      })
    }
  }

  cUpdateValue(e) {
    this.updateValue(e)
    this.updatePopper()
  }

  onPopperShow() {
    const el = this.$refs.popperInner

    if (el) {
      // First, hide the element to prevent it from flashing
      anime.set(el, { opacity: '0' })

      // Then, save the elements real height
      const elH = el.offsetHeight
      const isTop = this.extensionData.position
        ? this.extensionData.position.includes('top')
        : false

      // Set the starting height and y-offset
      anime.set(el, {
        height: '0',
        translateY: isTop ? elH : 0
      })

      // Execute the animation
      anime({
        targets: el,
        easing: 'easeOutQuint',
        opacity: '1',
        duration: 200,
        height: elH,
        translateY: 0,
        complete: () => {
          // Unset the fixed height after the animation has ended
          if (this.$refs.popperInner) {
            this.$refs.popperInner.style.height = ''
          }
        }
      })
    }
  }

  onPopperHide(done) {
    const el = this.$refs.popperInner

    if (el) {
      const elH = el.offsetHeight
      const isTop = this.extensionData.position
        ? this.extensionData.position.includes('top')
        : false

      anime({
        targets: el,
        easing: 'easeInSine',
        duration: 80,
        height: '0',
        opacity: '0',
        translateY: isTop ? elH : 0,
        complete: () => {
          el.style.height = ''
          done()
        }
      })
    }
  }

  /**
   * If the mask or transform prop was provided, the dynamic value will display the mutated version of the value
   * (without actually changing the internal value). The difference between mask and transform is that transform
   * will always show the altered value, whereas mask will show the original value when the input is in focus.
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
    return this.inputClass
  }

  /**
   * Set proper classes for the input container depending on the state of the popper dropdown extension.
   * @return string
   */
  get inputContainerClass() {
    let c = []

    c.push(this.extensionData.class)

    if (this.extension && this.isExtensionOpen) {
      c.push('extension-open')
    }

    return c.join(' ')
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
    } else {
      this.$emit('beforeSubmit', this.cValue)
      this.form.submit ? this.form.submit() : null
    }
  }

  /**
   * Remember certain relevant properties of the popper extension whenever it is opened or updated.
   *
   * @param {object} popper
   * @param {string} dir
   * @param {int} w
   */
  setExtensionData(popper, dir, w) {
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

    this.extensionData.height = popper.height
    this.extensionData.position = placement
    this.extensionData.class = placement + ' ' + wC
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
    this.$emit('focus', this.cValue, this)
  }

  /**
   * onBlur event.
   */
  onBlur() {
    this.isFocused = false
    const newVal = this.$refs.input ? this.$refs.input.value : null
    this.$emit('blur', newVal, this.cValue, this)
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
.input-block .popper-inner
  overflow auto
  max-height 85vh
</style>
