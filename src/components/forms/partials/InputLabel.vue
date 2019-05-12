<template>
  <label
    class="pui-label push-down-xs"
    :class="inputField.labelClass"
    :for="inputField.cId"
    v-if="inputField.label !== false"
  >
    <span class="input-label">
      {{ inputField.label ? inputField.label : humanize(inputField.name) }}
    </span>

    <span :class="suffixClass" v-text="suffix" v-if="inputField.required !== null" />
  </label>
</template>

<script>
import { Vue, Component, Inject } from 'vue-property-decorator'

@Component
export default class InputLabel extends Vue {
  @Inject() input
  @Inject({
    form: 'form',
    default: null
  })
  form

  get suffixClass() {
    return this.inputField.required ? 'pui-input-required red' : 'pui-input-optional subtle'
  }

  get suffix() {
    const config = this.form ? this.form.config : {}

    const requiredText =
      typeof this.inputField.requiredText === 'undefined'
        ? config.requiredText
        : this.inputField.requiredText

    const optionalText =
      typeof this.inputField.optionalText === 'undefined'
        ? config.optionalText
        : this.inputField.optionalText

    return this.inputField.required ? requiredText : optionalText
  }

  get inputField() {
    return this.input ? this.input : {}
  }

  /**
   * Convert this input fields name from an underscored format to a humanized format.
   * @param text
   * @return {string}
   */
  humanize(text) {
    if (text) {
      return text
        .replace(/_/g, ' ')
        .trim()
        .replace(/\b[A-Z][a-z]+\b/g, word => word.toLowerCase())
        .replace(/^[a-z]/g, first => first.toUpperCase())
    }
    return ''
  }
}
</script>
