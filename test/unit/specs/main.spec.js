import RootMain from '@/main.js'

jest.mock('@/standalone', () => ({
  getStandaloneParams: () => {
    return Promise.resolve({
      gitlab: 'gitlab.com'
    })
  }
}))
jest.mock('@/utils', () => ({
  getParameterByName: () => {
    return 'true'
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
    describe('Standalone', () => {
      it('Should load params from stadalone mode', () => {
        expect(vm.projectsFile).toEqual('standalone')
      })
    })
  })
})
