import styles from './InvalidConfig.module.css'

interface InvalidConfigProps {
  show: boolean
}

export function InvalidConfig({ show }: InvalidConfigProps) {
  if (!show) return null
  return (
    <div id="gcim-invalid-config" className={styles.container}>
      <div className={styles.header}>Invalid Configuration</div>
      <div className={styles.body}>
        <p>
          Make sure all configs are set. The following properties must be defined in the URL.
        </p>
        <p>
          Check{' '}
          <a
            href="https://github.com/emilianoeloi/gitlab-ci-dashboard/blob/master/README.md"
            target="_blank"
            rel="noreferrer"
          >
            README
          </a>{' '}
          for more configuration options.
        </p>
        <ul>
          <li>gitlab</li>
          <li>token</li>
          <li>projectsFile</li>
          <li>gitlabciProtocol (optional)</li>
          <li>hideSuccessCards (optional)</li>
          <li>hideVersion (optional)</li>
          <li>interval (optional)</li>
          <li>apiVersion (optional)</li>
        </ul>
        <p>
          <strong>projectsFile</strong> json pattern:
        </p>
        <pre className={styles.pre}>{`[
  {
    "description": "My project",
    "namespace": "group",
    "project": "my-project",
    "branch": "main"
  }
]`}</pre>
      </div>
      <div className={styles.example}>
        <p>
          Ex:{' '}
          <code>
            ?gitlab=gitlab.com&token=TOKEN&projectsFile=https://example.com/gitlab.json
          </code>
        </p>
      </div>
    </div>
  )
}
