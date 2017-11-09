<template>
  <div v-show="this.show" class="row" id="gcim-error">
    <div class="eight wide column centered ">
      <div class="ui red message">{{ this.message }}</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'error',
    props: ['onError'],
    computed: {
      show () {
        return (this.onError && this.onError.message != null && this.onError.message !== '')
      },
      message () {
        return this.onError && this.onError.message ? this.onError.message : ''
      }
    }
  }
</script>