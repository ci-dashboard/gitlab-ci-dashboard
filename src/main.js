// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import moment from 'moment'
import axios from 'axios'

import App from './App'

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

function getProjectByFile (fileUrl, callback) {
  axios.get(fileUrl)
  .then((response) => {
    callback(response.data)
  })
  .catch(() => {
    return []
  })
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

const INCREASE_ACTION = 'increase'
const DECREASE_ACTION = 'decrease'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  data () {
    return {
      projects: [],
      onBuilds: [],
      nonSuccessBuilds: [],
      statusQueue: [],
      status: [],
      token: null,
      gitlab: null,
      fileUrl: null,
      repositoriesParams: [],
      repositories: null,
      onLoading: false,
      onInvalid: false,
      onError: null,
      debug: ''
    }
  },
  computed: {
    sortedBuilds () {
      if (this.onBuilds == null) {
        return []
      }
      const sorted = this.onBuilds.sort((a, b) => {
        if (a.id < b.id) {
          return 1
        }
        if (a.id > b.id) {
          return -1
        }
        return 0
      })
      return sorted.filter((s) => {
        return s.status !== 'success'
      })
    }
  },
  created () {
    this.loadConfig()

    if (!this.configValid()) {
      this.onInvalid = true
      return
    }

    getProjectByFile(this.fileUrl, (repos) => {
      if (repos == null) {
        return
      }
      const repositories = []
      for (const index in repos) {
        try {
          const repository = repos[index]
          this.debug += repository
          const {
            nameWithNamespace,
            branch,
            projectName
          } = repository
          repositories.push({
            nameWithNamespace,
            projectName,
            branch: branch || 'master'
          })
        } catch (err) {
          onError.bind(this)({message: 'Wrong format', response: {status: 500}})
        }
      }
      this.repositories = repositories

      this.setupDefaults()
      this.fetchProjects()
      setInterval(() => {
        this.fetchProjects()
      }, 60000)
      this.handlerStatus()
    })
  },
  methods: {
    loadConfig () {
      this.gitlab = getParameterByName('gitlab')
      this.token = getParameterByName('token')
      this.ref = getParameterByName('ref')
      this.fileUrl = getParameterByName('fileUrl')
    },
    configValid () {
      let valid = true
      const {
        fileUrl,
        token,
        gitlab
      } = this
      if (fileUrl == null || token == null || gitlab == null) {
        valid = false
      }

      return valid
    },
    setupDefaults () {
      const {
        gitlab,
        token
      } = this
      axios.defaults.baseURL = 'http://' + gitlab + '/api/v3'
      axios.defaults.headers.common['PRIVATE-TOKEN'] = token
    },
    fetchProjects (page) {
      const {
        repositories
      } = this
      if (!repositories) {
        return
      }

      repositories.forEach((repo) => {
        this.onLoading = true
        axios.get('/projects/' + repo.nameWithNamespace.replace('/', '%2F'))
          .then((response) => {
            this.onLoading = false
            this.fetchBuilds({repo, project: response.data})
          })
          .catch(onError.bind(this))
      })
    },
    addStatusQueue (status, action) {
      this.statusQueue.push({
        status,
        action
      })
    },
    handlerStatus (statusItem) {
      if (statusItem) {
        this.updateStatus(statusItem)
      }
      setTimeout(() => {
        this.handlerStatus(this.statusQueue.shift())
      }, 500)
    },
    updateStatus (statusItem) {
      const s = this.status.filter((s) => {
        return statusItem.status === s.text
      })
      if (s.length === 0) {
        this.status.push({
          text: statusItem.status,
          total: 1
        })
        return
      }
      const selectedItem = s[0]
      if (statusItem.action === INCREASE_ACTION) {
        selectedItem.total++
      } else if (statusItem.action === DECREASE_ACTION) {
        selectedItem.total--
      }
      if (selectedItem.total === 0) {
        this.status = this.status.filter(r => r.text !== selectedItem.text)
      }
    },
    fetchBuilds (selectedProjects) {
      const {
        onBuilds
      } = this
      if (!selectedProjects) {
        return
      }
      const {
        repo,
        project
      } = selectedProjects
      axios.get('/projects/' + project.id + '/repository/branches/' + repo.branch)
        .then((response) => {
          const lastCommit = response.data.commit.id
          axios.get('/projects/' + project.id + '/repository/commits/' + lastCommit + '/builds')
            .then((response) => {
              let updated = false

              let build = this.filterLastBuild(response.data)
              if (!build) {
                return
              }
              let startedFromNow = moment(build.started_at).fromNow()

              onBuilds.forEach((b) => {
                if (
                  b.project === repo.projectName &&
                  b.branch === repo.branch
                ) {
                  updated = true

                  if (b.status !== build.status) {
                    this.addStatusQueue(b.status, DECREASE_ACTION)
                    this.addStatusQueue(build.status, INCREASE_ACTION)
                  }
                  b.lastStatus = b.status
                  b.status = build.status

                  b.id = build.id
                  b.started_at = startedFromNow
                  b.author = build.commit.author_name
                  b.project_path = project.path_with_namespace
                  b.branch = repo.branch
                }
              })

              if (!updated) {
                this.addStatusQueue(build.status, INCREASE_ACTION)
                const buildToAdd = {
                  project: repo.projectName,
                  id: build.id,
                  status: build.status,
                  lastStatus: '',
                  started_at: startedFromNow,
                  author: build.commit.author_name,
                  project_path: project.path_with_namespace,
                  branch: repo.branch
                }
                onBuilds.push(buildToAdd)
              }
            })
            .catch(onError.bind(this))
        })
        .catch(onError.bind(this))
    },
    filterLastBuild (builds) {
      if (!Array.isArray(builds) || builds.length === 0) {
        return
      }
      return builds[0]
    }
  },
  template: '' +
  '<App ' +
  'v-bind:onLoading="onLoading" ' +
  'v-bind:onInvalid="onInvalid" ' +
  'v-bind:onError="onError" ' +
  'v-bind:onBuilds="onBuilds" ' +
  'v-bind:sortedBuilds="sortedBuilds" ' +
  'v-bind:status="status" ' +
  '/>',
  components: { App }
})
