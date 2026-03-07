import type { ConfigFile } from '@/types/project'

export async function getConfigFromFile(fileUrl: string): Promise<ConfigFile> {
  if (!fileUrl) {
    throw new Error('Needs to pass a config file url')
  }
  const response = await fetch(fileUrl)
  if (!response.ok) {
    throw new Error(`Failed to load config: ${response.status}`)
  }
  const data = (await response.json()) as { dashboard?: ConfigFile }
  if (!data.dashboard) {
    throw new Error('Invalid file')
  }
  return data.dashboard
}

export async function getProjectsFromFile(fileUrl: string): Promise<unknown[]> {
  if (!fileUrl) {
    throw new Error('Needs to pass a file url')
  }
  const response = await fetch(fileUrl)
  if (!response.ok) {
    throw new Error(`Failed to load projects: ${response.status}`)
  }
  return response.json() as Promise<unknown[]>
}

export async function getStandaloneParams(baseUrl: string): Promise<unknown> {
  const response = await fetch(`${baseUrl}/params`)
  if (!response.ok) {
    throw new Error(`Failed to load standalone params: ${response.status}`)
  }
  return response.json()
}
