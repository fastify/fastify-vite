
const Item = (text, link) => ({ text, link })

const Guide = [
  Item('Basic Setup', '/guide/basic-setup'),
  Item('Global Data', '/guide/global-data'),
  Item('Route Hooks', '/guide/route-hooks'),
  Item('Route Payload', '/guide/route-payload'),
  Item('Isomorphic API', '/guide/isomorphic-api'),
  Item('Live Deployment', '/guide/deployment'),
  Item('Static Generation', '/guide/static'),
  Item('Renderer API', '/guide/renderers'),
]

const Examples = [
  Item('Vue Starter', '/examples/vue-starter'),
  Item('React Starter', '/examples/react-starter'),
  Item('HTTP clients', '/examples/http-clients'),
  Item('Redis cache', '/examples/redis-cache'),
  Item('ElementUI', '/examples/elementui'),
  Item('WindiCSS', '/examples/windicss'),
  Item('Storyblok', '/examples/storyblok'),
  Item('Contentful', '/examples/contentful'),
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
