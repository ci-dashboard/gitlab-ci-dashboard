import type {
  GitLabProjectRaw,
  GitLabBranch,
  GitLabBuild,
  GitLabTag,
  GitLabPipeline,
  GitLabCommit,
} from '@/types/pipeline'

interface GitLabClientConfig {
  baseUrl: string
  token: string
  protocol: 'http' | 'https'
  apiVersion: '3' | '4'
}

function createGitLabClient(config: GitLabClientConfig) {
  const apiUrl = `${config.protocol}://${config.baseUrl}/api/v${config.apiVersion}`

  async function get<T>(path: string): Promise<T> {
    const response = await fetch(`${apiUrl}${path}`, {
      headers: { 'PRIVATE-TOKEN': config.token },
    })
    if (!response.ok) {
      const error = new Error(`${response.status} - ${response.statusText}.`) as Error & {
        response: Response
      }
      error.response = response
      throw error
    }
    return response.json() as Promise<T>
  }

  function encodePath(value: string): string {
    return value.replace(/\//g, '%2F')
  }

  return {
    getProject(nameWithNamespace: string) {
      if (!nameWithNamespace) {
        return Promise.reject(new Error('nameWithNamespace is empty'))
      }
      return get<GitLabProjectRaw>(`/projects/${encodePath(nameWithNamespace)}`)
    },

    getBranch(projectId: number, branchName: string) {
      if (projectId == null || branchName == null) {
        return Promise.reject(new Error('projectId or branchName are empty'))
      }
      return get<GitLabBranch>(
        `/projects/${projectId}/repository/branches/${encodePath(branchName)}`,
      )
    },

    getBuilds(projectId: number, commitId: string) {
      if (projectId == null || commitId == null) {
        return Promise.reject(new Error('projectId or commitId are empty'))
      }
      return get<GitLabBuild[]>(
        `/projects/${projectId}/repository/commits/${commitId}/builds`,
      )
    },

    getPipelines(projectId: number) {
      if (projectId == null) {
        return Promise.reject(new Error('projectId is empty'))
      }
      return get<GitLabPipeline[]>(`/projects/${projectId}/pipelines`)
    },

    getPipeline(projectId: number, pipelineId: number) {
      if (projectId == null || pipelineId == null) {
        return Promise.reject(new Error('projectId or pipelineId are empty'))
      }
      return get<GitLabPipeline>(`/projects/${projectId}/pipelines/${pipelineId}`)
    },

    getTags(projectId: number) {
      if (projectId == null) {
        return Promise.reject(new Error('projectId is empty'))
      }
      return get<GitLabTag[]>(`/projects/${projectId}/repository/tags`)
    },

    getCommits(projectId: number, branchName: string) {
      if (projectId == null || !branchName) {
        return Promise.reject(new Error('projectId or branchName are empty'))
      }
      return get<GitLabCommit>(
        `/projects/${projectId}/repository/commits/${encodePath(branchName)}`,
      )
    },
  }
}

export type GitLabClient = ReturnType<typeof createGitLabClient>
export { createGitLabClient }
