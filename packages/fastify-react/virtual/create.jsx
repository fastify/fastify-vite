import Root from '/dx:root.jsx'

export default function create ({ url, ...serverInit }) {
  return (
    <Root url={url} {...serverInit} />
  )
}
