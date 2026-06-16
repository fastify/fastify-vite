import { createHtmlTemplateFunction, removeHtmlModuleScripts } from '@fastify/vite/utils'

type TemplateFn = (data?: object) => string

export interface HtmlTemplates {
  universal: {
    beforeElement: TemplateFn
    afterElement: TemplateFn
  }
  serverOnly: {
    beforeElement: TemplateFn
    afterElement: TemplateFn
  }
}

export function createHtmlTemplates(source: string, _config?: unknown): HtmlTemplates {
  const el = '<!-- element -->'

  const universal = source.split(el)
  const serverOnly = removeHtmlModuleScripts(source).split(el)

  return {
    // Templates for client-only and universal rendering
    universal: {
      beforeElement: createHtmlTemplateFunction(universal[0]) as TemplateFn,
      afterElement: createHtmlTemplateFunction(universal[1]) as TemplateFn,
    },
    // Templates for server-only rendering
    serverOnly: {
      beforeElement: createHtmlTemplateFunction(serverOnly[0]) as TemplateFn,
      afterElement: createHtmlTemplateFunction(serverOnly[1]) as TemplateFn,
    },
  }
}
