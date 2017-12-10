import fitch from 'fitch'

export const getStandaloneParams = (baseUrl) => {
  return fitch.get(`${baseUrl}/params`)
    .then((response) => {
      return response.data
    })
}
