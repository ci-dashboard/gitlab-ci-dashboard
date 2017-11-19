var projectTemplate = require('./projectTemplate.json')
var branchTemplate = require('./branchTemplate.json')
var buildTemplate = require('./buildTemplate.json')
var tagTemplate = require('./tagTemplate.json')

var projectsData = require('./projectsData')

const projects = []
const branchs = []
const builds = []
const tags = []

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

  const namespace = Object.assign({}, p.namespace)
  namespace.name = data.namespaceName
  namespace.path = data.namespaceName
  namespace.avatar.url = data.namespaceAvatar
  p.namespace = namespace

  return p
}

const fillBranch = (data) => {
  const b = Object.assign({}, branchTemplate)
  b.project_id = data.projectId
  b.name = data.branchName

  const commit = Object.assign({}, b.commit)
  commit.id = data.commitId
  commit.message = data.commitMessage
  commit.parent_ids[0] = data.commitParentId
  commit.author_name = data.authorName
  commit.author_email = data.authorEmail
  commit.committer_name = data.authorName
  commit.committer_email = data.authorEmail
  b.commit = commit

  return b
}

const fillBuild = (data) => {
  const b = Object.assign({}, buildTemplate)
  b.project_id = data.projectId
  b.ref = data.branchName

  const user = Object.assign({}, b.user)
  user.name = data.authorName
  user.username = data.username
  b.user = user

  const commit = Object.assign({}, b.commit)
  commit.id = data.commitId
  commit.short_id = data.commitId.substring(0, 8)
  commit.title = data.commitMessage
  commit.message = data.commitMessage
  commit.author_name = data.authorName
  commit.author_email = data.authorEmail
  b.commit = commit

  return b
}

const fillTag = (data) => {
  const t = Object.assign({}, tagTemplate)
  t.project_id = data.projectId
  t.name = data.tagName

  return t
}

projectsData.map((p) => {
  projects.push(fillProject(p))
  branchs.push(fillBranch(p))
  builds.push(fillBuild(p))
  tags.push(fillTag(p))
})

module.exports = {
  projects,
  branchs,
  builds,
  tags
}
