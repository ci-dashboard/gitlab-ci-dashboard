import Vue from 'vue'
import Builds from '@/components/Builds'

describe('Builds.vue', () => {
  it('has a data hook', () => {
    const type = typeof Builds.data
    expect(type).to.equal('function')
  })
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Builds)
    const vm = new Constructor().$mount()
    expect(vm.gitlab)
    .to.equal('')
  })
})
