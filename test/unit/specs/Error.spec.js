import Vue from 'vue'
import Error from '@/components/Error'

describe('Error.vue', () => {
  it('has a data hook', () => {
    const type = typeof Error.computed
    expect(type).toEqual('object')
  })
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Error)
    const vm = new Constructor().$mount()
    vm.onError = {message: 'error message'}
    expect(vm.show)
      .toEqual(true)
    expect(vm.message)
    .toEqual('error message')
  })
  it('should not show error box when message is empty', () => {
    const Constructor = Vue.extend(Error)
    const vm = new Constructor().$mount()
    vm.onError = {message: ''}
    expect(vm.show)
      .toEqual(false)
  })
})
