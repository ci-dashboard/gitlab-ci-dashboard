import {
  getParameterByName,
  getTopItem
} from '@/utils'

describe('Utilities', () => {
  it('Should get top item of array', () => {
    const arr = ['a', 'b', 'c']
    const topItem = getTopItem(arr)
    expect('a').toEqual(topItem)
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
