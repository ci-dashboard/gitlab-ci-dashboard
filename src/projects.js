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
      if (!repositories[x].includes('/')) {
        throw new Error(`Invalid project name`)
      }
      let branch = 'master'
      let projectPath = repositories[x]

      if (projectPath.includes(':')) {
        [projectPath, branch] = projectPath.split(':')
      }

      const namespace = projectPath.substring(0, projectPath.lastIndexOf('/'))
      const project = projectPath.substring(projectPath.lastIndexOf('/') + 1)

      newProjects.push({
        description: '',
        namespace,
        project,
        branch
      })
    }
    return newProjects
  }
