const commander = require('commander')
const express = require('express')

commander.option('--port [port]', 'the port to run gitlab-ci-dashboard')

commander.parse(process.argv)

const port = commander.port || process.env.PORT || 8081
const app = express()
app.use('/', express.static(__dirname + '/'))

const server = app.listen(port, () => {
  console.log(`The dashboard is now available at http://localhost:${server.address().port}`)
})
