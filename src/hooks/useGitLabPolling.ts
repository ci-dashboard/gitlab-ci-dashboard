import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import type { DashboardConfig } from '@/types/config'
import type { AppError } from '@/types/config'
import type { Build, StatusCount } from '@/types/pipeline'
import { PipelineStatus } from '@/types/pipeline'
import type { Repository, RawProjectConfig } from '@/types/project'
import { createGitLabClient } from '@/services/gitlab'
import { getProjectsFromFile } from '@/services/config'
import { getTopItem, getTopTagName } from '@/utils/sorting'
import { parseProjectsByQuerystring } from '@/utils/projects'

function fromNow(isoTimestamp: string | null): string {
  if (!isoTimestamp) return ''
  try {
    return formatDistanceToNow(parseISO(isoTimestamp), { addSuffix: true })
  } catch {
    return isoTimestamp
  }
}

function normalizeRepositories(rawProjects: RawProjectConfig[]): Repository[] {
  return rawProjects.map((repo) => ({
    nameWithNamespace: `${repo.namespace}/${repo.project}`,
    projectName: repo.project,
    branch: repo.branch ?? 'master',
    description: repo.description ?? '',
  }))
}

function buildLinkToBranch(protocol: string, gitlab: string, pathWithNamespace: string, branch: string): string {
  return `${protocol}://${gitlab}/${pathWithNamespace}/tree/${branch}`
}

function buildLinkToPipeline(protocol: string, gitlab: string, pathWithNamespace: string, pipelineId: number): string {
  return `${protocol}://${gitlab}/${pathWithNamespace}/pipelines/${pipelineId}`
}

function buildLinkToJob(protocol: string, gitlab: string, pathWithNamespace: string, buildId: number): string {
  return `${protocol}://${gitlab}/${pathWithNamespace}/-/jobs/${buildId}`
}

function normalizeError(err: unknown): AppError {
  const error = err as Error & { response?: { status: number }; project?: string }
  const message = error.message ?? 'Unknown error'

  if (message === 'Wrong format') {
    return { code: 2, message: "Wrong projects format! Try: 'namespace/project' or 'namespace/project:branch'" }
  }
  if (message === 'Network Error') {
    return { code: 3, message: 'Network Error. Please check the Gitlab domain.' }
  }
  if (error.response?.status === 401) {
    return { code: 4, message: 'Unauthorized Access. Please check your token.' }
  }
  if (message.includes('404')) {
    return { code: 5, message: `Project not found: ${error.project ?? ''}` }
  }
  return {
    code: 1,
    message: `Something went wrong. Make sure the configuration is ok and your GitLab is up and running. Details: ${message}`,
  }
}

interface PollingResult {
  builds: Build[]
  loading: boolean
  error: AppError | null
  statusCounts: StatusCount[]
}

export function useGitLabPolling(config: DashboardConfig): PollingResult {
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AppError | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const buildsRef = useRef<Build[]>([])
  buildsRef.current = builds

  // Derived: count builds per status (replaces the Vue status queue)
  const statusCounts = useMemo<StatusCount[]>(
    () =>
      [
        PipelineStatus.Success,
        PipelineStatus.Failed,
        PipelineStatus.Running,
        PipelineStatus.Pending,
        PipelineStatus.Canceled,
      ].map((status) => ({
        status,
        total: builds.filter((b) => b.status === status).length,
      })),
    [builds],
  )

  const updateBuild = useCallback((updated: Build) => {
    setBuilds((prev) => {
      const idx = prev.findIndex(
        (b) => b.project === updated.project && b.branch === updated.branch,
      )
      if (idx === -1) return [...prev, updated]
      const next = [...prev]
      next[idx] = updated
      return next
    })
  }, [])

  const fetchBuildsV3 = useCallback(
    async (
      client: ReturnType<typeof createGitLabClient>,
      repo: Repository,
      project: { id: number; path_with_namespace: string; namespace: { full_path: string } },
    ) => {
      const branch = await client.getBranch(project.id, repo.branch)
      const commitId = branch.commit.id
      const [rawBuilds, tags] = await Promise.all([
        client.getBuilds(project.id, commitId),
        client.getTags(project.id),
      ])
      const topBuild = getTopItem(rawBuilds)
      if (!topBuild) return
      const topTag = getTopTagName(tags)
      const build: Build = {
        id: topBuild.id,
        project: repo.projectName,
        description: repo.description,
        status: topBuild.status,
        lastStatus: buildsRef.current.find((b) => b.project === repo.projectName && b.branch === repo.branch)?.status ?? '',
        startedAt: fromNow(topBuild.started_at),
        author: topBuild.commit.author_name,
        commitMessage: topBuild.commit.message,
        projectPath: project.path_with_namespace,
        branch: repo.branch,
        tagName: topTag ?? null,
        namespaceName: project.namespace.full_path,
        linkToBranch: buildLinkToBranch(config.gitlabciProtocol, config.gitlab, project.path_with_namespace, repo.branch),
        linkToBuild: buildLinkToJob(config.gitlabciProtocol, config.gitlab, project.path_with_namespace, topBuild.id),
      }
      updateBuild(build)
    },
    [config.gitlab, config.gitlabciProtocol, updateBuild],
  )

  const fetchPipelinesV4 = useCallback(
    async (
      client: ReturnType<typeof createGitLabClient>,
      repo: Repository,
      project: { id: number; path_with_namespace: string; namespace: { full_path: string } },
    ) => {
      const commit = await client.getCommits(project.id, repo.branch)
      if (!commit.last_pipeline) return
      const [tags, pipeline] = await Promise.all([
        client.getTags(project.id),
        client.getPipeline(project.id, commit.last_pipeline.id),
      ])
      const topTag = getTopTagName(tags)
      const build: Build = {
        id: pipeline.id,
        project: repo.projectName,
        description: repo.description,
        status: pipeline.status,
        lastStatus: buildsRef.current.find((b) => b.project === repo.projectName && b.branch === repo.branch)?.status ?? '',
        startedAt: fromNow(pipeline.started_at),
        author: commit.author_name,
        commitMessage: commit.message,
        projectPath: project.path_with_namespace,
        branch: repo.branch,
        tagName: topTag ?? null,
        namespaceName: project.namespace.full_path,
        linkToBranch: buildLinkToBranch(config.gitlabciProtocol, config.gitlab, project.path_with_namespace, repo.branch),
        linkToBuild: buildLinkToPipeline(config.gitlabciProtocol, config.gitlab, project.path_with_namespace, pipeline.id),
      }
      updateBuild(build)
    },
    [config.gitlab, config.gitlabciProtocol, updateBuild],
  )

  const fetchAll = useCallback(
    async (repositories: Repository[]) => {
      setError(null)
      const client = createGitLabClient({
        baseUrl: config.gitlab,
        token: config.token,
        protocol: config.gitlabciProtocol,
        apiVersion: config.apiVersion,
      })

      await Promise.allSettled(
        repositories.map(async (repo) => {
          try {
            const project = await client.getProject(repo.nameWithNamespace)
            if (config.apiVersion === '3') {
              await fetchBuildsV3(client, repo, project)
            } else {
              await fetchPipelinesV4(client, repo, project)
            }
          } catch (err) {
            const e = err as Error & { project?: string }
            e.project = repo.nameWithNamespace
            setError(normalizeError(e))
          }
        }),
      )
      setLoading(false)
    },
    [config, fetchBuildsV3, fetchPipelinesV4],
  )

  useEffect(() => {
    async function init() {
      setLoading(true)

      // Resolve a lista de repositórios
      let rawProjects: RawProjectConfig[] | null = config.projects
      if (!rawProjects && config.projectsParam) {
        try {
          rawProjects = parseProjectsByQuerystring(config.projectsParam)
        } catch (err) {
          setError(normalizeError(err))
          setLoading(false)
          return
        }
      }
      if (!rawProjects && config.projectsFile) {
        try {
          rawProjects = (await getProjectsFromFile(config.projectsFile)) as RawProjectConfig[]
        } catch (err) {
          setError(normalizeError(err))
          setLoading(false)
          return
        }
      }
      if (!rawProjects?.length) {
        setLoading(false)
        return
      }

      const repositories = normalizeRepositories(rawProjects)
      await fetchAll(repositories)

      // Polling
      intervalRef.current = setInterval(() => {
        void fetchAll(repositories)
      }, config.interval * 1000)
    }

    void init()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [config, fetchAll])

  return { builds, loading, error, statusCounts }
}
