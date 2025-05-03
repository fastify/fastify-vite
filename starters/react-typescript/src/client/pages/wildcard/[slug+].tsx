import { useRouteContext } from '@fastify/react/client'

export function getData ({ req }) {
  let pathMatch = req.params['*'];
  if (pathMatch.charAt(pathMatch.length - 1) == '/') {
    pathMatch = pathMatch.substr(0, pathMatch.length - 1);
  }

  return {
    pathMatch: pathMatch.split('/'),
  }
}

export default function Wildcard () {
  const { data } = useRouteContext()
  return (
    <>
      <h1>Wildcard example that matches /wildcard/*</h1>
      <p>Path match: { data.pathMatch }</p>
    </>
  )
}
