import moxios from 'moxios'

import {
  getParameterByName
} from '@/main.js'

const mockedProjectDefinition = {
  description: 'React Native DraftJS Render',
  namespace: 'globocom',
  project: 'react-native-draftjs-render',
  branch: 'master'
}

describe('main.js', () => {
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
