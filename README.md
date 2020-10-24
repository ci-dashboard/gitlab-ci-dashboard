# GitLab CI Dashboard

[![npm](https://img.shields.io/npm/v/gitlab-ci-dashboard.svg?style=for-the-badge)](https://www.npmjs.com/package/gitlab-ci-dashboard) [![npm (tag)](https://img.shields.io/npm/v/gitlab-ci-dashboard/next.svg?style=for-the-badge)](https://github.com/emilianoeloi/gitlab-ci-dashboard/releases/tag/v6.4.5-alpha.1) [![npm](https://img.shields.io/npm/dw/gitlab-ci-dashboard.svg?style=for-the-badge)]() [![GitHub issues](https://img.shields.io/github/issues/emilianoeloi/gitlab-ci-dashboard.svg?style=for-the-badge)](https://github.com/emilianoeloi/gitlab-ci-dashboard/issues)  

[![Travis](https://img.shields.io/travis/emilianoeloi/gitlab-ci-dashboard.svg?style=for-the-badge)](https://travis-ci.org/emilianoeloi/gitlab-ci-dashboard)
[![Codecov](https://img.shields.io/codecov/c/github/emilianoeloi/gitlab-ci-dashboard.svg?style=for-the-badge)](https://codecov.io/gh/emilianoeloi/gitlab-ci-dashboard)

[![GitHub license](https://img.shields.io/github/license/emilianoeloi/gitlab-ci-dashboard.svg?style=for-the-badge)](LICENSE)

Dashboard for monitoring [GitLab CI][gitlab-ci] builds and pipelines for TV. This is a fork from [gitlab-ci-monitor](https://github.com/globocom/gitlab-ci-monitor).


[gitlab-ci]: https://about.gitlab.com/gitlab-ci/


![Example][example]

[example]: gitlab-ci-dashboard-example.png

## Gitlab support

 - Gitlab: 8.30.4, and 10.1.4
 - Gitlab [API](https://docs.gitlab.com/ee/api/): V3 and V4

## Usage

This project can runs completely in the browser with few parameters on querystring or run in standalone mode using command-line, you can use querystring parameters or using all parameters on json config file.

### Parameters

- **config**: path or url to config file

- **gitlab**: your gitlab server address
- **token**: your gitlab token
- **projectsFile/projects**: 
  - **using projectsFile**: url to file that contains a list of projects you want to monitor, see below how to create it
  - **using projects**: list or project you want to moniro, see below how to create it
- **gitlabciProtocol** (optional): protocol to access gitlabci api. Default: https
- **hideSuccessCards** (optional): hide cards when change to success status. Default: false
- **hideVersion** (optional): hide version of cards. Default: false
- **interval** (optional): interval, in seconds, that monitor go to gitlab server take a new data. Default 60
- **apiVersion** (optional): Gitlab API version. Default: 3

### json config sample

```json
{
  "dashboard": {
    "config": {
      "gitlab": "gitlab.example.com",
      "token": "123456",
      "gitlabciProtocol": "https",
      "hideSuccessCards": false,
      "hideVersion": false,
      "interval": 60,
      "apiVersion": 3
    },
    "projects": [
      {
        "description": "React Native render for draft.js model",
        "namespace": "globocom",
        "project": "react-native-draftjs-render",
        "branch": "master"
      }
    ]
  }
}
```

With these parameters, it will try to fetch the list of projects that this
token has access. Then, it will filter the list by the **projects** parameter
and show only the ones that have builds (i.e., that have GitLab CI enabled).
Finally, it will show the status from the most recent build in **master**
or the branch you have specified.

Standalone Example:
```bash
gitlab-ci-dashboard --gitlab gitlab.example.com --token 2345 --projectsFile ./example.json

## or if you using json config file, just:

gitlab-ci-dashboard --config ./config.json

```

Server hosted Example:

```bash
http://gitlab-ci-dashboard.example.com/?gitlab=gitlab.example.com&token=12345&projectsFile=http://gitlab-ci-dashboard.example.com/example.json

## or if you using json config file, just:

http://gitlab-ci-dashboard.example.com/?config=http://gitlab-ci-dashboard.example.com/config.json
```

## Standalone

```bash
# install globally
npm install -g gitlab-ci-dashboard

# run standalone http server
gitlab-ci-dashboard --gitlab gitlab.example.com --token 12345 --projectsFile ./file.json

## or if you using json config file, just:
gitlab-ci-dashboard --config ./config.json

# access https://localhost:8081/?standalone=true on browser

```

## Server hosted

```bash
# install dependencies
yarn install

# build for production with minification
yarn build

# Copy content of dist folder to your server
```

## Available scripts

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
yarn dev

# build for production with minification
yarn build

# run http server to access the monitor
yarn server

# run http server to access mocked gitlab-ci api
yarn gitlab-mocked-server

# build for production and view the bundle analyzer report
yarn build --report

# run unit tests
yarn unit

# run e2e tests
yarn e2e

# run all tests
yarn test
```

## How to develop

```bash
# run dev
yarn dev

# run gitlab-ci mock server
yarn gitlab-mocked-server

# open on browser
http://localhost:8080/?gitlab=localhost:8089&token=_&projectsFile=http://localhost:8080/static/file.json&gitlabciProtocol=http&interval=5

``` 

## projectsFile migration from versions earlier to 5.x

If your dashboard is using the projectsFile pattern below:

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
gitlab-ci-dashboard-migration --projectsFile example.json
```


## projectsFile creation from gitlab-ci-monitor base project

Take your url dashboard

```html
http://gitlab-ci-monitor.example.com/?gitlab=gitlab.example.com&token=12345&projects=namespace/project1,namespace/project1/branch,namespace/project2
```

Run migration command:

```bash
# migration command
gitlab-ci-dashboard-migration --querystring http://gitlab-ci-monitor.example.com/?gitlab=gitlab.example.com&token=12345&projects=namespace/project1,namespace/project1/branch,namespace/project2
```

The ***projects.json*** would be created

## Using 

***VueJS:*** For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

***Tests*** How to Write A Unit Test for Vue.js 
https://scotch.io/tutorials/how-to-write-a-unit-test-for-vuejs

***Animista:*** ANIMISTA IS A PLACE WHERE YOU CAN PLAY WITH A COLLECTION OF PRE-MADE CSS ANIMATIONS, TWEAK THEM AND GET ONLY THOSE YOU WILL ACTUALLY USE.
[Play](http://animista.net/about)

***Semantic UI:*** User Interface is the language of the web [Semantic UI](https://semantic-ui.com/)

## Another Dashboards

[gitlab-ci-monitor](https://github.com/globocom/gitlab-ci-monitor)

[Gitlab CI Monitor](https://github.com/tobiwild/gitlab-ci-monitor)

## License

GitLab CI Dashboard is licensed under the [MIT license](LICENSE).

[![NPM](https://nodei.co/npm/gitlab-ci-dashboard.png)](https://npmjs.org/package/gitlab-ci-dashboard)
