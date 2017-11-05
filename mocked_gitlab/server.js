var express = require('express')

// mocked jsons
var data = require('./data')
const {
  projects,
  branchs,
  builds
} = data

const counter = {
  projects: 0,
  branchs: 0,
  builds: 0,
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

const statePersistence = {
  running: 0,
  failed: 0,
  pending: 0,
  canceled: 0
}
const stateMachine = (build, projectId, status, div) => {
  if (build.project_id === projectId) {
    counter[status]++
    if (counter[status] % div === 0) {
      statePersistence[status] = statusList.indexOf(status)
      build.status = status
    } else {
      const index = statePersistence[status]++
      build.status = statusList[index >= 4 ? 4 : index]
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
    stateMachine(build[0], '8', 'running', 15)
    stateMachine(build[0], '3', 'failed', 3)
    stateMachine(build[0], '10', 'canceled', 5)
    stateMachine(build[0], '1', 'pending', 10)
    res.json(build)
  } else {
    res.sendStatus(404)
  }
})

app.listen(8089, () => {
  console.info('Mocked gitlab listening on port 8089')
})