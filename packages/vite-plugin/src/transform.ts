const SETUP_REGEX = /(<script\s+setup[^>]*>)/
const CLASS_REGEX = /(@Component[\s\S]*?export\s+class\s+(\w+)\s+extends\s+Vue\s*\{)/

export function transformSFC(code: string, id: string): string | null {
  if (code.includes('<script setup')) {
    return transformScriptSetup(code, id)
  }

  if (code.includes('@Component') && code.includes('extends Vue')) {
    return transformClassComponent(code, id)
  }

  return null
}

function transformScriptSetup(code: string, id: string): string {
  const componentName = id.split('/').pop()?.replace('.vue', '') ?? 'Unknown'

  // Détermine quels imports Vue sont déjà présents
  const existingVueImport = code.match(/import\s*\{([^}]+)\}\s*from\s*['"]vue['"]/)
  const existingImports = existingVueImport
    ? existingVueImport[1].split(',').map(s => s.trim())
    : []

  const toInject = ['onRenderTriggered', 'onMounted', 'getCurrentInstance']
    .filter(imp => !existingImports.includes(imp))

  const vueImportLine = toInject.length > 0
    ? `import { ${toInject.join(', ')} } from 'vue'`
    : ''

  const injection = `
${vueImportLine}
import { collector } from '@softcodefr/vue-lens-core'

const __vlUid = Math.random().toString(36).slice(2)

onMounted(() => {
  const el = getCurrentInstance()?.proxy?.$el
  if (el?.setAttribute) el.setAttribute('data-vue-lens-id', __vlUid)
})

onRenderTriggered((event: any) => {
  collector.emit({
    type: 'render',
    component: '${componentName}',
    file: '${id}',
    uid: __vlUid,
    reason: event.key ? String(event.key) : null,
    ts: Date.now()
  })
})
`

  let result = code.replace(SETUP_REGEX, `$1${injection}`)

  result = result.replace(
    /(<template[^>]*>\s*<)([a-zA-Z][a-zA-Z0-9-]*)/,
    `$1$2 data-vue-lens="${componentName}"`
  )

  return result
}

function transformClassComponent(code: string, id: string): string {
  const componentName = id.split('/').pop()?.replace('.vue', '') ?? 'Unknown'

  const imports = `
import { collector } from '@softcodefr/vue-lens-core'
`

  // Vérifie si mounted() existe déjà dans la classe
  const hasMounted = /mounted\s*\(\s*\)/.test(code)

  const uidProp = `  __vlUid = Math.random().toString(36).slice(2)\n`

  const mountedHook = hasMounted
    // Injecte l'attribution de l'uid dans le mounted() existant
    ? code.replace(
        /mounted\s*\(\s*\)\s*\{/,
        `mounted() {
    const el = this.$el
    if (el?.setAttribute) el.setAttribute('data-vue-lens-id', this.__vlUid)`
      )
    : null

  const mountedBlock = hasMounted ? '' : `
  mounted() {
    const el = this.$el
    if (el?.setAttribute) el.setAttribute('data-vue-lens-id', this.__vlUid)
  }
`

  const renderTriggered = `
  renderTriggered(event: any) {
    collector.emit({
      type: 'render',
      component: '${componentName}',
      file: '${id}',
      uid: this.__vlUid,
      reason: event.key ? String(event.key) : null,
      ts: Date.now()
    })
    if (typeof super.renderTriggered === 'function') super.renderTriggered(event)
  }
`

  // Si mounted existait, on part du code déjà modifié
  let result = hasMounted ? mountedHook! : code

  // Injecte les imports
  result = result.replace(
    /(<script[^>]*>)/,
    `$1${imports}`
  )

  // Injecte uid + mounted (si pas existant) + renderTriggered après l'ouverture de la classe
  result = result.replace(
    CLASS_REGEX,
    `$1${uidProp}${mountedBlock}${renderTriggered}`
  )

  // Injecte data-vue-lens sur le root element
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