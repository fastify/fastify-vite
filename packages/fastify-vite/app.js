// const { parse: parseHTML } = require('node-html-parser')
// const devalue = require('devalue')

const { values } = Object

function loadViews (views) {
  const routes = []
  const islands = {}
  for (const view of values(views)) {
    if (view.path && Array.isArray(view.path)) {
      routes.push(
        ...view.path.map((path) => {
          const { default: component, ...viewProps } = view
          return { path, component, ...viewProps }
        }),
      )
    } else if (view.path) {
      const { path, default: component, ...viewProps } = view
      routes.push({ path, component, ...viewProps })
    } else if (view.island) {
      const { island, default: component, ...viewProps } = view
      // viewProps.onSend = packIsland()
      islands[island] = { id: island, component, ...viewProps }
    } else {
      throw new Error('View components need to export a `path` property.')
    }
  }
  return {
    routes: routes.sort((a, b) => {
      if (b.path > a.path) {
        return 1
      } else if (a.path > b.path) {
        return -1
      } else {
        return 0
      }
    }),
    islands,
  }
}

function getIsland (url) {
  const src = new URL(url).pathname
  return (
    document.querySelector(`script[src$="${src}"]`) ||
    document.querySelector(`link[href="${src}"]`)
  )
}

// function packIsland (id) {
//   return (request, reply, payload, done) => {
//     const result = {
//       scripts: [],
//       markup: null,
//     }
//     try {
//       const parsed = parseHTML(payload)
//       const scripts = parsed.querySelectorAll('script')
//       const links = parsed.querySelectorAll('link')
//       for (const link of links) {
//         if (link.attributes.rel === 'modulepreload') {
//           result.scripts.push({
//             type: 'module',
//             src: link.attributes.href,
//           })
//         }
//       }
//       for (const script of scripts) {
//         result.scripts.push({
//           type: script.attributes.type,
//           src: script.attributes.src,
//         })
//       }
//       let markup = parsed.querySelector('#app')
//       if (markup) {
//         markup = payload.slice(...markup.range)
//         if (id) {
//           markup = markup.replace('id="app"', `id="${id}"`)
//         }
//         result.markup = markup
//       }
//       done(null, result)
//     } catch (error) {
//       done(error, result)
//     }
//   }
// }

module.exports = {
  loadViews,
  // Kept temporarily for backwards compatibility
  loadRoutes: loadViews,
  getIsland,
  // packIsland,
}
