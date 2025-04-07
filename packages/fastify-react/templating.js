import { createHtmlTemplateFunction } from '@fastify/vite/utils'
import { HTMLRewriter } from 'html-rewriter-wasm'

export async function createHtmlTemplates (source, config) {
  const el = '<!-- element -->'

  const universal = source.split(el)
  const serverOnlyRaw = await removeClientModule(source, config)
  const serverOnly = serverOnlyRaw.split(el)

  return {
    // Templates for client-only and universal rendering
    universal: {
      beforeElement: await createHtmlTemplateFunction(universal[0]),
      afterElement: await createHtmlTemplateFunction(universal[1]),
    },
    // Templates for server-only rendering
    serverOnly: {
      beforeElement: await createHtmlTemplateFunction(serverOnly[0]),
      afterElement: await createHtmlTemplateFunction(serverOnly[1]),
    },
  }
}

async function removeClientModule (html, config) {
  const decoder = new TextDecoder()

  let output = ''
  const rewriter = new HTMLRewriter((outputChunk) => {
    output += decoder.decode(outputChunk)
  })

  rewriter.on('script', {
    element (element) {
      for (const [attr, value] of element.attributes) {
        if (attr === 'type' && value === 'module') {
          element.replace('')
        }
      }
    },
  })

  try {
    const encoder = new TextEncoder()
    await rewriter.write(encoder.encode(html))
    await rewriter.end()
    return output
  } finally {
    rewriter.free()
  }
}
