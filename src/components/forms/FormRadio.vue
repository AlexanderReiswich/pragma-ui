<template>
  <div class="radio-container">
    <template v-for="(item, index) in options">
      <div class="pui-radio-label inline push-right-l push-down" :key="item.value || index">
        <label :for="cId + '_' + index" class="radio" :class="cLabelClass">
          <div class="pui-cell">
            <input
              type="radio"
              :id="cId + '_' + index"
              :name="name"
              :value="item.value || item"
              :checked="cValue === (item.value || item)"
              :disabled="disabled || item.disabled"
              @change="updateField"
              ref="radio"
            />
            <div class="radio-indicator" :class="cIndicatorClass" />
          </div>
          <div class="pui-cell">
            <span :class="cTextClass" v-html="item.text" />
          </div>
        </label>
      </div>
    </template>

    <input-errors />

    <input-notice />
  </div>
</template>

<script>
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { FieldMixin } from '@c/forms/mixins'
import { InputLabel, InputErrors, InputNotice } from '@c/forms/partials'

@Component({
  components: {
    InputLabel,
    InputErrors,
    InputNotice
  }
})
export default class FormRadio extends Mixins(FieldMixin) {
  @Prop({
    type: String,
    default: 'm'
  })
  size

  @Prop(String) labelClass
  @Prop(String) indicatorClass
  @Prop(String) textClass
  @Prop(Boolean) disabled
  @Prop(Array) options

  /**
   * Set the classes for the label element.
   * If the labelClass prop is not supplied, the push-right-l class is added by default.
   *
   * @return string
   */
  get cLabelClass() {
    if (this.labelClass) {
      return this.labelClass
    }

    return 'pui-double-column'
  }

  /**
   * Set the classes for the indicator element based on the desired radio size.
   * If the indicatorClass prop is supplied directly, a size class won't be set automatically.
   *
   * @return string
   */
  get cIndicatorClass() {
    if (this.indicatorClass) {
      return this.indicatorClass
    }

    return 'size-' + this.size
  }

  /**
   * Set the classes for the label text based on the desired radio size.
   * Text sizes do not directly correspond to radio indicator sizes and therefore have to be mapped.
   * If the textClass prop is supplied directly, a size class won't be set automatically.
   *
   * @return string
   */
  get cTextClass() {
    if (this.textClass) {
      return this.textClass
    }

    const sizes = {
      xs: 's',
      s: 'm',
      m: 'l',
      l: 'xl',
      xl: '2xl'
    }

    return 'inline size-' + (sizes[this.size] ? sizes[this.size] : 'l')
  }

  updateField() {
    let value = this.cValue

    this.$refs.radio.forEach((elem, i) => {
      if (elem.checked) value = this.options[i].value
    })

    // Trigger the value update
    this.updateValue(value)
  }
}
</script>
