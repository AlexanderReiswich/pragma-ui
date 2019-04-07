<template>
  <div class="full">
    <a
      href="#"
      class="pui-form-select-entry block pad-s"
      :class="itemClass"
      @click.prevent="$emit('select', option)"
    >
      <tico
        :name="isSelected ? 'check' : 'square'"
        :color="isSelected ? 'primary' : 'subtle'"
        :thin="true"
        size="l"
        class="inline push-right-s"
      />
      {{ option.text }}
    </a>
  </div>
</template>

<script>
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Tico } from '@c/ui'

@Component({
  components: {
    Tico
  }
})
export default class FormSelectEntry extends Vue {
  @Prop(Object) option
  @Prop([String, Number, Object, Array]) value
  @Prop(Boolean) focused

  get isSelected() {
    if (this.value) {
      if (this.value.constructor === Array) {
        return this.value.find(element => element === this.option.value)
      } else {
        return this.value === this.option.value
      }
    }
    return false
  }

  /**
   * Set proper classes for the input element depending on the state of the popper dropdown extension.
   * @return string
   */
  get itemClass() {
    let c = [this.isSelected ? 'primary' : 'dark']

    if (this.focused) {
      c.push('light-bg rounded-s')
    }

    return c.join(' ')
  }
}
</script>

<style lang="stylus"></style>
