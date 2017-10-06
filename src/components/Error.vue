<template>
  <div v-show="onError" class="row" id="gcim-error">
    <div class="eight wide column centered ">
      <div class="ui red message">{{ onError.message }}</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'error',
    data () {
      return {
        onError: {
          message: null
        }
      }
    }
  }
</script>