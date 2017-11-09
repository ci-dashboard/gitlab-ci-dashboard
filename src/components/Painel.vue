<template>
  <div id="gcim-painel" class="column centered">
    <ul class="ui red stackable vertical menu">
      <li class="item">
        <div class="ui grid">
          <div class="row">
            <div class="column wide eight" style="padding-top: 8px">
              <div class="wrapper">
                <div class="pie spinner"></div>
                <div class="pie filler"></div>
                <div class="mask"></div>
              </div>
            </div>
            <div class="column wide eight" style="width: 100px">
              <img class="logo" src="./assets/gitlab-logo.svg" />
            </div>
          </div>
        </div>
      </li>
      <li v-for="s in localStatus" v-bind:key="s.color" class="item">
        <div>
          <span style="font-size: 5em">{{ s.total }}</span>
          <span style="font-size: 1.1em;" v-bind:style="{ color: s.color }" x>{{ s.text }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: 'painel',
    props: ['status'],
    computed: {
      localStatus () {
        if (this.status && this.status.length > 0) {
          return this.status.map((s) => {
            s.color = this.statusColors[s.text]
            return s
          })
        }
        return [{text: 'gitlab-ci-monitor'}]
      }
    },
    data () {
      return {
        statusColors: {
          'success': '#00ad68',
          'failed': '#e7484d',
          'pending': '#e75e40',
          'running': '#3EC8FF',
          'canceled': '#aaaaaa'
        }
      }
    }
  }
</script>