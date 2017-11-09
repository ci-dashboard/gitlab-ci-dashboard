import Vue from 'vue'
import Error from '@/components/Error'

describe('Error.vue', () => {
  it('has a data hook', () => {
    const type = typeof Error.computed
    expect(type).to.equal('object')
  })
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Error)
    const vm = new Constructor().$mount()
    vm.onError = {message: 'error message'}
    expect(vm.show)
      .to.equal(true)
    expect(vm.message)
    .to.equal('error message')
  })
})
