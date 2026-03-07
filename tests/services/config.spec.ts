import { describe, it, expect, vi, afterEach } from 'vitest'
import { getConfigFromFile, getProjectsFromFile, getStandaloneParams } from '@/services/config'

function mockFetch(body: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: () => Promise.resolve(body),
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getConfigFromFile', () => {
  it('returns the dashboard config on success', async () => {
    const payload = {
      dashboard: {
        config: { gitlab: 'gitlab.example.com', token: 'secret' },
        projects: [{ namespace: 'group', project: 'proj', branch: 'main' }],
      },
    }
    vi.stubGlobal('fetch', mockFetch(payload))

    const result = await getConfigFromFile('http://example.com/config.json')
    expect(result).toEqual(payload.dashboard)
  })

  it('throws when the URL is empty', async () => {
    await expect(getConfigFromFile('')).rejects.toThrow('Needs to pass a config file url')
  })

  it('throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', mockFetch({}, false, 404))
    await expect(getConfigFromFile('http://example.com/missing.json')).rejects.toThrow(
      'Failed to load config: 404',
    )
  })

  it('throws when the response has no "dashboard" key', async () => {
    vi.stubGlobal('fetch', mockFetch({ other: 'data' }))
    await expect(getConfigFromFile('http://example.com/bad.json')).rejects.toThrow('Invalid file')
  })
})

describe('getProjectsFromFile', () => {
  it('returns the projects array on success', async () => {
    const projects = [{ namespace: 'group', project: 'proj', branch: 'master' }]
    vi.stubGlobal('fetch', mockFetch(projects))

    const result = await getProjectsFromFile('http://example.com/projects.json')
    expect(result).toEqual(projects)
  })

  it('throws when the URL is empty', async () => {
    await expect(getProjectsFromFile('')).rejects.toThrow('Needs to pass a file url')
  })

  it('throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', mockFetch({}, false, 500))
    await expect(getProjectsFromFile('http://example.com/bad.json')).rejects.toThrow(
      'Failed to load projects: 500',
    )
  })
})

describe('getStandaloneParams', () => {
  it('fetches /params from the base URL', async () => {
    const params = { gitlab: 'gitlab.example.com', token: '12345' }
    const fetchMock = mockFetch(params)
    vi.stubGlobal('fetch', fetchMock)

    const result = await getStandaloneParams('http://localhost:8081')
    expect(result).toEqual(params)
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8081/params')
  })

  it('throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', mockFetch({}, false, 404))
    await expect(getStandaloneParams('http://localhost:8081')).rejects.toThrow(
      'Failed to load standalone params: 404',
    )
  })
})
