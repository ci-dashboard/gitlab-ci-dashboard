import RootMain from '@/main.js'

jest.mock('@/standalone', () => ({
  getStandaloneParams: () => {
    return Promise.resolve({
      gitlab: 'gitlab.com'
    })
  }
}))

jest.mock('@/utils', () => ({
  getParameterByName: (param) => {
    if (param === 'standalone') {
      return true
    }
    return param
  },
  getTopItem: (param) => {
    return {
      id: 0,
      status: 'running',
      commit: {
        author_name: 'Author',
        message: 'Message'
      }
    }
  }
}))

jest.mock('@/gitlab', () => ({
  getBranch: () => (
    Promise.resolve({
      data: {
        commit: {
          id: 0
        }
      }
    })
  ),
  getBuilds: () => (
    Promise.resolve({
      data: [
        {id: 0},
        {id: 1}
      ]
    })
  ),
  getTags: () => (
    Promise.resolve({
      data: [
        {id: 0},
        {id: 1}
      ]
    })
  ),
  getProjects: () => {
    Promise.resolve({
      data: {
        id: 1
      }
    })
  },
  setBaseData: jest.fn()
}))

const mockedBuilds = [
  {
    id: 1,
    status: 'running',
    started_at: '2017-10-06T17:41:41.000Z',
    commit: {
      author_name: 'Author'
    }
  },
  {
    id: 3,
    status: 'success',
    started_at: '2017-10-06T17:41:41.000Z',
    commit: {
      author_name: 'Author'
    }
  },
  {
    id: 4,
    status: 'failed',
    started_at: '2017-10-06T17:41:41.000Z',
    commit: {
      author_name: 'Author'
    }
  },
  {
    id: 2,
    status: 'success',
    started_at: '2017-10-06T17:41:41.000Z',
    commit: {
      author_name: 'Author'
    }
  }
]

const mockedProjects = [
  {
    namespace: 'namespace1',
    project: 'project1',
    branch: 'branch1'
  },
  {
    namespace: 'namespace2',
    project: 'project2',
    branch: 'branch2'
  }
]

const mockedGitlabApi = {
  setBaseData: jest.fn()
}

const mockedRepos = {
  nameWithNamespace: 'namespace1/project1',
  projectName: 'project1',
  branch: 'branch1'
}

const mockedGitlabProject = {
  id: 1,
  path_with_namespace: 'namespace1/project1',
  namespace: {
    name: 'namespace1'
  }
}

const mockedTag = {
  name: 'tag1'
}

describe('main.js', () => {
  describe('Sorted Builds', () => {
    const vm = RootMain.$mount()
    it('Should sort the builds by id from highest to lowest', () => {
      vm.onBuilds = mockedBuilds
      const arr = vm.sortedBuilds
      expect(arr[0].id).toEqual(4)
      expect(arr[3].id).toEqual(1)
    })
    it('Should sort the builds by id from highest to lowest without success cards', () => {
      vm.onBuilds = mockedBuilds
      vm.hideSuccessCards = true
      const arr = vm.sortedBuilds
      expect(arr[0].id).toEqual(4)
      expect(arr[1].id).toEqual(1)
    })
    it('Should return empty sortedBuilds when builds is empty', () => {
      vm.onBuilds = []
      const arr = vm.sortedBuilds
      expect(arr.length).toEqual(0)
    })
    it('Should return empty sortedBuilds when builds is null', () => {
      vm.onBuilds = null
      const arr = vm.sortedBuilds
      vm.onBuilds = []
      expect(arr.length).toEqual(0)
    })
    it('Should return same builds when builds are equals', () => {
      vm.onBuilds = [{id: 1}, {id: 1}]
      const arr = vm.sortedBuilds
      vm.onBuilds = []
      expect(arr.length).toEqual(2)
    })
  })
  describe('handlerError', () => {
    const vm2 = RootMain.$mount()
    it('Should load params from stadalone mode', () => {
      expect(vm2.projectsFile).toEqual('standalone')
    })
  })
  describe('Standalone', () => {
    const vmError = RootMain.$mount()
    it('Should reset error when error is null', () => {
      vmError.handlerError(null)
      expect(vmError.onError.message).toEqual('')
    })
    it('Should return code error 1 as default error', () => {
      vmError.handlerError({message: 'Generic Error'})
      expect(vmError.onError.code).toEqual(1)
    })
    it('Should return code error 2 when is "Wront format"', () => {
      vmError.handlerError({message: 'Wrong format'})
      expect(vmError.onError.code).toEqual(2)
    })
    it('Should return code error 3 when is "Network Error"', () => {
      vmError.handlerError({message: 'Network Error'})
      expect(vmError.onError.code).toEqual(3)
    })
    it('Should return code error 4 when status error is 401', () => {
      vmError.handlerError({response: {status: 401}})
      expect(vmError.onError.code).toEqual(4)
    })
    it('Should return code error 5 when is "404 - Not Found."', () => {
      vmError.handlerError({message: '404 - Not Found.'})
      expect(vmError.onError.code).toEqual(5)
    })
  })
  describe('methods', () => {
    const vmMethods = RootMain.$mount()
    it('Should load config all params', (done) => {
      vmMethods.loadConfig().then(() => {
        expect(vmMethods.standalone).toEqual(true)
        expect(vmMethods.gitlab).toEqual('gitlab')
        expect(vmMethods.token).toEqual('token')
        expect(vmMethods.ref).toEqual('ref')
        expect(vmMethods.projectsParam).toEqual('projects')
        expect(vmMethods.projectsFile).toEqual('projectsFile')
        expect(vmMethods.gitlabciProtocol).toEqual('gitlabciProtocol')
        expect(vmMethods.hideSuccessCards).toEqual('hideSuccessCards')
        expect(vmMethods.apiVersion).toEqual('apiVersion')
        expect(vmMethods.hideVersion).toEqual('hideVersion')
        expect(vmMethods.interval).toEqual('interval')
        done()
      })
    })
    it('Should return valid config', () => {
      const isValid = vmMethods.configValid()
      expect(isValid).toEqual(true)
    })
    it('Should load setted repos on repositories list', () => {
      vmMethods.loadRepositories(mockedProjects)
      expect(vmMethods.repositories.length).toEqual(2)
    })
    it('Should fill default data', () => {
      vmMethods.setupDefaults(mockedGitlabApi)
      expect(mockedGitlabApi.setBaseData).toHaveBeenCalled()
    })
    it('Should load Builds', () => {
      vmMethods.loadBuilds(
        vmMethods.onBuilds,
        mockedBuilds,
        mockedRepos,
        mockedGitlabProject,
        mockedTag
      )
      expect(vmMethods.onBuilds.length).toEqual(1)
    })
    it('Should create branch link', () => {
      const mockedProject = {
        name: 'p1',
        namespace: {
          name: 'n1'
        },
        path_with_namespace: 'n1/p1'
      }
      const mockedRepo = {
        branch: 'b1'
      }
      const url = vmMethods.getLinkToBranch(mockedProject, mockedRepo)
      expect(url).toEqual('gitlabciProtocol://gitlab/n1/p1/tree/b1')
    })
    it('Should create pipeline link', () => {
      const mockedProject = {
        name: 'p1',
        namespace: {
          name: 'n1'
        },
        path_with_namespace: 'n1/p1'
      }
      const mockedRepo = {
        branch: 'b1'
      }
      const mockedBuild = {
        id: 1,
        status: 'running',
        started_at: '2017-10-06T17:41:41.000Z',
        commit: {
          author_name: 'Author'
        }
      }
      const url = vmMethods.getLinkToPipeline(mockedProject, mockedRepo, mockedBuild.id)
      expect(url).toEqual('gitlabciProtocol://gitlab/n1/p1/pipelines/1')
    })
    it('Should create job link', () => {
      const mockedProject = {
        name: 'p1',
        namespace: {
          name: 'n1'
        },
        path_with_namespace: 'n1/p1'
      }
      const mockedRepo = {
        branch: 'b1'
      }
      const mockedBuild = {
        id: 1,
        status: 'running',
        started_at: '2017-10-06T17:41:41.000Z',
        commit: {
          author_name: 'Author'
        }
      }
      const url = vmMethods.getLinkToJob(mockedProject, mockedRepo, mockedBuild.id)
      expect(url).toEqual('gitlabciProtocol://gitlab/n1/p1/-/jobs/1')
    })
  })
})
