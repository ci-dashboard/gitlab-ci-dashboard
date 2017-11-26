import {
  getParameterByName,
  getProjectsByQuerystring,
  getTopItem
} from '@/main.js'

describe('main.js', () => {
  describe('Utilities', () => {
    it('Should get top item of array', () => {
      const arr = ['a', 'b', 'c']
      const topItem = getTopItem(arr)
      expect('a').toEqual(topItem)
    })
  })
  describe('Compatibility Mode', () => {
    it('Should load project pattern from url param', () => {
      const projectsParam = 'namespace1/project1/branch1'
      const projects = getProjectsByQuerystring(projectsParam)
      expect('namespace1').toEqual(projects[0].namespace)
      expect('project1').toEqual(projects[0].project)
      expect('branch1').toEqual(projects[0].branch)
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
