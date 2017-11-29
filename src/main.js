// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import moment from 'moment'

import {
  setBaseData,
  getProjects,
  getBranch,
  getBuilds,
  getTags,
  getPipeline,
  getCommits
} from '@/gitlab'
import {
  getProjectsFromFile,
  getProjectsByQuerystring
} from '@/projects'
import {
  getStandaloneParams
} from '@/standalone'
import {
  getParameterByName,
  getTopItem
} from '@/utils'

import App from './App'

Vue.config.productionTip = false

const INCREASE_ACTION = 'increase'
const DECREASE_ACTION = 'decrease'
const DEFAULT_HIDE_SUCCESS_CARDS = false
const DEFAULT_HIDE_VERSION = false
const DEFAULT_INTERVAL = 60
const DEFAULT_GITLABCI_PROTOCOL = 'https'
const DEFAULT_API_VERSION = '3'

const STATUS_SUCCESS = 'success'

var root = new Vue({
  el: '#app',
  data () {
    return {
      projects: [],
      onBuilds: [],
      lastTags: [],
      lastPipelines: [],
      onPipelines: [],
      nonSuccessBuilds: [],
      statusQueue: [],
      status: [],
      token: null,
      gitlab: null,
      projectsParam: null,
      projectsFile: null,
      gitlabciProtocol: DEFAULT_GITLABCI_PROTOCOL,
      hideSuccessCards: DEFAULT_HIDE_SUCCESS_CARDS,
      apiVersion: DEFAULT_API_VERSION,
      hideVersion: DEFAULT_HIDE_VERSION,
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
          return s.status !== STATUS_SUCCESS
        })
      }
      return sorted
    }
  },
  created () {
    this.loadConfig()
    if (this.standalone) {
      getStandaloneParams().then((params) => {
        this.gitlab = params.gitlab
        this.token = params.token
        this.ref = params.ref
        this.projectsFile = 'standalone'
        this.projects = params.projects
        this.gitlabciProtocol = params.gitlabciProtocol
        this.hideSuccessCards = params.hideSuccessCards
        this.apiVersion = params.apiVersion
        this.hideVersion = params.hideVersion
        this.interval = params.interval
        this.startup()
      })
    } else {
      this.startup()
    }
  },
  methods: {
    loadConfig () {
      this.standalone = getParameterByName('standalone')
      this.gitlab = getParameterByName('gitlab')
      this.token = getParameterByName('token')
      this.ref = getParameterByName('ref')
      this.projectsParam = getParameterByName('projects')
      this.projectsFile = getParameterByName('projectsFile')
      this.gitlabciProtocol = getParameterByName('gitlabciProtocol') || DEFAULT_GITLABCI_PROTOCOL
      this.hideSuccessCards = getParameterByName('hideSuccessCards')
      this.apiVersion = getParameterByName('apiVersion') || '3'
      if (this.hideSuccessCards == null) {
        this.hideSuccessCards = DEFAULT_HIDE_SUCCESS_CARDS
      }
      this.hideVersion = getParameterByName('hideVersion')
      if (this.hideVersion == null) {
        this.hideVersion = DEFAULT_HIDE_VERSION
      }
      this.interval = getParameterByName('interval') || DEFAULT_INTERVAL
    },
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
            namespace,
            project,
            branch
          } = repository
          const nameWithNamespace = `${namespace}/${project}`
          const projectName = project
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
      } if (this.projectsParam) {
        this.projects = getProjectsByQuerystring(this.projectsParam)
        this.loadProjects(this.projects)
      } else {
        getProjectsFromFile(this.projectsFile).then(projects => this.loadProjects(projects))
      }
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
        gitlab,
        projects
      } = this
      if ((projects == null && projectsFile == null) || token == null || gitlab == null) {
        valid = false
      }

      return valid
    },
    setupDefaults () {
      const {
        gitlab,
        token,
        gitlabciProtocol,
        apiVersion
      } = this
      setBaseData(gitlab, token, gitlabciProtocol, apiVersion)
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
        getProjects(repo.nameWithNamespace)
          .then((response) => {
            this.onLoading = false
            if (this.apiVersion === DEFAULT_API_VERSION) {
              this.fetchBuilds({repo, project: response.data})
            } else {
              this.fetchPipelines({repo, project: response.data})
            }
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
    loadBuilds (onBuilds, data, repo, project, tag) {
      let updated = false

      let build = getTopItem(data)
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
          b.tag_name = tag && tag.name
          b.namespace_name = project.namespace.name
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
          branch: repo.branch,
          tag_name: tag && tag.name,
          namespace_name: project.namespace.name
        }
        onBuilds.push(buildToAdd)
      }
    },
    fetchPipelines (selectedProject) {
      var updated = false
      if (!selectedProject) {
        return
      }
      const {
        repo,
        project
      } = selectedProject
      getCommits(project.id, repo.branch).then(({data}) => {
        const {
          message
        } = data
        const authorName = data['author_name']
        const lastPipelineId = data['last_pipeline'].id
        getTags(project.id)
          .then((response) => {
            const tag = getTopItem(response.data)
            getPipeline(project.id, lastPipelineId)
              .then((pipeline) => {
                const lastPipeline = pipeline.data
                this.onBuilds.forEach((build) => {
                  if (
                    build.project === repo.projectName &&
                    build.branch === repo.branch
                  ) {
                    updated = true
                    build.project = repo.projectName
                    build.status = lastPipeline.status
                    build.lastStatus = build.status
                    build.id = lastPipeline.id
                    build.started_at = moment(lastPipeline.started_at).fromNow()
                    build.author = authorName
                    build.commit_message = message
                    build.project_path = 'b.project_path'
                    build.branch = repo.branch
                    build.tag_name = tag && tag.name
                    build.namespace_name = project.namespace.name
                  }
                })
                if (!updated) {
                  let b = {}
                  b.project = repo.projectName
                  b.status = lastPipeline.status
                  b.lastStatus = b.status
                  b.id = lastPipeline.id
                  b.started_at = moment(lastPipeline.started_at).fromNow()
                  b.author = authorName
                  b.commit_message = message
                  b.project_path = 'b.project_path'
                  b.branch = repo.branch
                  b.tag_name = tag && tag.name
                  b.namespace_name = project.namespace.name
                  this.onBuilds.push(b)
                }
              })
              .catch(this.handlerError.bind(this))
          })
          .catch(this.handlerError.bind(this))
      })
      .catch(this.handlerError.bind(this))
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
      getBranch(project.id, repo.branch)
        .then((response) => {
          const lastCommit = response.data.commit.id
          getBuilds(project.id, lastCommit)
            .then((response) => {
              const builds = response.data
              getTags(project.id)
                .then((response) => {
                  const tag = getTopItem(response.data)
                  this.loadBuilds(onBuilds, builds, repo, project, tag)
                })
                .catch(this.handlerError.bind(this))
            })
            .catch(this.handlerError.bind(this))
        })
        .catch(this.handlerError.bind(this))
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
  'v-bind:hideVersion="hideVersion"' +
  '/>',
  components: { App }
})

export default root
