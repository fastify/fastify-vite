import { createRequire } from 'module'
import { defineConfig, type DefaultTheme } from 'vitepress'
import { withMermaid } from "vitepress-plugin-mermaid";

const require = createRequire(import.meta.url)

export default withMermaid({
  lang: 'en-US',
  title: '@fastify/vite',
  description: 'Vite & Vue powered static site generator.',

  lastUpdated: true,
  cleanUrls: true,

  markdown: {
    math: true,
    theme: 'poimandres',
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
    Guide(),
    Vue(true),
    React(true),
    { text: 'Configuration', base: '/config/', link: 'index' }
  ]
}

function sidebarVue(): DefaultTheme.SidebarItem[] {
  return [
    Guide(true),
    Vue(),
    React(true),
    { text: 'Configuration', base: '/config/', link: 'index' }    
  ]
}

function sidebarReact(): DefaultTheme.SidebarItem[] {
  return [
    Guide(true),
    Vue(true),
    React(),
    { text: 'Configuration', base: '/config/', link: 'index' }
  ]
}

function sidebarConfig(): DefaultTheme.SidebarItem[] {
  return [
    {
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
    },
    {
      text: '@fastify/vue',
      collapsed: true,
      items: [
        { text: 'Project Structure', link: 'vue/project-structure' },
        { text: 'Vite Plugin', link: 'vue/vite-plugin' },
      ]
    },
    {
      text: '@fastify/react',
      collapsed: true,
      items: [
        { text: 'Project Structure', link: 'react/project-structure' },
        { text: 'Vite Plugin', link: 'react/vite-plugin' },
      ]
    },
  ]
}

function Guide (collapsed = false) {
  return {
    collapsed,
    text: 'Introduction',
    base: '/guide/',
    items: [
      { text: 'Getting Started', link: 'getting-started',
        items: [
          { text: 'Why not a framework?', link: 'getting-started#why-not-a-framework' },
          { text: 'A quick walkthrough', link: 'getting-started#a-quick-walkthrough' },
          { text: 'Directory structure', link: 'getting-started#directory-structure' },
          { text: 'Architectural primitives', link: 'getting-started#architectural-primitives' },
        ],
      },
      { text: 'Rendering Function', link: 'rendering-function', },
      { text: 'Router Integration', link: 'router-integration', },
      { text: 'Templating Function', link: 'templating-function' },
      { text: 'Build and Deploy', link: 'build-and-deploy' },
      { text: 'Core Renderers', link: 'core-renderers' },
    ]
  }
}

function Vue (collapsed = false) {
  return {
    text: '@fastify/vue',
    collapsed: true,
    base: '/vue/',
    items: [
      { text: 'Getting Started', link: 'index' },
      { text: 'Project Structure', link: 'project-structure' },
      { 
        text: 'Router Setup', 
        link: 'router-setup',
        items: [
          { text: 'Routes location', link: 'router-setup#routes-location' },
          { text: 'Dynamic parameters', link: 'router-setup#dynamic-parameters' }
        ],
      },
      { 
        text: 'Route Modules', 
        link: 'route-modules',
        items: [
          { text: 'Data fetching', link: 'route-modules#data-fetching' },
          { text: 'Page metadata', link: 'route-modules#page-metadata' },
          { text: 'The onEnter event', link: 'route-modules#the-onenter-event' },
        ],        
      },
      { text: 'Route Layouts', link: 'route-layouts' },
      { text: 'Route Context', link: 'route-context' },
      { text: 'Rendering Modes', link: 'rendering-modes' },      
    ]
  }
}

function React (collapsed = false) {
  return {
    text: '@fastify/react',
    collapsed: true,
    base: '/react/',
    items: [
      { text: 'Getting Started', link: 'index' },
      { text: 'Project Structure', link: 'project-structure' },
      { text: 'Router Setup', link: 'router-setup' },
      { text: 'Rendering Modes', link: 'rendering-modes' },
      { text: 'Data Fetching', link: 'data-fetching' },
      { text: 'Route Layouts', link: 'route-layouts' },
      { text: 'Route Context', link: 'route-context' },
      { text: 'onEnter Event', link: 'onenter-event' },
      { text: 'Head Management', link: 'head-management' },
    ]
  }
}