<template>
  <label
    class="push-down-xs"
    :class="input.labelClass"
    :for="input.cId"
    v-if="input.label !== false"
  >
    <span class="input-label">
      {{ input.label ? input.label : humanize(input.name) }}
    </span>

    <span :class="suffixClass" v-text="suffix" v-if="input.required !== null" />
  </label>
</template>

<script>
import { Vue, Component, Inject } from 'vue-property-decorator'

@Component
export default class InputLabel extends Vue {
  @Inject() input
  @Inject({
    from: 'form',
    default: null
  })
  form

  get suffixClass() {
    return this.input.required ? 'pui-input-required red' : 'pui-input-optional subtle'
  }

  get suffix() {
    const config = this.form ? this.form.config : {}

    const requiredText =
      typeof this.input.requiredText === 'undefined' ? config.requiredText : this.input.requiredText

    const optionalText =
      typeof this.input.optionalText === 'undefined' ? config.optionalText : this.input.optionalText

    return this.input.required ? requiredText : optionalText
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
