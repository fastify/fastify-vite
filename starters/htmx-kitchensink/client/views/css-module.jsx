import styles from '/assets/styles.module.css'

export const path = '/css-module'

export const head = <>
  <title>Server-side rendered with CSS module</title>
</>

export default function () {
  return (
    <>
  	  <p class={styles.banner}>This route is rendered on the server and the CSS bundle for the route is loaded asynchronously.</p>
      <p>
        <a href="/">Go back to the index</a>
      </p>
    </>
  )
}