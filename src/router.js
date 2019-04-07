import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home'
import Forms from './views/Forms'
import DataLists from './views/DataLists'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/forms',
      name: 'forms',
      component: Forms
    },
    {
      path: '/datalists',
      name: 'datalists',
      component: DataLists
    }
  ]
})
