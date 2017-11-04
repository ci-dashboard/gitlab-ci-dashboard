var express = require('express')

// mocked jsons
var projects = require('./projects.json')
var branchs = require('./branchs.json')
var builds = require('./builds.json')

const app = express()
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, PRIVATE-TOKEN')
  next()
})

app.get('/', (req, res, next) => {
  res.send('Mocked gitlab')
})

// https://(...)/api/v3/projects/native%2Fgitlab-ci-monitor
app.get('/api/v3/projects/:param1', (req, res, next) => {
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

// https://(...)/api/v3/projects/5060/repository/commits/20327e8f4abcb170a42874c8623ab753126f2ebe/builds
app.get('/api/v3/projects/:param1/repository/commits/:param2/builds', (req, res, next) => {
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
    res.json(build)
  } else {
    res.sendStatus(404)
  }
})

app.listen(8089, () => {
  console.info('Mocked gitlab listening on port 8089')
})