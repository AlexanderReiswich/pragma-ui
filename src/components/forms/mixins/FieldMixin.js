import { Vue, Component, Prop, Inject } from 'vue-property-decorator'
import get from 'lodash.get'

/**
 * This mixin sets a number of essential form input values, such as common props and certain computed values
 * (id, value and errors).
 *
 * It then reactively provides these properties so that the input fields child components can access them, as well.
 */
@Component({
  provide() {
    const input = {}
    const includes = [
      'cId',
      'cValue',
      'name',
      'label',
      'labelClass',
      'notice',
      'required',
      'requiredText',
      'optionalText',
      'disabled',
      'loading',
      'formLoading',
      'errors'
    ]

    for (let i of includes) {
      Object.defineProperty(input, i, {
        enumerable: true,
        get: () => this[i]
      })
    }

    return { input }
  }
})
export default class FieldMixin extends Vue {
  @Inject() form

  @Prop(String) id

  @Prop(String) name

  @Prop() value

  @Prop() defaultValue

  @Prop({
    type: [String, Boolean],
    default: null
  })
  label

  @Prop(String) labelClass

  @Prop(String) placeholder

  @Prop(String) notice

  @Prop([Boolean, null])
  required

  @Prop([String, null])
  requiredText

  @Prop([String, null])
  optionalText

  @Prop(Boolean) disabled

  @Prop(Boolean) loading

  localValue = null
  hash = Math.random().toString(36).substring(2, 10)

  get cForm() {
    return this.form ? this.form : null
  }

  /**
   * The computed name of the form container, used for the creation of the input fields id.
   * A random string is used if no name is supplied.
   *
   * @returns string
   */
  get formName() {
    return this.cForm ? this.cForm.name : ''
  }

  /**
   * Retrieve the configuration options for this form.
   *
   * @returns object
   */
  get config() {
    return this.cForm ? this.cForm.config : {}
  }

  /**
   * The computed id of this field.
   *
   * @returns string
   */
  get cId() {
    return this.id ? this.id : this.formName + '-' + (this.name || this.hash)
  }

  /**
   * The computed value of this field.
   * This function attempts to derive the value from a number of possible sources.
   * If the value prop was supplied directly, that's what will be used.
   * If the parent form has data and a field with the corresponding name, it'll return that instead.
   * If nothing is found, the defaultValue prop will be used.
   * And if that isn't set either just an empty string will be returned.
   *
   * @returns string
   */
  get cValue() {
    if (!this.isEmpty(this.value)) {
      return this.value
    }

    const data = this.cForm ? this.cForm.localData : {}

    if (this.name && data) {
      const val = data[this.name]

      if (!this.isEmpty(val)) {
        return get(data, this.name)
      }
    }

    if (!this.isEmpty(this.localValue)) {
      return this.localValue
    }

    return this.defaultValue || ''
  }

  /**
   * Helper function to check whether the parent form is in a loading state.
   *
   * @returns string|array
   */
  get formLoading() {
    return this.cForm ? this.cForm.loading : false
  }

  /**
   * Retrieve the errors for this particular input field.
   *
   * @returns string|array
   */
  get errors() {
    const errors = this.cForm ? this.cForm.errors : null
    return errors && errors[this.name] ? errors[this.name] : null
  }

  /**
   * Check if a value is either null, undefined or an empty string.
   * Zeroes are viewed as non-empty.
   *
   * @returns {boolean}
   */
  isEmpty(val) {
    return val === null || val === undefined || val === ''
  }

  /**
   * The updateValue method updates this fields value within the parent forms localData.
   * Emits an "updated" event with the new and old value as attributes
   *
   * @param {Event|Boolean|String} e
   * @returns {void}
   */
  updateValue(e) {
    const value = typeof e === 'object' && typeof e.target === 'object' ? e.target.value : e

    this.$emit('updated', value, this.cValue)

    if (this.name && this.cForm) {
      this.cForm.setValue(this.name, value)
    } else {
      this.localValue = value
    }
  }

  /**
   * Save the initial field value to local data on mount.
   */
  mounted() {
    if (this.name && this.cForm) {
      this.cForm.setValue(this.name, this.cValue)
    }
  }
}
