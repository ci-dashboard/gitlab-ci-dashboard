import { Command } from 'commander'
import express from 'express'
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import open from 'open'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface ServerParams {
  gitlab?: string
  token?: string
  projects?: unknown[]
  gitlabciProtocol?: string
  hideSuccessCards?: boolean
  hideVersion?: boolean
  apiVersion?: string
  interval?: number
}

interface DashboardFileConfig {
  dashboard: {
    config: {
      gitlab?: string
      token?: string
      gitlabciProtocol?: string
      hideSuccessCards?: boolean
      hideVersion?: boolean
      apiVersion?: string
      interval?: number
    }
    projects?: unknown[]
  }
}

const program = new Command()
  .option('--port <port>', 'port to run gitlab-ci-dashboard', '8081')
  .option('--gitlab <host>', 'gitlab server host')
  .option('--token <token>', 'gitlab token')
  .option('--config <path>', 'config file with all configurations')
  .option('--apiVersion <version>', 'gitlab api version (default: 3)', '3')
  .option('--projectsFile <path>', 'url or path to file with list of projects')
  .option('--gitlabciProtocol <protocol>', 'protocol to access gitlab ci api (default: https)', 'https')
  .option('--hideSuccessCards', 'hide cards when they change to success status', false)
  .option('--hideVersion', 'hide version on cards', false)
  .option('--interval <seconds>', 'polling interval in seconds (default: 60)', '60')

program.parse()
const opts = program.opts<{
  port: string
  gitlab?: string
  token?: string
  config?: string
  apiVersion: string
  projectsFile?: string
  gitlabciProtocol: string
  hideSuccessCards: boolean
  hideVersion: boolean
  interval: string
}>()

const port = Number(process.env.PORT ?? opts.port)
const gitlab = process.env.GITLAB ?? opts.gitlab
const token = process.env.TOKEN ?? opts.token
const configFile = process.env.CONFIG ?? opts.config
const projectsFile = process.env.PROJECTS_FILE ?? opts.projectsFile
const gitlabciProtocol = process.env.GITLABCI_PROTOCOL ?? opts.gitlabciProtocol
const hideSuccessCards = process.env.HIDE_SUCCESS_CARDS === 'true' || opts.hideSuccessCards
const apiVersion = process.env.API_VERSION ?? opts.apiVersion
const hideVersion = process.env.HIDE_VERSION === 'true' || opts.hideVersion
const interval = Number(process.env.INTERVAL ?? opts.interval)

function startServer(params?: ServerParams) {
  const app = express()
  const distPath = resolve(__dirname, '../dist')

  // Serve only compiled output — never expose source files
  app.use(express.static(distPath))

  if (params) {
    app.get('/params', (_req, res) => {
      res.json(params)
    })
  }

  const server = app.listen(port, () => {
    const address = server.address()
    const actualPort = typeof address === 'object' && address ? address.port : port
    const standaloneFlag = params ? '?standalone=true' : ''
    const uri = `http://localhost:${actualPort}/${standaloneFlag}`
    console.log(`The dashboard is now available at ${uri}`)
    void open(uri)
  })
}

async function main() {
  if (configFile) {
    const data = await readFile(configFile, 'utf8')
    const json = JSON.parse(data) as DashboardFileConfig
    const { config, projects } = json.dashboard
    startServer({
      gitlab: config.gitlab,
      token: config.token,
      projects,
      gitlabciProtocol: config.gitlabciProtocol,
      hideSuccessCards: config.hideSuccessCards,
      apiVersion: config.apiVersion,
      hideVersion: config.hideVersion,
      interval: config.interval,
    })
  } else if (projectsFile) {
    const data = await readFile(projectsFile, 'utf8')
    const projects = JSON.parse(data) as unknown[]
    startServer({ gitlab, token, projects, gitlabciProtocol, hideSuccessCards, apiVersion, hideVersion, interval })
  } else {
    startServer()
  }
}

main().catch((err: unknown) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
