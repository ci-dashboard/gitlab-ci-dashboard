import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusPanel } from '@/components/StatusPanel/StatusPanel'
import { PipelineStatus } from '@/types/pipeline'
import type { StatusCount } from '@/types/pipeline'

vi.mock('@/assets/gitlab-logo.svg', () => ({ default: 'gitlab-logo.svg' }))

const ZERO_COUNTS: StatusCount[] = [
  { status: PipelineStatus.Success, total: 0 },
  { status: PipelineStatus.Failed, total: 0 },
  { status: PipelineStatus.Running, total: 0 },
  { status: PipelineStatus.Pending, total: 0 },
  { status: PipelineStatus.Canceled, total: 0 },
]

function makeCounts(overrides: Partial<Record<PipelineStatus, number>> = {}): StatusCount[] {
  return ZERO_COUNTS.map((sc) => ({
    ...sc,
    total: overrides[sc.status] ?? sc.total,
  }))
}

describe('StatusPanel', () => {
  it('renders the panel with the correct id', () => {
    render(<StatusPanel statusCounts={ZERO_COUNTS} interval={60} error={null} />)
    expect(document.getElementById('gcim-painel')).not.toBeNull()
  })

  it('renders all status labels', () => {
    render(<StatusPanel statusCounts={ZERO_COUNTS} interval={60} error={null} />)
    expect(screen.getByText('SUCCESS')).toBeInTheDocument()
    expect(screen.getByText('FAILED')).toBeInTheDocument()
    expect(screen.getByText('RUNNING')).toBeInTheDocument()
    expect(screen.getByText('PENDING')).toBeInTheDocument()
    expect(screen.getByText('CANCELED')).toBeInTheDocument()
  })

  it('shows correct counts for each status', () => {
    const counts = makeCounts({
      [PipelineStatus.Success]: 3,
      [PipelineStatus.Failed]: 1,
      [PipelineStatus.Running]: 2,
    })
    render(<StatusPanel statusCounts={counts} interval={60} error={null} />)

    const countEls = screen.getAllByText(/^\d+$/)
    const numbers = countEls.map((el) => Number(el.textContent))
    expect(numbers).toContain(3)
    expect(numbers).toContain(1)
    expect(numbers).toContain(2)
  })

  it('renders zero for absent statuses', () => {
    render(<StatusPanel statusCounts={[]} interval={60} error={null} />)
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBe(5)
  })

  it('renders the error message when an error is present', () => {
    render(
      <StatusPanel
        statusCounts={ZERO_COUNTS}
        interval={60}
        error={{ code: 500, message: 'Something went wrong' }}
      />,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('does not render an error when error is null', () => {
    render(<StatusPanel statusCounts={ZERO_COUNTS} interval={60} error={null} />)
    expect(document.getElementById('gcim-error')).toBeNull()
  })

  it('renders the GitLab CI Dashboard footer link', () => {
    render(<StatusPanel statusCounts={ZERO_COUNTS} interval={60} error={null} />)
    expect(screen.getByRole('link', { name: 'GitLab CI Dashboard' })).toBeInTheDocument()
  })

  it('renders the gitlab logo image', () => {
    render(<StatusPanel statusCounts={ZERO_COUNTS} interval={60} error={null} />)
    expect(screen.getByRole('img', { name: 'GitLab' })).toBeInTheDocument()
  })
})
