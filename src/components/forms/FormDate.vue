<template>
  <form-input
    v-bind="filteredProps"
    slot="reference"
    :value="cValue"
    :extension="true"
    :transform="transformDate"
    :isExtensionOpen="isOpen"
    :toggleExtension="toggleExtension"
    :disableAutocomplete="true"
  >
    <template v-slot:extension>
      <calendar-partial
        :value="rawDate"
        :isOpen="isOpen"
        :number="numberComponent"
        :config="config"
        :toggleExtension="toggleExtension"
        @updated="updateDate"
        @saved="saveDate"
      />
    </template>
    <template v-slot:afterInput>
      <transition name="fade">
        <div class="pui-clear-date align-vh" v-if="cValue">
          <tico
            name="close"
            color="muted"
            size="l"
            class="inline pointer"
            :thin="true"
            @click.native.prevent="clearDate"
          />
        </div>
      </transition>
    </template>
  </form-input>
</template>

<script>
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { FieldMixin } from '@c/forms/mixins'
import { CalendarPartial } from '@c/forms/partials'
import FormInput from './FormInput'
import { FormNumber } from '@c/forms'
import { Tico } from '@c/ui'
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(LocalizedFormat)
dayjs.extend(customParseFormat)

/**
 * The FormDate component wraps a regular FormInput component and extends it with a datetime selector.
 */
@Component({
  components: {
    FormInput,
    CalendarPartial,
    Tico
  }
})
export default class FormDate extends Mixins(FieldMixin) {
  isOpen = false
  shouldSaveValue = false
  previousValue = null

  // We pass the number component as a prop to the calendar to prevent circular dependency issues
  numberComponent = FormNumber

  /**
   * Format of the visible value in the input field.
   */
  @Prop({
    type: String,
    default: 'L'
  })
  visibleFormat

  /**
   * Format of the saved date value.
   */
  @Prop({
    type: String,
    default: 'YYYY-MM-DD HH:mm:ss'
  })
  storageFormat

  /**
   * Get the props for the input component, but exclude the ones that relate to the date component.
   */
  get filteredProps() {
    const { name, visibleFormat, storageFormat, ...filteredProps } = this.$props
    return filteredProps
  }

  get rawDate() {
    if (this.cValue) {
      return dayjs(String(this.cValue), this.storageFormat)
    }
    return null
  }

  /**
   * Open or close the dropdown extension.
   *
   * @param {boolean} state
   * @return {void}
   */
  toggleExtension(state) {
    this.isOpen = typeof state === 'undefined' ? !this.isOpen : state

    // If the value is not supposed to be committed, reset it on close
    if (this.isOpen) {
      this.previousValue = this.rawDate
    } else {
      setTimeout(() => {
        if (!this.shouldSaveValue) {
          this.updateDate(this.previousValue)
        } else {
          this.shouldSaveValue = false
        }
      }, 10)
    }
  }

  /**
   * Update the input value.
   *
   * @param date
   * @return {void}
   */
  updateDate(date) {
    this.updateValue(date ? date.format(this.storageFormat) : null)
  }

  /**
   * Remember to commit the current value when the user intended to save.
   *
   * @return {void}
   */
  saveDate() {
    this.shouldSaveValue = true
  }

  /**
   * Clear the selected date value.
   *
   * @return {void}
   */
  clearDate() {
    this.updateValue(null)
  }

  /**
   * Convert the storage date value into the format determined in the visibleFormat prop.
   *
   * @param date
   * @return {string|null}
   */
  transformDate(date) {
    if (date && dayjs(date, this.storageFormat).isValid()) {
      return this.rawDate.format(this.visibleFormat)
    }
    return null
  }
}
</script>

<style lang="stylus">
.pui-clear-date
  position absolute
  top 0
  right 0
  bottom 0
  width 40px
</style>
