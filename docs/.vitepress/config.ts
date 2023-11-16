import { createRequire } from 'module'
import { defineConfig, type DefaultTheme } from 'vitepress'

const require = createRequire(import.meta.url)

export default defineConfig({
  lang: 'en-US',
  title: '@fastify/vite',
  description: 'Vite & Vue powered static site generator.',

  lastUpdated: true,
  cleanUrls: true,

  markdown: {
    math: true
  },

  sitemap: {
    hostname: 'https://vitepress.dev',
    transformItems(items) {
      return items.filter((item) => !item.url.includes('migration'))
    }
  },

  /* prettier-ignore */
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/vitepress-logo-mini.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/vitepress-logo-mini.png' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'VitePress' }],
    ['meta', { name: 'og:image', content: 'https://vitepress.dev/vitepress-og.jpg' }],
    ['script', { src: 'https://cdn.usefathom.com/script.js', 'data-site': 'AZBRSFGG', 'data-spa': 'auto', defer: '' }]
  ],

  themeConfig: {
    // logo: { src: '/vitepress-logo-mini.svg', width: 24, height: 24 },

    nav: nav(),

    sidebar: {
      '/guide/': { base: '/guide/', items: sidebarGuide() },
      '/vue/': { base: '/vue/', items: sidebarVue() },
      '/react/': { base: '/react/', items: sidebarReact() },
      '/config/': { base: '/config/', items: sidebarConfig() }
    },

    editLink: {
      pattern: 'https://github.com/fastify/fastify-vite/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/fastify/fastify-vite' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2021-present Jonas gALVEZ'
    },

    search: {
      provider: 'algolia',
      options: {
        appId: '8J64VVRP8K',
        apiKey: 'a18e2f4cc5665f6602c5631fd868adfd',
        indexName: 'vitepress'
      }
    },

  }
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Guide',
      link: '/guide/getting-started',
      activeMatch: '/guide/'
    },
    {
      text: 'Configuration',
      link: '/config/index',
      activeMatch: '/config/'
    }
  ]
}

/* prettier-ignore */
function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Introduction',
      collapsed: false,
      items: [
        { text: 'Getting Started', link: 'getting-started' },
        { text: 'Project Structure', link: 'project-structure' },
        { text: 'Rendering Function', link: 'rendering-function' },
        { text: 'Templating Function', link: 'templating-function' },
        { text: 'Building & Deployment', link: 'building-and-deployment' },
        { text: 'Framework Shells', link: 'framework-shells' },
      ]
    },
    {
      text: '@fastify/vue',
      collapsed: true,
      items: [
        { base: '/vue/', text: 'What\'s Included', link: 'whats-included' },
        { base: '/vue/', text: 'Basic Setup', link: 'basic-setup' },
        { base: '/vue/', text: 'Project Structure', link: 'project-structure' },
        { base: '/vue/', text: 'Rendering Modes', link: 'rendering-modes' },
        { base: '/vue/', text: 'Routing Modes', link: 'routing-modes' },
        { base: '/vue/', text: 'Data Fetching', link: 'data-fetching' },
        { base: '/vue/', text: 'Route Layouts', link: 'route-layouts' },
        { base: '/vue/', text: 'Route Context', link: 'route-context' },
        { base: '/vue/', text: 'onEnter Event', link: 'onenter-event' },
        { base: '/vue/', text: 'Head Management', link: 'head-management' },
        { base: '/vue/', text: 'Virtual Modules', link: 'virtual-moduless' },
      ]
    },
    {
      text: '@fastify/react',
      collapsed: true,
      items: [
        { base: '/react/', text: 'What\'s Included', link: 'whats-included' },
        { base: '/react/', text: 'Basic Setup', link: 'basic-setup' },
        { base: '/react/', text: 'Project Structure', link: 'project-structure' },
        { base: '/react/', text: 'Rendering Modes', link: 'rendering-modes' },
        { base: '/react/', text: 'Routing Modes', link: 'routing-modes' },
        { base: '/react/', text: 'Data Fetching', link: 'data-fetching' },
        { base: '/react/', text: 'Route Layouts', link: 'route-layouts' },
        { base: '/react/', text: 'Route Context', link: 'route-context' },
        { base: '/react/', text: 'onEnter Event', link: 'onenter-event' },
        { base: '/react/', text: 'Head Management', link: 'head-management' },
        { base: '/react/', text: 'Virtual Modules', link: 'virtual-moduless' },
      ]
    },
    { text: 'Configuration', base: '/config/', link: 'index' }
  ]
}

function sidebarVue(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Introduction',
      collapsed: false,
      items: [
        { base: '/guide/', text: 'Getting Started', link: 'getting-started' },
        { base: '/guide/', text: 'Project Structure', link: 'project-structure' },
        { base: '/guide/', text: 'Rendering Function', link: 'rendering-function' },
        { base: '/guide/', text: 'Templating Function', link: 'templating-function' },
        { base: '/guide/', text: 'Building & Deployment', link: 'building-and-deployment' },
        { base: '/guide/', text: 'Framework Shells', link: 'framework-shells' },
      ]
    },
    {
      text: '@fastify/vue',
      collapsed: false,
      items: [
        { text: 'What\'s Included', link: 'whats-included' },
        { text: 'Basic Setup', link: 'basic-setup' },
        { text: 'Project Structure', link: 'project-structure' },
        { text: 'Rendering Modes', link: 'rendering-modes' },
        { text: 'Routing Modes', link: 'routing-modes' },
        { text: 'Data Fetching', link: 'data-fetching' },
        { text: 'Route Layouts', link: 'route-layouts' },
        { text: 'Route Context', link: 'route-context' },
        { text: 'onEnter Event', link: 'onenter-event' },
        { text: 'Head Management', link: 'head-management' },
        { text: 'Virtual Modules', link: 'virtual-moduless' },
      ]
    },
    {
      text: '@fastify/react',
      collapsed: true,
      items: [
        { base: '/react/', text: 'What\'s Included', link: 'whats-included' },
        { base: '/react/', text: 'Basic Setup', link: 'basic-setup' },
        { base: '/react/', text: 'Project Structure', link: 'project-structure' },
        { base: '/react/', text: 'Rendering Modes', link: 'rendering-modes' },
        { base: '/react/', text: 'Routing Modes', link: 'routing-modes' },
        { base: '/react/', text: 'Data Fetching', link: 'data-fetching' },
        { base: '/react/', text: 'Route Layouts', link: 'route-layouts' },
        { base: '/react/', text: 'Route Context', link: 'route-context' },
        { base: '/react/', text: 'onEnter Event', link: 'onenter-event' },
        { base: '/react/', text: 'Head Management', link: 'head-management' },
        { base: '/react/', text: 'Virtual Modules', link: 'virtual-moduless' },
      ]
    },
    { text: 'Configuration', base: '/config/', link: 'index' }    
  ]
}

function sidebarReact(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '@fastify/vue',
      collapsed: true,
      items: [
        { base: '/vue/', text: 'What\'s Included', link: 'whats-included' },
        { base: '/vue/', text: 'Basic Setup', link: 'basic-setup' },
        { base: '/vue/', text: 'Project Structure', link: 'project-structure' },
        { base: '/vue/', text: 'Rendering Modes', link: 'rendering-modes' },
        { base: '/vue/', text: 'Routing Modes', link: 'routing-modes' },
        { base: '/vue/', text: 'Data Fetching', link: 'data-fetching' },
        { base: '/vue/', text: 'Route Layouts', link: 'route-layouts' },
        { base: '/vue/', text: 'Route Context', link: 'route-context' },
        { base: '/vue/', text: 'onEnter Event', link: 'onenter-event' },
        { base: '/vue/', text: 'Head Management', link: 'head-management' },
        { base: '/vue/', text: 'Virtual Modules', link: 'virtual-moduless' },
      ]
    },
    {
      text: '@fastify/react',
      collapsed: true,
      items: [
        { text: 'What\'s Included', link: 'whats-included' },
        { text: 'Basic Setup', link: 'basic-setup' },
        { text: 'Project Structure', link: 'project-structure' },
        { text: 'Rendering Modes', link: 'rendering-modes' },
        { text: 'Routing Modes', link: 'routing-modes' },
        { text: 'Data Fetching', link: 'data-fetching' },
        { text: 'Route Layouts', link: 'route-layouts' },
        { text: 'Route Context', link: 'route-context' },
        { text: 'onEnter Event', link: 'onenter-event' },
        { text: 'Head Management', link: 'head-management' },
        { text: 'Virtual Modules', link: 'virtual-moduless' },
      ]
    },
    { text: 'Configuration', base: '/config/', link: 'index' }
  ]
}

function sidebarConfig(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Configuration',
      items: [
        { text: 'clientModule', link: 'clientModule' },
        { text: 'prepareClient', link: 'prepareClient' },
        { text: 'createRenderFunction', link: 'createRenderFunction' },
        { text: 'createHtmlFunction', link: 'createHtmlFunction' },
        { text: 'createRouteHandler', link: 'createRouteHandler' },
        { text: 'createErrorHandler', link: 'createErrorHandler' },
        { text: 'createRoute', link: 'createRoute' },
        { text: 'renderer', link: 'renderer' },
        { text: 'spa', link: 'spa' },
      ]
    }
  ]
}
