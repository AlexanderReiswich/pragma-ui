<template>
  <div>
    <a :href="'#' + row.email" class="btn">Edit</a>
  </div>
</template>

<script>
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class DataListEdit extends Vue {
  @Prop() row
  @Prop() head
}
</script>
