/* eslint-disable no-cond-assign */

import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

export function getPageRoutes (importMap) {
  return Object.keys(importMap)
    // Ensure that static routes have
    // precedence over the dynamic ones
    .sort((a, b) => a > b ? -1 : 1)
    .map((path) => ({
      path: path
        // Remove /pages and .jsx extension
        .slice(6, -4)
        // Replace [id] with :id
        .replace(/\[(\w+)\]/, (_, m) => `:${m}`)
        // Replace '/index' with '/'
        .replace(/\/index$/, '/'),
      // The React component (default export)
      component: importMap[path].default,
      // The getServerSideProps individual export
      getServerSideProps: importMap[path].getServerSideProps,
    }))
}

export function PageManager ({ routes, ctx }) {
  return (
    <Routes>{
      routes.map(({ path, component, getServerSideProps }) => {
        return <Route key={path} path={path} element={
          <Page
            ctx={ctx}
            hasServerSideProps={!!getServerSideProps}
            component={component} />
        } />
      })
    }</Routes>
  )
}

function Page ({
  ctx,
  hasServerSideProps,
  component: Component,
}) {
  // If running on the server...
  // See if we already have serverSideProps populated
  // via the registered preHandler hook and passed
  // down via the SSR context
  if (ctx) {
    if (ctx.serverSideProps) {
      return <Component {...ctx.serverSideProps} />
    } else {
      return <Component />
    }
  }
  // If running on the client...
  // Retrieve serverSideProps hydration if available
  let serverSideProps = window.hydration.serverSideProps
  // Ensure hydration is always cleared after the first page render
  window.hydration = {}
  if (hasServerSideProps) {
    // First check if we have serverSideProps hydration
    if (serverSideProps) {
      return <Component {...serverSideProps} />
    }
    const { pathname, search } = useLocation()
    try {
      // If not, fetch serverSideProps from the JSON endpoint
      serverSideProps = fetchWithSuspense(`${pathname}${search}`)
      return <Component {...serverSideProps} />
    } catch (error) {
      // If it's an actual error...
      if (error instanceof Error) {
        return <p>Error: {error.message}</p>
      }
      // If it's just a promise (suspended state)
      throw error
    }
  }
  return <Component />
}

const suspenseMap = new Map()

function fetchWithSuspense (path) {
  let loader
  // When fetchWithSuspense() is called the first time inside
  // a component, it'll create the resource object (loader) for
  // tracking its state, but the next time it's called, it'll
  // return the same resource object previously saved
  if (loader = suspenseMap.get(path)) {
    // Handle error, suspended state or return loaded data
    if (loader.error || loader.data?.statusCode === 500) {
      if (loader.data?.statusCode === 500) {
        throw new Error(loader.data.message)
      }
      throw loader.error
    }
    if (loader.suspended) {
      throw loader.promise
    }
    // Remove from suspenseMap now that we have data
    suspenseMap.delete(path)

    return loader.data
  } else {
    loader = {
      suspended: true,
      error: null,
      data: null,
      promise: null,
    }
    loader.promise = fetch(`/json${path}`)
      .then((response) => response.json())
      .then((loaderData) => { loader.data = loaderData })
      .catch((loaderError) => { loader.error = loaderError })
      .finally(() => { loader.suspended = false })

    // Save the active suspended state to track it
    suspenseMap.set(path, loader)

    // Call again for handling tracked state
    return fetchWithSuspense(path)
  }
}
