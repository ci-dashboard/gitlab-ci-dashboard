<template>
  <div v-show="false" class="row" id="gcim-loading">
    <div class="ui large active centered inline loader"></div>
  </div>
</template>

<script>
  export default {
    name: 'loading',
    props: ['onLoading'],
    data () {
      return {
        loadingText: ''
      }
    }
  }
</script>