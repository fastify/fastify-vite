
const Item = (text, link) => ({ text, link })

const Quickstart = [
  Item('Vue 3+', '/quickstart/vue'),
  Item('React 17+', '/quickstart/react'),
]

const Concepts = [
  Item('Project Blueprint', '/concepts/project-blueprint'),
  Item('Integrated Routing', '/concepts/integrated-routing'),
  Item('Client Hydration', '/concepts/client-hydration'),
  Item('Renderer API', '/concepts/renderer-api'),
]

const Guide = [
  Item('Configuration', '/guide/config'),
  Item('Global Data', '/guide/global-data'),
  Item('Data Fetching', '/guide/data-fetching'),
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

/*
const Examples = [
  Item('Undici', '/examples/http-clients'),
  Item('Redis', '/examples/redis-cache'),
  Item('WindiCSS', '/examples/windicss'),
  Item('ElementUI', '/examples/elementui'),
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
  { text: 'Quickstart', children: Quickstart },
  { text: 'Concepts', children: Concepts },
  { text: 'Guide', children: Guide },
  { text: 'Functions', children: Functions },
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
        text: 'Concepts',
        items: Concepts,
      },
      {
        text: 'Guide',
        items: Guide,
      },
      {
        text: 'Functions',
        items: Functions,
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
