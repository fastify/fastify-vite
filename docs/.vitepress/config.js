
const Guide = [
  { text: 'Basic Setup', link: '/guide/setup' },
  { text: 'Configuration', link: '/guide/config' },
  { text: 'Modular Renderers', link: '/guide/renderers' },
  { text: 'Environments', link: '/guide/environments' },
  { text: 'Global Data', link: '/guide/global-data' },
  { text: 'Route Hooks', link: '/guide/route-hooks' },
  { text: 'Route Payload', link: '/guide/route-payload' },
  { text: 'Isomorphic API', link: '/guide/isomorphic-api' },
  { text: 'Live deployment', link: '/guide/deployment' },
  { text: 'Static generation', link: '/guide/static' },
]

const Examples = [
  { text: 'Vue + API', link: '/examples/vue' },
  { text: 'React + API', link: '/examples/vue' },
  { text: 'Vue + Integrated API', link: '/examples/vue-api' },
  { text: 'React + Integrated API', link: '/examples/react-api' },
  { text: 'HTTP clients', link: '/recipes/http-clients' },
  { text: 'Redis cache', link: '/recipes/redis-cache' },
  { text: 'ElementUI', link: '/recipes/elementui' },
  { text: 'WindiCSS', link: '/recipes/windicss' },
  { text: 'Storyblok', link: '/recipes/storyblok' },
  { text: 'Contentful', link: '/recipes/contentful' },
]

const Meta = [
  { text: 'Motivation', link: '/meta/motivation' },
  { text: 'Philosophy', link: '/meta/philosophy' },
  { text: 'Contributing', link: '/meta/contributing' },
  { text: 'Roadmap', link: '/meta/roadmap' },
  { text: 'Team', link: '/meta/team' },
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
