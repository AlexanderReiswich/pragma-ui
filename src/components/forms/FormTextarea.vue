<template>
  <div class="textarea-container" ref="container">
    <input-label />

    <div class="input-block relative" :class="textareaBlockClass">
      <textarea
        class="textarea"
        :class="textareaClass"
        :id="cId"
        :name="name"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxLength"
        :rows="rows ? rows : 2"
        @input="onInput"
        @keydown="keyDown"
        @keydown.enter="$emit('beforeSubmit', cValue)"
        @keydown.esc="escape"
        @blur="onBlur"
        @focus="onFocus"
        v-text="cValue"
        ref="textarea"
        slot="reference"
      />

      <div class="pui-count-chars" v-if="maxLength">
        <span class="pui-char-count" :class="charCountClass">{{ characters }}</span> /
        <span class="pui-max-chars" :class="maxCharCountClass">{{ maxLength }}</span>
      </div>

      <slot name="afterInput" :updateValue="onInput" :cValue="cValue" />
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
    InputNotice
  },
  directives: {
    ClickOutside
  }
})
export default class FormTextarea extends Mixins(FieldMixin) {
  @Prop(Boolean) readonly

  @Prop(String) textareaBlockClass

  @Prop(String) textareaClass

  @Prop(Number) rows

  @Prop(Number) maxLength

  @Prop(Function) beforeKeyPress

  characters = 0
  charCountClass = ''
  maxCharCountClass = ''

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
    this.$emit('focus', this.cValue)
  }

  /**
   * onBlur event.
   */
  onBlur() {
    const newVal = this.$refs.textarea ? this.$refs.textarea.value : null
    this.$emit('blur', newVal, this.cValue)
  }

  /**
   * Trigger the beforeKeyPress function if it was defined.
   */
  keyDown(e) {
    if (this.beforeKeyPress && !this.beforeKeyPress(e)) {
      e.preventDefault()
    }

    this.calculateHeight()
  }

  setLimits(e) {
    const max = parseInt(this.maxLength)
    const value = e.target.value

    // Calculate character count
    this.characters = value ? value.length : 0

    // Set character count classes
    this.charCountClass = this.characters > max * 0.97 ? 'red' : ''
    this.maxCharCountClass = this.characters === max ? 'red' : ''
  }

  calculateHeight() {
    const textarea = this.$refs.textarea

    if (textarea) {
      const offset = textarea.offsetHeight - textarea.clientHeight
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + offset + 'px'
    }
  }

  onInput(e) {
    this.updateValue(e)
    this.setLimits(e)
  }

  mounted() {
    this.calculateHeight()
  }

  updated() {
    this.calculateHeight()
  }
}
</script>

<style lang="stylus"></style>
