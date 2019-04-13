<template>
  <button type="submit" :disabled="disabled">
    <span class="spinner push-right-s" :class="spinnerClass" v-if="formLoading" />

    <template v-if="formLoading && savingText">
      {{ savingText }}
    </template>
    <template v-else>
      {{ text }}

      <slot />
    </template>
  </button>
</template>

<script>
import { Component, Prop, Inject, Mixins } from 'vue-property-decorator'
import { FieldMixin } from '@c/forms/mixins'

@Component
export default class FormSubmit extends Mixins(FieldMixin) {
  @Inject({
    form: 'form',
    default: null
  })
  form

  @Prop(String) spinnerClass
  @Prop(String) savingText

  /**
   * Checks if the slot content is empty and if so displays default text.
   *
   * @returns {string}
   */
  get text() {
    if (!(this.$slots.default && this.$slots.default.length)) {
      return this.form ? this.form.config.submitText : ''
    }
    return ''
  }
}
</script>
