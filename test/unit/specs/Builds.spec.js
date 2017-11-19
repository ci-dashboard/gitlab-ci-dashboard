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
  it('should return class "card failed" to failed status', () => {
    const Constructor = Vue.extend(Builds)
    const vm = new Constructor().$mount()
    const statusClass = vm.statusClass({
      status: 'failed'
    })
    expect('card failed ')
    .to.equal(statusClass)
  })
  it('should return class "bounce-out-top" when status is success and hideSuccessCards is true', () => {
    const Constructor = Vue.extend(Builds)
    const vm = new Constructor().$mount()
    vm.hideSuccessCards = true
    const positionClass = vm.positionClass({
      status: 'success'
    })
    expect('bounce-out-top')
    .to.equal(positionClass)
  })
  it('should show version card when hideVersion is false', () => {
    const Constructor = Vue.extend(Builds)
    const vm = new Constructor().$mount()
    vm.hideVersion = false
    const show = vm.showVersion()
    expect(true).to.equal(show)
  })
})
