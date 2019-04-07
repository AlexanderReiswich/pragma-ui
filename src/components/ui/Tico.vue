<template>
  <div>
    <div :class="ticoOuterClass">
      <i :class="ticoInnerClass">
        <span></span>
      </i>
    </div>
  </div>
</template>

<script>
import { Component, Vue, Prop } from 'vue-property-decorator'

/**
 * The Tico component wraps PragmaCSS' Transformicon styles.
 */
@Component
export default class Tico extends Vue {
  @Prop(String) size
  @Prop(String) name
  @Prop(String) color
  @Prop(Boolean) thin
  @Prop(String) innerClass

  get ticoOuterClass() {
    return ['tico-' + (this.size ? this.size : 'm'), this.color].filter(Boolean).join(' ')
  }

  get ticoInnerClass() {
    return [
      'tico-' + (this.name ? this.name : 'options'),
      this.thin ? 'tico-thin' : '',
      this.innerClass
    ]
      .filter(Boolean)
      .join(' ')
  }
}
</script>
