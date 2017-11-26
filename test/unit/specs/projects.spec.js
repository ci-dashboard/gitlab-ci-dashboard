import {
  getProjectsFromFile
} from '@/projects'

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
})
