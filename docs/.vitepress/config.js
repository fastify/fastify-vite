
const Item = (text, link) => ({ text, link })

const Guide = [
  Item('Using Vue', '/guide/vue'),
  Item('Using React', '/guide/react'),
  Item('Configuration', '/guide/config'),
  Item('Global Data', '/guide/global-data'),
  Item('Route Hooks', '/guide/route-hooks'),
  Item('Route Payloads', '/guide/route-payloads'),
  Item('Isomorphic Data', '/guide/isomorphic-data'),
  /*
  Item('Live Deployment', '/guide/deployment'),
  Item('Static Generation', '/guide/static'),
  */
]

const Internals = [
  Item('Client Hydration', '/internals/client-hydration'),
  Item('Renderer API', '/internals/renderers'),
]

const Examples = [
  Item('HTTP clients', '/examples/http-clients'),
  Item('Redis cache', '/examples/redis-cache'),
  /*
  Item('ElementUI', '/examples/elementui'),
  Item('WindiCSS', '/examples/windicss'),
  Item('Storyblok', '/examples/storyblok'),
  Item('Contentful', '/examples/contentful'),
  */
]

const Meta = [
  Item('Motivation', '/meta/motivation'),
  Item('Philosophy', '/meta/philosophy'),
  Item('Contributing', '/meta/contributing'),
  Item('Roadmap', '/meta/roadmap'),
  Item('Team', '/meta/team'),
]

const DefaultSidebar = [
  { text: 'Guide', children: Guide },
  { text: 'Internals', children: Internals },
  { text: 'Examples', children: Examples },
  { text: 'Meta', children: Meta },
]

module.exports = {
  lang: 'en-US',
  title: 'fastify-vite',
  themeConfig: {
    displayAllHeaders: true,
    repo: 'terixjs/fastify-vite',
    nav: [
      {
        text: 'Guide',
        items: Guide,
      },
      {
        text: 'Internals',
        items: Internals,
      },
      {
        text: 'Examples',
        items: Examples,
      },
      {
        text: 'Meta',
        items: Meta,
      },
    ],
    sidebar: {
      '/': DefaultSidebar,
    }
  }
}
