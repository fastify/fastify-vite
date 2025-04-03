import { Link } from '@solidjs/router'

export default function Other () {
  return (
    <>
      <p>This page is just for demonstrating client-side navigation.</p>
      <Link href="/">Go back to index</Link>
    </>
  )
}
