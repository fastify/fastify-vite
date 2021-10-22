import { pathExists } from 'fs-extra'

const pluginData = {}

export default {
  name: 'fastify-vite-vue',
  config (config, { command }) {
    pluginData.root = config.root
  },
  resolveId (id)  {
    if (id === virtualFileId) {
      return virtualFileId
    }
  },
  load(id) {
    if (id === virtualFileId) {
      return `export const msg = "from virtual file"`
    }
  }
}