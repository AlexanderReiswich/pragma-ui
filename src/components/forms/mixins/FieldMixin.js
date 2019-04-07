import { Vue, Component, Inject, Prop } from 'vue-property-decorator'
import get from 'lodash.get'

/**
 * This mixin sets a number of essential form input values, such as common props and certain computed values
 * (id, value and errors).
 *
 * It then reactively provides these properties so that the input fields child components can access them, as well.
 */
@Component({
  reactiveProvide: {
    name: 'input',
    include: [
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
  }
})
export default class FieldMixin extends Vue {
  @Inject({
    from: 'form',
    default: null
  })
  form

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

  /**
   * The computed name of the form container, used for the creation of the input fields id.
   * A random string is used if no name is supplied.
   *
   * @returns string
   */
  get formName() {
    return this.form ? this.form.name : ''
  }

  /**
   * The computed id of this field.
   *
   * @returns string
   */
  get cId() {
    const name =
      Math.random()
        .toString(36)
        .substring(2, 10) || this.name

    return this.id ? this.id : this.formName + '-' + name
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

    const data = this.form ? this.form.localData : {}

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
    return this.form ? this.form.loading : false
  }

  /**
   * Retrieve the errors for this particular input field.
   *
   * @returns string|array
   */
  get errors() {
    const errors = this.form ? this.form.errors : null
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
   * @param {Event} e
   * @returns {void}
   */
  updateValue(e) {
    const value = typeof e === 'object' && e.target ? e.target.value : e

    console.log(value)
    this.$emit('updated', value, this.cValue)

    if (this.name && this.form) {
      this.form.setValue(this.name, value)
    } else {
      this.localValue = value
    }
  }

  /**
   * Save the initial field value to local data on mount.
   */
  mounted() {
    if (this.name && this.form) {
      this.form.setValue(this.name, this.cValue)
    }
  }
}
