/*
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

commander.parse(process.argv)

const projectsFile = commander.projectsFile

if (projectsFile == null) {
  console.error('projectsFile is empty')
}

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
