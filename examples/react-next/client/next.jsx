import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

export function getPageRoutes (importMap) {
  const routes = []
  return Object.keys(importMap)
    // Ensure that static routes have 
    // precedence over the dynamic ones
    .sort((a, b) => a > b ? -1 : 1)
    .map((path) => ({
      path: path
        // Remove /pages
        .slice(6)
        // Replace [id] with :id
        .replace(/\[(\w+)\]/, (_, m) => `:${m}`)
        // Remove .jsx extension
        .slice(0, -4)
        // Replace '/index' with '/'
        .replace(/\/index$/, '/'),
      // The React component (default export)
      component: importMap[path].default,
      // The getServerSideProps individual export
      getServerSideProps: importMap[path].getServerSideProps,
    }))
}

export function PageManager ({ routes, ctx }) {
	const [location, resetLocation] = useState(useLocation())
  return (
    <Routes>{
      routes.map(({ path, component, getServerSideProps }) => {
        return <Route key={path} path={path} element={
          <Page 
            ctx={ctx}
            path={path}
            hasServerSideProps={!!getServerSideProps}
            component={component} />
        } />
      })
    }</Routes>
  )
}

function Page ({ 
  path, 
  ctx,
  hasServerSideProps,
  component: Component
}) {
	let serverSideProps
  if (ctx && ctx.serverSideProps) {
    return <Component {...ctx.serverSideProps} /> 
  }
  if (hasServerSideProps) {
	  if (window.hydration.serverSideProps) {
	    return <Component {...window.hydration.serverSideProps} /> 
	  }
	  return <Component {...fetchWithSuspense(path).read()} /> 
  }
  return <Component /> 
}

const suspenseMap = new Map()

function fetchWithSuspense (path, read) {
	let loader
	if (loader = suspenseMap.get(path)) {
		return loader
	} else {
		loader = {
			suspended: true, 
			error: null,
			data: null,
			promise: null,
			read () {
				if (this.data) {
					suspenseMap.delete(path)
					return this.data
				}
				if (this.error) {
					suspenseMap.delete(path)
					throw this.error
				}
				if (this.suspended) {
					throw this.promise
				}
			},
			load () {
				this.promise = fetch(`/json${path}`)
			    .then((response) => { return response.json() })
			    .then((loaderData) => { this.data = loaderData })
			    .catch((loaderError) => { this.error = loaderError })
			    .finally(() => { this.suspended = false })
			}
		}
		loader.load()
		suspenseMap.set(path, loader)
		return fetchWithSuspense(path)
	}
}