import { createStaticVNode, h, defineAsyncComponent, defineComponent } from 'vue'
import { isServer } from 'fastify-vite-vue/client'
import { useFastify, useRequest, useReply } from 'fastify-vite-vue/server'

export default {
	props: {
		name: String,
	},
	async setup (props) {
		let element
		if (isServer) {
			const fastify = useFastify()
			const req = useRequest()
			const reply = useReply()
			// This can be hooked to an external microservice
			;({ element } = await fastify.vite.render(req, reply, props.name))
		}
		return () => {
			if (import.meta.env.SSR) {
				console.log( 'ran on the server')
				return createStaticVNode(element)
			} else {
				console.log( 'ran on the client')
				return h(defineAsyncComponent({
	  			loader: () => import(`./views/${props.name}.vue`)
				}))
			}
		}
	}
}
