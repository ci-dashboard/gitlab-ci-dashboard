import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Loading } from '@/components/Loading/Loading'

describe('Loading', () => {
  it('renders the spinner when loading is true', () => {
    render(<Loading loading={true} />)
    expect(document.getElementById('gcim-loading')).not.toBeNull()
  })

  it('renders nothing when loading is false', () => {
    render(<Loading loading={false} />)
    expect(document.getElementById('gcim-loading')).toBeNull()
  })

  it('renders a visible spinner element inside the container', () => {
    render(<Loading loading={true} />)
    const container = document.getElementById('gcim-loading')
    expect(container?.children.length).toBeGreaterThan(0)
  })
})
