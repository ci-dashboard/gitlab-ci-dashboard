import {
  getParameterByName
  // getProjectByFile,
} from '@/main.js'

describe('main.js', () => {
  describe('Get querystring params', () => {
    const url = 'http://localhost:8080/?gitlab=localhost:8089&token=_&projectsFile=http://localhost:8080/static/file.json&gitlabciProtocol=http&interval=5&hideSuccessCards=false'
    it('Should get non-optional params from url', () => {
      // gitlab
      const gitlab = getParameterByName('gitlab', url)
      expect('localhost:8089').to.equal(gitlab)

      // token
      const token = getParameterByName('token', url)
      expect('_').to.equal(token)

      // projectsFile
      const projectsFile = getParameterByName('projectsFile', url)
      expect('http://localhost:8080/static/file.json').to.equal(projectsFile)
    })
    it('Should get optional params from url', () => {
      // gitlabciProtocol
      const gitlabciProtocol = getParameterByName('gitlabciProtocol', url)
      expect('http').to.equal(gitlabciProtocol)

      // hideSuccessCards
      const hideSuccessCards = getParameterByName('hideSuccessCards', url)
      expect(false).to.equal(hideSuccessCards)

      // interval
      const interval = getParameterByName('interval', url)
      expect('5').to.equal(interval)
    })
  })
})
