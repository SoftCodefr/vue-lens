export function transformSFC(code: string, id: string): string | null {
  if (!code.includes('<script setup')) return null

  const componentName = id.split('/').pop()?.replace('.vue', '') ?? 'Unknown'

  // Injection du hook de render
  const injection = `
import { onRenderTriggered, onMounted, getCurrentInstance } from 'vue'
import { collector } from '@softcodefr/vue-lens-core'

const __vlUid = Math.random().toString(36).slice(2)

onMounted(() => {
  const el = getCurrentInstance()?.proxy?.$el
  if (el?.setAttribute) el.setAttribute('data-vue-lens-id', __vlUid)
})

onRenderTriggered(() => {
  collector.emit({
    type: 'render',
    component: '${componentName}',
    file: '${id}',
    uid: __vlUid,
    ts: Date.now()
  })
})
`

  let result = code.replace(
    /(<script\s+setup[^>]*>)/,
    `$1${injection}`
  )

  // Injection de data-vue-lens sur le root element du template
  result = result.replace(
    /(<template[^>]*>\s*<)([a-zA-Z][a-zA-Z0-9-]*)/,
    `$1$2 data-vue-lens="${componentName}"`
  )

  return result
}

export function transformMain(code: string): string {
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
      'app.use(store)',
      `app.use(store)
import { setupVuex } from 'virtual:vue-lens-store'
setupVuex(store)`
    )
  }

  return code
}