<template>
  <div id="app">
    <div class="ui four column grid" id="gcim-app">
      <logo />
      <error v-bind:onError="onError" />
      <invalidConfig v-bind:onInvalid="onInvalid" />
      <loading v-bind:onLoading="onLoading" />
      <builds v-bind:onBuilds="onBuilds" />
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import axios from 'axios'

import Logo from './components/Logo'
import Error from './components/Error'
import InvalidConfig from './components/InvalidConfig'
import Loading from './components/Loading'
import Builds from './components/Builds'

const getParameterByName = (name, url) => {
  if (!url) url = window.location.href
  name = name.replace(/[[]]/g, '\\$&')
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  var results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

const onError = (error) => {
  this.onLoading = false

  this.onError = {message: 'Something went wrong. Make sure the configuration is ok and your Gitlab is up and running.'}

  if (error.message === 'Wrong format') {
    this.onError = { message: 'Wrong projects format! Try: \'namespace/project\' or \'namespace/project/branch\'' }
  }

  if (error.message === 'Network Error') {
    this.onError = { message: 'Network Error. Please check the Gitlab domain.' }
  }

  if (error.response && error.response.status === 401) {
    this.onError = { message: 'Unauthorized Access. Please check your token.' }
  }
}

export default {
  name: 'app',
  components: {
    Logo,
    Error,
    InvalidConfig,
    Loading,
    Builds
  },
  data () {
    return {
      projects: [],
      onBuilds: [],
      token: null,
      gitlab: null,
      repositories: null,
      onLoading: false,
      onInvalid: false,
      onError: null
    }
  },
  created () {
    this.loadConfig()

    if (!this.configValid()) {
      this.onInvalid = true
      return
    }

    this.setupDefaults()

    this.fetchProjects()

    var self = this
    setInterval(() => {
      self.fetchBuilds()
    }, 60000)
  },
  methods: {
    loadConfig: () => {
      this.gitlab = getParameterByName('gitlab')
      this.token = getParameterByName('token')
      this.ref = getParameterByName('ref')

      let repositories = getParameterByName('projects')
      if (repositories == null) {
        return
      }

      repositories = repositories.split(',')
      this.repositories = []
      for (let x in repositories) {
        try {
          let repository = repositories[x].split('/')
          var namespace = repository[0].trim()
          var projectName = repository[1].trim()
          var nameWithNamespace = namespace + '/' + projectName
          var branch = 'master'
          if (repository.length > 2) {
            branch = repository[2].trim()
          }
          this.repositories.push({
            nameWithNamespace: nameWithNamespace,
            projectName: projectName,
            branch: branch
          })
        } catch (err) {
          onError.bind(this)({message: 'Wrong format', response: {status: 500}})
        }
      };
    },
    configValid: () => {
      let valid = true
      if (this.repositories == null || this.token == null || this.gitlab == null) {
        valid = false
      }

      return valid
    },
    setupDefaults: () => {
      axios.defaults.baseURL = 'https://' + this.gitlab + '/api/v3'
      axios.defaults.headers.common['PRIVATE-TOKEN'] = this.token
    },
    fetchProjects: (page) => {
      var self = this

      if (!this.repositories) {
        return
      }

      this.repositories.forEach((p) => {
        self.onLoading = true
        axios.get('/projects/' + p.nameWithNamespace.replace('/', '%2F'))
          .then((response) => {
            self.onLoading = false
            self.projects.push({project: p, data: response.data})
            self.fetchBuilds()
          })
          .catch(onError.bind(self))
      })
    },
    fetchBuilds: () => {
      var self = this
      if (!this.projects) {
        return
      }
      this.projects.forEach((p) => {
        axios.get('/projects/' + p.data.id + '/repository/branches/' + p.project.branch)
          .then(function (response) {
            let lastCommit = response.data.commit.id
            axios.get('/projects/' + p.data.id + '/repository/commits/' + lastCommit + '/builds')
              .then(function (response) {
                let updated = false

                let build = self.filterLastBuild(response.data)
                if (!build) {
                  return
                }
                let startedFromNow = moment(build.started_at).fromNow()

                self.onBuilds.forEach((b) => {
                  if (b.project === p.project.projectName && b.branch === p.project.branch) {
                    updated = true

                    b.id = build.id
                    b.status = build.status
                    b.started_at = startedFromNow
                    b.author = build.commit.author_name
                    b.project_path = p.data.path_with_namespace
                    b.branch = p.project.branch
                  }
                })

                if (!updated) {
                  self.onBuilds.push({
                    project: p.project.projectName,
                    id: build.id,
                    status: build.status,
                    started_at: startedFromNow,
                    author: build.commit.author_name,
                    project_path: p.data.path_with_namespace,
                    branch: p.project.branch
                  })
                }
              })
              .catch(onError.bind(self))
          })
          .catch(onError.bind(self))
      })
    },
    filterLastBuild: (builds) => {
      if (!Array.isArray(builds) || builds.length === 0) {
        return
      }
      return builds[0]
    }
  }
}
</script>

<style>
body {
  background:#3C454D;
}

.logo {
  width: 30px;
  height: 30px;
  display: block;
  margin: auto;
  margin-top: 10px;
}

.builds {
  margin: 0 50px;
}
.project-name {
  color: white !important;
  text-shadow: 1px 1px rgba(0,0,0,0.2);
}

.project-name a {
  color: inherit;
}

.ui.card>.extra a:not(.ui):hover, .ui.cards>.card>.extra a:not(.ui):hover {
  color: rgba(0,0,0,.4);
}

.ui.card, .ui.cards>.card {
  box-shadow: none !important;
}

.ui.card, .ui.cards>.card.success {
  background-color: #00AD68;
}

.ui.card, .ui.cards>.card.failed {
  background-color: #E7484D;
}

.ui.card, .ui.cards>.card.pending {
  background-color: #e75e40;
}

.ui.card, .ui.cards>.card.running{
  background-color: #2d9fd8;
}

.ui.card, .ui.cards>.card.canceled{
  background-color: #aaaaaa;
}
</style>
