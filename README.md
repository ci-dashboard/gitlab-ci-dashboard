# GitLab CI Monitor

A simple dashboard for monitoring [GitLab CI][gitlab-ci] builds.

[gitlab-ci]: https://about.gitlab.com/gitlab-ci/


![Example][example]

[example]: gitlab-ci-monitor-example-3.1.gif


## Usage

This project runs completely in the browser. It expects a few parameters
in the query string:

- **gitlab**: your gitlab server address
- **token**: your gitlab token
- **projectsFile**: a url to file that contains a list of projects you want to monitor, see below how to create it
- **gitlabciProtocol** (optional): protocol to access gitlabci api. Default: https
- **hideSuccessCards** (optional): hide cards when change to success status. Default: true

### json projectsFile pattern

```
[
  {
    "nameWithNamespace": "native/gitlab-ci-monitor",
    "projectName": "gitlab-ci-monitor",
    "branch": "hackday"
  },
  (...)
]
```

Example:

```
http://gitlab-ci-monitor.example.com/?gitlab=gitlab.example.com&token=12345&projectsFile=http://gitlab-ci-monitor.example.com/file.json
```

With these parameters, it will try to fetch the list of projects that this
token has access. Then, it will filter the list by the **projects** parameter
and show only the ones that have builds (i.e., that have GitLab CI enabled).
Finally, it will show the status from the most recent build in **master**
or the branch you have specified.

## Build Setup

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
http://localhost:8080/?gitlab=localhost:8089&token=_&projectsFile=http://localhost:8080/static/file.json&gitlabciProtocol=http

``` 

## Using 

***VueJS:*** For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

***Tests*** How to Write A Unit Test for Vue.js https://github.com/emilianoeloi/gitlab-ci-monitor

***Animista:*** ANIMISTA IS A PLACE WHERE YOU CAN PLAY WITH A COLLECTION OF PRE-MADE CSS ANIMATIONS, TWEAK THEM AND GET ONLY THOSE YOU WILL ACTUALLY USE.
[Play](http://animista.net/about)

## License

GitLab CI Monitor is licensed under the [MIT license](LICENSE).
