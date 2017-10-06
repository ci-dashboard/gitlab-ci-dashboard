<template>
  <div v-show="loading" class="row" id="gcim-loading">
    <div class="ui large active centered inline loader"></div>
  </div>
</template>

<script>
  export default {
    name: 'loading',
    data () {
      return {
        loadingText: ''
      }
    }
  }
</script>