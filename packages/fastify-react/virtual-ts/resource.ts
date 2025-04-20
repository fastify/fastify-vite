const clientFetchMap = new Map()
const clientResourceMap = new Map()

export function waitResource(
  path,
  id,
  promise,
  resourceMap = clientResourceMap,
) {
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

export function waitFetch(path, options = {}, fetchMap = clientFetchMap) {
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
  loader.promise = fetch(path, options)
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

  return waitFetch(path, options, fetchMap)
}
