<template>
  <div :data-state="isOpen ? 'open' : 'closed'">
    <div @click.prevent="toggle" :class="btnClass">
      <tico
        :name="isOpen ? 'chevron-up' : 'chevron-down'"
        :color="arrowColor"
        size="m"
        class="pui-dropdown-arrow-left inline push-right-m"
        v-if="arrow === 'left'"
      />
      <slot name="button" />
      <tico
        :name="isOpen ? 'chevron-up' : 'chevron-down'"
        :color="arrowColor"
        size="m"
        class="pui-dropdown-arrow-right inline push-left-m"
        v-if="arrow === 'right'"
      />
    </div>
    <slot name="visible"></slot>
    <transition
      @enter="enter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="relative" v-show="isOpen">
        <slot :toggle="toggle" />
      </div>
    </transition>
  </div>
</template>

<script>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Tico } from '@c/ui'
import anime from 'animejs'

/**
 * The Dropdown component can be used to toggle content visibility via a button or through other means.
 */
@Component({
  components: {
    Tico
  }
})
export default class Dropdown extends Vue {
  @Prop({
    type: Boolean,
    default: false
  })
  open

  @Prop(String) btnClass

  @Prop({
    type: Boolean,
    default: true
  })
  cancel

  @Prop(String) arrow

  @Prop({
    type: String,
    default: 'primary'
  })
  arrowColor

  isMoving = false
  isOpen = false
  dropDownHeight = 0

  get cIcon() {
    if (this.isOpen) {
      return this.cancel ? 'cancel' : this.icon
    } else {
      return this.icon
    }
  }

  @Watch('open')
  toggleOpen(value) {
    this.isOpen = value
  }

  toggle() {
    if (!this.isMoving) {
      this.isOpen = !this.isOpen
      this.$emit('toggle', this.isOpen)
    }
  }

  enter(el, done) {
    this.isMoving = true

    Object.assign(el.style, {
      opacity: 0,
      height: 'auto',
      overflow: 'hidden'
    })

    this.dropDownHeight = el.offsetHeight + 'px'
    el.style.height = 0

    anime({
      targets: el,
      easing: 'easeOutQuart',
      opacity: 1,
      height: this.dropDownHeight,
      duration: 400,
      complete: () => done()
    })
  }

  afterEnter(el) {
    Object.assign(el.style, {
      height: 'auto',
      overflow: 'inherit'
    })
    this.isMoving = false
  }

  beforeLeave(el) {
    this.isMoving = true

    Object.assign(el.style, {
      height: el.offsetHeight,
      overflow: 'hidden'
    })
  }

  leave(el, done) {
    el.style.height = el.offsetHeight + 'px'

    anime({
      targets: el,
      easing: 'easeOutQuart',
      opacity: 0,
      height: 0,
      duration: 400,
      complete: () => done()
    })
  }

  afterLeave() {
    this.isMoving = false
  }

  mounted() {
    this.isOpen = this.open ? this.open : false

    if (this.isOpen) {
      this.dropDownHeight = 'auto'
    }
  }
}
</script>
