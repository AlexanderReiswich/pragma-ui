import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

Vue.use({
  install(Vue) {
    Vue.prototype.$puiConfig = {
      requiredText: '*',
      optionalText: '',
      submitText: 'Save',
      securityLabelWeak: 'Weak',
      securityLabelModerate: 'Moderate',
      securityLabelStrong: 'Strong',
      setYearText: 'Set year',
      cancelText: 'Cancel',
      monthSelectionText: 'Month selection',
      setDateText: 'Save',
      setTodayText: 'Today',
      searchLabelText: 'Search',
      selectPlaceholderText: 'Select...',
      searchPlaceholderText: 'Search...',
      selectNoResults: '— No results —',
      calendarLocale: null,
      showAllResults: 'Show all entries',
      allEntriesLoadedText: num => '— All ' + num + ' entries loaded —'
    }
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
