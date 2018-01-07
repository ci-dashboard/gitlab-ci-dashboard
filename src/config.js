import fitch from 'fitch'

export const getConfigFromFile = (fileUrl) => {
  if (fileUrl == null || fileUrl === '') {
    return Promise.reject(new Error('Needs to pass a config file url'))
  }
  return fitch.get(fileUrl)
    .then((response) => {
      if (response.data && response.data.dashboard) {
        return response.data.dashboard
      }
      return Promise.reject(new Error('Invalid file'))
    })
}
