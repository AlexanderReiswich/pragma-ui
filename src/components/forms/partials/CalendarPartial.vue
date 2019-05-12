<template>
  <div class="pui-calendar">
    <div class="pui-calendar-header pad-s space-around wrap no-select">
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

        <div class="inline">
          <popper
            trigger="click"
            transition="popper-fade"
            enter-active-class="popper-fade-enter popper-fade-enter-active"
            leave-active-class="popper-fade-leave popper-fade-leave-active"
            :options="yearPopperOptions"
            :force-show="selectingYear"
            v-click-outside="closeYearSelection"
          >
            <a
              class="pui-calendar-label pui-year-label inline small uppercase extend-m pointer"
              slot="reference"
              @click="selectingYear = true"
            >
              {{ vD.format('YYYY') }}
            </a>
            <div class="popper with-arrow">
              <div class="popper-inner white-bg shadow-m rounded-m">
                <div class="align-left space-between wrap align-h pad-m">
                  <component
                    :is="number"
                    :value="selectedYear"
                    :min="selectedYear - 1000"
                    :max="selectedYear + 1000"
                    @updated="setYearDirectInput"
                    class="pui-year-selection-input push-down-m"
                  />
                  <div class="space-between full">
                    <button class="btn" v-text="config.setYearText" @click.prevent="setYear" />
                    <button
                      class="btn blank muted"
                      @click.prevent="selectingYear = false"
                      v-text="config.cancelText"
                    />
                  </div>
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
    </div>

    <div class="flex wrap pad-s">
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
        <div class="pui-months-overview-title full bold" v-text="config.monthSelectionText" />
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

    <div class="pui-calendar-footer pad-s space-between">
      <a
        href="#"
        class="pui-today-label push-s muted small uppercase extend-m"
        @click.prevent="setDate(null)"
        v-text="config.setTodayText"
      />
      <button
        class="pui-set-date-btn btn push-h-s"
        v-text="config.setDateText"
        @click.prevent="submitCalendar"
      />
    </div>
  </div>
</template>

<script>
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import { CalendarMixin } from '@c/forms/mixins'
import { Tico } from '@c/ui'
import ClickOutside from 'vue-click-outside'

/**
 * The Calendar component displays an interactive UI for date selection.
 */
@Component({
  components: {
    Tico,
    Popper: () => import('@c/ui/Popper')
  },
  filters: {
    shortMonth(m) {
      return m.slice(0, 3)
    }
  },
  directives: {
    ClickOutside
  }
})
export default class CalendarPartial extends Mixins(CalendarMixin) {
  @Prop({
    type: String,
    default: 'en'
  })
  locale

  @Prop(Object) value
  @Prop(Object) config
  @Prop(Boolean) isOpen
  @Prop(Function) number
  @Prop(Function) toggleExtension

  selectingMonth = false
  selectingYear = false
  dayClass = 'pui-active-day light-bg-on-hover pointer'
  activeDayClass = 'pui-day primary-bg white'
  activeMonthClass = 'pui-active-month'
  inactiveMonthClass = 'pui-inactive-month opacity-25'
  yearDirectInput = null
  yearPopperOptions = {
    placement: 'bottom',
    modifiers: {
      flip: {
        behavior: ['bottom', 'top']
      }
    }
  }

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
   * @param {Object} date
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
   * Close the year selection view.
   */
  closeYearSelection() {
    if (this.selectingYear) {
      this.selectingYear = false
    }
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

  /**
   * Set the selected date and close the calendar.
   */
  submitCalendar() {
    this.setDate(this.vD)
    this.toggleExtension ? this.toggleExtension(false) : null
  }

  mounted() {
    this.yearDirectInput = this.selectedYear
  }
}
</script>

<style lang="stylus">
.pui-calendar
  width auto
  max-width 480px

.pui-calendar .popper
  width auto

.pui-calendar-header
  padding-top 4%
  padding-bottom 2%

.pui-calendar-footer
  padding-bottom 4%

.pui-day-column
  width 14%
  height 54px

.popper-m .pui-day-column
  height 50px

.popper-s .pui-day-column
  height 44px

.popper-xs .pui-day-column
  height 34px

.pui-day-column div
  width 40px
  height 40px

.popper-s .pui-day-column div
  width 38px
  height 38px

.popper-xs .pui-day-column div
  width 36px
  height 36px

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

.pui-year-selection-input
  min-width 260px
  max-width 300px
</style>
