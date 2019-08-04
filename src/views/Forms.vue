<template>
  <div class="push-down-2xl">
    <form-container
      name="sample"
      :errors="formErrors"
      @submit="($event, form) => saveForm($event, form)"
    >
      <template slot-scope="{}">
        <h3 class="size-l bold push-down-s">Text inputs</h3>

        <div class="grid gap-m push-down">
          <div class="col s12 m6 push-down-m">
            <form-input name="username" notice="An example notice." :required="true" />
          </div>
          <div class="col s12 m6 push-down-m">
            <form-password name="password" :strengthCheck="true" />
          </div>
        </div>

        <h3 class="size-l bold push-down-s">Number inputs</h3>

        <div class="grid gap-m push-down">
          <div class="col s12 m6 push-down-m">
            <form-number name="favorite_number" :required="false" />
          </div>
          <div class="col s12 m6 push-down-m">
            <form-number name="monthly_income" format="currency" :float="2" :max="250000" />
          </div>
        </div>

        <h3 class="size-l bold push-down-s">Date field</h3>

        <div class="grid gap-m push-down">
          <div class="col s12 m6 push-down-m">
            <form-date name="date_of_birth" />
          </div>
        </div>

        <h3 class="size-l bold push-down-s">Textarea</h3>

        <div class="grid gap-m push-down">
          <div class="col s12 push-down-m">
            <form-textarea
              name="about_me"
              placeholder="Tell us something about yourself..."
              :rows="4"
              :maxLength="200"
            />
          </div>
        </div>

        <h3 class="size-l bold push-down-s">Select dropdown</h3>

        <div class="grid gap-m push-down">
          <div class="col s12 m6 push-down-m">
            <form-select
              name="salutation"
              :multiple="false"
              :searchable="false"
              :options="salutationOptions"
              :empty="false"
            />
          </div>
          <div class="col s12 m6 push-down-m">
            <form-select
              name="feedback"
              label="How did you hear about us?"
              :multiple="true"
              :searchable="true"
              :options="feedbackOptions"
            />
          </div>
        </div>

        <h3 class="size-l bold push-down-m">Radio buttons</h3>

        <div class="grid gap-m push-down-l">
          <div class="col s12 push-down-m">
            <form-radio
              name="gender"
              :options="genderOptions"
              defaultValue="m"
              @updated="checkValueOnUpdate"
            />
          </div>
        </div>

        <h3 class="size-l bold push-down-m">Checkboxes</h3>

        <div class="grid gap-m push-down-l">
          <div class="col s12 m6 push-down-m">
            <form-checkbox name="agree" @updated="checkValueOnUpdate" class="push-down-s">
              I agree to the terms of service
            </form-checkbox>
            <form-checkbox name="privacy" @updated="checkValueOnUpdate">
              I have read the privacy policy
            </form-checkbox>
          </div>
          <div class="col s12 m6 push-down-m">
            <form-checkbox name="remember_me" :switch="true" @updated="checkValueOnUpdate">
              Keep me signed in
            </form-checkbox>
          </div>
        </div>

        <h3 class="size-l bold push-down-s">Error messages</h3>

        <div class="grid gap-m">
          <div class="col s12 m6 push-down-m">
            <form-input name="real_name" />
          </div>
          <div class="col s12 m6 push-down-m">
            <form-input name="occupation" />
          </div>
        </div>

        <div class="light-bg pad push-down-l" v-if="submittedData">
          The following data has been submitted:<br /><br />
          <div v-for="(value, key) in submittedData" :key="key">
            {{ key }}: <b>{{ value }}</b>
          </div>
        </div>

        <h3 class="size-l bold push-down-s">Submit button</h3>

        <form-submit class="btn ghost" spinnerClass="border-primary">
          Submit form
        </form-submit>
      </template>
    </form-container>
  </div>
</template>

<script>
import { Vue, Component, Prop } from 'vue-property-decorator'
import * as FormComponents from '@c/forms'

@Component({
  components: {
    ...FormComponents
  }
})
export default class FormsPage extends Vue {
  @Prop(String) msg

  submittedData = null

  formErrors = {
    real_name: 'A single error message',
    occupation: ['First error', 'Second error']
  }

  genderOptions = [
    {
      value: 'm',
      text: 'Male'
    },
    {
      value: 'f',
      text: 'Female'
    },
    {
      value: 'o',
      text: 'Other'
    }
  ]

  salutationOptions = [
    {
      value: 'mr',
      text: 'Mr.'
    },
    {
      value: 'mrs',
      text: 'Mrs.'
    },
    {
      value: 'dr',
      text: 'Dr.'
    }
  ]

  feedbackOptions = [
    {
      value: 'a',
      text: 'Google'
    },
    {
      value: 'b',
      text: 'Recommendation from a friend'
    },
    {
      value: 'c',
      text: 'Online ad'
    },
    {
      value: 'd',
      text: 'Magazine article'
    },
    {
      value: 'e',
      text: 'Tech blog'
    },
    {
      value: 'f',
      text: 'Social Media'
    },
    {
      value: 'g',
      text: 'Newsletter'
    },
    {
      value: 'h',
      text: 'Product comparison service'
    },
    {
      value: 'i',
      text: 'Product Hunt'
    },
    {
      value: 'j',
      text: 'Other'
    }
  ]

  checkValueOnUpdate(value, oldValue) {
    console.log(value, oldValue)
  }

  saveForm(data, { setLoading }) {
    setLoading(true)

    // For demonstration purposes, we simulate an ajax call with a timeout
    setTimeout(() => {
      setLoading(false)
      this.submittedData = data
    }, 1000)
  }
}
</script>
