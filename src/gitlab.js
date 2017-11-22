import axios from 'axios'

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

export const getTags = (projectId) => {
  if (projectId == null) {
    return Promise.reject(new Error('projectId is empty'))
  }
  return axios.get(`/projects/${projectId}/repository/tags`)
}
