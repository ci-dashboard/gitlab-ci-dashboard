// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import moment from 'moment'

import gitlabApi, {
  getProjects,
  getBranch,
  getBuilds,
  getTags,
  getPipeline,
  getCommits
} from '@/gitlab'
import {
  getConfigFromFile
} from '@/config'
import {
  getProjectsFromFile,
  getProjectsByQuerystring
} from '@/projects'
import {
  getStandaloneParams
} from '@/standalone'
import {
  getParameterByName,
  getTopItem,
  getTopTagName
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
      configFile: null,
      projects: null,
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
      interval: DEFAULT_INTERVAL,
      wrongProjects: []
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
    this.loadConfig().then(() => {
      if (this.standalone) {
        getStandaloneParams(window.location.origin).then((params) => {
          this.gitlab = params.gitlab
          this.token = params.token
          this.ref = params.ref
          this.projectsFile = 'standalone'
          this.projects = params.projects
          this.gitlabciProtocol = params.gitlabciProtocol || DEFAULT_GITLABCI_PROTOCOL
          this.hideSuccessCards = params.hideSuccessCards || DEFAULT_HIDE_VERSION
          this.apiVersion = params.apiVersion || DEFAULT_API_VERSION
          this.hideVersion = params.hideVersion || DEFAULT_API_VERSION
          this.interval = params.interval || DEFAULT_INTERVAL
          this.startup()
        })
      } else {
        this.startup()
      }
    })
  },
  methods: {
    loadConfig () {
      this.configFile = getParameterByName('config')
      return getConfigFromFile(this.configFile)
        .then(({config, projects}) => {
          this.standalone = config.standalone
          this.gitlab = config.gitlab
          this.token = config.token
          this.ref = config.ref
          this.projects = projects
          this.projectsFile = config.projectsFile
          this.gitlabciProtocol = config.gitlabciProtocol || DEFAULT_GITLABCI_PROTOCOL
          this.hideSuccessCards = config.hideSuccessCards
          this.apiVersion = config.apiVersion || DEFAULT_API_VERSION
          if (this.hideSuccessCards == null) {
            this.hideSuccessCards = DEFAULT_HIDE_SUCCESS_CARDS
          }
          this.hideVersion = config.hideVersion
          if (this.hideVersion == null) {
            this.hideVersion = DEFAULT_HIDE_VERSION
          }
          this.interval = config.interval || DEFAULT_INTERVAL
        })
        .catch((e) => {
          this.standalone = getParameterByName('standalone')
          this.gitlab = getParameterByName('gitlab')
          this.token = getParameterByName('token')
          this.ref = getParameterByName('ref')
          this.projectsParam = getParameterByName('projects')
          this.projectsFile = getParameterByName('projectsFile')
          this.gitlabciProtocol = getParameterByName('gitlabciProtocol') || DEFAULT_GITLABCI_PROTOCOL
          this.hideSuccessCards = getParameterByName('hideSuccessCards')
          this.apiVersion = getParameterByName('apiVersion') || DEFAULT_API_VERSION
          if (this.hideSuccessCards == null) {
            this.hideSuccessCards = DEFAULT_HIDE_SUCCESS_CARDS
          }
          this.hideVersion = getParameterByName('hideVersion')
          if (this.hideVersion == null) {
            this.hideVersion = DEFAULT_HIDE_VERSION
          }
          this.interval = getParameterByName('interval') || DEFAULT_INTERVAL
          return Promise.resolve()
        })
    },
    loadRepositories (repos) {
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
            branch,
            description
          } = repository
          const nameWithNamespace = `${namespace}/${project}`
          const projectName = project
          repositories.push({
            nameWithNamespace,
            projectName,
            branch: branch || 'master',
            description
          })
        } catch (err) {
          this.handlerError.bind(this)({message: 'Wrong format', response: {status: 500}})
        }
      }
      this.repositories = repositories
    },
    loadProjects (repos) {
      this.loadRepositories(repos)
      this.setupDefaults(gitlabApi)
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

      if (this.standalone || Array.isArray(this.projects)) {
        this.loadProjects(this.projects)
      } else if (this.projectsParam) {
        try {
          this.projects = getProjectsByQuerystring(this.projectsParam)
          this.loadProjects(this.projects)
        } catch (err) {
          this.handlerError(err)
        }
      } else {
        getProjectsFromFile(this.projectsFile).then(projects => this.loadProjects(projects))
      }
    },
    handlerError (error) {
      if (error == null) {
        this.onError = {
          code: 0,
          message: ''
        }
        this.wrongProjects = []
        return
      }
      this.onError = {
        code: 1,
        message: `
          Something went wrong.
          Make sure the configuration is ok and your Gitlab is up and running.
          Details: ${error.message}
        `
      }

      if (error.message === 'Wrong format') {
        this.onError = {
          code: 2,
          message: 'Wrong projects format! Try: \'namespace/project\' or \'namespace/project/branch\''
        }
      }

      if (error.message === 'Network Error') {
        this.onError = {
          code: 3,
          message: 'Network Error. Please check the Gitlab domain.'
        }
      }

      if (error.response && error.response.status === 401) {
        this.onError = {
          code: 4,
          message: 'Unauthorized Access. Please check your token.'
        }
      }

      if (error.message === '404 - Not Found.') {
        this.wrongProjects.push(error.project)
        this.onError = {
          code: 5,
          message: `Project(s) not found: ${this.wrongProjects.map(w => ' ' + w)}`
        }
      }
    },
    configValid () {
      const {
        projectsFile,
        token,
        gitlab,
        projectsParam,
        configFile
      } = this
      if (configFile) {
        return true
      }
      if ((projectsParam == null && projectsFile == null) || token == null || gitlab == null) {
        return false
      }
      return true
    },
    setupDefaults (provider) {
      const {
        gitlab,
        token,
        gitlabciProtocol,
        apiVersion
      } = this
      provider.setBaseData(gitlab, token, gitlabciProtocol, apiVersion)
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
                .then(this.loadBuilds.bind(this))
            } else {
              this.fetchPipelines({repo, project: response.data})
            }
          })
          .catch((err) => {
            err.project = repo.nameWithNamespace
            this.handlerError(err)
          })
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
    getLinkToBranch (project, repo) {
      return `${this.gitlabciProtocol}://${this.gitlab}/${project.path_with_namespace}/tree/${repo.branch}`
    },
    getLinkToPipeline (project, repo, buildId) {
      return `${this.gitlabciProtocol}://${this.gitlab}/${project.path_with_namespace}/pipelines/${buildId}`
    },
    getLinkToJob (project, repo, buildId) {
      return `${this.gitlabciProtocol}://${this.gitlab}/${project.path_with_namespace}/-/jobs/${buildId}`
    },
    loadBuilds (onBuilds, data, repo, project, tag) {
      let updated = false

      let build = getTopItem(data)
      if (!build) {
        return
      }
      let startedFromNow = moment(build.started_at).fromNow()

      for (const index in onBuilds) {
        const b = onBuilds[index]
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
          b.namespace_name = project.namespace.full_path
          b.link_to_branch = this.getLinkToBranch(project, repo)
          b.link_to_build = this.getLinkToJob(project, repo, build.id)
          b.description = repo.description
        }
      }

      if (!updated) {
        this.addStatusQueue(build.status, INCREASE_ACTION)
        const buildToAdd = {
          project: repo.projectName,
          description: repo.description,
          id: build.id,
          status: build.status,
          lastStatus: '',
          started_at: startedFromNow,
          author: build.commit.author_name,
          commit_message: build.commit.message,
          project_path: project.path_with_namespace,
          branch: repo.branch,
          tag_name: tag && tag.name,
          namespace_name: project.namespace.full_path,
          link_to_branch: this.getLinkToBranch(project, repo),
          link_to_build : this.getLinkToJob(project, repo, build.id)
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
          message,
          author_name: authorName,
          last_pipeline: {id: lastPipelineId}
        } = data
        getTags(project.id)
          .then((response) => {
            const tag = getTopTagName(response.data)
            getPipeline(project.id, lastPipelineId)
              .then((pipeline) => {
                const lastPipeline = pipeline.data
                this.onBuilds.forEach((build) => {
                  if (
                    build.project === repo.projectName &&
                    build.branch === repo.branch
                  ) {
                    updated = true
                    if (lastPipeline.status !== build.status) {
                      this.addStatusQueue(build.status, DECREASE_ACTION)
                      this.addStatusQueue(lastPipeline.status, INCREASE_ACTION)
                    }
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
                    build.namespace_name = project.namespace.full_path
                    build.link_to_branch = this.getLinkToBranch(project, repo)
                    build.link_to_build = this.getLinkToPipeline(project, repo, lastPipeline.id)
                  }
                })
                if (!updated) {
                  this.addStatusQueue(lastPipeline.status, INCREASE_ACTION)
                  let buildToAdd = {}
                  buildToAdd.project = repo.projectName
                  buildToAdd.status = lastPipeline.status
                  buildToAdd.lastStatus = buildToAdd.status
                  buildToAdd.id = lastPipeline.id
                  buildToAdd.started_at = moment(lastPipeline.started_at).fromNow()
                  buildToAdd.author = authorName
                  buildToAdd.commit_message = message
                  buildToAdd.project_path = 'buildToAdd.project_path'
                  buildToAdd.branch = repo.branch
                  buildToAdd.tag_name = tag && tag.name
                  buildToAdd.namespace_name = project.namespace.full_path
                  buildToAdd.link_to_branch = this.getLinkToBranch(project, repo)
                  buildToAdd.link_to_build = this.getLinkToPipeline(project, repo, lastPipeline.id)
                  this.onBuilds.push(buildToAdd)
                }
              })
              .catch(this.handlerError.bind(this))
          })
          .catch(this.handlerError.bind(this))
      })
        .catch(this.handlerError.bind(this))
    },
    handlerBranch (onBuilds, repo, project, lastCommit) {
      return getBuilds(project.id, lastCommit)
        .then((response) => {
          const builds = response.data
          this.handlerBuilds(onBuilds, builds, repo, project)
            .then((tag) => {
              this.loadBuilds(onBuilds, builds, repo, project, tag)
            })
        })
        .catch(this.handlerError.bind(this))
    },
    handlerBuilds (onBuilds, builds, repo, project) {
      return getTags(project.id)
        .then((response) => {
          const tag = getTopItem(response.data)
          return Promise.resolve(tag)
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
      return getBranch(project.id, repo.branch)
        .then((response) => {
          const lastCommit = response.data.commit.id
          this.handlerBranch(onBuilds, repo, project, lastCommit)
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
