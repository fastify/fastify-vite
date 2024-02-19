import Html from '@kitajs/html'

export const path = '/sample-fragment'
export const method = 'GET'

export default ({ app, req, reply }) => {
  // Access http://localhost:3000/sample-fragment
  return <p>
    This fragment is delivered to the 
    client without a surrounding {Html.escape('<body>')}
  </p>
}
