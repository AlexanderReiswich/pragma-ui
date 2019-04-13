import { Vue, Component } from 'vue-property-decorator'
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(LocalizedFormat)

/**
 * The Calendar mixin supplies the Calendar component with all the logic-related behaviors.
 */
@Component
export default class CalendarMixin extends Vue {
  // The currently selected date
  sD = dayjs()

  // The currently visible date
  vD = dayjs()

  /**
   * @return {Object} {
   *   formats: {
   *     L: 'MM/DD/YYYY'
   *     LL: 'MMMM D, YYYY'
   *     LLL: 'MMMM D, YYYY h:mm A'
   *     LLLL: 'dddd, MMMM D, YYYY h:mm A'
   *     LT: 'h:mm A'
   *     LTS: 'h:mm:ss A'
   *   },
   *   months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
   *   name: 'en',
   *   weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
   * }
   */
  get localeData() {
    return this.config && this.config.calendarLocale
      ? this.config.calendarLocale
      : dayjs[this.locale]
  }

  /**
   * Get a list of the shortened day names of the week, starting with Monday.
   * @return {Array}
   */
  get dayNames() {
    let w = this.arrangeWeekdays(this.localeData.weekdays)
    let o = this.arrangeWeekdays(dayjs.en.weekdays)

    return w.map((day, i) => {
      return {
        full: day,
        short: day.substring(0, 2),
        className: 'label-' + o[i].toLowerCase()
      }
    })
  }

  get selectedYear() {
    return parseInt(this.vD.format('YYYY'))
  }

  /**
   * Get a list of the month names.
   * @return {Array}
   */
  get monthNames() {
    return this.localeData.months
  }

  /**
   * Determine the offset for the first day of the current month.
   *
   * @param {Object} date
   * @return {Number} The weekday, a value between 0 and 6
   */
  firstDayOffset(date) {
    let s = date.startOf('month').day()

    // We treat Sunday as the last day of the week instead of the first
    s = s === 0 ? 7 : s

    // Due to the Sunday offset, we decrement the index so that Monday starts at 0
    return s - 1
  }

  getDayClassName(entry) {
    const d = dayjs(entry.date).day()

    return dayjs.en.weekdays[d].toLowerCase()
  }

  /**
   * Arrange the weekdays so that Monday is the first day and Sunday is last.
   *
   * @param {Array} days
   * @return {Number} The list of weekdays
   */
  arrangeWeekdays(days) {
    let w = days.slice(0) // Create a clone of the weekdays array

    w.push(w[0]) // We move Sunday to the end so its the last day of the week...
    w.splice(0, 1) // ...and then we remove it at the beginning

    return w
  }

  /**
   * Create an array with integers representing the days of a month.
   *
   * @param {Object} date
   * @return {Array} Days of the month
   */
  scaffoldMonth(date) {
    return Array(date.daysInMonth())
      .fill()
      .map((val, i) => i + 1)
  }

  /**
   * Temporarily move to another month. This action doesn't affect the selected date value.
   *
   * @param {Number} month A number from 1 to 12.
   * @param {String} dir Optional. 'next' to go to the next month, 'prev' to go to the previous month.
   * @return {void}
   */
  goToMonth(month, dir = '') {
    const goTo = dir
      ? this.vD.month() + (dir === 'prev' ? -month : month) // Jump to the prev / next month in set increment
      : month - 1 // If a direction was not set, go to the specified month

    this.vD = this.vD.set('month', goTo)
  }

  /**
   * Temporarily move to another year. This action doesn't affect the selected date value.
   *
   * @param {Number} year
   * @param {String} dir Optional. 'next' to go to the next year, 'prev' to go to the previous year.
   * @return {void}
   */
  goToYear(year, dir) {
    const goTo = dir
      ? this.vD.year() + (dir === 'prev' ? -year : year) // Jump to the prev / next year in set increment
      : year - 1 // If a direction was not set, go to the specified year

    this.vD = this.vD.set('year', goTo)
  }

  /**
   * Easy access to the dayjs date object.
   *
   * @return {Object}
   */
  today() {
    return dayjs()
  }

  /**
   * Set the date to the provided value. If no value was given, set it to today.
   *
   * @param {Object} date
   * @return {void}
   */
  setDate(date) {
    this.sD = this.vD = date ? date : dayjs()
    this.$emit('updated', this.sD)
  }

  /**
   * Set an appropriate class name to each date entry in the calendar.
   *
   * @param {Object} day
   * @return {String}
   */
  setDayClass(day) {
    const c = [day.pos === 'current' ? this.activeMonthClass : this.inactiveMonthClass]

    if (day.date.isSame(this.sD, 'day')) {
      c.push('selected-day', this.activeDayClass)
    } else {
      c.push(this.dayClass)

      if (this.getDayClassName(day) === 'sunday') {
        c.push('red')
      }
    }

    return c.join(' ')
  }

  /**
   * Create a list of all calendar days for the current month, as well as parts of days from
   * the previous and next month.
   *
   * @return {Array}
   */
  get days() {
    let res = []

    const firstDayOffset = this.firstDayOffset(this.vD)

    const prevMonth = this.vD.subtract(1, 'month').startOf('month')
    const currentMonth = this.vD.startOf('month')
    const nextMonth = this.vD.add(1, 'month').startOf('month')

    const prevMonthScaffold = this.scaffoldMonth(prevMonth)
    const currentMonthScaffold = this.scaffoldMonth(currentMonth)
    const nextMonthScaffold = this.scaffoldMonth(nextMonth)

    const restLeft = prevMonthScaffold.slice(
      prevMonthScaffold.length - firstDayOffset,
      prevMonthScaffold.length
    )
    const restRight = nextMonthScaffold.slice(0, 42 - (currentMonth.daysInMonth() + firstDayOffset))

    // First we add the visible days from the last month
    for (let n of restLeft) res.push({ n, pos: 'prev', date: prevMonth.set('date', n) })

    // Then we add all days of the current month
    for (let n of currentMonthScaffold)
      res.push({ n, pos: 'current', date: currentMonth.set('date', n) })

    // Lastly, we add the visible days from the next month
    for (let n of restRight) res.push({ n, pos: 'next', date: nextMonth.set('date', n) })

    return res
  }
}
