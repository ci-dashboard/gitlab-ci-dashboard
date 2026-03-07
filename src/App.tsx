import { useMemo } from 'react'
import type { DashboardConfig } from '@/types/config'
import { useGitLabPolling } from '@/hooks/useGitLabPolling'
import { BuildCardList } from '@/components/BuildCard/BuildCard'
import { StatusPanel } from '@/components/StatusPanel/StatusPanel'
import { Loading } from '@/components/Loading/Loading'
import styles from './App.module.css'

interface AppProps {
  config: DashboardConfig
}

export function App({ config }: AppProps) {
  const { builds, loading, error, statusCounts } = useGitLabPolling(config)

  const sortedBuilds = useMemo(
    () => [...builds].sort((a, b) => b.id - a.id),
    [builds],
  )

  return (
    <div className={styles.layout}>
      <div className={styles.mainContent}>
        <Loading loading={loading} />
        <BuildCardList
          builds={sortedBuilds}
          hideSuccessCards={config.hideSuccessCards}
          hideVersion={config.hideVersion}
        />
      </div>
      <div className={styles.sidebar}>
        <StatusPanel
          statusCounts={statusCounts}
          interval={config.interval}
          error={error}
        />
      </div>
    </div>
  )
}
