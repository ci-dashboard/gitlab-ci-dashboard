import {
  getProjectsFromFile,
  getProjectsByQuerystring
} from '@/projects'

const gitlabCIMonitorURL = 'globocom/react-native-draftjs-render,globo.com/gitlab-ci-monitor'

const projectDef = {
  description: 'React Native DraftJS Render',
  namespace: 'globocom',
  project: 'react-native-draftjs-render',
  branch: 'master'
}

jest.mock('axios', () => ({
  get: () => {
    return Promise.resolve({data: [{
      description: 'React Native DraftJS Render',
      namespace: 'globocom',
      project: 'react-native-draftjs-render',
      branch: 'master'
    }]})
  }
}))

describe('Projects File', () => {
  it('should be valid projects file pattern', () => {
    expect('React Native DraftJS Render').toEqual(projectDef.description)
    expect('globocom').toEqual(projectDef.namespace)
    expect('react-native-draftjs-render').toEqual(projectDef.project)
    expect('master').toEqual(projectDef.branch)
  })
  it('should get valid list of projects to test', (done) => {
    getProjectsFromFile('http://localhost:8080/static/file.json').then((data) => {
      expect(data.length).toBeGreaterThan(0)
      expect('globocom').toEqual(data[0].namespace)
      done()
    })
  })
  it('should return err when dont pass file as param', (done) => {
    getProjectsFromFile().catch((err) => {
      expect(typeof err).toEqual('object')
      done()
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
    it('Should transform gitlab ci pattern in projects', () => {
      const projects = getProjectsByQuerystring(gitlabCIMonitorURL)
      expect(2).toEqual(projects.length)
      expect(projects[1].branch).toEqual('master')
      expect(projects[0].project).toEqual('react-native-draftjs-render')
    })
  })
})
