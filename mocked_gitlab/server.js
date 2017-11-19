var express = require('express')

// mocked jsons
var data = require('./data')
const {
  projects,
  branchs,
  builds,
  tags
} = data

const counter = {
  projects: 0,
  branchs: 0,
  builds: 0,
  tags: 0,
  running: 0,
  failed: 0,
  pending: 0,
  canceled: 0
}

const statusList = [
  'canceled',
  'failed',
  'pending',
  'running',
  'success'
]

const app = express()
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, PRIVATE-TOKEN')
  next()
})

app.get('/', (req, res, next) => {
  res.send('<h1>Mocked gitlab</h1><pre>' + JSON.stringify(counter) + '</pre>')
})

// https://(...)/api/v3/projects/native%2Fgitlab-ci-monitor
app.get('/api/v3/projects/:param1', (req, res, next) => {
  counter.projects++
  const {
    param1
  } = req.params
  const project = projects.filter((p) => {
    return p.path_with_namespace === param1
  })
  if (project && project.length > 0) {
    res.json(project[0])
  } else {
    res.sendStatus(404)
  }
})

// https://(...)/api/v3/projects/5060/repository/branches/hackday
app.get('/api/v3/projects/:param1/repository/branches/:param2', (req, res, next) => {
  counter.branchs++
  const {
    param1,
    param2
  } = req.params
  const branch = branchs.filter((b) => {
    return (
      b.project_id === param1 &&
      b.name === param2
    )
  })
  if (branch && branch.length > 0) {
    res.json(branch[0])
  } else {
    res.sendStatus(404)
  }
})

// https://(...)/api/v3/projects/5060/repository/branches/feature/branch
app.get('/api/v3/projects/:param1/repository/branches/:param2/:param3', (req, res, next) => {
  counter.branchs++
  const {
    param1,
    param2,
    param3
  } = req.params
  const branch = branchs.filter((b) => {
    return (
      b.project_id === param1 &&
      b.name === `${param2}/${param3}`
    )
  })
  if (branch && branch.length > 0) {
    res.json(branch[0])
  } else {
    res.sendStatus(404)
  }
})

// https://(...)/api/v3/projects/10/repository/tags
app.get('/api/v3/projects/:param1/repository/tags', (req, res, next) => {
  counter.tags++
  const {
    param1
  } = req.params
  const tag = tags.filter((t) => {
    return (
      t.project_id === param1
    )
  })
  if (tag && tag.length > 0) {
    res.json(tag)
  } else {
    res.sendStatus(404)
  }
})

const statePersistence = {
  running: 0,
  failed: 0,
  pending: 0,
  canceled: 0
}
const buildPersistence = {}
let lastBuildId = null
const incrementBuildId = (build) => {
  if (!buildPersistence[build.projectId]) {
    buildPersistence[build.projectId] = build
  }
  if (lastBuildId == null) {
    lastBuildId = buildPersistence[build.projectId].id
  }
  build.id = lastBuildId++
}
const updateCommitMessage = ({ status, commit }) => {
  commit.message = commit.message
    .replace('success', '')
    .replace('running', '')
    .replace('pending', '')
    .replace('canceled', '')
    .replace('failed', '')
  commit.message = `${status} ${commit.message}`
}
const stateMachine = (build, projectId, status, div) => {
  if (build.project_id === projectId) {
    counter[status]++
    if (counter[status] % div === 0) {
      statePersistence[status] = statusList.indexOf(status)
      build.status = status
    } else {
      const index = statePersistence[status]++
      const statusListSize = statusList.length
      build.status = statusList[index >= statusListSize - 1 ? statusListSize - 1 : index]
    }
    if (status !== 'success') {
      const d = new Date()
      build.started_at = d.toISOString()
      updateCommitMessage(build)
      incrementBuildId(build)
    }
  }
}

// https://(...)/api/v3/projects/5060/repository/commits/20327e8f4abcb170a42874c8623ab753126f2ebe/builds
app.get('/api/v3/projects/:param1/repository/commits/:param2/builds', (req, res, next) => {
  counter.builds++
  const {
    param1,
    param2
  } = req.params
  const build = builds.filter((b) => {
    return (
      b.project_id === param1 &&
      b.commit.id === param2
    )
  })
  if (build && build.length > 0) {
    stateMachine(build[0], '14', 'running', 15)
    stateMachine(build[0], '13', 'failed', 3)
    stateMachine(build[0], '15', 'canceled', 5)
    stateMachine(build[0], '16', 'pending', 10)
    stateMachine(build[0], '12', 'pending', 2)
    res.json(build)
  } else {
    res.sendStatus(404)
  }
})

app.listen(8089, () => {
  console.info('Mocked gitlab listening on port 8089')
})
