<template>
  <div id="summary-id" class="sixteen wide column centered" style="margin: 1.1em">
    <div class="ui message">
      <ul class="ui red stackable menu">
        <li class="item">
          <img class="logo" src="./assets/gitlab-logo.svg" v-bind:alt="altText" />
        </li>
        <li v-for="s in localStatus" v-bind:key="s.color" class="item">
          <h2>{{ s.total }} {{ s.text }}</h2>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'summary',
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