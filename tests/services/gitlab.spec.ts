import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createGitLabClient } from '@/services/gitlab'

const BASE_CONFIG = {
  baseUrl: 'gitlab.example.com',
  token: 'test-token',
  protocol: 'https' as const,
  apiVersion: '4' as const,
}

function mockFetch(body: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Not Found',
    json: () => Promise.resolve(body),
  })
}

describe('createGitLabClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch({}))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('getProject', () => {
    it('fetches the correct URL with encoded namespace', async () => {
      const fetchMock = mockFetch({ id: 1, name: 'my-project' })
      vi.stubGlobal('fetch', fetchMock)

      const client = createGitLabClient(BASE_CONFIG)
      await client.getProject('group/my-project')

      expect(fetchMock).toHaveBeenCalledWith(
        'https://gitlab.example.com/api/v4/projects/group%2Fmy-project',
        expect.objectContaining({ headers: { 'PRIVATE-TOKEN': 'test-token' } }),
      )
    })

    it('rejects immediately when nameWithNamespace is empty', async () => {
      const client = createGitLabClient(BASE_CONFIG)
      await expect(client.getProject('')).rejects.toThrow('nameWithNamespace is empty')
    })

    it('throws when the response is not ok', async () => {
      vi.stubGlobal('fetch', mockFetch({ message: 'Not found' }, false, 404))
      const client = createGitLabClient(BASE_CONFIG)
      await expect(client.getProject('group/missing')).rejects.toThrow('404 - Not Found.')
    })
  })

  describe('getBranch', () => {
    it('fetches the correct URL', async () => {
      const fetchMock = mockFetch({ name: 'main' })
      vi.stubGlobal('fetch', fetchMock)

      const client = createGitLabClient(BASE_CONFIG)
      await client.getBranch(42, 'main')

      expect(fetchMock).toHaveBeenCalledWith(
        'https://gitlab.example.com/api/v4/projects/42/repository/branches/main',
        expect.anything(),
      )
    })

    it('rejects when branchName is null', async () => {
      const client = createGitLabClient(BASE_CONFIG)
      // @ts-expect-error – testing runtime guard
      await expect(client.getBranch(42, null)).rejects.toThrow()
    })
  })

  describe('getBuilds', () => {
    it('fetches builds for a commit', async () => {
      const fetchMock = mockFetch([])
      vi.stubGlobal('fetch', fetchMock)

      const client = createGitLabClient(BASE_CONFIG)
      await client.getBuilds(42, 'abc123')

      expect(fetchMock).toHaveBeenCalledWith(
        'https://gitlab.example.com/api/v4/projects/42/repository/commits/abc123/builds',
        expect.anything(),
      )
    })
  })

  describe('getPipelines', () => {
    it('fetches pipelines for a project', async () => {
      const fetchMock = mockFetch([])
      vi.stubGlobal('fetch', fetchMock)

      const client = createGitLabClient(BASE_CONFIG)
      await client.getPipelines(7)

      expect(fetchMock).toHaveBeenCalledWith(
        'https://gitlab.example.com/api/v4/projects/7/pipelines',
        expect.anything(),
      )
    })
  })

  describe('getTags', () => {
    it('fetches tags for a project', async () => {
      const fetchMock = mockFetch([{ name: '1.0.0' }])
      vi.stubGlobal('fetch', fetchMock)

      const client = createGitLabClient(BASE_CONFIG)
      const tags = await client.getTags(7)

      expect(tags).toEqual([{ name: '1.0.0' }])
    })
  })

  describe('getCommits', () => {
    it('fetches latest commit on a branch', async () => {
      const fetchMock = mockFetch({ id: 'abc' })
      vi.stubGlobal('fetch', fetchMock)

      const client = createGitLabClient(BASE_CONFIG)
      await client.getCommits(42, 'main')

      expect(fetchMock).toHaveBeenCalledWith(
        'https://gitlab.example.com/api/v4/projects/42/repository/commits/main',
        expect.anything(),
      )
    })

    it('rejects when branchName is empty', async () => {
      const client = createGitLabClient(BASE_CONFIG)
      await expect(client.getCommits(42, '')).rejects.toThrow()
    })
  })
})
