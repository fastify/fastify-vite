import { Link } from 'react-router-dom'
import './index.css'

export const path = '/'

export default function Index (props) {
  return (
    <>
      <ul>
        <li>
          <Link to="/global-data">Global Data</Link><span>:</span>
          <code>useHydration()</code> and <code>$global</code> data.
        </li>
        <li>
          <Link to="/route-hooks">Route Hooks</Link><span>:</span>
          <code>onRequest()</code>, <code>useHydration()</code> and <code>$data</code>.
        </li>
        <li>
          <Link to="/route-payload">Route Payload</Link><span>:</span>
          <code>useHydration()</code>, <code>getPayload()</code> and <code>$payloadPath</code>.
        </li>
        <li>
          <Link to="/data-fetching">Isomorphic API</Link><span>:</span>
          <code>useHydration()</code>, <code>getData()</code> and <code>$data</code>.
        </li>
      </ul>
    </>
  )
}
