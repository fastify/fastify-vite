// The default export function runs exactly once on
// the server and once on the client during the
// first render, that is, it's not executed again
// in subsequent client-side navigation.
export default async (ctx) => {
  // Set default params here for fetch/axios or similar XHR library
  ctx.state.locale = ctx.meta.locale
}

// State initializer, must be a function called state
// as this is a special context.js export and has
// special processing, e.g., serialization and hydration
export function state() {
  return {
    locale: 'sv',
  }
}
