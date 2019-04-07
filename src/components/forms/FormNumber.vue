<template>
  <form-input
    v-bind="filteredProps"
    :value="localValue"
    :mask="maskedValue"
    :beforeKeyPress="beforeKeyPress"
    inputmode="numeric"
    @updated="onUpdate"
    @blur="onBlur"
    @wheelUp="increment"
    @wheelDown="decrement"
  >
    <template v-slot:afterInput>
      <div class="pui-number-button-container">
        <div
          class="pui-number-minus rounded-s muted light-bg tween"
          :class="{ 'pui-number-disabled': belowMin }"
          @mousedown="walk(false)"
          @touchStart="walk(false)"
          v-text="'-'"
        />
        <div
          class="pui-number-plus rounded-s muted light-bg tween"
          :class="{ 'pui-number-disabled': aboveMax }"
          @mousedown="walk(true)"
          @touchStart="walk(true)"
          v-text="'+'"
        />
      </div>
    </template>
  </form-input>
</template>

<script>
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { FieldMixin } from '@c/forms/mixins'
import { FormInput } from '@c/forms'

/**
 * The FormNumber component wraps a regular FormInput component and extends it with number-related
 * settings and controls.
 */
@Component({
  components: {
    FormInput
  }
})
export default class FormNumber extends Mixins(FieldMixin) {
  @Prop(Number) float

  /**
   * Allowed values are: "decimal", "currency" and "percent".
   */
  @Prop({
    type: String,
    default: 'decimal'
  })
  format

  /**
   * Locale codes such as 'en-US' or 'de-DE'.
   */
  @Prop({
    type: String,
    default: 'en-US'
  })
  locale

  /**
   * Currency codes such as 'USD' or 'EUR'.
   */
  @Prop({
    type: String,
    default: 'USD'
  })
  currency

  /**
   * Minimum allowed value.
   */
  @Prop({
    type: Number,
    default: 0
  })
  min

  /**
   * Maximum allowed value.
   */
  @Prop({
    type: Number,
    default: 100
  })
  max

  localValue = 0
  delayTimeout = null
  isWalking = false

  /**
   * Get the props for the input component, but exclude the ones that relate to the number component.
   *
   * @return Object
   */
  get filteredProps() {
    const { float, format, locale, currency, min, max, ...filteredProps } = this.$props
    return filteredProps
  }

  /**
   * The step size is 1 by default. If the float data variable is set, it determines the number of the floating
   * point numbers.
   *
   * @return Number
   */
  get stepSize() {
    return this.float ? 1 / Math.pow(10, this.float) : 1
  }

  /**
   * Check if current value is equal or below min value.
   *
   * @return String
   */
  get belowMin() {
    return this.cValue <= this.min
  }

  /**
   * Check if current value is equal or above max value.
   *
   * @return String
   */
  get aboveMax() {
    return this.cValue >= this.max
  }

  /**
   * Mask the number value in the desired format, i.e. as a currency.
   *
   * @param value Number
   * @return String
   */
  maskedValue(value) {
    return new Intl.NumberFormat(this.locale, {
      style: this.format,
      currency: this.currency,
      useGrouping: this.format === 'currency'
    }).format(value)
  }

  /**
   * Either increase or decrease the current value by a unit of one.
   *
   * @param value Number
   * @param up Boolean
   * @return {Number}
   */
  shift(value, up) {
    let res = parseFloat(value || 0) + (up ? this.stepSize : -this.stepSize)

    // A fix for decimal numbers due to issues in the way javascript handles floating-point logic
    if (this.float) return parseFloat(res.toFixed(this.float))

    return res
  }

  /**
   * Decrease the current value by a single step within the constraints of the min value.
   *
   * @param e
   */
  decrement(e) {
    if (e) e.preventDefault()

    let res = this.shift(this.localValue, false)
    if (res >= this.min) this.localValue = res
  }

  /**
   * Increase the current value by a single step within the constraints of the max value.
   *
   * @param e
   */
  increment(e) {
    if (e) e.preventDefault()

    let res = this.shift(this.localValue, true)
    if (res <= this.max) this.localValue = res
  }

  /**
   * While the isWalking variable is true, the step function shifts the number value in perpetuity.
   */
  step(up, interval) {
    setTimeout(() => {
      if (this.isWalking) {
        up ? this.increment() : this.decrement()
        return this.step(up, interval > 1 ? interval - 1 : 1)
      }
    }, interval)
  }

  /**
   * Only allow keys relevant for number input.
   *
   * @param {Object} e
   * @return {Boolean}
   */
  beforeKeyPress(e) {
    return [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      ',',
      '.',
      '-',
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown'
    ].includes(e.key)
  }

  /**
   * Update the local value via the input component.
   */
  onUpdate(value, old) {
    this.localValue = value
    this.$emit('updated', value, old)
  }

  /**
   * Ensure that the number is valid after blurring the input field.
   *
   * @param {Number|String} value
   */
  onBlur(value) {
    this.localValue = this.processNumber(value)

    // Trigger the value update
    this.updateValue(this.localValue)
  }

  /**
   * This method converts numbers of any currency format back to their proper integer or float values.
   *
   * @param {Number|String} value
   */
  processNumber(value) {
    // Convert decimal string values back to floats
    if (typeof value === 'string') {
      // Replace all potential non-number characters from the value
      value = value.replace(/[^0-9.,-]+/g, '')

      if (this.float) {
        // Extract all commas / dots from the value
        const p = value.match(/[,.]/g) || []

        // If the last occurence of commas/dots is a comma...
        if (p[p.length - 1] === ',') {
          // ...then swap the dots and commas, so that the dot becomes the delimiter
          value = value.replace(/[,.]/g, $1 => ($1 === ',' ? '.' : ''))
        } else {
          // Otherwise simply remove all commas
          value = value.replace(',', '')
        }

        value = parseFloat(value)
      } else {
        value = parseInt(value)
      }
    }

    return Math.max(this.min, Math.min(value, this.max))
  }

  /**
   * Continually shift the current value by a single step.
   * The speed increases the longer the interval goes on.
   *
   * @param up
   * @return {Number}
   */
  walk(up) {
    // Create a listener for the mouseup event to stop the walk
    document.addEventListener('mouseup', this.stopWalk)
    document.addEventListener('touchend', this.stopWalk)

    this.isWalking = up ? 'up' : 'down'

    this.delayTimeout = setTimeout(() => {
      if (this.isWalking) {
        up ? this.increment() : this.decrement()
        return this.step(up, 70)
      }
    }, 200)
  }

  /**
   * Stop the perpetual number shift.
   */
  stopWalk() {
    document.removeEventListener('mouseup', this.stopWalk)
    document.removeEventListener('touchend', this.stopWalk)
    clearTimeout(this.delayTimeout)

    if (this.isWalking === 'up') this.increment()
    if (this.isWalking === 'down') this.decrement()

    this.isWalking = false

    // Trigger the value update
    this.updateValue(this.localValue)
  }

  mounted() {
    this.localValue = this.value
  }
}
</script>

<style lang="stylus" scoped>
.pui-number-button-container
  position absolute
  top 0
  right 0
  bottom 0
  padding 8px

.pui-number-minus,
.pui-number-plus
  display inline-flex
  align-items center
  font-weight bold
  font-size 25px
  height 100%
  margin-left 4px
  padding 0 14px
  opacity 0.7
  cursor pointer
  -webkit-tap-highlight-color transparent
  user-select none

.pui-number-minus:hover,
.pui-number-plus:hover
  opacity 1

.pui-number-disabled,
.pui-number-disabled:hover
  opacity 0.2
  cursor default
</style>
