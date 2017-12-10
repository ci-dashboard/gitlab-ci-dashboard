var express = require('express')

// mocked jsons
var data = require('./data')
const {
  projects,
  branchs,
  builds,
  tags,
  pipelines,
  commits
} = data

const counter = {
  projects: 0,
  branchs: 0,
  builds: 0,
  tags: 0,
  pipelines: 0,
  commits: 0,
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
app.get('/api/:apiVersion/projects/:projectId', (req, res, next) => {
  counter.projects++
  const {
    projectId
  } = req.params
  const project = projects.filter((p) => {
    return p.path_with_namespace === projectId
  })
  if (project && project.length > 0) {
    res.json(project[0])
  } else {
    res.sendStatus(404)
  }
})

// https://(...)/api/v3/projects/5060/repository/branches/hackday
app.get('/api/:apiVersion/projects/:projectId/repository/branches/:projectName', (req, res, next) => {
  counter.branchs++
  const {
    projectId,
    projectName
  } = req.params
  const branch = branchs.filter((b) => {
    return (
      b.project_id === projectId &&
      b.name === projectName
    )
  })
  if (branch && branch.length > 0) {
    res.json(branch[0])
  } else {
    res.sendStatus(404)
  }
})

// https://(...)/api/v3/projects/5060/repository/branches/feature/branch
app.get('/api/:apiVersion/projects/:projectId/repository/branches/:branchName1/:branchName2', (req, res, next) => {
  counter.branchs++
  const {
    projectId,
    branchName1,
    branchName2
  } = req.params
  const branch = branchs.filter((b) => {
    return (
      b.project_id === projectId &&
      b.name === `${branchName1}/${branchName2}`
    )
  })
  if (branch && branch.length > 0) {
    res.json(branch[0])
  } else {
    res.sendStatus(404)
  }
})

// https://(...)/api/v3/projects/10/repository/tags
app.get('/api/:apiVersion/projects/:projectId/repository/tags', (req, res, next) => {
  counter.tags++
  const {
    projectId
  } = req.params
  const tag = tags.filter((t) => {
    return (
      t.project_id === projectId &&
      t.name != null
    )
  })
  res.json(tag)
})

const statePersistence = {
  running: 0,
  failed: 0,
  pending: 0,
  canceled: 0
}
const buildPersistence = {}
let lastBuildId = null
const getNextPipelineId = () => {
  const next = pipelines.reduce((prev, curr) => (
    prev['id'] > curr['id'] ? prev : curr
  ))
  return ~~next.id + 1
}
const updateLastPipelineID = (build) => {
  const newID = getNextPipelineId()
  const commit = commits.filter((c) => (
    ~~c.last_pipeline.id === ~~build.id &&
    ~~c.project_id === ~~build.project_id
  ))
  build.id = newID
  if (commit && commit.length > 0) {
    commit[0].last_pipeline.id = newID
  }
}
const incrementBuildId = (build) => {
  if (!buildPersistence[build.projectId]) {
    buildPersistence[build.projectId] = build
  }
  if (lastBuildId == null) {
    lastBuildId = buildPersistence[build.projectId].id
  }
  updateLastPipelineID(build)
}
const updateCommitMessage = ({ status, commit }) => {
  if (commit == null) {
    return
  }
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

// https://(...)/api/v3/projects/5060/repository/commits/20327e  8f4abcb170a42874c8623ab753126f2ebe/builds
app.get('/api/:apiVersion/projects/:projectId/repository/commits/:commitId/builds', (req, res, next) => {
  counter.builds++
  const {
    projectId,
    commitId
  } = req.params
  const build = builds.filter((b) => {
    return (
      b.project_id === projectId &&
      b.commit.id === commitId
    )
  })
  if (build && build.length > 0) {
    stateMachine(build[0], '14', 'running', 15)
    stateMachine(build[0], '13', 'failed', 3)
    stateMachine(build[0], '15', 'canceled', 5)
    stateMachine(build[0], '16', 'pending', 10)
    stateMachine(build[0], '12', 'running', 2)
    stateMachine(build[0], '17', 'canceled', 3)
    res.json(build)
  } else {
    res.sendStatus(404)
  }
})

// https://(...)/api/v4/projects/4746844/repository/commits/feature%2Fapi_v4
app.get('/api/:apiVersion/projects/:projectId/repository/commits/:lastPipelineRef', (req, res, next) => {
  counter.commits++
  const {
    projectId,
    lastPipelineRef
  } = req.params
  const commit = commits.filter((c) => {
    return (
      c.project_id === projectId &&
      c.last_pipeline.ref === lastPipelineRef
    )
  })
  if (commit && commit.length > 0) {
    res.json(commit[0])
  } else {
    res.sendStatus(404)
  }
})

// https://(...)/api/v4/projects/4746844/pipelines/14397366
// http://(...)/api/v4/projects/17/pipelines/14397366
app.get('/api/:apiVersion/projects/:projectId/pipelines/:lastPipelineId', (req, res, next) => {
  counter.pipelines++
  const {
    projectId,
    lastPipelineId
  } = req.params
  const pipeline = pipelines.filter((p) => {
    return (
      p.project_id === projectId &&
      ~~p.id === ~~lastPipelineId
    )
  })
  if (pipeline && pipeline.length > 0) {
    stateMachine(pipeline[0], '14', 'running', 15)
    stateMachine(pipeline[0], '13', 'failed', 3)
    stateMachine(pipeline[0], '15', 'canceled', 5)
    stateMachine(pipeline[0], '16', 'pending', 10)
    stateMachine(pipeline[0], '12', 'running', 2)
    stateMachine(pipeline[0], '17', 'canceled', 3)
    res.json(pipeline)
  } else {
    res.sendStatus(404)
  }
})

app.listen(8089, () => {
  console.info('Mocked gitlab listening on port 8089')
})
