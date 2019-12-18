<template>
  <form method="post" accept-charset="utf-8" @submit="submit" :id="name">
    <slot />
  </form>
</template>

<script>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import set from 'lodash.set'
import clone from 'lodash.clonedeep'

@Component({
  provide() {
    const form = {}
    const includes = ['config', 'name', 'submit', 'localData', 'errors', 'setValue', 'loading']

    for (let i of includes) {
      Object.defineProperty(form, i, {
        enumerable: true,
        get: () => this[i]
      })
    }

    return { form }
  }
})
export default class FormContainer extends Vue {
  defaults = {
    requiredText: '*',
    optionalText: '',
    submitText: 'Save',
    securityLabelWeak: 'Weak',
    securityLabelModerate: 'Moderate',
    securityLabelStrong: 'Strong',
    setYearText: 'Set year',
    cancelText: 'Cancel',
    monthSelectionText: 'Month selection',
    setDateText: 'Save',
    setTodayText: 'Today',
    calendarLocale: null
  }
  config = {}
  localData = {}
  loading = false

  @Prop(String) customConfig

  @Prop({
    type: String,
    default: Math.random()
      .toString(36)
      .substring(7)
  })
  name

  @Prop(String) load
  @Prop(String) save
  @Prop(Object) data
  @Prop(Object) errors
  @Prop(Function) beforeSubmit

  /**
   * The FormContainer component uses a clone of the data prop internally. Whenever new data is supplied
   * to the BaseForm, it is used to generate the localData object.
   *
   * @param {Object} data
   * @returns void
   */
  @Watch('data', {
    immediate: true,
    deep: true
  })
  onDataChanged(data) {
    if (data) {
      this.localData = clone(data)
    }
  }

  /**
   * Merge the default config with the custom config.
   *
   * @param {Object} customConfig
   * @returns void
   */
  @Watch('customConfig', {
    immediate: true,
    deep: true
  })
  onCustomConfigChanged(customConfig) {
    this.config = {
      ...this.defaults,
      ...customConfig
    }
  }

  /**
   * The setValue method is used to update the local form data from the outside, i.e. the input components
   * in its slot.
   *
   * @param {string} name
   * @param {string | number | Object} value
   *
   * @returns void
   */
  setValue(name, value) {
    this.localData = set(clone(this.localData), name, value)
  }

  setLoading(status) {
    this.loading = status
  }

  submit() {
    console.log('submit')
    const form = {
      setLoading: this.setLoading,
      getErrors: this.getErrors
    }

    // Emit submit event
    this.$emit('submit', this.localData, form)
  }

  beforeMount() {
    if (this.$puiConfig) {
      this.config = {
        ...this.defaults,
        ...this.$puiConfig
      }
    }
  }
}
</script>
