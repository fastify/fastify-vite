import routes from '/:routes.js'
import create from '/:create.js'

export default { 
  context: import('/:context.js'), 
  routes,
  create,
}
