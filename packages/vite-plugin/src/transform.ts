export function transformSFC(code: string, id: string): string | null {
    // Only transform <script setup>
    if (!code.includes('<script setup')) return null
  
    const injection = `
  import { onRenderTriggered } from 'vue'
  import { collector } from '@vue-debug/core'
  
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
  
    // Inject after the opening of <script setup>
    return code.replace(
      /(<script\s+setup[^>]*>)/,
      `$1${filled}`
    )
  }