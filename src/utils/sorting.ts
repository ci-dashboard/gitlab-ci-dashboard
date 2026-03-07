import semver from 'semver'
import { PipelineStatus } from '@/types/pipeline'
import type { GitLabBuild, GitLabTag } from '@/types/pipeline'

const IGNORED_STATUSES = new Set<string>([
  PipelineStatus.Created,
  PipelineStatus.Manual,
  PipelineStatus.Skipped,
])

// Retorna o build mais relevante: o que está em execução ou o último finalizado válido
export function getTopItem(list: GitLabBuild[]): GitLabBuild | undefined {
  if (!Array.isArray(list) || list.length === 0) return undefined

  let lastValidEntry: GitLabBuild | undefined

  return [...list].reverse().find((entry) => {
    if (IGNORED_STATUSES.has(entry.status)) return false
    if (entry.started_at && !entry.finished_at) return true
    lastValidEntry = entry
    return false
  }) ?? lastValidEntry
}

// Retorna o nome da tag mais recente por semver (descending), ignorando tags não-semver
export function getTopTagName(tags: GitLabTag[]): string | undefined {
  if (!Array.isArray(tags) || tags.length === 0) return undefined

  const validTagNames = tags
    .map((t) => t.name)
    .filter((name) => semver.valid(name) !== null)
    .sort((a, b) => semver.rcompare(a, b))

  return validTagNames[0]
}
