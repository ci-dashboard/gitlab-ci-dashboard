var express = require('express')
var cors = require('cors')

// mocked jsons
var projects = require('./projects.json')
var branchs = require('./branch.json')
var builds = require('./builds.json')

var corsOptions = {
  origin: 'http://localhost:8080',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const app = express()
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.get('/', (req, res, next) => {
  res.send('Mocked gitlab')
})

// https://(...)/api/v3/projects/native%2Fgitlab-ci-monitor
app.get('/api/v3/projects/:param1', (req, res, next) => {
  res.json(projects)
})

// https://(...)/api/v3/projects/5060/repository/branches/hackday
app.get('/api/v3/projects/:param1/repository/branches/:param2', (req, res, next) => {
  const {
    param1,
    param2
  } = req.params
  res.json(branchs)
})

// https://(...)/api/v3/projects/5060/repository/commits/20327e8f4abcb170a42874c8623ab753126f2ebe/builds
app.get('/api/v3/projects/:param1/repository/commits/:param2/builds', (req, res, next) => {
  const {
    param1,
    param2
  } = req.params
  res.json(builds)
})

app.listen(8089, () => {
  console.info('Mocked gitlab listening on port 8089')
})