import axios from 'axios'

export const getProjectsFromFile = (fileUrl) => {
  if (fileUrl == null || fileUrl === '') {
    return Promise.reject(new Error('Needs to pass a file url'))
  }
  return axios.get(fileUrl)
    .then((response) => {
      return response.data
    })
}
