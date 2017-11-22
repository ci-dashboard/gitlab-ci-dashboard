import Vue from 'vue'
import Loading from '@/components/Loading'

describe('Loading.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Loading)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('#gcim-loading .loader').textContent).not.toEqual(null)
  })
})
