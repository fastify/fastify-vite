import { createApp } from './app'

export default (createRenderFunction) => ({
  routes: [{ path: '/*' }],
  render: createRenderFunction(createApp),
})
