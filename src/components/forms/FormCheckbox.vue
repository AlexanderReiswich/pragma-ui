<template>
  <div class="checkbox-container">
    <label :for="cId" class="checkbox" :class="'pui-double-column ' + cLabelClass">
      <div class="pui-cell">
        <input
          type="checkbox"
          :id="cId"
          :name="name"
          :checked="cValue"
          :disabled="disabled"
          @change="updateField"
          ref="checkbox"
        />
        <span :class="cIndicatorClass" />
      </div>
      <div class="pui-cell">
        <span :class="cTextClass">
          <slot />
        </span>
      </div>
    </label>

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
export default class FormCheckbox extends Mixins(FieldMixin) {
  @Prop(String) size
  @Prop(Boolean) switch
  @Prop(String) labelClass
  @Prop(String) indicatorClass
  @Prop(String) textClass
  @Prop(Boolean) disabled

  /**
   * Set the classes for the label element.
   * If the labelClass prop is not supplied, the push-down class is added by default.
   *
   * @return string
   */
  get cLabelClass() {
    if (this.labelClass) {
      return this.labelClass
    }

    return 'push-down'
  }

  /**
   * Set the classes for the indicator element based on the desired checkbox size.
   * If the indicatorClass prop is supplied directly, a size class won't be set automatically unless its set explicitly.
   *
   * @return string
   */
  get cIndicatorClass() {
    let c = [this.switch ? 'switch-indicator' : 'checkbox-indicator']
    const size = this.size ? this.size : 'm'

    c.push(this.indicatorClass ? this.indicatorClass : 'size-' + size)

    if (this.indicatorClass && this.size) c.push('size-' + size)

    return c.join(' ')
  }

  /**
   * Set the classes for the label text based on the desired checkbox size.
   * Text sizes do not directly correspond to checkbox indicator sizes and therefore have to be mapped.
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

    const size = this.size ? this.size : 'm'

    return 'inline size-' + (sizes[size] ? sizes[size] : 'l')
  }

  updateField() {
    // Trigger the value update
    this.updateValue(!this.cValue)
  }
}
</script>

<style lang="stylus">
.pui-double-column
  display table-row

.pui-double-column .pui-cell
  display table-cell
  vertical-align top
</style>
