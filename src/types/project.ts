// Entrada de projeto a partir do arquivo de configuração JSON
export interface RawProjectConfig {
  description?: string
  namespace: string
  project: string
  branch?: string
}

// Projeto normalizado para uso interno no polling
export interface Repository {
  nameWithNamespace: string
  projectName: string
  branch: string
  description: string
}

// Configuração provinda do arquivo de configuração
export interface FileConfig {
  gitlab?: string
  token?: string
  standalone?: boolean
  projectsFile?: string
  gitlabciProtocol?: string
  hideSuccessCards?: boolean
  hideVersion?: boolean
  interval?: number
  apiVersion?: string
}

export interface ConfigFile {
  config: FileConfig
  projects: RawProjectConfig[]
}
