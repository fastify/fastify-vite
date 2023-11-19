
const fetchMap = new Map()
const resourceMap = new Map()

export function waitResource (path, id, promise) {
  const resourceId = `${path}:${id}`
  const loader = resourceMap.get(resourceId)
  if (loader) {
    if (loader.error) {
      throw loader.error
    }
    if (loader.suspended) {
      throw loader.promise
    }
    resourceMap.delete(resourceId)

    return loader.result
  } else {
    const loader = {
      suspended: true,
      error: null,
      result: null,
      promise: null,
    }
    loader.promise = promise()
      .then((result) => { loader.result = result })
      .catch((loaderError) => { loader.error = loaderError })
      .finally(() => { loader.suspended = false })

    resourceMap.set(resourceId, loader)

    return waitResource(path, id)
  }
}

export function waitFetch (path) {
  const loader = fetchMap.get(path)
  if (loader) {
    if (loader.error || loader.data?.statusCode === 500) {
      if (loader.data?.statusCode === 500) {
        throw new Error(loader.data.message)
      }
      throw loader.error
    }
    if (loader.suspended) {
      throw loader.promise
    }
    fetchMap.delete(path)

    return loader.data
  } else {
    const loader = {
      suspended: true,
      error: null,
      data: null,
      promise: null,
    }
    loader.promise = fetch(`/-/data${path}`)
      .then((response) => response.json())
      .then((loaderData) => { loader.data = loaderData })
      .catch((loaderError) => { loader.error = loaderError })
      .finally(() => { loader.suspended = false })

    fetchMap.set(path, loader)

    return waitFetch(path)
  }
}
