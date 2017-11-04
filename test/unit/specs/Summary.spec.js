import Vue from 'vue'
import Summary from '@/components/Summary'

describe('Summary.vue', () => {
  it('has a data hook', () => {
    const type = typeof Summary.data
    expect(type).to.equal('function')
  })
})
