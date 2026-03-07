import { describe, it, expect } from 'vitest'
import { parseProjectsByQuerystring } from '@/utils/projects'

describe('parseProjectsByQuerystring', () => {
  it('parses a single project with default branch', () => {
    const result = parseProjectsByQuerystring('group/my-project')
    expect(result).toEqual([
      { description: '', namespace: 'group', project: 'my-project', branch: 'master' },
    ])
  })

  it('parses a single project with an explicit branch', () => {
    const result = parseProjectsByQuerystring('group/my-project:develop')
    expect(result).toEqual([
      { description: '', namespace: 'group', project: 'my-project', branch: 'develop' },
    ])
  })

  it('parses multiple projects separated by commas', () => {
    const result = parseProjectsByQuerystring('group/proj-a,group/proj-b:feature')
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      description: '',
      namespace: 'group',
      project: 'proj-a',
      branch: 'master',
    })
    expect(result[1]).toEqual({
      description: '',
      namespace: 'group',
      project: 'proj-b',
      branch: 'feature',
    })
  })

  it('handles subgroup namespaces (multiple slashes)', () => {
    const result = parseProjectsByQuerystring('group/subgroup/my-project:main')
    expect(result).toEqual([
      {
        description: '',
        namespace: 'group/subgroup',
        project: 'my-project',
        branch: 'main',
      },
    ])
  })

  it('handles branch names containing slashes', () => {
    const result = parseProjectsByQuerystring('group/my-project:feature/login')
    expect(result).toEqual([
      {
        description: '',
        namespace: 'group',
        project: 'my-project',
        branch: 'feature/login',
      },
    ])
  })

  it('trims whitespace around entries', () => {
    const result = parseProjectsByQuerystring(' group/my-project ')
    expect(result[0]?.namespace).toBe('group')
    expect(result[0]?.project).toBe('my-project')
  })

  it('throws when an entry has no namespace separator', () => {
    expect(() => parseProjectsByQuerystring('invalid-project')).toThrow('Invalid project name')
  })
})
