import axios from 'axios'

export const setBaseData = (baseUrl, token, protocol = 'https', apiVersion = '3') => {
  axios.defaults.baseURL = `${protocol}://${baseUrl}/api/v${apiVersion}`
  axios.defaults.headers.common['PRIVATE-TOKEN'] = token
}

export const getBaseData = () => {
  return {
    baseUrl: axios.defaults.baseURL,
    token: axios.defaults.headers.common['PRIVATE-TOKEN']
  }
}

export const getProjects = (nameWithNamespace) => {
  if (nameWithNamespace == null || nameWithNamespace === '') {
    return Promise.reject(new Error('nameWithNamespace is empty'))
  }
  return axios.get(`/projects/${nameWithNamespace.replace('/', '%2F')}`)
}

export const getBranch = (projectId, branchName) => {
  if (projectId == null || branchName == null) {
    return Promise.reject(new Error('projectId or branchName are empty'))
  }
  return axios.get(`/projects/${projectId}/repository/branches/${branchName}`)
}

export const getBuilds = (projectId, commitId) => {
  if (projectId == null || commitId == null) {
    return Promise.reject(new Error('projectId or commitId are empty'))
  }
  return axios.get(`/projects/${projectId}/repository/commits/${commitId}/builds`)
}

export const getPipelines = (projectId) => {
  if (projectId == null) {
    return Promise.reject(new Error('projectId is empty'))
  }
  return axios.get(`/projects/${projectId}/pipelines`)
}

export const getPipeline = (projectId, pipelineId) => {
  if (projectId == null || pipelineId == null) {
    return Promise.reject(new Error('projectId or pipelineId are empty'))
  }
  return axios.get(`/projects/${projectId}/pipelines/${pipelineId}`)
}

export const getTags = (projectId) => {
  if (projectId == null) {
    return Promise.reject(new Error('projectId is empty'))
  }
  return axios.get(`/projects/${projectId}/repository/tags`)
}
