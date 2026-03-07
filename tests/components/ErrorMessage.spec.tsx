import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorMessage } from '@/components/ErrorMessage/ErrorMessage'
import type { AppError } from '@/types/config'

describe('ErrorMessage', () => {
  it('renders nothing when error is null', () => {
    render(<ErrorMessage error={null} />)
    expect(document.getElementById('gcim-error')).toBeNull()
  })

  it('renders nothing when error has an empty message', () => {
    const error: AppError = { code: 0, message: '' }
    render(<ErrorMessage error={error} />)
    expect(document.getElementById('gcim-error')).toBeNull()
  })

  it('renders the error message when present', () => {
    const error: AppError = { code: 404, message: 'Not found' }
    render(<ErrorMessage error={error} />)
    expect(screen.getByText('Not found')).toBeInTheDocument()
  })

  it('renders the container with the correct id', () => {
    const error: AppError = { code: 500, message: 'Server error' }
    render(<ErrorMessage error={error} />)
    expect(document.getElementById('gcim-error')).not.toBeNull()
  })
})
