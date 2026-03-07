import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BuildCardList } from '@/components/BuildCard/BuildCard'
import { PipelineStatus } from '@/types/pipeline'
import type { Build } from '@/types/pipeline'

function makeBuild(overrides: Partial<Build> = {}): Build {
  return {
    id: 101,
    project: 'my-project',
    description: '',
    status: PipelineStatus.Success,
    lastStatus: '',
    startedAt: '2 hours ago',
    author: 'Alice',
    commitMessage: 'fix: something important',
    projectPath: 'group/my-project',
    branch: 'main',
    tagName: null,
    namespaceName: 'Group',
    linkToBranch: 'https://gitlab.example.com/group/my-project/tree/main',
    linkToBuild: 'https://gitlab.example.com/group/my-project/-/builds/101',
    ...overrides,
  }
}

describe('BuildCardList', () => {
  it('renders nothing in the card grid when builds is empty', () => {
    render(<BuildCardList builds={[]} hideSuccessCards={false} hideVersion={false} />)
    const section = document.getElementById('gcim-builds')
    expect(section).not.toBeNull()
    // no build cards rendered
    expect(screen.queryByText(/#\d+/)).toBeNull()
  })

  it('renders a card for each build', () => {
    const builds = [makeBuild({ id: 1 }), makeBuild({ id: 2 })]
    render(<BuildCardList builds={builds} hideSuccessCards={false} hideVersion={false} />)
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
  })

  it('shows project name and branch', () => {
    render(
      <BuildCardList
        builds={[makeBuild({ project: 'my-project', branch: 'develop' })]}
        hideSuccessCards={false}
        hideVersion={false}
      />,
    )
    expect(screen.getByText('my-project (develop)')).toBeInTheDocument()
  })

  it('shows namespace name', () => {
    render(
      <BuildCardList
        builds={[makeBuild({ namespaceName: 'My Group' })]}
        hideSuccessCards={false}
        hideVersion={false}
      />,
    )
    expect(screen.getByText('My Group')).toBeInTheDocument()
  })

  it('hides commit message and blame for success builds', () => {
    render(
      <BuildCardList
        builds={[makeBuild({ status: PipelineStatus.Success, author: 'Bob' })]}
        hideSuccessCards={false}
        hideVersion={false}
      />,
    )
    expect(screen.queryByText('Blame Bob')).toBeNull()
  })

  it('shows commit message and blame for failed builds', () => {
    render(
      <BuildCardList
        builds={[
          makeBuild({
            status: PipelineStatus.Failed,
            commitMessage: 'feat: bad change',
            author: 'Bob',
          }),
        ]}
        hideSuccessCards={false}
        hideVersion={false}
      />,
    )
    expect(screen.getByText('feat: bad change')).toBeInTheDocument()
    expect(screen.getByText('Blame Bob')).toBeInTheDocument()
  })

  it('shows the tagName when hideVersion is false', () => {
    render(
      <BuildCardList
        builds={[makeBuild({ tagName: '2.1.0' })]}
        hideSuccessCards={false}
        hideVersion={false}
      />,
    )
    expect(screen.getByText('2.1.0')).toBeInTheDocument()
  })

  it('hides the tagName when hideVersion is true', () => {
    render(
      <BuildCardList
        builds={[makeBuild({ tagName: '2.1.0' })]}
        hideSuccessCards={false}
        hideVersion={true}
      />,
    )
    expect(screen.queryByText('2.1.0')).toBeNull()
  })

  it('shows the description when present', () => {
    render(
      <BuildCardList
        builds={[makeBuild({ description: 'Production build' })]}
        hideSuccessCards={false}
        hideVersion={false}
      />,
    )
    expect(screen.getByText('Production build')).toBeInTheDocument()
  })

  it('shows the startedAt time', () => {
    render(
      <BuildCardList
        builds={[makeBuild({ startedAt: '5 minutes ago' })]}
        hideSuccessCards={false}
        hideVersion={false}
      />,
    )
    expect(screen.getByText('5 minutes ago')).toBeInTheDocument()
  })

  it('renders build links correctly', () => {
    const build = makeBuild({
      linkToBranch: 'https://gitlab.example.com/group/proj/tree/main',
      linkToBuild: 'https://gitlab.example.com/group/proj/-/builds/101',
    })
    render(<BuildCardList builds={[build]} hideSuccessCards={false} hideVersion={false} />)
    const buildLink = screen.getByRole('link', { name: '#101' })
    expect(buildLink).toHaveAttribute('href', build.linkToBuild)
  })
})
