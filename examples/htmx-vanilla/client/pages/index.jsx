import styles from './index.module.css'

export const path = '/'

export default function ({ req }) {
	req.data = {
		page: {
			title: 'Page title'
		}
	}
  return (
  	<div>
      <h1 class={styles.header}>
      	Hello from HTMX, @kitajs/html and @fastify/vite!
      </h1>
	  </div>
  )
}
