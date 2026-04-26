import type { Plugin, ResolvedConfig } from 'vite'
import { transformSFC, transformMain, transformMainStore } from './transform'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export interface VueLensOptions {
  router?: boolean
  store?: boolean
  network?: boolean
}


function detectStore(root: string): 'pinia' | 'vuex' | null {
  try {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'))
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    if (deps['pinia']) return 'pinia'
    if (deps['vuex']) return 'vuex'
    return null
  } catch {
    return null
  }
}

export function vueLens(options: VueLensOptions = {}): Plugin {
  let storeType: 'pinia' | 'vuex' | null = null

  return {
    name: 'vue-lens',
    enforce: 'pre',
    apply: 'serve',

    configResolved(config: ResolvedConfig) {
      if (options.store) {
        storeType = detectStore(config.root)
        if (storeType) {
          console.log(`[vue-lens] store detected: ${storeType}`)
        } else {
          console.warn('[vue-lens] store: true but no pinia or vuex found in package.json')
        }
      }
    },

    resolveId(id) {
      if (id === 'virtual:vue-lens-panel') return '\0virtual:vue-lens-panel'
      if (id === 'virtual:vue-lens-router') return '\0virtual:vue-lens-router'
      if (id === 'virtual:vue-lens-store') return '\0virtual:vue-lens-store'
      if (id === 'virtual:vue-lens-network') return '\0virtual:vue-lens-network'
    },

    load(id) {
      if (id === '\0virtual:vue-lens-panel') {
        return readFileSync(resolve(__dirname, 'panel/index.js'), 'utf-8')
      }
      if (id === '\0virtual:vue-lens-router') {
        return readFileSync(resolve(__dirname, 'router.js'), 'utf-8')
      }
      if (id === '\0virtual:vue-lens-store') {
        return readFileSync(resolve(__dirname, 'store.js'), 'utf-8')
      }
      if (id === '\0virtual:vue-lens-network') {
        return readFileSync(resolve(__dirname, 'network.js'), 'utf-8')
      }
    },

    transform(code, id) {
      if (id.endsWith('.vue')) {
        return transformSFC(code, id)
      }

      if (id.includes('main.ts') || id.includes('main.js')) {
        let result = `import 'virtual:vue-lens-panel'\n${code}`
        if (options.router) result = transformMain(result)
        if (options.store && storeType) result = transformMainStore(result, storeType)
        if (options.network) result = `import { setupNetwork } from 'virtual:vue-lens-network'\nsetupNetwork()\n${result}`
        return result
      }

      return null
    }
  }
}