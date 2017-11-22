import {
  getBranch,
  getBuilds,
  getTags
} from '@/gitlab'

jest.mock('axios', () => ({
  get: (url) => {
    let result = {}
    if (url.indexOf('branch') > 0) {
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
    }
    return Promise.resolve(result)
  }
}))
describe('gitlab', () => {
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
})
