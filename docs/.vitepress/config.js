
const Item = (text, link) => ({ text, link })

const Quickstart = [
  Item('Vue 3+', '/quickstart/vue'),
  Item('React 17+', '/quickstart/react'),
  Item('Debugging', '/quickstart/debugging'),
]

const Concepts = [
  Item('Project Blueprint', '/concepts/project-blueprint'),
  Item('Built-in Commands', '/concepts/builtin-commands'),
  Item('Integrated Routing', '/concepts/integrated-routing'),
  Item('Client Hydration', '/concepts/client-hydration'),
  Item('Renderer Adapters', '/concepts/renderer-adapters'),
]

const Deployment = [
  Item('Vite Build', '/deployment/vite-build'),
  Item('Node Server', '/deployment/node-server'),
  Item('Static Generation', '/deployment/static-generation'),
  Item('Generate Server', '/deployment/generate-server'),
]

const Reference = [
  Item('Config', '/reference/config'),
  Item('Route Hooks', '/reference/route-hooks'),
  Item('Functions', '/reference/functions'),
  Item('Global Data', '/reference/global-data'),  
]

const Experimental = [
  Item('Data Fetching', '/experimental/data-fetching'),
  Item('API Integration', '/experimental/api-integration'),
  Item('Island Mode', '/experimental/island-mode'),  
]

const Meta = [
  Item('About', '/meta/about'),
  Item('Philosophy', '/meta/philosophy'),
  Item('Contributing', '/meta/contributing'),
  Item('Maintenance', '/meta/maintenance'),  
]

const DefaultSidebar = [
  { text: 'Quickstart', children: Quickstart },
  { text: 'Concepts', children: Concepts },
  { text: 'Deployment', children: Deployment },
  { text: 'Experimental', children: Experimental },
  { text: 'Reference', children: Reference },
  { text: 'Meta', children: Meta },
]

module.exports = {
  lang: 'en-US',
  title: 'fastify-vite',
  description: 'Fastify plugin for Vite integration',
  themeConfig: {
    displayAllHeaders: true,
    repo: 'terixjs/fastify-vite',
    nav: [
      {
        text: 'Quickstart',
        items: Quickstart,
      },
      {
        text: 'Meta',
        items: Meta,
      },
    ],
    sidebar: {
      '/': DefaultSidebar,
    }
  },
  head: [
    ['meta', { name: 'theme-color', content: '#ffffff' }],
    ['meta', { name: 'author', content: 'Jonas Galvez' }],
    ['meta', { property: 'og:title', content: 'fastify-vite' }],
    ['meta', { property: 'og:image', content: 'https://fastify-vite.dev/cover.png' }],
    ['meta', { property: 'og:description', content: 'Fastify plugin for Vite integration' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:creator', content: '@anothergalvez' }],
    ['meta', { name: 'twitter:image', content: 'https://fastify-vite.dev/cover.png' }],
  ],
}
