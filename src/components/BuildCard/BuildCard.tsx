import type { Build } from '@/types/pipeline'
import { PipelineStatus } from '@/types/pipeline'
import styles from './BuildCard.module.css'

interface BuildCardListProps {
  builds: Build[]
  hideSuccessCards: boolean
  hideVersion: boolean
}

function getCardClass(build: Build, hideSuccessCards: boolean): string {
  const classes = [styles.card, styles[build.status] ?? '']
  if (hideSuccessCards) {
    classes.push(
      build.status === PipelineStatus.Success ? styles.bounceOutTop : styles.bounceInTop,
    )
  }
  return classes.filter(Boolean).join(' ')
}

function isSuccess(build: Build): boolean {
  return build.status === PipelineStatus.Success
}

export function BuildCardList({ builds, hideSuccessCards, hideVersion }: BuildCardListProps) {
  return (
    <div id="gcim-builds" className={styles.buildSection}>
      <div className={styles.cardGrid}>
        {builds.map((build) => (
          <div key={build.id} className={getCardClass(build, hideSuccessCards)}>
            <div className={styles.content}>
              {build.description && <h3 className={styles.description}>{build.description}</h3>}
              <a
                className={styles.projectLink}
                href={build.linkToBranch}
                target="_blank"
                rel="noreferrer"
              >
                <h4 className={styles.projectName}>
                  {build.project} ({build.branch})
                </h4>
              </a>
              <div className={styles.namespace}>{build.namespaceName}</div>
              {!isSuccess(build) && (
                <div className={styles.commitMessage}>{build.commitMessage}</div>
              )}
              {!isSuccess(build) && <div className={styles.blame}>Blame {build.author}</div>}
              {build.tagName && !hideVersion && (
                <div className={styles.versionBadge}>
                  <span style={{ fontSize: isSuccess(build) ? '2.5em' : '1.5em' }}>
                    {build.tagName}
                  </span>
                </div>
              )}
            </div>
            <div className={styles.extra}>
              <span className={styles.buildId}>
                <a href={build.linkToBuild} target="_blank" rel="noreferrer">
                  #{build.id}
                </a>
              </span>
              <span className={styles.startedAt}>{build.startedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
