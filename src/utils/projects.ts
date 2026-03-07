import type { RawProjectConfig } from '@/types/project'

// Converte querystring "namespace/project:branch,namespace/project2" em lista de projetos
export function parseProjectsByQuerystring(projectsParam: string): RawProjectConfig[] {
  return projectsParam.split(',').map((entry) => {
    if (!entry.includes('/')) {
      throw new Error('Invalid project name')
    }
    let projectPath = entry.trim()
    let branch = 'master'

    if (projectPath.includes(':')) {
      const colonIdx = projectPath.indexOf(':')
      branch = projectPath.substring(colonIdx + 1)
      projectPath = projectPath.substring(0, colonIdx)
    }

    const lastSlash = projectPath.lastIndexOf('/')
    const namespace = projectPath.substring(0, lastSlash)
    const project = projectPath.substring(lastSlash + 1)

    return { description: '', namespace, project, branch }
  })
}
