<template>
  <div class="sixteen wide column centered" style="margin-top: 1.1em; margin-bottom: 1.1em">
    <div class="ui message">
      <ul class="ui red stackable menu">
        <li class="item">
          <img class="logo" src="./assets/gitlab-logo.svg" v-bind:alt="altText" />
        </li>
        <li v-for="s in status" v-bind:key="s.color" class="item">
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
    data () {
      return {
        messsage: 'Nothing'
      }
    }
  }
</script>