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

export const getProjectsByQuerystring = (projectsParam) => {
  let newProjects = []
  const repositories = projectsParam.split(',')
  for (const x in repositories) {
    try {
      const repos = repositories[x].split('/')
      const namespace = repos[0].trim()
      const project = repos[1].trim()
      let branch = 'master'
      if (repos.length > 2) {
        branch = repos[2].trim()
      }
      newProjects.push({
        description: '',
        namespace,
        project,
        branch
      })
    } catch (err) {
      console.log(err)
    }
  }
  return newProjects
}
