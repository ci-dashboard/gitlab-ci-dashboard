import Vue from 'vue'
import Builds from '@/components/Builds'

describe('Builds.vue', () => {
  it('has a data hook', () => {
    const type = typeof Builds.data
    expect(type).toEqual('function')
  })
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Builds)
    const vm = new Constructor().$mount()
    expect(vm.gitlab)
    .toEqual('')
  })
  it('should return class "card failed" to failed status', () => {
    const Constructor = Vue.extend(Builds)
    const vm = new Constructor().$mount()
    const statusClass = vm.statusClass({
      status: 'failed'
    })
    expect('card failed ')
    .toEqual(statusClass)
  })
  it('should return class "bounce-out-top" when status is success and hideSuccessCards is true', () => {
    const Constructor = Vue.extend(Builds)
    const vm = new Constructor().$mount()
    vm.hideSuccessCards = true
    const positionClass = vm.positionClass({
      status: 'success'
    })
    expect('bounce-out-top')
    .toEqual(positionClass)
  })
  it('should show version card when hideVersion is false and has tag name', () => {
    const Constructor = Vue.extend(Builds)
    const vm = new Constructor().$mount()
    vm.hideVersion = false
    const show = vm.showVersion({
      tag_name: 'v1'
    })
    expect(true).toEqual(show)
  })
  it('should dont show version card when hideVersion is false and havent tag name', () => {
    const Constructor = Vue.extend(Builds)
    const vm = new Constructor().$mount()
    vm.hideVersion = false
    const show = vm.showVersion({
      tag_name: null
    })
    expect(false).toEqual(show)
  })
  it('should hide commit message and author when was success card', () => {
    const Constructor = Vue.extend(Builds)
    const vm = new Constructor().$mount()
    vm.hideVersion = false
    const success = vm.isSuccessCard({
      status: 'success'
    })
    expect(true).toEqual(success)
  })
})
