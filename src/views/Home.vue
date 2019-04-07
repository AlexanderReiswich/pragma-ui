<template>
  <div class="home">
    <HelloWorld />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@c/HelloWorld'

export default {
  name: 'home',
  components: {
    HelloWorld
  }
}
</script>
