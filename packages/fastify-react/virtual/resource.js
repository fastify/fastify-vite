const fetchMap = new Map()
const resourceMap = new Map()

export function waitResource(path, id, promise) {
  const resourceId = `${path}:${id}`
  const loaderStatus = resourceMap.get(resourceId)
  if (loaderStatus) {
    if (loaderStatus.error) {
      throw loaderStatus.error
    }
    if (loaderStatus.suspended) {
      throw loaderStatus.promise
    }
    resourceMap.delete(resourceId)

    return loaderStatus.result
  }
  const loader = {
    suspended: true,
    error: null,
    result: null,
    promise: null,
  }
  loader.promise = promise()
    .then((result) => {
      loader.result = result
    })
    .catch((loaderError) => {
      loader.error = loaderError
    })
    .finally(() => {
      loader.suspended = false
    })

  resourceMap.set(resourceId, loader)

  return waitResource(path, id)
}

export function waitFetch(path) {
  const loaderStatus = fetchMap.get(path)
  if (loaderStatus) {
    if (loaderStatus.error || loaderStatus.data?.statusCode === 500) {
      if (loaderStatus.data?.statusCode === 500) {
        throw new Error(loaderStatus.data.message)
      }
      throw loaderStatus.error
    }
    if (loaderStatus.suspended) {
      throw loaderStatus.promise
    }
    fetchMap.delete(path)

    return loaderStatus.data
  }
  const loader = {
    suspended: true,
    error: null,
    data: null,
    promise: null,
  }
  loader.promise = fetch(`/-/data${path}`)
    .then((response) => response.json())
    .then((loaderData) => {
      loader.data = loaderData
    })
    .catch((loaderError) => {
      loader.error = loaderError
    })
    .finally(() => {
      loader.suspended = false
    })

  fetchMap.set(path, loader)

  return waitFetch(path)
}
