import type { RawProjectConfig } from './project'

// Configuração interna do dashboard — já normalizada e validada
export interface DashboardConfig {
  gitlab: string
  token: string
  gitlabciProtocol: 'http' | 'https'
  apiVersion: '3' | '4'
  hideSuccessCards: boolean
  hideVersion: boolean
  interval: number
  // Fonte dos projetos — apenas uma delas estará preenchida
  projects: RawProjectConfig[] | null    // lista inline (config file ou standalone)
  projectsFile: string | null            // URL para buscar lista de projetos
  projectsParam: string | null           // querystring "namespace/project:branch,..."
  standalone: boolean
}

// Resultado do carregamento de configuração — discriminated union para type safety nos componentes
export type ConfigState =
  | { status: 'loading' }
  | { status: 'invalid' }
  | { status: 'ready'; config: DashboardConfig }

// Erro padronizado exibido no painel
export interface AppError {
  code: number
  message: string
}
