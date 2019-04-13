<template>
  <div :class="ticoOuterClass">
    <i :class="ticoInnerClass">
      <span></span>
    </i>
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
  @Prop(String) innerClass
  @Prop(Boolean) thin

  get ticoOuterClass() {
    const classes = ['tico-' + (this.size ? this.size : 'm')]

    if (this.color) {
      classes.push(this.color)
    }

    if (this.thin) {
      classes.push('tico-thin')
    }

    return classes.join(' ')
  }

  get ticoInnerClass() {
    const classes = ['tico-' + (this.name ? this.name : 'options')]

    if (this.innerClass) {
      classes.push(this.innerClass)
    }

    return classes.join(' ')
  }
}
</script>
