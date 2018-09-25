<template>
  <div class="row" style="margin: 1em 0 1em 1em" id="gcim-builds">
    <div class="sixteen wide column">
      <div class="ui stackable cards">
        <div
          v-for="build in sortedBuilds"
          v-bind:key="build.id"
          v-bind:class="statusClass(build)"
        >
          <div class="content">
            <h3 v-if="build.description" class="ui header">{{ build.description }}</h3>
            <a target="_blank" v-bind:href="build.link_to_branch">
              <h3 class="header project-name">
                {{ build.project }} ({{ build.branch }})
              </h3>
            </a>
            <div class="meta">{{ build.namespace_name }}</div>
            <b>Commit:</b>
            <div class="description">
              {{ build.commit_message }}
            </div>
            <b>Author:</b>
            <div class="description">
              {{ build.author }}
            </div>
            <div v-if="!isSuccessCard(build) && showVersion(build)" class="ui center floated basic button">
              <h1 style="font-size: 1.5em">{{ build.tag_name }}</h1>
            </div>
            <div v-if="isSuccessCard(build) && showVersion(build)" class="ui center floated basic button">
              <h1 style="font-size: 2.5em">
                {{ build.tag_name }}
              </h1>
            </div>
          </div>
          <div class="extra content">
            <span class="left floated hashtag build-id">
              <a target="_blank" v-bind:href="build.link_to_build">
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
  import {SUCCESS} from '../status'

  export default {
    name: 'builds',
    props: ['onBuilds', 'sortedBuilds', 'hideSuccessCards', 'hideVersion'],
    data () {
      return {
        gitlab: ''
      }
    },
    methods: {
      isSuccessCard ({status}) {
        return status === SUCCESS
      },
      showVersion (build) {
        return !this.hideVersion && build.tag_name != null
      },
      statusClass (build) {
        return `card ${build.status} ${this.positionClass(build)}`
      },
      positionClass ({ lastStatus, status }) {
        if (!this.hideSuccessCards) {
          return ''
        }
        return status === 'success' ? 'bounce-out-top' : 'bounce-in-top'
      }
    }
  }
</script>