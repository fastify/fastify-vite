'use client'

import { useState, useEffect, Component, startTransition } from 'react'
import { useLocation } from 'react-router'
import {
  createFromFetch,
  setServerCallback,
  createTemporaryReferenceSet,
  encodeReply,
} from '@vitejs/plugin-rsc/browser'

class RscErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error('RSC render error:', error)
  }

  render() {
    if (this.state.error) {
      return (
        <div role="alert">
          <h2>RSC Render Error</h2>
          <pre>{this.state.error.message}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default function RscContent() {
  const location = useLocation()
  const [element, setElement] = useState(null)
  const [loading, setLoading] = useState(false)

  // Register server action callback once on mount.
  // Uses window.location inside the callback for the current URL at call time,
  // so it stays accurate after client-side navigation.
  useEffect(() => {
    setServerCallback(async (id, args) => {
      const temporaryReferences = createTemporaryReferenceSet()
      const rscUrl = `${window.location.pathname}_.rsc${window.location.search}`
      const payload = await createFromFetch(
        fetch(rscUrl, {
          method: 'POST',
          headers: { 'x-rsc-action': id },
          body: await encodeReply(args, { temporaryReferences }),
        }),
        { temporaryReferences },
      )
      startTransition(() => {
        setElement(payload.matches?.[0]?.element ?? null)
        setLoading(false)
      })
      const { ok, data } = payload.returnValue ?? {}
      if (!ok) throw data
      return data
    })
  }, [])

  // Fetch RSC content on client navigation (initial hydration handled by mount.js)
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const rscUrl = `${location.pathname}_.rsc${location.search}`
    createFromFetch(fetch(rscUrl)).then((payload) => {
      if (!cancelled) {
        startTransition(() => {
          setElement(payload.matches?.[0]?.element ?? null)
          setLoading(false)
        })
        if (payload?.head?.title) {
          document.title = payload.head.title
        }
      }
    })

    return () => {
      cancelled = true
    }
  }, [location.pathname, location.search])

  // Only show loading on initial render, not on client navigation (avoids flicker)
  if (loading && !element) {
    return <div className="rsc-loading">Loading...</div>
  }

  return <RscErrorBoundary>{element}</RscErrorBoundary>
}
