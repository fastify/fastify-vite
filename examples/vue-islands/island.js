import {
  useSSRContext,
  h,
  createStaticVNode,
  defineAsyncComponent,
} from 'vue'

export default {
  props: {
    name: String,
  },
  async setup (props) {
    let element
    if (import.meta.env.SSR) {
      const { fastify, req, reply } = useSSRContext()
      const renderingResult = await fastify.vite.render(req, reply, props.name)
      element = renderingResult.element
      // const island = await useIsland(props.name)
      // element = island.element
    }
    return () => {
      if (import.meta.env.SSR) {
        return createStaticVNode(element)
      } else {
        return h(defineAsyncComponent({
	  			loader: () => import(`./views/${props.name}.vue`),
        }))
      }
    }
  },
}
