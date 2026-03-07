import { describe, it, expect } from 'vitest'
import { getSearchParam } from '@/utils/url'

describe('getSearchParam', () => {
  it('returns a string value when the param exists', () => {
    expect(getSearchParam('gitlab', 'http://localhost/?gitlab=gitlab.example.com')).toBe(
      'gitlab.example.com',
    )
  })

  it('returns null when the param is absent', () => {
    expect(getSearchParam('token', 'http://localhost/?gitlab=gitlab.example.com')).toBeNull()
  })

  it('converts "true" to boolean true', () => {
    expect(getSearchParam('standalone', 'http://localhost/?standalone=true')).toBe(true)
  })

  it('converts "false" to boolean false', () => {
    expect(getSearchParam('hideSuccessCards', 'http://localhost/?hideSuccessCards=false')).toBe(
      false,
    )
  })

  it('returns an empty string when the param has no value', () => {
    expect(getSearchParam('token', 'http://localhost/?token=')).toBe('')
  })

  it('handles multiple params and returns the correct one', () => {
    expect(
      getSearchParam('token', 'http://localhost/?gitlab=gitlab.example.com&token=abc123'),
    ).toBe('abc123')
  })
})
