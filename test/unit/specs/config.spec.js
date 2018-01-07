import {
  getConfigFromFile,
} from '@/config'

jest.mock('fitch', () => ({
  get: (url) => {
    if (url === 'http://host.domain/valid_config.json') {
      return Promise.resolve({data: {
        dashboard: {
          config: {
            gitlab: 'gitlab.example.com',
            token: '123456',
            gitlabciProtocol: 'https',
            hideSuccessCards: false,
            hideVersion: false,
            interval: 60,
            apiVersion: 3
          },
          projects: [
            {
              description: 'React Native render for draft.js model',
              namespace: 'globocom',
              project: 'react-native-draftjs-render',
              branch: 'master'
            }
          ]
        }
      }})
    } else {
      return Promise.resolve({data: null})
    }
  }
}))

describe('config', () => {
  test('get valid config file', (done) => {
    const jsonUrl = 'http://host.domain/valid_config.json'
    getConfigFromFile(jsonUrl).then((config) => {
      expect(config.config).not.toBeNull()
      done()
    })
  })
  test('handle invalid config file', (done) => {
    const jsonUrl = 'http://host.domain/invalid_config.json'
    getConfigFromFile(jsonUrl).catch((err) => {
      expect(err).not.toBeNull()
      done()
    })
  })
  test('handle empty url from config file', (done) => {
    const jsonUrl = ''
    getConfigFromFile(jsonUrl).catch((err) => {
      expect(err).not.toBeNull()
      done()
    })
  })
})
