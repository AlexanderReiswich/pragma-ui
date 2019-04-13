<template>
  <form-input
    v-bind="filteredProps"
    slot="reference"
    :value="localValue ? localValue.format(storageFormat) : null"
    :extension="true"
    :transform="transformDate"
    :isExtensionOpen="isOpen"
    :toggleExtension="toggleExtension"
    @blur="onBlur"
  >
    <template v-slot:extension>
      <calendar-partial
        :value="localValue"
        :isOpen="isOpen"
        :number="numberComponent"
        :config="config"
        :toggleExtension="toggleExtension"
        @updated="updateDate"
      />
    </template>
    <template v-slot:afterInput>
      <transition name="fade">
        <div class="pui-clear-date align-vh" v-if="localValue">
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

dayjs.extend(LocalizedFormat)

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
  localValue = null

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

  /**
   * Open or close the dropdown extension.
   *
   * @param {boolean} state
   * @return {void}
   */
  toggleExtension(state) {
    this.isOpen = typeof state === 'undefined' ? !this.isOpen : state
  }

  /**
   * Get the props for the input component, but exclude the ones that relate to the date component.
   *
   * @return {void}
   */
  updateDate(date) {
    this.localValue = date
    this.updateValue(date.format(this.storageFormat))
  }

  /**
   * Clear the selected date value.
   *
   * @return {void}
   */
  clearDate() {
    this.localValue = null
  }

  /**
   * Convert the storage date value into the format determined in the visibleFormat prop.
   *
   * @return {string}
   */
  transformDate() {
    return this.localValue ? this.localValue.format(this.visibleFormat) : null
  }

  /**
   * If the date value has been changed through direct input, an attempt is made to apply it.
   * If it's not a valid date, the previous value will be set back.
   *
   * @param date
   * @return string
   */
  onBlur(date) {
    let currentDate = this.transformDate()

    if (date && date !== currentDate) {
      this.localValue = dayjs(date, this.visibleFormat).isValid()
        ? dayjs(date, this.visibleFormat)
        : dayjs(currentDate, this.visibleFormat)
    }
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
