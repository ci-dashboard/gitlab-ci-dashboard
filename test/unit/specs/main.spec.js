import RootMain, {
  getParameterByName,
  getTopItem
} from '@/main.js'

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
  })
  describe('Utilities', () => {
    it('Should get top item of array', () => {
      const arr = ['a', 'b', 'c']
      const topItem = getTopItem(arr)
      expect('a').toEqual(topItem)
    })
  })
  describe('Get querystring params', () => {
    const url = 'http://localhost:8080/?gitlab=localhost:8089&projects=namespace1/project1/branch1&token=_&projectsFile=http://localhost:8080/static/file.json&gitlabciProtocol=http&interval=5&hideSuccessCards=false'
    it('Should get non-optional params from url', () => {
      // gitlab
      const gitlab = getParameterByName('gitlab', url)
      expect('localhost:8089').toEqual(gitlab)

      // token
      const token = getParameterByName('token', url)
      expect('_').toEqual(token)

      // projectsFile
      const projectsFile = getParameterByName('projectsFile', url)
      expect('http://localhost:8080/static/file.json').toEqual(projectsFile)

      // projects
      const projects = getParameterByName('projects', url)
      expect('namespace1/project1/branch1').toEqual(projects)
    })
    it('Should get optional params from url', () => {
      // gitlabciProtocol
      const gitlabciProtocol = getParameterByName('gitlabciProtocol', url)
      expect('http').toEqual(gitlabciProtocol)

      // hideSuccessCards
      const hideSuccessCards = getParameterByName('hideSuccessCards', url)
      expect(false).toEqual(hideSuccessCards)

      // interval
      const interval = getParameterByName('interval', url)
      expect('5').toEqual(interval)
    })
  })
})
