import moxios from 'moxios'

import {
  getParameterByName,
  getProjectsByQuerystring,
  getTopItem
} from '@/main.js'

const mockedProjectDefinition = {
  description: 'React Native DraftJS Render',
  namespace: 'globocom',
  project: 'react-native-draftjs-render',
  branch: 'master'
}

describe('main.js', () => {
  describe('Utilities', () => {
    it('Should get top item of array', () => {
      const arr = ['a', 'b', 'c']
      const topItem = getTopItem(arr)
      expect('a').to.equal(topItem)
    })
  })
  describe('Projects File', () => {
    beforeEach(() => {
      // import and pass your custom axios instance to this method
      moxios.install()
    })

    afterEach(() => {
      // import and pass your custom axios instance to this method
      moxios.uninstall()
    })
    it('should be valid projects file pattern', () => {
      const projectDef = mockedProjectDefinition
      expect('React Native DraftJS Render').to.equal(projectDef.description)
      expect('globocom').to.equal(projectDef.namespace)
      expect('react-native-draftjs-render').to.equal(projectDef.project)
      expect('master').to.equal(projectDef.branch)
    })
    it('should get valid list of projects to test', (done) => {
      // getProjectByFile('http://localhost:8080/static/file.json', (data) => {
      //   console.info('getProjectByFile')
      //   done()
      // })
      // moxios.wait(() => {
      //   let request = moxios.requests.mostRecent()
      //   request.respondWith({
      //     status: 200,
      //     response: [
      //       {
      //         nameWithNamespace: 'native/gitlab-ci-monitor',
      //         projectName: 'gitlab-ci-monitor',
      //         branch: 'hackday'
      //       }
      //     ]
      //   }).then((data) => {
      //     return data
      //   })
      // })
      done()
    })
  })
  describe('Compatibility Mode', () => {
    it('Should load project pattern from url param', () => {
      const projectsParam = 'namespace1/project1/branch1'
      const projects = getProjectsByQuerystring(projectsParam)
      expect('namespace1').to.equal(projects[0].namespace)
      expect('project1').to.equal(projects[0].project)
      expect('branch1').to.equal(projects[0].branch)
    })
  })
  describe('Get querystring params', () => {
    const url = 'http://localhost:8080/?gitlab=localhost:8089&projects=namespace1/project1/branch1&token=_&projectsFile=http://localhost:8080/static/file.json&gitlabciProtocol=http&interval=5&hideSuccessCards=false'
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

      // projects
      const projects = getParameterByName('projects', url)
      expect('namespace1/project1/branch1').to.equal(projects)
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
