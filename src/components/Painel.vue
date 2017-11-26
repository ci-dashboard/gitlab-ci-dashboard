<template>
  <div id="gcim-painel" class="ui grid card" style="background-color: white">
    <div class="ui row centered" style="padding-bottom: 2em">
      <img class="logo" src="../assets/gitlab-logo.svg" />
    </div>
    <div v-for="s in localStatus" v-bind:key="s.color" class="ui row">
      <div style="margin: 1em">
        <span style="font-size: 5em">{{ s.total }}</span>
        <span style="font-size: 1.1em;" v-bind:style="{ color: s.color }">{{ s.text.toUpperCase() }}</span>
      </div>
    </div>
    <div class="ui row centered">
      <div class="wrapper">
        <div
          class="pie spinner"
          v-bind:style="{ animation: spinnerAnimation }"
        ></div>
        <div
          class="pie filler"
          v-bind:style="{ animation: filterAnimation }"
        ></div>
        <div
          class="mask"
          v-bind:style="{ animation: maskAnimation }"
        ></div>
      </div>
    </div>
    <div class="ui row centered">
      <h5>
        <a target="_blank" href="https://github.com/emilianoeloi/gitlab-ci-dashboard">
          GitLab CI Dashboard
        </a>
      </h5>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'painel',
    props: ['status', 'interval'],
    computed: {
      localStatus () {
        return this.painelStatus.map((ps) => {
          if (this.status == null) {
            return ps
          }
          const arr = this.status.filter((s) => {
            return s.text === ps.text
          })
          if (arr.length > 0) {
            const foundStatus = arr[0]
            ps.total = foundStatus.total
          }
          return ps
        })
      },
      filterAnimation () {
        return `opa ${this.interval}s steps(1, end) infinite reverse`
      },
      maskAnimation () {
        return `opa ${this.interval}s steps(1, end) infinite`
      },
      spinnerAnimation () {
        return `rota ${this.interval}s linear infinite`
      }
    },
    data () {
      return {
        painelStatus: [
          {
            text: 'success',
            color: '#00ad68',
            total: 0
          },
          {
            text: 'failed',
            color: '#e7484d',
            total: 0
          },
          {
            text: 'running',
            color: '#2d9fd8',
            total: 0
          },
          {
            text: 'pending',
            color: '#ffb541',
            total: 0
          },
          {
            text: 'canceled',
            color: '#aaaaaa',
            total: 0
          }
        ]
      }
    }
  }
</script>
<style>
.wrapper {
  position: relative;
  margin: 0.2em;
  background: white;
}

.wrapper, .wrapper * {
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.wrapper {
  width: 30px;
  height: 30px;
}

.wrapper .pie {
  width: 50%;
  height: 100%;
  transform-origin: 100% 50%;
  position: absolute;
  background: #fc6d26;
  border: 5px solid #fca326;
}

.wrapper .spinner {
  border-radius: 100% 0 0 100% / 50% 0 0 50%;
  z-index: 200;
  border-right: none;
}

.wrapper:hover .spinner,
.wrapper:hover .filler,
.wrapper:hover .mask {
  animation-play-state: running;
}

.wrapper .filler {
  border-radius: 0 100% 100% 0 / 0 50% 50% 0;
  left: 50%;
  opacity: 0;
  z-index: 100;
  border-left: none;
}

.wrapper .mask {
  width: 50%;
  height: 100%;
  position: absolute;
  background: inherit;
  opacity: 1;
  z-index: 300;
}

@keyframes rota {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes opa {
  0% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
}
</style>