# 📊 Dashboard do GitLab CI

[![npm](https://img.shields.io/npm/v/gitlab-ci-dashboard.svg?)](https://www.npmjs.com/package/gitlab-ci-dashboard) 
[![npm (tag)](https://img.shields.io/npm/v/gitlab-ci-dashboard/next.svg?)](https://github.com/emilianoeloi/gitlab-ci-dashboard/releases/tag/v6.4.5-alpha.1) 
[![npm](https://img.shields.io/npm/dw/gitlab-ci-dashboard.svg?)]() 
[![GitHub issues](https://img.shields.io/github/issues/emilianoeloi/gitlab-ci-dashboard.svg?)](https://github.com/emilianoeloi/gitlab-ci-dashboard/issues)  

![Node.js CI](https://github.com/emilianoeloi/confirmados/workflows/Node.js%20CI/badge.svg?)
[![codecov](https://codecov.io/gh/ci-dashboard/gitlab-ci-dashboard/branch/master/graph/badge.svg?token=hr3q4zgwIV&)](undefined)

[![GitHub license](https://img.shields.io/github/license/emilianoeloi/gitlab-ci-dashboard.svg?)](LICENSE)

Dashboard para monitorar builds e pipelines do [GitLab CI][gitlab-ci] para TV. Este é um fork do [gitlab-ci-monitor](https://github.com/globocom/gitlab-ci-monitor).

[gitlab-ci]: https://about.gitlab.com/gitlab-ci/

![Exemplo][example]

[example]: gitlab-ci-dashboard-example.png

## Suporte ao GitLab

 - GitLab: 8.30.4, e 10.1.4
 - GitLab [API](https://docs.gitlab.com/ee/api/): V3 e V4

## Uso

Este projeto pode ser executado completamente no navegador com poucos parâmetros na string de consulta ou pode ser executado em modo autônomo usando linha de comando. Você pode usar parâmetros da string de consulta ou todos os parâmetros no arquivo de configuração em JSON.

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
        "description": "Renderizador React Native para o modelo draft.js",
        "namespace": "globocom",
        "project": "react-native-draftjs-render",
        "branch": "master"
      }
    ]
  }
}
```

Exemplo autônomo:
```bash
$ gitlab-ci-dashboard --gitlab gitlab.example.com --token 2345 --projectsFile ./example.json

$ gitlab-ci-dashboard --config ./config.json
```

Exemplo de servidor hospedado:
```bash
http://gitlab-ci-dashboard.example.com/?gitlab=gitlab.example.com&token=12345&projectsFile=http://gitlab-ci-dashboard.example.com/example.json

http://gitlab-ci-dashboard.example.com/?config=http://gitlab-ci-dashboard.example.com/config.json
``` 

## Standalone

```bash
$ npm install -g gitlab-ci-dashboard

$ gitlab-ci-dashboard --gitlab gitlab.example.com --token 12345 --projectsFile ./file.json

$ gitlab-ci-dashboard --config ./config.json
```

## Servidor hospedado

```bash
$ yarn install

$ yarn build
```

## Scripts disponíveis

```bash
$ yarn install
$ yarn dev
$ yarn build
$ yarn server
$ yarn gitlab-mocked-server
$ yarn build --report
$ yarn unit
$ yarn e2e
$ yarn test
```

## Como desenvolver

```bash
$ yarn dev

$ yarn gitlab-mocked-server 

http://localhost:8080/?gitlab=localhost:8089&token=_&projectsFile=http://localhost:8080/static/file.json&gitlabciProtocol=http&interval=5
```

## Migração do projectsFile de versões anteriores à 5.x

```bash
$ gitlab-ci-dashboard-migration --projectsFile example.json
```

## Criação do projectsFile a partir do projeto base gitlab-ci-monitor

```bash
$ gitlab-ci-dashboard-migration --querystring http://gitlab-ci-monitor.example.com/?gitlab=gitlab.example.com&token=12345&projects=namespace/project1,namespace/project1/branch,namespace/project2
```

## Usando

Para uma explicação detalhada sobre como as coisas funcionam, confira o [guia](http://vuejs-templates.github.io/webpack/) e a [documentação do vue-loader](http://vuejs.github.io/vue-loader).

***Tests*** Como escrever um teste unitário para Vue.js
https://scotch.io/tutorials/how-to-write-a-unit-test-for-vuejs

***Animista:*** ANIMISTA É UM LUGAR ONDE VOCÊ PODE BRINCAR COM UMA COLEÇÃO DE ANIMAÇÕES CSS PRÉ-FEITAS, AJUSTÁ-LAS E OBTER APENAS AS QUE VOCÊ REALMENTE VAI USAR.
[Play](http://animista.net/about)

***Semantic UI:*** Interface do usuário é a linguagem da web [Semantic UI](https://semantic-ui.com/)

## Outros projetos legais

- [gitlab-ci-monitor](https://github.com/globocom/gitlab-ci-monitor)
- [gitlab-ci-viewer](https://github.com/mikaelkaron/gitlab-ci-viewer)
- [gitlab-monitor](https://github.com/timoschwarzer/gitlab-monitor)
