import fitch from 'fitch'

export const setBaseData = (baseUrl, token, protocol = 'https', apiVersion = '3') => {
  fitch.defaults = {
    baseUrl: `${protocol}://${baseUrl}/api/v${apiVersion}`,
    token,
    protocol,
    apiVersion,
    config: {
      headers: { 'PRIVATE-TOKEN': token }
    }
  }
  fitch.preparedGet = (uri) => {
    const url = `${fitch.defaults.baseUrl}${uri}`
    const config = fitch.defaults.config
    return fitch.get(url, config)
  }
}

export const getBaseData = () => {
  return fitch.defaults
}

export const getProjects = (nameWithNamespace) => {
  if (nameWithNamespace == null || nameWithNamespace === '') {
    return Promise.reject(new Error('nameWithNamespace is empty'))
  }
  return fitch.preparedGet(`/projects/${nameWithNamespace.replace('/', '%2F')}`)
}

export const getBranch = (projectId, branchName) => {
  if (projectId == null || branchName == null) {
    return Promise.reject(new Error('projectId or branchName are empty'))
  }
  const b = '' + branchName.replace('/', '%2F')
  return fitch.preparedGet(`/projects/${projectId}/repository/branches/${b}`)
}

export const getBuilds = (projectId, commitId) => {
  if (projectId == null || commitId == null) {
    return Promise.reject(new Error('projectId or commitId are empty'))
  }
  return fitch.preparedGet(`/projects/${projectId}/repository/commits/${commitId}/builds`)
}

export const getPipelines = (projectId) => {
  if (projectId == null) {
    return Promise.reject(new Error('projectId is empty'))
  }
  return fitch.preparedGet(`/projects/${projectId}/pipelines`)
}

export const getPipeline = (projectId, pipelineId) => {
  if (projectId == null || pipelineId == null) {
    return Promise.reject(new Error('projectId or pipelineId are empty'))
  }
  return fitch.preparedGet(`/projects/${projectId}/pipelines/${pipelineId}`)
}

export const getTags = (projectId) => {
  if (projectId == null) {
    return Promise.reject(new Error('projectId is empty'))
  }
  return fitch.preparedGet(`/projects/${projectId}/repository/tags`)
}

export const getCommits = (projectId, branchName) => {
  if (projectId == null || branchName == null || branchName === '') {
    return Promise.reject(new Error('projectId or branchName are empty'))
  }
  return fitch.preparedGet(`/projects/${projectId}/repository/commits/${('' + branchName).replace('/', '%2F')}`)
}

export default {
  setBaseData
}
