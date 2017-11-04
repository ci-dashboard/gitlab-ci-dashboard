var projectTemplate = require('./projectTemplate.json')
var branchTemplate = require('./branchTemplate.json')
var buildTemplate = require('./buildTemplate.json')

var projectsData = require('./projectsData')

const projects = []
const branchs = []
const builds = []

const replaceNamespaceProject = (field, data) => {
  return field.replace('NAMESPACE_NAME', data.namespaceName)
  .replace('PROJECT_NAME', data.projectName)
}

const fillProject = (data) => {
  const p = Object.assign({}, projectTemplate)
  p.id = data.projectId
  p.name = data.projectName
  p.ssh_url_to_repo = data.sslUrl
  p.http_url_to_repo = data.httpUrl
  p.web_url = data.webUrl
  p.name_with_namespace = replaceNamespaceProject(p.name_with_namespace, data)
  p.path = data.projectName
  p.path_with_namespace = replaceNamespaceProject(p.path_with_namespace, data)

  p.namespace.name = data.namespaceName
  p.namespace.path = data.namespaceName
  p.namespace.avatar.url = data.namespaceAvatar

  return p
}

const fillBranch = (data) => {
  const b = Object.assign({}, branchTemplate)
  b.project_id = data.projectId
  b.name = data.branchName
  b.commit.id = data.commitId
  b.commit.message = data.commitMessage
  b.commit.parent_ids[0] = data.commitParentId
  b.commit.author_name = data.authorName
  b.commit.author_email = data.authorEmail
  b.commit.committer_name = data.authorName
  b.commit.committer_email = data.authorEmail

  return b
}

const fillBuild = (data) => {
  const b = Object.assign({}, buildTemplate)
  b.project_id = data.projectId
  b.ref = data.branchName
  b.user.name = data.authorName
  b.user.username = data.username
  b.commit.id = data.commitId
  b.commit.short_id = data.commitId.substring(0, 8)
  b.commit.title = data.commitMessage
  b.commit.message = data.commitMessage
  b.commit.author_name = data.authorName
  b.commit.author_email = data.authorEmail

  return b
}

projectsData.map((p) => {
  projects.push(fillProject(p))
  branchs.push(fillBranch(p))
  builds.push(fillBuild(p))
})

module.exports = {
  projects,
  branchs,
  builds
}
