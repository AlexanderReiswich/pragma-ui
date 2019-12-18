<template>
  <form-input type="password" v-bind="filteredProps" @updated="scorePassword">
    <div slot="afterInputContainer" class="space-between" v-if="strengthCheck">
      <div class="pui-meter inline push-right-s nowrap" :class="'pui-' + strengthClass">
        <div :class="meterBlockClass(block)" v-for="block in blocks" :key="block" />
      </div>

      <div class="small inline muted tween-l" :class="{ 'opacity-0': !strength }">
        {{ strengthLabel }}
      </div>
    </div>
  </form-input>
</template>

<script>
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { FieldMixin } from '@c/forms/mixins'
import { FormInput } from '@c/forms'

/**
 * The FormPassword component wraps a regular FormInput component and extends it with an (optional)
 * password strength indicator.
 */
@Component({
  components: {
    FormInput
  }
})
export default class FormPassword extends Mixins(FieldMixin) {
  @Prop(Boolean) strengthCheck
  @Prop(Boolean) preventSubmit
  @Prop(String) securityLabelWeak
  @Prop(String) securityLabelModerate
  @Prop(String) securityLabelStrong

  blocks = ['weak', 'moderate', 'strong']
  strength = 0
  strengthLabel = ''
  strengthClass = 'pui-none'

  /**
   * Get the props for the input component, but exclude the ones that relate to the password component.
   */
  get filteredProps() {
    const {
      strengthCheck,
      securityLabelWeak,
      securityLabelModerate,
      securityLabelStrong,
      ...filteredProps
    } = this.$props
    return filteredProps
  }

  /**
   * Map password strength percentage values to an array of string values.
   *
   * @param {int} digit
   * @param {array} values
   * @returns {string}
   */
  retrieve(digit, values) {
    if (!digit) return values[0]
    if (digit < 60) return values[1]
    if (digit < 80) return values[2]
    return values[3]
  }

  meterBlockClass(active) {
    const res = ['pui-meter-block', 'tween-l', 'pui-bar-' + active]

    const classes = {
      weak: 'red-bg',
      moderate: 'orange-bg',
      strong: 'green-bg'
    }

    res.push(classes[this.strengthClass])

    return res.filter(Boolean).join(' ')
  }

  /**
   * A simple function to calculate an approximate password strength score.
   * Sets the local values for strength, strengthLabel and strengthClass every time the input value gets updated.
   *
   * @param {string} pw
   * @returns void
   */
  scorePassword(pw) {
    let score = 0

    if (pw) {
      // Award every unique letter until 5 repetitions
      const letters = {}

      for (let i = 0; i < pw.length; i++) {
        letters[pw[i]] = (letters[pw[i]] || 0) + 1
        score += 5.0 / letters[pw[i]]
      }

      // Bonus points for mixing it up
      const variations = {
        digits: /\d/.test(pw),
        lower: /[a-z]/.test(pw),
        upper: /[A-Z]/.test(pw),
        nonWords: /\W/.test(pw)
      }

      let variationCount = 0

      for (let check in variations) {
        variationCount += variations[check] ? 1 : 0
      }

      score += (variationCount - 1) * 10
    }

    const opts = this.form ? this.form.config : {}

    this.strength = score
    this.strengthClass = this.retrieve(score, ['none', ...this.blocks])
    this.strengthLabel = this.retrieve(score, [
      '',
      this.securityLabelWeak || opts.securityLabelWeak,
      this.securityLabelModerate || opts.securityLabelModerate,
      this.securityLabelStrong || opts.securityLabelStrong
    ])
  }

  mounted() {
    // Set the relevant data values on mount / re-mount
    this.scorePassword(this.cValue)
  }
}
</script>

<style lang="stylus">
.pui-meter
  width 40%

.pui-meter.pui-none .pui-meter-block
  opacity 0

.pui-meter-block
  display inline-block
  width 30%
  height 4px
  border-radius 12px
  margin-right 1%
  vertical-align middle
</style>
