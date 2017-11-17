// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import moment from 'moment'
import axios from 'axios'

import App from './App'

Vue.config.productionTip = false

export const getParameterByName = (name, url) => {
  if (!url) url = window.location.href
  name = name.replace(/[[]]/g, '\\$&')
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  var results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  const parameter = decodeURIComponent(results[2].replace(/\+/g, ' '))
  if (parameter === 'true') {
    return true
  }
  if (parameter === 'false') {
    return false
  }
  return parameter
}

export const getProjectByFile = (fileUrl, callback) => {
  axios.get(fileUrl)
  .then((response) => {
    callback(response.data)
  })
  .catch(() => {
    return []
  })
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
      projectsFile: null,
      gitlabciProtocol: 'https',
      hideSuccessCards: true,
      repositoriesParams: [],
      repositories: null,
      onLoading: false,
      onInvalid: false,
      onError: null,
      debug: '',
      interval: 60
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
      if (this.hideSuccessCards) {
        return sorted.filter((s) => {
          return s.status !== 'success'
        })
      }
      return sorted
    }
  },
  created () {
    this.loadConfig()
    if (this.standalone) {
      axios.get('/params')
      .then(({data}) => {
        this.gitlab = data.gitlab
        this.token = data.token
        this.ref = data.ref
        this.projectsFile = 'standalone'
        this.projects = data.projects
        this.gitlabciProtocol = data.gitlabciProtocol
        this.hideSuccessCards = data.hideSuccessCards
        this.hideSuccessCards = data.hideSuccessCards
        this.interval = data.interval
        this.startup()
      })
      .catch(() => {
        return []
      })
    } else {
      this.startup()
    }
  },
  methods: {
    loadProjects (repos) {
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
          this.handlerError.bind(this)({message: 'Wrong format', response: {status: 500}})
        }
      }
      this.repositories = repositories

      this.setupDefaults()
      this.fetchProjects()
      setInterval(() => {
        this.handlerError()
        this.fetchProjects()
      }, this.interval * 1000)
      this.handlerStatus()
    },
    startup () {
      if (!this.configValid()) {
        this.onInvalid = true
        return
      }

      if (this.standalone) {
        this.loadProjects(this.projects)
      } else {
        getProjectByFile(this.projectsFile, this.loadProjects)
      }
    },
    loadConfig () {
      this.standalone = getParameterByName('standalone')
      this.gitlab = getParameterByName('gitlab')
      this.token = getParameterByName('token')
      this.ref = getParameterByName('ref')
      this.projectsFile = getParameterByName('projectsFile')
      this.gitlabciProtocol = getParameterByName('gitlabciProtocol') || 'https'
      this.hideSuccessCards = getParameterByName('hideSuccessCards')
      if (this.hideSuccessCards == null) {
        this.hideSuccessCards = true
      }
      this.interval = getParameterByName('interval') || 60
    },
    handlerError (error) {
      if (error == null) {
        this.onError = { message: '' }
        return
      }
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
    },
    configValid () {
      let valid = true
      const {
        projectsFile,
        token,
        gitlab
      } = this
      if (projectsFile == null || token == null || gitlab == null) {
        valid = false
      }

      return valid
    },
    setupDefaults () {
      const {
        gitlab,
        token
      } = this
      axios.defaults.baseURL = `${this.gitlabciProtocol}://${gitlab}/api/v3`
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
          .catch(this.handlerError.bind(this))
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
                  b.commit_message = build.commit.message
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
                  commit_message: build.commit.message,
                  project_path: project.path_with_namespace,
                  branch: repo.branch
                }
                onBuilds.push(buildToAdd)
              }
            })
            .catch(this.handlerError.bind(this))
        })
        .catch(this.handlerError.bind(this))
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
  'v-bind:hideSuccessCards="hideSuccessCards"' +
  'v-bind:interval="interval"' +
  '/>',
  components: { App }
})
