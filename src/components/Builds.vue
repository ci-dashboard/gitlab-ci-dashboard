<template>
  <div class="row builds" id="gcim-builds">
    <div class="sixteen wide column">
      <div class="ui stackable cards">
        <div v-for="build in builds" v-bind:key="build" v-bind:class="builds.statusClass">
          <div class="content">
            <div class="header project-name">
              <a target="_blank" v-bind:href="build.project_url">{{ build.project }} ({{ build.branch }})</a>
            </div>
            <div class="meta">{{ build.author }}</div>
            <div class="description">
            </div>
          </div>
          <div class="extra content">
            <span class="left floated hashtag build-id">
              <a target="_blank" v-bind:href="build.project_build_url">
              <i class="hashtag icon"></i>
                {{ build.id}}
              </a>
            </span>
            <span class="right floated calendar">
              <i class="calendar icon"></i>
              {{ build.started_at }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'builds',
    data () {
      return {
        gitlab: '',
        builds: [
          {
            id: '',
            status: '',
            project_path: '',
            started_at: '',
            statusClass: 'card ',
            project_url: `https://gitlab/build.project_path`,
            project_build_url: `https://gitlab/build.project_path/builds/build.id`
          }
        ]
      }
    }
  }
</script>