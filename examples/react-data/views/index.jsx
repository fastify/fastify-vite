import React from 'react'
import { Link } from 'react-router-dom'

export const path = '/'

export default function Index () {
  return (
    <>
      <ul>
        <li>
          <Link to="/global-data">Global Data</Link><span>:</span>
          <b>useHydration()</b> and <b>$global</b> data.
        </li>
        <li>
          <Link to="/route-hooks">Route Hooks</Link><span>:</span>
          <b>onRequest()</b>, <b>useHydration()</b> and <b>$data</b>.
        </li>
        <li>
          <Link to="/route-payload">Route Payload</Link><span>:</span>
          <b>useHydration()</b>, <b>getPayload()</b> and <b>$payloadPath</b>.
        </li>
        <li>
          <Link to="/data-fetching">Isomorphic API</Link><span>:</span>
          <b>useHydration()</b>, <b>getData()</b> and <b>$data</b>.
        </li>
      </ul>
    </>
  )
}
