import type { Plugin } from 'vite'
import { transformSFC, transformMain } from './transform'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export interface vueLensOptions {
  router?: boolean
}

export function vueLens(options: vueLensOptions = {}): Plugin {
  return {
    name: '@softcodefr/vue-lens',
    enforce: 'pre',
    apply: 'serve',

    resolveId(id) {
      if (id === 'virtual:vue-lens-panel') return '\0virtual:vue-lens-panel'
      if (id === 'virtual:vue-lens-router') return '\0virtual:vue-lens-router'
    },

    load(id) {
      if (id === '\0virtual:vue-lens-panel') {
        return readFileSync(resolve(__dirname, 'panel.js'), 'utf-8')
      }
      if (id === '\0virtual:vue-lens-router') {
        return readFileSync(resolve(__dirname, 'router.js'), 'utf-8')
      }
    },

    transform(code, id) {
      if (id.endsWith('.vue')) {
        return transformSFC(code, id)
      }

      if (id.includes('main.ts') || id.includes('main.js')) {
        let result = `import 'virtual:vue-lens-panel'\n${code}`
        if (options.router) {
          result = transformMain(result)
        }
        return result
      }

      return null
    }
  }
}