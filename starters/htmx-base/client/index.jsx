// Both routes.js and root.jsx are provided
// internally so you don't have to.

// The /: prefix is the @fastify/vite convention for 
// shadowable virtual modules — if you  place your own 
// route.js and root.jsx files in the root of your 
// client/ directory, they're used instead

export { routes } from '/:routes.js'
export { default as root } from '/:root.jsx'

// Can also be a function that receives ({ app, req, reply })
export const head = <>
  <title>Default title</title>
</>
 