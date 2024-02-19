
const pages = import.meta.glob('/pages/*.jsx', { eager: true })

export const routes = Object.entries(pages)
  .map(([path, page]) => ({ ...page, module: path }))
