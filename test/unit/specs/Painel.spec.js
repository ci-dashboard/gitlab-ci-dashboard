import Vue from 'vue'
import Painel from '@/components/Painel'

describe('Painel.vue', () => {
  it('has a data hook', () => {
    const type = typeof Painel.data
    expect(type).to.equal('function')
  })
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Painel)
    const vm = new Constructor().$mount()
    expect(vm.localStatus[0].text)
    .to.equal('gitlab-ci-monitor')
  })
  it('should return status name: "success"', () => {
    const Constructor = Vue.extend(Painel)
    const vm = new Constructor().$mount()
    vm.status = [{text: 'success'}]
    expect(vm.localStatus[0].text)
    .to.equal('success')
  })
})
