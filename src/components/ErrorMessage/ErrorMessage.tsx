import type { AppError } from '@/types/config'
import styles from './ErrorMessage.module.css'

interface ErrorMessageProps {
  error: AppError | null
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error?.message) return null
  return (
    <div id="gcim-error" className={styles.container}>
      <p className={styles.message}>{error.message}</p>
    </div>
  )
}
