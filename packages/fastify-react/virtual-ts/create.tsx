import Root from '$app/root.tsx'

export default function create({ url, ...serverInit }) {
  return <Root url={url} {...serverInit} />
}
