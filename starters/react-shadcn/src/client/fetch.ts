// This method is only used on the client, assuming the
// requests are made to the current location, so no base
// URL configuration is needed in this example.

export function sendJSON (path, options) {
  return fetch(path, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options.json && {
      body: JSON.stringify(options.json),
    },
    ...options
  })
}
