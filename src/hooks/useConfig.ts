import { useState, useEffect } from 'react'
import type { DashboardConfig, ConfigState } from '@/types/config'
import type { ConfigFile, RawProjectConfig } from '@/types/project'
import { getConfigFromFile, getStandaloneParams } from '@/services/config'
import { getSearchParam } from '@/utils/url'

const DEFAULT_PROTOCOL = 'https' as const
const DEFAULT_API_VERSION = '3' as const
const DEFAULT_INTERVAL = 60
const DEFAULT_HIDE_SUCCESS = false
const DEFAULT_HIDE_VERSION = false

function buildConfigFromFile(file: ConfigFile): DashboardConfig {
  const { config, projects } = file
  return {
    gitlab: config.gitlab ?? '',
    token: config.token ?? '',
    gitlabciProtocol: (config.gitlabciProtocol as 'http' | 'https') ?? DEFAULT_PROTOCOL,
    apiVersion: (config.apiVersion as '3' | '4') ?? DEFAULT_API_VERSION,
    hideSuccessCards: config.hideSuccessCards ?? DEFAULT_HIDE_SUCCESS,
    hideVersion: config.hideVersion ?? DEFAULT_HIDE_VERSION,
    interval: config.interval ?? DEFAULT_INTERVAL,
    standalone: config.standalone ?? false,
    projects: projects ?? null,
    projectsFile: config.projectsFile ?? null,
    projectsParam: null,
  }
}

function buildConfigFromParams(): DashboardConfig {
  return {
    gitlab: (getSearchParam('gitlab') as string) ?? '',
    token: (getSearchParam('token') as string) ?? '',
    gitlabciProtocol:
      ((getSearchParam('gitlabciProtocol') as string) as 'http' | 'https') ?? DEFAULT_PROTOCOL,
    apiVersion: ((getSearchParam('apiVersion') as string) as '3' | '4') ?? DEFAULT_API_VERSION,
    hideSuccessCards: (getSearchParam('hideSuccessCards') as boolean) ?? DEFAULT_HIDE_SUCCESS,
    hideVersion: (getSearchParam('hideVersion') as boolean) ?? DEFAULT_HIDE_VERSION,
    interval: Number(getSearchParam('interval') ?? DEFAULT_INTERVAL),
    standalone: (getSearchParam('standalone') as boolean) ?? false,
    projects: null,
    projectsFile: (getSearchParam('projectsFile') as string) ?? null,
    projectsParam: (getSearchParam('projects') as string) ?? null,
  }
}

function isConfigValid(config: DashboardConfig): boolean {
  if (!config.gitlab || !config.token) return false
  const hasProjects =
    config.projects != null || config.projectsFile != null || config.projectsParam != null
  return hasProjects
}

export function useConfig(): ConfigState {
  const [state, setState] = useState<ConfigState>({ status: 'loading' })

  useEffect(() => {
    async function load() {
      let config: DashboardConfig | null = null

      // 1. Tenta carregar do arquivo de configuração (?config=URL)
      const configUrl = getSearchParam('config') as string | null
      if (configUrl) {
        try {
          const fileConfig = await getConfigFromFile(configUrl)
          config = buildConfigFromFile(fileConfig)
        } catch {
          // arquivo inválido → fallback para querystring
        }
      }

      // 2. Fallback para querystring
      if (!config) {
        config = buildConfigFromParams()
      }

      // 3. Modo standalone: sobrescreve config com parâmetros vindos do servidor
      if (config.standalone) {
        try {
          const params = (await getStandaloneParams(window.location.origin)) as DashboardConfig & {
            projects: RawProjectConfig[]
          }
          config = {
            ...config,
            gitlab: params.gitlab,
            token: params.token,
            gitlabciProtocol: params.gitlabciProtocol ?? DEFAULT_PROTOCOL,
            hideSuccessCards: params.hideSuccessCards ?? DEFAULT_HIDE_SUCCESS,
            hideVersion: params.hideVersion ?? DEFAULT_HIDE_VERSION,
            apiVersion: params.apiVersion ?? DEFAULT_API_VERSION,
            interval: params.interval ?? DEFAULT_INTERVAL,
            projects: params.projects ?? null,
            projectsFile: null,
            projectsParam: null,
            standalone: true,
          }
        } catch {
          setState({ status: 'invalid' })
          return
        }
      }

      // 4. Valida
      if (!isConfigValid(config)) {
        setState({ status: 'invalid' })
        return
      }

      setState({ status: 'ready', config })
    }

    void load()
  }, [])

  return state
}
