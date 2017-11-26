import {
  getStandaloneParams
} from '@/standalone'

jest.mock('axios', () => ({
  get: () => {
    return Promise.resolve({data: {
      gitlab: 'gitlab.example.com',
      token: '12345',
      projectsFile: 'standalone'
    }})
  }
}))

describe('Standalone', () => {
  it('should get valid params for standalone mode', (done) => {
    getStandaloneParams().then((params) => {
      expect('gitlab.example.com').toEqual(params.gitlab)
      expect('12345').toEqual(params.token)
      expect('standalone').toEqual(params.projectsFile)
      done()
    })
  })
})
