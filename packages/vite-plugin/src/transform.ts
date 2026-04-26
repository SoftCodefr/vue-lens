export function transformSFC(code: string, id: string): string | null {
  if (!code.includes('<script setup')) return null

  const injection = `
import { onRenderTriggered } from 'vue'
import { collector } from '@softcodefr/vue-lens-core'

onRenderTriggered(() => {
  collector.emit({
    type: 'render',
    component: '__COMPONENT_NAME__',
    file: '__COMPONENT_FILE__',
    ts: Date.now()
  })
})
`

  const componentName = id.split('/').pop()?.replace('.vue', '') ?? 'Unknown'
  const filled = injection
    .replace('__COMPONENT_NAME__', componentName)
    .replace('__COMPONENT_FILE__', id)

  return code.replace(
    /(<script\s+setup[^>]*>)/,
    `$1${filled}`
  )
}

export function transformMain(code: string): string {
  // Détecte app.use(router) et injecte setupVueDebugRouter juste après
  if (!code.includes('app.use(router)')) return code

  return code.replace(
    'app.use(router)',
    `app.use(router)
import { setupVueLensRouter } from 'virtual:vue-lens-router'
setupVueLensRouter(router)`
  )
}

export function transformMainStore(code: string, storeType: 'pinia' | 'vuex'): string {
  if (storeType === 'pinia') {
    if (!code.includes('createPinia()')) return code
    return code.replace(
      'createPinia()',
      `createPinia()
import { setupPinia } from 'virtual:vue-lens-store'
setupPinia(pinia)`
    )
  }

  if (storeType === 'vuex') {
    if (!code.includes('createStore(')) return code
    return code.replace(
      'createStore(',
      `createStore(`
    ).replace(
      'app.use(store)',
      `app.use(store)
import { setupVuex } from 'virtual:vue-lens-store'
setupVuex(store)`
    )
  }

  return code
}
