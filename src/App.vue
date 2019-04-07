<template>
  <div id="app" class="page-container">
    <div class="container max-width-900">
      <img class="block centered push-v-xl max-width-200" alt="Pragma logo" src="@img/logo.svg" />

      <ul class="inline-list space-around border-bottom-s border-subtle pad-s push-down-xl">
        <li v-for="item in menu" :key="item.link">
          <router-link :to="item.link" v-text="item.text" />
        </li>
      </ul>

      <router-view />
    </div>
  </div>
</template>

<script>
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class App extends Vue {
  menu = [
    {
      link: '/forms',
      text: 'Forms'
    },
    {
      link: '/datalists',
      text: 'Data Lists'
    }
  ]
}
</script>

<style lang="stylus">
@import 'assets/styles/pragma.postcss';
</style>
