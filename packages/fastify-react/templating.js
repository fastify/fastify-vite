import { createHtmlTemplateFunction } from '@fastify/vite/utils'
import { HTMLRewriter } from 'html-rewriter-wasm'

export async function createHtmlTemplates (source, config) {
  const serverOnly = await removeClientModule(source, config)

  return {
    // Templates for client-only and universal rendering
    universal: await createHtmlTemplateFunction(source),
    // Templates for server-only rendering
    serverOnly: await createHtmlTemplateFunction(serverOnly)
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
