import type { Plugin } from 'vite'
import { transformSFC } from './transform'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const VIRTUAL_ID = 'virtual:vue-lens-panel'
const RESOLVED_ID = '\0' + VIRTUAL_ID

const pluginDir = dirname(fileURLToPath(import.meta.url))

export function vueDebug(): Plugin {
  return {
    name: '@softcodefr/vue-lens',
    enforce: 'pre',
    apply: 'serve',

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },

    load(id) {
      if (id === RESOLVED_ID) {
        const panelPath = resolve(pluginDir, 'panel.js')
        return readFileSync(panelPath, 'utf-8')
      }
    },

    transform(code, id) {
      if (id.endsWith('.vue')) {
        return transformSFC(code, id)
      }

      if (id.includes('main.ts') || id.includes('main.js')) {
        return `import '${VIRTUAL_ID}'\n${code}`
      }

      return null
    }
  }
}