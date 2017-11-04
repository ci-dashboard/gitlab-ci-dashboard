import Vue from 'vue'
import Summary from '@/components/Summary'

describe('Summary.vue', () => {
  it('has a data hook', () => {
    const type = typeof Summary.data
    expect(type).to.equal('function')
  })
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Summary)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.summary').textContent)
      .to.equal('')
  })
})
