/*
FROM
  http://gitlab-ci-monitor.example.com/?gitlab=gitlab.example.com&token=12345&projects=namespace/project1,namespace/project1/branch,namespace/project2
FROM
  {
    "nameWithNamespace": "native/gitlab-ci-monitor",
    "projectName": "gitlab-ci-monitor",
    "branch": "hackday"
  },
TO
  {
    "description": "",
    "namespace": "native",
    "project": "gitlab-ci-monitor",
    "branch": "hackday"
  },

*/
const commander = require('commander')
const fs = require('fs')
const beautify = require('json-beautify')

const getParameterByName = (name, url) => {
  if (!url) url = window.location.href
  name = name.replace(/[[]]/g, '\\$&')
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  var results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  const parameter = decodeURIComponent(results[2].replace(/\+/g, ' '))
  if (parameter === 'true') {
    return true
  }
  if (parameter === 'false') {
    return false
  }
  return parameter
}

const migratePattern = (projects) => {
  if (projects == null) {
    return null
  }
  const newPatternProjects = []
  projects.map((p) => {
    const nameWithNamespaceSplitted = p.nameWithNamespace.split('/')
    const newPattern = {
      description: '',
      namespace: nameWithNamespaceSplitted[0],
      project: nameWithNamespaceSplitted[1],
      branch: p.branch
    }
    newPatternProjects.push(newPattern)
  })
  return newPatternProjects
}

commander.option('--projectsFile [projectsFile]', 'a url to file that contains a list of projects you want to monitor')
commander.option('--querystring [querystring]', 'gitlab-ci-monitor querystring')

commander.parse(process.argv)

const projectsFile = commander.projectsFile
const querystring = commander.querystring

if (projectsFile != null) {
  let projects = []
  console.info('Migration:', 'Open Projects File')
  fs.readFile(projectsFile, 'utf8', function (err, data) {
    if (err) {
      return console.log(err)
    }
    projects = JSON.parse(data)

    // magrate pattern
    console.info('Migration:', 'Migrate Pattern')
    const newProjects = migratePattern(projects)

    // rename old file
    console.info('Migration', 'Rename old file')
    fs.rename(projectsFile, `${projectsFile}_4.x`, (err) => {
      if (err) throw err
      console.info('Migration', 'Rename old file', 'success')
      // create a new file
      console.info('Migration', 'Create new file')
      fs.writeFile(projectsFile, beautify(newProjects, null, 2, 8), (err) => {
        if (err) throw err
        console.info('Migration', 'Create new file', 'success')
      })
    })
  })
}

if (querystring != null) {
  let newProjects = []
  const projects = getParameterByName('projects', querystring)

  if (projects == null) {
    return
  }

  // create a new file
  console.info('Migration', 'Reading projects')
  const repositories = projects.split(',')
  for (const x in repositories) {
    try {
      const repos = repositories[x].split('/')
      const namespace = repos[0].trim()
      const project = repos[1].trim()
      let branch = 'master'
      if (repos.length > 2) {
        branch = repos[2].trim()
      }
      newProjects.push({
        description: '',
        namespace,
        project,
        branch
      })
    } catch (err) {
      console.log(err)
    }
  }
  // create a new file
  console.info('Migration', 'Create new file')
  fs.writeFile('projects.json', beautify(newProjects, null, 2, 8), (err) => {
    if (err) throw err
    console.info('Migration', 'Project "projects.json" was created', 'success')
  })
}
