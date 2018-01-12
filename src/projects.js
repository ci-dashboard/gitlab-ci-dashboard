import fitch from 'fitch'

export const getProjectsFromFile = (fileUrl) => {
  if (fileUrl == null || fileUrl === '') {
    return Promise.reject(new Error('Needs to pass a file url'))
  }
  return fitch.get(fileUrl)
    .then((response) => {
      return response.data
    })
}

export const getProjectsByQuerystring = (projectsParam) => {
  let newProjects = []
  const repositories = projectsParam.split(',')
  for (const x in repositories) {
    try {
      const namespace = repositories[x].substring(0, repositories[x].lastIndexOf('/'))
      let project = repositories[x].substring(repositories[x].lastIndexOf('/') + 1)
      let branch = 'master'
      if (project.includes(':')) {
        [project, branch] = project.split(':')
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
