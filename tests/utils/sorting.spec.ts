import { describe, it, expect } from 'vitest'
import { getTopItem, getTopTagName } from '@/utils/sorting'
import { PipelineStatus } from '@/types/pipeline'
import type { GitLabBuild, GitLabTag } from '@/types/pipeline'

function makeBuild(overrides: Partial<GitLabBuild> = {}): GitLabBuild {
  return {
    id: 1,
    status: PipelineStatus.Success,
    started_at: '2024-01-01T00:00:00Z',
    finished_at: '2024-01-01T00:01:00Z',
    commit: { id: 'abc', message: 'chore: bump', author_name: 'Dev' },
    ...overrides,
  }
}

function makeTag(name: string): GitLabTag {
  return {
    name,
    message: null,
    target: 'abc123',
    commit: { id: 'abc123', short_id: 'abc', title: name, created_at: '2024-01-01T00:00:00Z', message: '' },
  }
}

describe('getTopItem', () => {
  it('returns undefined for an empty list', () => {
    expect(getTopItem([])).toBeUndefined()
  })

  it('returns undefined for a non-array', () => {
    // @ts-expect-error – testing runtime guard
    expect(getTopItem(null)).toBeUndefined()
  })

  it('returns the currently running build (started but not finished)', () => {
    const running = makeBuild({
      id: 2,
      status: PipelineStatus.Running,
      started_at: '2024-01-01T00:02:00Z',
      finished_at: null,
    })
    const finished = makeBuild({ id: 1, status: PipelineStatus.Success })
    expect(getTopItem([finished, running])).toEqual(running)
  })

  it('returns the last finished valid build when nothing is running', () => {
    // GitLab API returns builds newest-first; input must be in that order
    const older = makeBuild({ id: 1, status: PipelineStatus.Success })
    const newer = makeBuild({
      id: 2,
      status: PipelineStatus.Failed,
      started_at: '2024-01-02T00:00:00Z',
      finished_at: '2024-01-02T00:01:00Z',
    })
    expect(getTopItem([newer, older])).toEqual(newer)
  })

  it('skips created, manual and skipped builds', () => {
    const skipped = makeBuild({ id: 1, status: PipelineStatus.Skipped })
    const manual = makeBuild({ id: 2, status: PipelineStatus.Manual })
    const created = makeBuild({ id: 3, status: PipelineStatus.Created })
    const valid = makeBuild({ id: 4, status: PipelineStatus.Success })
    expect(getTopItem([skipped, manual, created, valid])).toEqual(valid)
  })

  it('returns undefined when all builds are in ignored statuses', () => {
    const builds = [
      makeBuild({ status: PipelineStatus.Skipped }),
      makeBuild({ status: PipelineStatus.Manual }),
    ]
    expect(getTopItem(builds)).toBeUndefined()
  })
})

describe('getTopTagName', () => {
  it('returns undefined for an empty list', () => {
    expect(getTopTagName([])).toBeUndefined()
  })

  it('returns the highest semver tag', () => {
    const tags = [makeTag('1.0.0'), makeTag('2.0.0'), makeTag('1.5.0')]
    expect(getTopTagName(tags)).toBe('2.0.0')
  })

  it('ignores non-semver tags', () => {
    const tags = [makeTag('release-2024'), makeTag('1.2.3'), makeTag('latest')]
    expect(getTopTagName(tags)).toBe('1.2.3')
  })

  it('returns undefined when all tags are non-semver', () => {
    const tags = [makeTag('stable'), makeTag('latest')]
    expect(getTopTagName(tags)).toBeUndefined()
  })

  it('handles pre-release versions correctly (higher patch wins)', () => {
    const tags = [makeTag('1.0.1'), makeTag('1.0.2'), makeTag('1.0.0')]
    expect(getTopTagName(tags)).toBe('1.0.2')
  })
})
