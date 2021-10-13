
const Item = (text, link) => ({ text, link })

const Guide = [
  Item('Using Vue', '/guide/vue'),
  Item('Using React', '/guide/react'),
  Item('Configuration', '/guide/config'),
  Item('Global Data', '/guide/global-data'),
  Item('Route Hooks', '/guide/route-hooks'),
  Item('API Integration', '/guide/api-integration'),
  Item('Island Mode', '/guide/island-mode'),
  Item('Deployment', '/guide/deployment'),
]

const Functions = [
  Item('useHydration', '/functions/use-hydration'),
  Item('useFastify', '/functions/use-fastify'),
  Item('useRequest', '/functions/use-request'),
  Item('useReply', '/functions/use-reply'),
]

const Internals = [
  Item('Client Hydration', '/internals/client-hydration'),
  Item('Renderer API', '/internals/renderer-api'),
]

/*
const Examples = [
  Item('HTTP clients', '/examples/http-clients'),
  Item('Redis cache', '/examples/redis-cache'),
  Item('ElementUI', '/examples/elementui'),
  Item('WindiCSS', '/examples/windicss'),
  Item('Storyblok', '/examples/storyblok'),
  Item('Contentful', '/examples/contentful'),
]
*/


const Meta = [
  Item('About', '/meta/about'),
  Item('Philosophy', '/meta/philosophy'),
  Item('Contributing', '/meta/contributing'),
]

const DefaultSidebar = [
  { text: 'Guide', children: Guide },
  { text: 'Functions', children: Functions },
  { text: 'Internals', children: Internals },
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
        text: 'Guide',
        items: Guide,
      },
      {
        text: 'Functions',
        items: Functions,
      },
      {
        text: 'Internals',
        items: Internals,
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
