import {
  setBaseData,
  getBaseData,
  getProjects,
  getBranch,
  getBuilds,
  getTags,
  getPipelines,
  getPipeline
} from '@/gitlab'

jest.mock('axios', () => ({
  defaults: {
    baseUrl: '',
    headers: {
      common: {
        'PRIVATE-TOKEN': ''
      }
    }
  },
  get: (url) => {
    let result = {}
    if (
      url.indexOf('projects') > 0 &&
      url.indexOf('branch') === -1 &&
      url.indexOf('builds') === -1 &&
      url.indexOf('tags') === -1 &&
      url.indexOf('pipelines') === -1
    ) {
      result = {
        url,
        type: 'projects'
      }
    } else if (url.indexOf('branch') > 0) {
      result = {
        url,
        type: 'branch'
      }
    } else if (url.indexOf('builds') > 0) {
      result = {
        url,
        type: 'builds'
      }
    } else if (url.indexOf('tags') > 0) {
      result = {
        url,
        type: 'tags'
      }
    } else if (url.indexOf('pipelines') > 0) {
      result = {
        url,
        type: 'pipelines'
      }
    }
    return Promise.resolve(result)
  }
}))
describe('gitlab', () => {
  test('should set base request data', () => {
    setBaseData('gitlab.example.com', '12345')
    const baseData = getBaseData()
    expect(baseData.baseUrl).toEqual('https://gitlab.example.com/api/v4')
    expect(baseData.token).toEqual('12345')
  })
  test('should set base request data with optional params', () => {
    setBaseData('gitlab.example.com', '12345', 'http', '3')
    const baseData = getBaseData()
    expect(baseData.baseUrl).toEqual('http://gitlab.example.com/api/v3')
    expect(baseData.token).toEqual('12345')
  })
  test('should return projecs', (done) => {
    getProjects('namespace/project').then((data) => {
      expect(data.type).toEqual('projects')
      done()
    })
  })
  test('should return branch', (done) => {
    getBranch(0, 'branchName').then((data) => {
      expect(data.type).toEqual('branch')
      done()
    })
  })
  test('should dont return branch', (done) => {
    getBranch().catch((err) => {
      expect(typeof err).toEqual('object')
      done()
    })
  })
  test('should return builds', (done) => {
    getBuilds(0, '123456').then((data) => {
      expect(data.type).toEqual('builds')
      done()
    })
  })
  test('should dont return builds', (done) => {
    getBuilds().catch((err) => {
      expect(typeof err).toEqual('object')
      done()
    })
  })
  test('should return tags', (done) => {
    getTags(0).then((data) => {
      expect(data.type).toEqual('tags')
      done()
    })
  })
  test('should dont return tags', (done) => {
    getTags().catch((err) => {
      expect(typeof err).toEqual('object')
      done()
    })
  })
  test('should return pipelines', (done) => {
    getPipelines(0).then((data) => {
      expect(data.type).toEqual('pipelines')
      done()
    })
  })
  test('should dont return pipelines', (done) => {
    getPipelines().catch((err) => {
      expect(typeof err).toEqual('object')
      done()
    })
  })
  test('should return pipeline', (done) => {
    getPipeline(0, 1).then((data) => {
      expect(data.type).toEqual('pipelines')
      done()
    })
  })
  test('should dont return pipeline', (done) => {
    getPipeline().catch((err) => {
      expect(typeof err).toEqual('object')
      done()
    })
  })
})
