import { 
  UnheadProvider as ClientUnheadProvider 
} from '@unhead/react/client'
import { 
  UnheadProvider as ServerUnheadProvider 
} from '@unhead/react/server?server'

import Root from '$app/root.jsx'

export default function create({ url, ...serverInit }) {
  const UnheadProvider = import.meta.env.SSR
    ? ServerUnheadProvider
    : ClientUnheadProvider
  return (
    <UnheadProvider value={serverInit.ctxHydration.useHead}>
      <Root url={url} {...serverInit} />
    </UnheadProvider>
  )
}
