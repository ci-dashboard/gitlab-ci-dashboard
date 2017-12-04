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
      response: {
        data: {
          builds: [
            {id: 0},
            {id: 1}
          ]
        }
      }
    })
  ),
  getTags: () => {
    Promise.resolve({
      response: {
        data: [
          {id: 0},
          {id: 1}
        ]
      }
    })
  },
  getProjects: () => {
    Promise.resolve({
      response: {
        data: {
          id: 1
        }
      }
    })
  }
}))

const mockedBuilds = [
  {
    id: 1,
    status: 'running'
  },
  {
    id: 3,
    status: 'success'
  },
  {
    id: 4,
    status: 'failed'
  },
  {
    id: 2,
    status: 'success'
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
  id: 1
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
  })
  describe('Standalone', () => {
    const vm2 = RootMain.$mount()
    it('Should load params from stadalone mode', () => {
      expect(vm2.projectsFile).toEqual('standalone')
    })
  })
  describe('methods', () => {
    const vmMethods = RootMain.$mount()
    it('Should load config all params', () => {
      vmMethods.loadConfig()
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
    it('Should fetch builds from branch, bruilds, and tags', () => {
      vmMethods.fetchBuilds({
        repo: mockedRepos,
        project: mockedGitlabProject
      })
    })
  })
})
