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
    theme: {
      light: 'min-light',
      dark: 'dracula',
    }
  },

  sitemap: {
    hostname: 'https://fastify-vite.dev',
  },

  /* prettier-ignore */
  head: [
    // ['link', { rel: 'icon', type: 'image/svg+xml', href: '/vitepress-logo-mini.svg' }],
    // ['link', { rel: 'icon', type: 'image/png', href: '/vitepress-logo-mini.png' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: '@fastify/vite' }],
    // ['meta', { name: 'og:image', content: 'https://vitepress.dev/vitepress-og.jpg' }],
    // ['script', { src: 'https://cdn.usefathom.com/script.js', 'data-site': 'AZBRSFGG', 'data-spa': 'auto', defer: '' }]
  ],

  themeConfig: {
    // logo: { src: '/vitepress-logo-mini.svg', width: 24, height: 24 },

    nav: nav(),

    sidebar: {
      '/guide/': { base: '/guide/', items: sidebarGuide() },
      '/vue/': { base: '/vue/', items: sidebarVue() },
      '/react/': { base: '/react/', items: sidebarReact() },
      '/config/': { base: '/config/', items: sidebarConfig() },
      '/roadmap': { base: '/guide/', items: sidebarGuide() },
      '/contributing': { base: '/guide/', items: sidebarGuide() },
      '/sponsoring': { base: '/guide/', items: sidebarGuide() },
      '/consulting': { base: '/guide/', items: sidebarGuide() },
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
      copyright: 'Copyright © 2021-present Jonas Galvez'
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
      text: 'Vue',
      link: '/vue/index',
      activeMatch: '/vue/'
    },
    {
      text: 'React',
      link: '/react/index',
      activeMatch: '/react/'
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
    ...Common(),
  ]
}

function sidebarVue(): DefaultTheme.SidebarItem[] {
  return [
    Guide(true),
    Vue(),
    React(true),
    ...Common(),
  ]
}

function sidebarReact(): DefaultTheme.SidebarItem[] {
  return [
    Guide(true),
    Vue(true),
    React(),
    ...Common(),
  ]
}

function sidebarConfig(): DefaultTheme.SidebarItem[] {
  return [
    {
      'text': 'Base options',
      'link': 'index#base-options',
      collapsed: false,
      items: [
        { text: 'root', link: 'index#root' },
        { text: 'dev', link: 'index#dev' },
        { text: 'spa', link: 'index#spa' },
        { text: 'renderer', link: 'index#renderer' }
      ],
    },
    {
      'text': 'Renderer options',
      'link': 'index#renderer-options',
      collapsed: false,
      items: [
        { text: 'clientModule', link: 'index#clientmodule' },
        { text: 'prepareClient', link: 'index#prepareclient-clientmodule-scope-config' },
        { text: 'createRenderFunction', link: 'index#createrenderfunction' },
        { text: 'createHtmlFunction', link: 'index#createhtmlfunction-source-scope-config' },
        { text: 'createRouteHandler', link: 'index#createroutehandler-client-route-scope-config' },
        { text: 'createErrorHandler', link: 'index#createerrorhandler-client-route-scope-config' },
        { text: 'createRoute', link: 'index#createroute-handler-errorhandler-route-scope-config' }
      ]
    },
    {
      text: '@fastify/vue',
      collapsed: false,
      items: [
        { text: 'Vite Plugin', link: 'vue/vite-plugin' },
        {
          text: 'Virtual Modules',
          link: 'vue/virtual-modules',
          items: [
            { text: '/:root.vue', link: 'vue/virtual-modules#root-vue' },
            { text: '/:router.vue', link: 'vue/virtual-modules#router-vue' },
            { text: '/:routes.js', link: 'vue/virtual-modules#routes-js' },
            { text: '/:core.js', link: 'vue/virtual-modules#core-js' },
            { text: '/:create.js', link: 'vue/virtual-modules#create-js' },
            { text: '/:layouts/default.vue', link: 'vue/virtual-modules#layouts-default-vue' },
            { text: '/:mount.js', link: 'vue/virtual-modules#mount-js' }
          ]
        },
      ]
    },
    {
      text: '@fastify/react',
      collapsed: false,
      items: [
        { text: 'Vite Plugin', link: 'react/vite-plugin' },
        {
          text: 'Virtual Modules',
          link: 'react/virtual-modules',
          items: [
            { text: '/:root.jsx', link: 'react/virtual-modules#root-jsx' },
            { text: '/:routes.js', link: 'react/virtual-modules#routes-js' },
            { text: '/:core.jsx', link: 'react/virtual-modules#core-jsx' },
            { text: '/:create.jsx', link: 'react/virtual-modules#create-jsx' },
            { text: '/:layouts/default.jsx', link: 'react/virtual-modules#layouts-default-jsx' },
            { text: '/:mount.js', link: 'react/virtual-modules#mount-js' },
            { text: '/:resource.js', link: 'react/virtual-modules#resource-js' }
          ]
        },
      ]
    },
  ]
}

function Guide (collapsed = false) {
  return {
    collapsed,
    text: 'Guide',
    base: '/guide/',
    items: [
      { text: 'Getting Started', link: 'getting-started',
        items: [
          { text: 'Why not a framework?', link: 'getting-started#why-not-a-framework' },
          { text: 'A quick walkthrough', link: 'getting-started#a-quick-walkthrough' },
          { text: 'Directory structure', link: 'getting-started#directory-structure' },
          { text: 'Architectural primitives', link: 'getting-started#architectural-primitives' }
        ],
      },
      { text: 'Rendering Function', link: 'rendering-function', },
      { text: 'Router Integration', link: 'router-integration', },
      { text: 'Templating Function', link: 'templating-function' },
      { text: 'Build and Deploy', link: 'build-and-deploy' },
      { text: 'Core Renderers', link: 'core-renderers' },
      { text: 'Known Limitations', link: 'known-limitations' }
    ]
  }
}

function Vue (collapsed = false) {
  return {
    collapsed,
    text: '@fastify/vue',
    base: '/vue/',
    items: [
      {
        text: 'Getting Started',
        link: 'index',
        items: [
          { text: 'Starter templates', link: 'index#starter-templates' },
          { text: 'Runtime requirements', link: 'index#runtime-requirements' },
          { text: 'Known limitations', link: 'index#known-limitations' }
        ],
      },
      {
        text: 'Project Structure',
        link: 'project-structure',
        items: [
          { text: 'Essential files', link: 'project-structure#essential-files' },
          { text: 'Smart imports', link: 'project-structure#smart-imports' },
          { text: 'Special directories', link: 'project-structure#special-directories' }
        ]
      },
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
          { text: 'The onEnter event', link: 'route-modules#the-onenter-event' }
        ],
      },
      {
        text: 'Route Context',
        link: 'route-context',
        items: [
          { text: 'Init module', link: 'route-context#init-module' },
          { text: 'Access hook', link: 'route-context#access-hook' },
          { text: 'Execution order', link: 'route-context#execution-order' }
        ]
      },
      { text: 'Route Layouts', link: 'route-layouts' },
      { text: 'Rendering Modes', link: 'rendering-modes' }
    ]
  }
}

function React (collapsed = false) {
  return {
    collapsed,
    text: '@fastify/react',
    base: '/react/',
    items: [
      {
        text: 'Getting Started',
        link: 'index',
        items: [
          { text: 'Starter templates', link: 'index#starter-templates' },
          { text: 'Runtime requirements', link: 'index#runtime-requirements' },
          { text: 'Known limitations', link: 'index#known-limitations' }
        ],
      },
      {
        text: 'Project Structure',
        link: 'project-structure',
        items: [
          { text: 'Essential files', link: 'project-structure#essential-files' },
          { text: 'Smart imports', link: 'project-structure#smart-imports' },
          { text: 'Special directories', link: 'project-structure#special-directories' }
        ]
      },
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
          { text: 'The onEnter event', link: 'route-modules#the-onenter-event' }
        ],
      },
      {
        text: 'Route Context',
        link: 'route-context',
        items: [
          { text: 'Init module', link: 'route-context#init-module' },
          { text: 'Access hook', link: 'route-context#access-hook' },
          { text: 'Execution order', link: 'route-context#execution-order' }
        ]
      },
      { text: 'Route Layouts', link: 'route-layouts' },
      { text: 'Rendering Modes', link: 'rendering-modes' }
    ]
  }
}

function Common () {
  return [
    { text: 'Configuration', base: '/config/', link: 'index' },
    { text: 'Roadmap', base: '/', link: 'roadmap' },
    { text: 'Contributing', base: '/', link: 'contributing' },
    { text: 'Sponsoring', base: '/', link: 'sponsoring' },
    { text: 'Consulting', base: '/', link: 'consulting' }
  ]
}
