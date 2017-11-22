import Vue from 'vue'
import Painel from '@/components/Painel'

describe('Painel.vue', () => {
  it('has a data hook', () => {
    const type = typeof Painel.data
    expect(type).toEqual('function')
  })
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Painel)
    const vm = new Constructor().$mount()
    expect(vm.localStatus[0].text)
    .toEqual('success')
  })
  it('should return status name: "success"', () => {
    const Constructor = Vue.extend(Painel)
    const vm = new Constructor().$mount()
    vm.status = [{text: 'success'}]
    expect(vm.localStatus[0].text)
    .toEqual('success')
  })
  it('should compute animation styles por mask, filter and spinner', () => {
    const Constructor = Vue.extend(Painel)
    const vm = new Constructor().$mount()
    vm.interval = 5

    const expectedFilter = 'opa 5s steps(1, end) infinite reverse'
    const expectedMask = 'opa 5s steps(1, end) infinite'
    const expectedSpinner = 'rota 5s linear infinite'

    expect(expectedFilter)
    .toEqual(vm.filterAnimation)
    expect(expectedMask)
    .toEqual(vm.maskAnimation)
    expect(expectedSpinner)
    .toEqual(vm.spinnerAnimation)
  })
})
