import axios from 'axios'

export const getStandaloneParams = () => {
  return axios.get('/params')
    .then((response) => {
      return response.data
    })
}
