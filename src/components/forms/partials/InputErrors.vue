<template>
  <div v-if="inputField.errors" class="push-up-s push-down-m red align-v">
    <tico
      name="alert"
      color="red"
      size="m"
      innerClass="border-l border-red circular"
      class="inline push-right-s"
      v-if="!isList"
    />

    <template v-if="isList">
      <ul class="push-left-m push-up-0">
        <li class="red" v-for="(error, index) in inputField.errors" :key="index">
          {{ error }}
        </li>
      </ul>
    </template>
    <template v-else>
      <div>{{ inputField.errors }}</div>
    </template>
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
export default class InputErrors extends Vue {
  @Inject() input

  get isList() {
    if (this.inputField.errors && this.inputField.errors.constructor === Array) {
      return this.inputField.errors.length > 1
    }
    return false
  }

  get inputField() {
    return this.input ? this.input : {}
  }
}
</script>
