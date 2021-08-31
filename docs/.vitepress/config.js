
const Item = (text, link) => ({ text, link })

const Guide = [
  Item('Basic Setup', '/guide/setup'),
  Item('Configuration', '/guide/config'),
  Item('Environments', '/guide/environments'),
  Item('Routing', '/guide/routing'),
  Item('Global Data', '/guide/global-data'),
  Item('Route Hooks', '/guide/route-hooks'),
  Item('Route Payload', '/guide/route-payload'),
  Item('Isomorphic API', '/guide/isomorphic-api'),
  Item('Live Deployment', '/guide/deployment'),
  Item('Static Generation', '/guide/static'),
  Item('Renderer API', '/guide/renderers'),
]

const Examples = [
  Item('Vue + API', '/examples/vue'),
  Item('React + API', '/examples/vue'),
  Item('Vue + Integrated API', '/examples/vue-api'),
  Item('React + Integrated API', '/examples/react-api'),
  Item('HTTP clients', '/recipes/http-clients'),
  Item('Redis cache', '/recipes/redis-cache'),
  Item('ElementUI', '/recipes/elementui'),
  Item('WindiCSS', '/recipes/windicss'),
  Item('Storyblok', '/recipes/storyblok'),
  Item('Contentful', '/recipes/contentful'),
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
