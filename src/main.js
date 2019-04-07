import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ReactiveProvide from 'vue-reactive-provide'

Vue.config.productionTip = false
Vue.use(ReactiveProvide)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
