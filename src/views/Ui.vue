<template>
  <div class="push-down-2xl">
    <h3 class="size-l bold push-down-m">Dropdown component</h3>

    <dropdown btnClass="btn push-down" arrow="left" arrowColor="white">
      <template v-slot:button>
        Toggle dropdown
      </template>
      <div class="light-bg pad-s rounded">
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
        et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
        Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
        diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
        gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
      </div>
    </dropdown>
  </div>
</template>

<script>
import { Vue, Component } from 'vue-property-decorator'
import * as UiComponents from '@c/ui'

@Component({
  components: {
    ...UiComponents
  }
})
export default class UiPage extends Vue {}
</script>
