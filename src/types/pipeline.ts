// Status de execução de pipelines do GitLab CI
export enum PipelineStatus {
  Created = 'created',
  Pending = 'pending',
  Running = 'running',
  Failed = 'failed',
  Success = 'success',
  Canceled = 'canceled',
  Skipped = 'skipped',
  Manual = 'manual',
  WaitingForResource = 'waiting_for_resource',
  Preparing = 'preparing',
  Scheduled = 'scheduled',
}

// Resposta bruta da API GitLab — pipelines
export interface GitLabPipeline {
  id: number
  iid: number
  project_id: number
  status: PipelineStatus
  source: string
  ref: string
  sha: string
  web_url: string
  created_at: string
  updated_at: string
  started_at: string | null
  finished_at: string | null
  duration: number | null
  queued_duration: number | null
  coverage: string | null
}

// Resposta bruta da API GitLab — tag
export interface GitLabTag {
  name: string
  message: string | null
  target: string
  commit: {
    id: string
    short_id: string
    title: string
    created_at: string
    message: string
  }
}

// Resposta bruta da API GitLab — commit (endpoint /repository/commits/:sha)
export interface GitLabCommit {
  id: string
  short_id: string
  title: string
  message: string
  author_name: string
  authored_date: string
  committed_date: string
  web_url: string
  last_pipeline: GitLabPipeline | null
}

// Resposta bruta da API GitLab — branch
export interface GitLabBranch {
  name: string
  protected: boolean
  commit: {
    id: string
    short_id: string
    title: string
    author_name: string
    message: string
  }
}

// Resposta bruta da API GitLab — build (API v3: /commits/:sha/builds)
export interface GitLabBuild {
  id: number
  status: PipelineStatus
  started_at: string | null
  finished_at: string | null
  commit: {
    id: string
    message: string
    author_name: string
  }
}

// Resposta bruta da API GitLab — projeto
export interface GitLabProjectRaw {
  id: number
  name: string
  name_with_namespace: string
  path_with_namespace: string
  web_url: string
  default_branch: string
  namespace: {
    id: number
    name: string
    full_path: string
  }
}

// Modelo interno — build normalizado para exibição no dashboard
export interface Build {
  id: number
  project: string               // nome do projeto (sem namespace)
  description: string
  status: PipelineStatus
  lastStatus: PipelineStatus | ''
  startedAt: string             // ex: "2 hours ago" (formatado por date-fns)
  author: string
  commitMessage: string
  projectPath: string           // path completo: namespace/project
  branch: string
  tagName: string | null
  namespaceName: string
  linkToBranch: string
  linkToBuild: string
}

// Contagem de status para o painel lateral
export interface StatusCount {
  status: PipelineStatus
  total: number
}
