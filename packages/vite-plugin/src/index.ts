import type { Plugin } from 'vite'
import { transformSFC } from './transform'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function vueDebug(): Plugin {
  return {
    name: 'vue-debug',
    enforce: 'pre',
    apply: 'serve',

    resolveId(id) {
      if (id === 'virtual:vue-debug-panel') return '\0virtual:vue-debug-panel'
    },

    load(id) {
      if (id === '\0virtual:vue-debug-panel') {
        const panelPath = resolve(__dirname, 'panel.js')
        return readFileSync(panelPath, 'utf-8')
      }
    },

    transform(code, id) {
      if (id.endsWith('.vue')) {
        return transformSFC(code, id)
      }

      if (id.includes('main.ts') || id.includes('main.js')) {
        return `import 'virtual:vue-debug-panel'\n${code}`
      }

      return null
    }
  }
}