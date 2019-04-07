<template>
  <div class="pui-calendar pad-s">
    <div class="space-around wrap pad-up-m push-h-s no-select">
      <div class="center push-s">
        <tico
          name="chevron-left"
          color="muted"
          size="m"
          class="inline pointer"
          @click.native.prevent="goToMonth(1, 'prev')"
        />

        <a
          href="#"
          class="pui-calendar-label pui-month-label inline small uppercase extend-m"
          @click.prevent="toggleMonthSelection"
        >
          {{ vD.format('MMMM') | shortMonth }}
        </a>

        <tico
          name="chevron-right"
          color="muted"
          size="m"
          class="inline pointer"
          @click.native.prevent="goToMonth(1, 'next')"
        />
      </div>
      <div class="center push-s">
        <tico
          name="chevron-left"
          color="muted"
          size="m"
          class="inline pointer"
          @click.native.prevent="goToYear(1, 'prev')"
        />

        <div class="pui-calendar-label year-label inline small uppercase extend-m">
          <popper
            trigger="click"
            transition="popper-fade"
            enter-active-class="popper-fade-enter popper-fade-enter-active"
            leave-active-class="popper-fade-leave popper-fade-leave-active"
            :options="yearPopperOptions"
            :force-show="selectingYear"
          >
            <a class="pointer" slot="reference" @click="selectingYear = true">
              {{ vD.format('YYYY') }}
            </a>
            <div class="popper with-arrow">
              <div class="popper-inner white-bg shadow-m rounded-m">
                <form-number
                  :value="selectedYear"
                  :min="selectedYear - 1000"
                  :max="selectedYear + 1000"
                  @updated="setYearDirectInput"
                />
                <div class="push-up-m space-around align-v">
                  <button class="btn push-right" v-text="'Set year'" @click.prevent="setYear" />
                  <button
                    class="btn blank muted"
                    @click.prevent="selectingYear = false"
                    v-text="'Cancel'"
                  />
                </div>
              </div>
            </div>
          </popper>
        </div>

        <tico
          name="chevron-right"
          color="muted"
          size="m"
          class="inline pointer"
          @click.native.prevent="goToYear(1, 'next')"
        />
      </div>
      <a
        href="#"
        class="pui-today-label push-s muted small uppercase extend-m"
        @click.prevent="setDate()"
      >
        Today
      </a>
    </div>

    <br />

    <div class="flex wrap">
      <div
        class="pui-day-names pui-day-column center align-vh"
        v-for="day in dayNames"
        :key="day.short"
      >
        <div v-text="day.short" class="align-vh muted pad-xs" :class="day.className" />
      </div>

      <div
        class="pui-single-day pui-day-column center align-vh"
        v-for="(day, index) in days"
        :class="getDayClassName(day)"
        :key="'day_' + index"
      >
        <div
          v-text="padNum(day.n)"
          class="align-vh circular tween-l small"
          :class="setDayClass(day)"
          @click="setDate(day.date)"
        />
      </div>
    </div>

    <div class="pui-selection-overlay" v-show="selectingMonth">
      <div class="pui-months-overview" v-show="selectingMonth">
        <div class="pui-months-overview-title full bold">
          Month selection
        </div>
        <a
          v-for="(month, index) in monthNames"
          :key="month"
          href="#"
          class="block size-s extend-l pad"
          :class="vD.month() === index ? 'pui-active-month primary' : 'muted'"
          @click.prevent="selectMonth(index + 1)"
        >
          {{ month | shortMonth }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import { CalendarMixin } from '@c/forms/mixins'
import { Tico } from '@c/ui'
import Popper from 'vue-popperjs'

/**
 * The Calendar component displays an interactive UI for date selection.
 */
@Component({
  components: {
    Tico,
    Popper,
    FormNumber: () => import('@c/forms/FormNumber') // Dynamic import to prevent circular reference
  },
  filters: {
    shortMonth(m) {
      return m.slice(0, 3)
    }
  }
})
export default class Calendar extends Mixins(CalendarMixin) {
  @Prop({
    type: String,
    default: 'en'
  })
  locale

  @Prop(Object) value
  @Prop(Boolean) isOpen

  selectingMonth = false
  selectingYear = false
  dayClass = 'primary-bg white'
  activeDayClass = 'light-bg-on-hover pointer'
  activeMonthClass = 'pui-active-month'
  inactiveMonthClass = 'pui-inactive-month opacity-25'
  yearDirectInput = null

  /**
   * If the calendar popup is closed, make sure to also close the year selection.
   *
   * @param {Boolean} isOpen
   */
  @Watch('isOpen', {
    immediate: true
  })
  onDataChanged(isOpen) {
    if (!isOpen) {
      this.selectingYear = false
    }
  }

  /**
   * If the date value has been changed, update the local date objects.
   *
   * @param {Boolean} date
   */
  @Watch('value', {
    immediate: true
  })
  onValueChanged(date) {
    this.sD = this.vD = date && date.isValid() ? date : this.today()
  }

  /**
   * Pad a number with leading zeroes.
   *
   * @param {Number} num
   * @param {Number} pad
   * @return String
   */
  padNum(num, pad = 2) {
    return num.toString().padStart(pad, '0')
  }

  /**
   * Open month selection view.
   */
  toggleMonthSelection() {
    this.selectingMonth = !this.selectingMonth
  }

  /**
   * Open month selection view.
   */
  selectMonth(month) {
    this.selectingMonth = false
    this.goToMonth(month)
  }

  /**
   * Open year selection view.
   */
  toggleYearSelection() {
    this.selectingYear = !this.selectingYear
  }

  /**
   * Update the local direct input year value.
   */
  setYearDirectInput(value) {
    this.yearDirectInput = value
  }

  /**
   * Set the year selected through direct input.
   */
  setYear() {
    this.vD = this.vD.set('year', this.yearDirectInput)
    this.selectingYear = false
  }

  yearPopperOptions = {
    placement: 'bottom',
    modifiers: {
      flip: {
        behavior: ['bottom', 'top']
      }
    }
  }

  mounted() {
    this.yearDirectInput = this.selectedYear
  }
}
</script>

<style lang="stylus" scoped>
.pui-calendar
  width auto
  max-width 480px

.pui-day-column
  width 14%
  height 60px

.pui-day-column div
  width 40px
  height 40px

.pui-calendar-label
  width 60px
  text-align center

.pui-selection-overlay
  position absolute
  top 0
  right 0
  bottom 0
  left 0
  background #fff
  text-align center

.pui-months-overview
  display flex
  flex-wrap wrap
  align-items center
  align-content space-evenly
  justify-content center
  height 100%

.pui-months-overview > a
  width 30%
  box-sizing border-box
</style>
