// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import moment from 'moment'
import axios from 'axios'

import App from './App'

Vue.use(Vuex)
Vue.config.productionTip = false

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

/* eslint-disable no-new */
const store = new Vuex.Store({
  strict: true,
  state: {
    data: {
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
  mutations: {
    updateData: (state, data) => {
      Object.assign(state.data, data)
    }
  },
  getters: {
    gitlabUrl: state => {
      return 'http://' + state.data.gitlab
    }
  }
})

new Vue({
  el: '#app',
  store: store,
  data () {
    return {
      data: this.$store.state.data
    }
  },
  created () {
    this.loadConfig()

    if (!this.configValid()) {
      this.updateField('onInvalid', true)
      return
    }

    this.setupDefaults()

    this.fetchProjects()

    // setInterval(() => {
    this.fetchBuilds()
    // }, 60000)
  },
  methods: {
    updateField (field, value) {
      this.$store.commit('updateData', {
        [field]: value
      })
    },
    loadConfig () {
      this.updateField('gitlab', getParameterByName('gitlab'))
      this.updateField('token', getParameterByName('token'))
      this.updateField('ref', getParameterByName('ref'))
      let repositoriesParams = getParameterByName('projects')

      if (repositoriesParams == null) {
        return
      }
      const repositories = []
      for (const index in repositoriesParams.split(',')) {
        try {
          let repository = repositories[index].split('/')
          var namespace = repository[0].trim()
          var projectName = repository[1].trim()
          var nameWithNamespace = namespace + '/' + projectName
          var branch = 'master'
          if (repository.length > 2) {
            branch = repository[2].trim()
          }
          repositories.push({
            nameWithNamespace: nameWithNamespace,
            projectName: projectName,
            branch: branch
          })
        } catch (err) {
          onError.bind(this)({message: 'Wrong format', response: {status: 500}})
        }
      }
      this.updateField('repositories', repositories)
    },
    configValid () {
      let valid = true
      const {
        repositories,
        token,
        gitlab
      } = this.$store.state.data
      if (repositories == null || token == null || gitlab == null) {
        valid = false
      }

      return valid
    },
    setupDefaults () {
      const {
        gitlab,
        token
      } = this.$store.state.data
      axios.defaults.baseURL = 'https://' + gitlab + '/api/v3'
      axios.defaults.headers.common['PRIVATE-TOKEN'] = token
    },
    fetchProjects (page) {
      const {
        repositories,
        projects
      } = this.$store.state.data
      if (!repositories) {
        return
      }

      repositories.forEach((p) => {
        this.updateField('onLoading', true)
        axios.get('/projects/' + p.nameWithNamespace.replace('/', '%2F'))
          .then((response) => {
            this.updateField('onLoading', true)
            projects.push({project: p, data: response.data})
            this.fetchBuilds()
          })
          .catch(onError.bind(this))
      })
    },
    fetchBuilds () {
      const {
        projects,
        onBuilds
      } = this.$store.state.data
      if (!projects) {
        return
      }
      projects.forEach((p) => {
        axios.get('/projects/' + p.data.id + '/repository/branches/' + p.project.branch)
          .then((response) => {
            const lastCommit = response.data.commit.id
            axios.get('/projects/' + p.data.id + '/repository/commits/' + lastCommit + '/builds')
              .then((response) => {
                let updated = false

                let build = this.filterLastBuild(response.data)
                if (!build) {
                  return
                }
                let startedFromNow = moment(build.started_at).fromNow()

                onBuilds.forEach((b) => {
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
    filterLastBuild (builds) {
      if (!Array.isArray(builds) || builds.length === 0) {
        return
      }
      return builds[0]
    }
  },
  computed: {
    dataState () {
      return this.$store.state.data
    }
  },
  template: '<App v-bind:data="data" v-bind:gitlabUrl="gitlabUrl" />',
  components: { App }
})
