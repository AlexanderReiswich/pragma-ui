<template>
  <div class="push-down-2xl">
    <h3 class="size-l bold push-down-m">Dropdown component</h3>

    <dropdown btnClass="btn push-down" arrow="left" arrowColor="white">
      <template v-slot:button>
        Toggle dropdown
      </template>
      <div class="light-bg pad-s rounded">
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
        et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
        Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
        diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
        gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
      </div>
    </dropdown>
  </div>
</template>

<script>
import { Vue, Component, Prop } from 'vue-property-decorator'
import * as UiComponents from '@c/ui'

@Component({
  components: {
    ...UiComponents
  }
})
export default class UiPage extends Vue {
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
