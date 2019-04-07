import * as forms from './forms'

const components = {
  forms
}
export default components

/*const install = function(Vue) {
  Object.values(components).forEach(component => {
    // console.log(component.name)
    Vue.component(component.name, component)
  })
}

// auto install
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default Object.assign({}, components, { install })*/ // eslint-disable-line no-undef
