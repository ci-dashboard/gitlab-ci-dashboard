<template>
  <div v-show="onInvalid" class="row" id="gcim-invalid-config">
    <div class="eight wide column centered ">
      <div class="ui attached message">
        <div class="header">{{ headerText }}</div>
      </div>
      <div class="ui attached fluid segment">
        <p>
          Make sure all configs are set.
          The following properties must be defined in the URL.
        </p>
        <p>
          Check <a href="https://github.com/emilianoeloi/gitlab-ci-dashboard/blob/master/README.md">READ ME</a> for more configuration options.
        </p>
        <ul>
          <li>gitlab</li>
          <li>token</li>
          <li>projectsFile</li>
          <li>gitlabciProtocol (optional)</li>
          <li>hideSuccessCards (optional)</li>
          <li>hideVersion (optional)</li>
          <li>interval (optional)</li>
          <li>apiVersion (optional)</li>
        </ul>
        <p>projectsFile json pattern</p>
        <pre>
[
  {
    "description": "React Native render for draft.js model",
    "namespace": "globocom",
    "project": "react-native-draftjs-render",
    "branch": "develop"
  }
  (...)
]
        </pre>
      </div>
      <div class="ui bottom attached warning message">
        <p>Ex: https://emilianoeloi.github.io/gitlab-ci-dashboard/?gitlab=gitlab.com&token=w_zZcGZw-8pKxX_qSbWy&projectsFile=https://emilianoeloi.github.io/gitlab-ci-dashboard/static/gitlab.json</p>
        <h4>gitlab-ci-monitor compatibility</h4>
        <p>Ex: https://emilianoeloi.github.io/gitlab-ci-dashboard/?gitlab=gitlab.example.com&token=12345&projects=namespace/project1,namespace/project1/branch,namespace/project2</p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'invalid-config',
    props: ['onInvalid'],
    data () {
      return {
        headerText: 'Invalid Configuration'
      }
    }
  }
</script>