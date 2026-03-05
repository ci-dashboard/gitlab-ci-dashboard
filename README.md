# 📊 GitLab CI Dashboard

[![npm](https://img.shields.io/npm/v/gitlab-ci-dashboard.svg)](https://www.npmjs.com/package/gitlab-ci-dashboard) [![npm downloads](https://img.shields.io/npm/dw/gitlab-ci-dashboard.svg)](https://www.npmjs.com/package/gitlab-ci-dashboard) [![GitHub issues](https://img.shields.io/github/issues/emilianoeloi/gitlab-ci-dashboard.svg)](https://github.com/emilianoeloi/gitlab-ci-dashboard/issues) [![GitHub license](https://img.shields.io/github/license/emilianoeloi/gitlab-ci-dashboard.svg)](LICENSE) [![codecov](https://codecov.io/gh/ci-dashboard/gitlab-ci-dashboard/branch/master/graph/badge.svg)](https://codecov.io/gh/ci-dashboard/gitlab-ci-dashboard)

Dashboard for monitoring [GitLab CI](https://about.gitlab.com/gitlab-ci/) builds and pipelines, designed for TV displays. Forked from [gitlab-ci-monitor](https://github.com/globocom/gitlab-ci-monitor).

![Example](gitlab-ci-dashboard-example.png)

## Requirements

- **Node.js** >= 18.12.0
- **GitLab** 8.30.4 or 10.1.4+
- **GitLab API** V3 or V4

## Usage

The dashboard can run in two modes:

| Mode | How |
|---|---|
| **Browser** | Pass parameters via querystring |
| **Standalone** | Run the CLI server, pass parameters via flags or JSON config |

### Parameters

| Parameter | Required | Default | Description |
|---|---|---|---|
| `gitlab` | ✅ | — | GitLab server hostname |
| `token` | ✅ | — | GitLab personal access token |
| `projectsFile` / `projects` | ✅ | — | URL to projects file or inline project list |
| `config` | — | — | Path/URL to a JSON config file (replaces all other params) |
| `gitlabciProtocol` | — | `https` | Protocol for GitLab API access |
| `apiVersion` | — | `3` | GitLab API version (`3` or `4`) |
| `hideSuccessCards` | — | `false` | Hide cards when status changes to success |
| `hideVersion` | — | `false` | Hide version tag on cards |
| `interval` | — | `60` | Polling interval in seconds |

> ⚠️ **Security:** In standalone mode, the `/params` endpoint exposes your GitLab token unauthenticated. Host this application on a private/local network only.

### JSON config file

```json
{
  "dashboard": {
    "config": {
      "gitlab": "gitlab.example.com",
      "token": "YOUR_TOKEN",
      "gitlabciProtocol": "https",
      "apiVersion": 3,
      "hideSuccessCards": false,
      "hideVersion": false,
      "interval": 60
    },
    "projects": [
      {
        "description": "My project",
        "namespace": "my-group",
        "project": "my-repo",
        "branch": "master"
      }
    ]
  }
}
```

## Standalone (CLI)

```bash
# Install globally
npm install -g gitlab-ci-dashboard

# Run with flags
gitlab-ci-dashboard --gitlab gitlab.example.com --token YOUR_TOKEN --projectsFile ./projects.json

# Or with a config file
gitlab-ci-dashboard --config ./config.json

# Open in browser
open http://localhost:8081/?standalone=true
```

## Browser (server-hosted)

```bash
# Build
npm install
npm run build
# Serve the dist/ folder with any static HTTP server

# Access via querystring
http://your-server/?gitlab=gitlab.example.com&token=YOUR_TOKEN&projectsFile=http://your-server/projects.json

# Or via config file
http://your-server/?config=http://your-server/config.json
```

## Development

```bash
# Install dependencies
npm install

# Dev server with hot reload (http://localhost:8080)
npm run dev

# Run mock GitLab API server (http://localhost:8089)
npm run gitlab-mocked-server

# Open dev dashboard with mock data
open "http://localhost:8080/?gitlab=localhost:8089&token=_&projectsFile=http://localhost:8080/static/file.json&gitlabciProtocol=http&interval=5"
```

## Available scripts

```bash
npm run dev          # Dev server with HMR at localhost:8080
npm run build        # Production build → dist/
npm run test         # Run unit tests with coverage
npm run lint         # ESLint (src + tests)
npm run server       # Serve dist/ via http-server
npm run gitlab-mocked-server  # Run mock GitLab API
npm run build -- --report     # Build + bundle analyzer
```

## Migration

### From v5.x projectsFile format

```bash
gitlab-ci-dashboard-migration --projectsFile example.json
```

### From gitlab-ci-monitor querystring

```bash
gitlab-ci-dashboard-migration --querystring "http://old-monitor/?gitlab=gitlab.example.com&token=12345&projects=ns/project1,ns/project2"
# Generates projects.json
```

## Tech stack

- [Vue 2](https://v2.vuejs.org/) — UI framework
- [Webpack 5](https://webpack.js.org/) — bundler
- [Babel 7](https://babeljs.io/) — transpilation
- [Jest 29](https://jestjs.io/) — unit tests
- [Semantic UI](https://semantic-ui.com/) — UI components (CDN)

## License

MIT — see [LICENSE](LICENSE).

[![NPM](https://nodei.co/npm/gitlab-ci-dashboard.png)](https://npmjs.org/package/gitlab-ci-dashboard)
