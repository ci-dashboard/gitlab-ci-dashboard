<template>
  <div id="gcim-painel" class="sixteen wide column centered" style="margin: 1.1em 1.1em 0 1.1em">
    <div class="ui message">
      <ul class="ui red stackable menu">
        <li class="item">
          <div class="wrapper">
            <div class="pie spinner"></div>
            <div class="pie filler"></div>
            <div class="mask"></div>
          </div>
          <img class="logo" src="./assets/gitlab-logo.svg" />
        </li>
        <li v-for="s in localStatus" v-bind:key="s.color" class="item">
          <h1>{{ s.total }} {{ s.text }}</h1>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'painel',
    props: ['status'],
    computed: {
      localStatus () {
        if (this.status && this.status.length > 0) {
          return this.status
        }
        return [{text: 'gitlab-ci-monitor'}]
      }
    },
    data () {
      return {
        statusColors: {
          'success': '#00AD68',
          'failed': '#E7484D',
          'pending': '#e75e40',
          'running': '#2d9fd8',
          'canceled': '#aaaaaa'
        }
      }
    }
  }
</script>