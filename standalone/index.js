const commander = require('commander')
const express = require('express')
const fs = require('fs')
var opn = require('opn')

commander.option('--port [port]', 'the port to run gitlab-ci-dashboard')
commander.option('--gitlab [gitlab server host]', 'your gitlab server host')
commander.option('--token [token]', 'gitlab token')
commander.option('--projectsFile [projectsFile]', 'a url to file that contains a list of projects you want to monitor, see below how to create it')
commander.option('--gitlabciProtocol [gitlabciProtocol]', '(optional): protocol to access gitlabci api. Default: https')
commander.option('--hideSuccessCards [hideSuccessCards]', '(optional): hide cards when change to success status. Default: true')
commander.option('--interval [interval]', '(optional): interval, in seconds, that monitor go to gitlab server take a new data. Default 60')

commander.parse(process.argv)

const port = commander.port || process.env.PORT || 8081
const gitlab = commander.gitlab || process.env.GITLAB
const token = commander.token || process.env.TOKEN
const projectsFile = commander.projectsFile || process.env.PROJECTS_FILE
const gitlabciProtocol = commander.gitlabciProtocol || process.env.GITLABCI_PROTOCOL || 'https'
const hideSuccessCards = commander.hideSuccessCards || process.env.HIDE_SUCCESS_CARDS || false
const interval = commander.interval || process.env.INTERVAL || 60

let projects = []
if (projectsFile != null) {
  fs.readFile(projectsFile, 'utf8', function (err, data) {
    if (err) {
      return console.log(err)
    }
    projects = JSON.parse(data)
    const params = {
      gitlab,
      token,
      projects,
      gitlabciProtocol,
      hideSuccessCards,
      interval
    }

    const app = express()
    app.use('/', express.static(__dirname + '/'))
    app.use('/params', (req, res) => {
      res.json(params)
    })

    const server = app.listen(port, () => {
      const uri = `http://localhost:${server.address().port}/?standalone=true`
      console.log(`The dashboard is now available at ${uri}`)
      opn(uri)
    })
  })
}
