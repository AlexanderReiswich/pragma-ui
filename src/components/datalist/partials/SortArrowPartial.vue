<template>
  <div>
    <template v-if="direction">
      <div
        class="pui-sort tween-l pointer"
        :data-dir="direction"
        :class="active ? 'pui-sort-active primary' : 'subtle dark-on-hover'"
        @click="toggle"
      >
        <slot />
        <tico
          :name="direction === 'asc' ? 'chevron-up' : 'chevron-down'"
          :color="active ? 'pui-sort-arrow-active primary' : 'subtle'"
          size="m"
          class="pui-sort-arrow inline push-left-xs"
        />
      </div>
    </template>
    <template v-else>
      <div class="pui-sort tween-l subtle">
        <slot />
      </div>
    </template>
  </div>
</template>

<script>
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Tico } from '@c/ui'

@Component({
  components: {
    Tico
  }
})
export default class SortArrowPartial extends Vue {
  @Prop([String, Boolean]) direction
  @Prop(Boolean) active

  toggle() {
    this.$emit('toggle')
  }
}
</script>

<style lang="stylus" scoped>
.pui-sort
  user-select none

.pui-sort-arrow
  vertical-align middle
</style>
