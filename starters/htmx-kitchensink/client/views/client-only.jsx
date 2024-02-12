
export const path = '/client-only'

export const head = <>
  <title>Client Only Page</title>
</>

export default function () {
  return (
    <>
  	  <p>This route is rendered on the client only!</p>
      <p>
        <a href="/">Go back to the index</a>
      </p>
      <p>⁂</p>
      <p>When this route is rendered on the server, no SSR takes place.</p>
      <p>See the output of <code>curl http:\/\/localhost:3000/client-only</code>.</p>
    </>
  )
}