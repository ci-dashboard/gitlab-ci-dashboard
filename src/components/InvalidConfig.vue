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
        <ul>
          <li>gitlab</li>
          <li>token</li>
          <li>projectsFile</li>
          <li>gitlabciProtocol (optional)</li>
          <li>hideSuccessCards (optional)</li>
          <li>interval (optional)</li>
        </ul>
        <p>projectsFile json pattern</p>
        <pre>
[
  {
    "description": "React Native render for draft.js model",
    "namespace": "globocom",
    "project": "react-native-draftjs-render",
    "branch": "master"
  }
  (...)
]
        </pre>
      </div>
      <div class="ui bottom attached warning message">
        <p>Ex: http://gitlab-ci-dashboard.example.com?gitlab=gitlab.example.com&token=some-token&projectsFile=http://gitlab-ci-dashboard.example.com/file.json&gitlabciProtocol=http&hideSuccessCards=false</p>
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