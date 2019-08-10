<template>
  <span :class="isActive ? 'popper-is-active' : ''">
    <transition :name="transition" @after-leave="afterLeave">
      <span ref="popper" v-show="!disabled && showPopper">
        <slot>{{ content }}</slot>
      </span>
    </transition>
    <slot name="reference"></slot>
    <slot name="extra"></slot>
  </span>
</template>

<script>
import Popper from 'popper.js'

function on(element, event, handler) {
  if (element && event && handler) {
    document.addEventListener
      ? element.addEventListener(event, handler, false)
      : element.attachEvent('on' + event, handler)
  }
}

function off(element, event, handler) {
  if (element && event) {
    document.removeEventListener
      ? element.removeEventListener(event, handler, false)
      : element.detachEvent('on' + event, handler)
  }
}

export default {
  props: {
    trigger: {
      type: String,
      default: 'hover',
      validator: value => ['click', 'hover', 'custom'].indexOf(value) > -1
    },
    delayOnMouseOver: {
      type: Number,
      default: 10
    },
    delayOnMouseOut: {
      type: Number,
      default: 10
    },
    disabled: {
      type: Boolean,
      default: false
    },
    content: String,
    boundariesSelector: String,
    reference: {},
    forceShow: {
      type: Boolean,
      default: false
    },
    dataValue: {
      default: null
    },
    appendToBody: {
      type: Boolean,
      default: false
    },
    visibleArrow: {
      type: Boolean,
      default: true
    },
    transition: {
      type: String,
      default: ''
    },
    beforeHide: {
      type: Function,
      default: null
    },
    stopPropagation: {
      type: Boolean,
      default: false
    },
    preventDefault: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      isActive: false,
      referenceElm: null,
      popperJS: null,
      showPopper: false,
      hasOpened: false,
      currentPlacement: '',
      popperOptions: {
        placement: 'bottom',
        computeStyle: {
          gpuAcceleration: false
        },
        onUpdate: () => {
          // Updates in the Popper context are scheduled, so we don't know exactly when an update takes place.
          // For this reason, we use the hasOpened prop to determine when the popper was, in fact, opened.
          if (!this.hasOpened) {
            this.hasOpened = true
            this.$emit('opened', this)
          }
        }
      }
    }
  },
  watch: {
    showPopper(value) {
      if (value) {
        this.isActive = true
        if (this.popperJS) {
          this.popperJS.enableEventListeners()
        }
        this.updatePopper()
      } else {
        if (this.popperJS) {
          this.popperJS.disableEventListeners()
        }
      }
    },
    forceShow: {
      handler(value) {
        this[value ? 'doShow' : 'doClose']()
      },
      immediate: true
    },
    disabled(value) {
      if (value) {
        this.showPopper = false
      }
    }
  },
  created() {
    this.appendedArrow = false
    this.appendedToBody = false
    this.popperOptions = Object.assign(this.popperOptions, this.options)
  },
  mounted() {
    this.referenceElm = this.reference || this.$slots.reference[0].elm
    this.popper = this.$slots.default[0].elm

    if (this.trigger === 'click') {
      on(this.referenceElm, 'click', this.doToggle)
      on(document, 'click', this.handleDocumentClick)
    } else if (this.trigger === 'hover') {
      on(this.referenceElm, 'mouseover', this.onMouseOver)
      on(this.referenceElm, 'focus', this.onMouseOver)
      on(this.popper, 'mouseover', this.onMouseOver)
      on(this.popper, 'focus', this.onMouseOver)
      on(this.referenceElm, 'mouseout', this.onMouseOut)
      on(this.referenceElm, 'blur', this.onMouseOut)
      on(this.popper, 'mouseout', this.onMouseOut)
      on(this.popper, 'blur', this.onMouseOut)
    }
  },
  methods: {
    doToggle(event) {
      if (this.stopPropagation) {
        event.stopPropagation()
      }
      if (this.preventDefault) {
        event.preventDefault()
      }
      if (!this.forceShow) {
        this.showPopper = this.showPopper ? this.doClose() : this.doShow()
      }
    },
    doShow() {
      if (!this.showPopper) {
        this.showPopper = true
        this.$emit('show', this)
      }
    },
    afterLeave() {
      this.isActive = false
      this.doDestroy()
    },
    doClose() {
      if (this.showPopper) {
        const hide = () => {
          this.showPopper = false
          this.hasOpened = false
          this.$emit('hide', this)
        }

        // Trigger the beforeHide callback if it was provided
        this.beforeHide ? this.beforeHide(() => hide()) : hide()
      }
    },
    doDestroy() {
      if (this.showPopper) {
        return
      }
      if (this.popperJS) {
        this.popperJS.destroy()
        this.popperJS = null
      }
      if (this.appendedToBody) {
        this.appendedToBody = false
        document.body.removeChild(this.popper.parentElement)
      }
    },
    createPopper() {
      this.$nextTick(() => {
        if (this.visibleArrow) {
          this.appendArrow(this.popper)
        }
        if (this.appendToBody && !this.appendedToBody) {
          this.appendedToBody = true
          document.body.appendChild(this.popper.parentElement)
        }
        if (this.popperJS && this.popperJS.destroy) {
          this.popperJS.destroy()
        }
        if (this.boundariesSelector) {
          const boundariesElement = document.querySelector(this.boundariesSelector)
          if (boundariesElement) {
            this.popperOptions.modifiers = Object.assign({}, this.popperOptions.modifiers)
            this.popperOptions.modifiers.preventOverflow = Object.assign(
              {},
              this.popperOptions.modifiers.preventOverflow
            )
            this.popperOptions.modifiers.preventOverflow.boundariesElement = boundariesElement
          }
        }
        this.popperOptions.onCreate = () => {
          this.$emit('created', this)
          this.$nextTick(this.updatePopper)
        }
        this.popperJS = new Popper(this.referenceElm, this.popper, this.popperOptions)
      })
    },
    destroyPopper() {
      off(this.referenceElm, 'click', this.doToggle)
      off(this.referenceElm, 'mouseup', this.doClose)
      off(this.referenceElm, 'mousedown', this.doShow)
      off(this.referenceElm, 'focus', this.doShow)
      off(this.referenceElm, 'blur', this.doClose)
      off(this.referenceElm, 'mouseout', this.onMouseOut)
      off(this.referenceElm, 'mouseover', this.onMouseOver)
      off(document, 'click', this.handleDocumentClick)
      this.doClose()
      this.doDestroy()
    },
    appendArrow(element) {
      if (this.appendedArrow) {
        return
      }
      this.appendedArrow = true
      const arrow = document.createElement('div')
      arrow.setAttribute('x-arrow', '')
      arrow.className = 'popper__arrow'
      element.appendChild(arrow)
    },
    updatePopper() {
      this.popperJS ? this.popperJS.scheduleUpdate() : this.createPopper()
    },
    onMouseOver() {
      clearTimeout(this._timer)
      this._timer = setTimeout(() => {
        this.doShow()
      }, this.delayOnMouseOver)
    },
    onMouseOut() {
      clearTimeout(this._timer)
      this._timer = setTimeout(() => {
        this.doClose()
      }, this.delayOnMouseOut)
    },
    handleDocumentClick(e) {
      if (
        !this.$el ||
        !this.referenceElm ||
        this.elementContains(this.$el, e.target) ||
        this.elementContains(this.referenceElm, e.target) ||
        !this.popper ||
        this.elementContains(this.popper, e.target)
      ) {
        return
      }
      this.$emit('documentClick', this)
      if (this.forceShow) {
        return
      }
      this.doClose()
    },
    elementContains(elm, otherElm) {
      if (typeof elm.contains === 'function') {
        return elm.contains(otherElm)
      }
      return false
    }
  },
  destroyed() {
    this.destroyPopper()
  }
}
</script>
