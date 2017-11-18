# GitLab CI Dashboard

[![NPM](https://nodei.co/npm/gitlab-ci-dashboard.png)](https://npmjs.org/package/gitlab-ci-dashboard)

[![Build Status](https://travis-ci.org/emilianoeloi/gitlab-ci-dashboard.svg?branch=v3.7.0)](https://travis-ci.org/emilianoeloi/gitlab-ci-dashboard) [![codecov](https://codecov.io/gh/emilianoeloi/gitlab-ci-dashboard/branch/master/graph/badge.svg)](https://codecov.io/gh/emilianoeloi/gitlab-ci-dashboard)

Dashboard for monitoring [GitLab CI][gitlab-ci] builds. This project is based on [gitlab-ci-monitor](https://github.com/globocom/gitlab-ci-monitor) by globo.com.


[gitlab-ci]: https://about.gitlab.com/gitlab-ci/


![Example][example]

[example]: gitlab-ci-dashboard-example.png


## Usage

This project runs completely in the browser. It expects a few parameters
in the query string:

- **gitlab**: your gitlab server address
- **token**: your gitlab token
- **projectsFile**: a url to file that contains a list of projects you want to monitor, see below how to create it
- **gitlabciProtocol** (optional): protocol to access gitlabci api. Default: https
- **hideSuccessCards** (optional): hide cards when change to success status. Default: true
- **interval** (optional): interval, in seconds, that monitor go to gitlab server take a new data. Default 60

### json projectsFile pattern

```
[
  {
    "description": "React Native render for draft.js model",
    "namespace": "globocom",
    "project": "react-native-draftjs-render",
    "branch": "master"
  }
  (...)
]
```

With these parameters, it will try to fetch the list of projects that this
token has access. Then, it will filter the list by the **projects** parameter
and show only the ones that have builds (i.e., that have GitLab CI enabled).
Finally, it will show the status from the most recent build in **master**
or the branch you have specified.

Standalone Example:
```bash
gitlab-ci-dashboard --gitlab gitlab.example.com --token 2345 --projectFiles ./example.json 
```

Server hosted Example:

```
http://gitlab-ci-dashboard.example.com/?gitlab=gitlab.example.com&token=12345&projectsFile=http://gitlab-ci-dashboard.example.com/example.json
```

## Standalone

``` bash
# install globally
npm install -g gitlab-ci-dashboard

# run standalone http server
gitlab-ci-dashboard --gitlab gitlab.example.com --token 12345 --projectFiles ./file.json 

# access https://localhost:8081/?standalone=true on browser

```

## Server hosted

``` bash
# install dependencies
npm install

# build for production with minification
npm run build

# Copy content of dist folder to your server
```

## Available scripts

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# run http server to access the monitor
npm run server

# run http server to access mocked gitlab-ci api
npm run gitlab-mocked-server

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

## How to develop

```bash
# run dev
npm run dev

# run gitlab-ci mock server
npm run gitlab-mocked-server

# open on browser
http://localhost:8080/?gitlab=localhost:8089&token=_&projectsFile=http://localhost:8080/static/file.json&gitlabciProtocol=http&interval=5

``` 

## projectsFile migration from earlier to 5.x

If dashboard using the projectsFile pattern below:

```json
{
  "nameWithNamespace": "native/gitlab-ci-monitor",
  "projectName": "gitlab-ci-monitor",
  "branch": "hackday"
},
```

Run migration command:

```bash
# migration command
gitlab-ci-dashboard-migration --projectsFile yourfile.json
```

## Using 

***VueJS:*** For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

***Tests*** How to Write A Unit Test for Vue.js 
https://scotch.io/tutorials/how-to-write-a-unit-test-for-vuejs

***Animista:*** ANIMISTA IS A PLACE WHERE YOU CAN PLAY WITH A COLLECTION OF PRE-MADE CSS ANIMATIONS, TWEAK THEM AND GET ONLY THOSE YOU WILL ACTUALLY USE.
[Play](http://animista.net/about)

***Semantic UI:*** User Interface is the language of the web [Semantic UI](https://semantic-ui.com/)
## License

GitLab CI Dashboard is licensed under the [MIT license](LICENSE).
