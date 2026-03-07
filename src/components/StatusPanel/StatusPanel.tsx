import type { StatusCount } from '@/types/pipeline'
import type { AppError } from '@/types/config'
import { ErrorMessage } from '@/components/ErrorMessage/ErrorMessage'
import gitlabLogo from '@/assets/gitlab-logo.svg'
import styles from './StatusPanel.module.css'

const STATUS_COLORS: Record<string, string> = {
  success: 'var(--color-success)',
  failed: 'var(--color-failed)',
  running: 'var(--color-running)',
  pending: 'var(--color-pending)',
  canceled: 'var(--color-canceled)',
}

const DISPLAYED_STATUSES: Array<{ status: string; label: string }> = [
  { status: 'success', label: 'SUCCESS' },
  { status: 'failed', label: 'FAILED' },
  { status: 'running', label: 'RUNNING' },
  { status: 'pending', label: 'PENDING' },
  { status: 'canceled', label: 'CANCELED' },
]

interface StatusPanelProps {
  statusCounts: StatusCount[]
  interval: number
  error: AppError | null
}

function getTotal(statusCounts: StatusCount[], status: string): number {
  return statusCounts.find((s) => (s.status as string) === status)?.total ?? 0
}

export function StatusPanel({ statusCounts, interval, error }: StatusPanelProps) {
  const spinnerStyle = { animation: `rota ${interval}s linear infinite` }
  const fillerStyle = { animation: `opa ${interval}s steps(1, end) infinite reverse` }
  const maskStyle = { animation: `opa ${interval}s steps(1, end) infinite` }

  return (
    <div id="gcim-painel" className={styles.panel}>
      <div className={styles.logoRow}>
        <img src={gitlabLogo} className={styles.logo} alt="GitLab" />
      </div>

      <div className={styles.errorRow}>
        <ErrorMessage error={error} />
      </div>

      {DISPLAYED_STATUSES.map(({ status, label }) => (
        <div key={status} className={styles.statusRow}>
          <span className={styles.statusCount}>{getTotal(statusCounts, status)}</span>
          <span className={styles.statusLabel} style={{ color: STATUS_COLORS[status] }}>
            {label}
          </span>
        </div>
      ))}

      <div className={styles.timerRow}>
        <div className={styles.wrapper}>
          <div className={`${styles.pie} ${styles.spinner}`} style={spinnerStyle} />
          <div className={`${styles.pie} ${styles.filler}`} style={fillerStyle} />
          <div className={styles.mask} style={maskStyle} />
        </div>
      </div>

      <div className={styles.footerRow}>
        <h5>
          <a
            href="https://github.com/emilianoeloi/gitlab-ci-dashboard"
            target="_blank"
            rel="noreferrer"
          >
            GitLab CI Dashboard
          </a>
        </h5>
      </div>
    </div>
  )
}
