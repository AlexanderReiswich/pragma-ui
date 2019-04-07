<template>
  <div class="push-v-s align-v" v-show="input.notice">
    <tico
      name="info"
      color="muted"
      size="m"
      innerClass="border-l border-muted circular"
      class="inline push-right-s"
    />
    <div class="muted">{{ input.notice }}</div>
  </div>
</template>

<script>
import { Vue, Component, Inject } from 'vue-property-decorator'
import { Tico } from '@c/ui'

@Component({
  components: {
    Tico
  }
})
export default class InputNotice extends Vue {
  @Inject() input
}
</script>
