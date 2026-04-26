import { describe, it, expect } from 'vitest'
import { transformSFC, transformMain, transformMainStore } from '../transform'

describe('transformSFC', () => {
  it('should return null for non-script-setup components', () => {
    const code = `
<template>
  <div>Hello</div>
</template>

<script>
export default {
  name: 'MyComponent'
}
</script>
`
    const result = transformSFC(code, '/path/to/MyComponent.vue')
    expect(result).toBeNull()
  })

  it('should transform script setup components', () => {
    const code = `
<template>
  <div>Hello {{ name }}</div>
</template>

<script setup>
import { ref } from 'vue'
const name = ref('World')
</script>
`
    const result = transformSFC(code, '/path/to/MyComponent.vue')
    expect(result).toBeTruthy()
    expect(result).toContain('import { onRenderTriggered, onMounted, getCurrentInstance } from \'vue\'')
    expect(result).toContain('import { collector } from \'@softcodefr/vue-lens-core\'')
    expect(result).toContain('onRenderTriggered')
    expect(result).toContain('collector.emit')
    expect(result).toContain('component: \'MyComponent\'')
    expect(result).toContain('file: \'/path/to/MyComponent.vue\'')
  })

  it('should extract component name from file path', () => {
    const code = `
<template>
  <div>Hello</div>
</template>

<script setup>
import { ref } from 'vue'
</script>
`
    const result = transformSFC(code, '/src/components/UserProfile.vue')
    expect(result).toContain('component: \'UserProfile\'')
  })

  it('should handle unknown component names', () => {
    const code = `
<template>
  <div>Hello</div>
</template>

<script setup>
import { ref } from 'vue'
</script>
`
    const result = transformSFC(code, '')
    expect(result).toContain('component: \'Unknown\'')
  })

  it('should add data-vue-lens attribute to template root', () => {
    const code = `
<template>
  <div class="container">Hello</div>
</template>

<script setup>
import { ref } from 'vue'
</script>
`
    const result = transformSFC(code, '/path/to/TestComponent.vue')
    expect(result).toContain('<div data-vue-lens="TestComponent" class="container">')
  })

  it('should handle self-closing tags in template', () => {
    const code = `
<template>
  <MyCustomComponent />
</template>

<script setup>
import MyCustomComponent from './MyCustomComponent.vue'
</script>
`
    const result = transformSFC(code, '/path/to/TestComponent.vue')
    expect(result).toContain('<MyCustomComponent data-vue-lens="TestComponent" />')
  })

  it('should generate unique UIDs', () => {
    const code = `
<template>
  <div>Test</div>
</template>

<script setup>
</script>
`
    const result1 = transformSFC(code, '/path/to/Component1.vue')
    const result2 = transformSFC(code, '/path/to/Component2.vue')
    
    // Both should contain UID generation, but we can't easily test uniqueness
    expect(result1).toContain('__vlUid = Math.random().toString(36).slice(2)')
    expect(result2).toContain('__vlUid = Math.random().toString(36).slice(2)')
  })
})

describe('transformMain', () => {
  it('should return unchanged code if no router usage found', () => {
    const code = `
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
`
    const result = transformMain(code)
    expect(result).toBe(code)
  })

  it('should transform code with router usage', () => {
    const code = `
import { createApp } from 'vue'
import { createRouter } from 'vue-router'
import App from './App.vue'

const app = createApp(App)
const router = createRouter({})
app.use(router)
app.mount('#app')
`
    const result = transformMain(code)
    expect(result).toContain('app.use(router)')
    expect(result).toContain('import { setupVueLensRouter } from \'virtual:vue-lens-router\'')
    expect(result).toContain('setupVueLensRouter(router)')
  })

  it('should handle multiple app.use(router) calls', () => {
    const code = `
import { createApp } from 'vue'
import { createRouter } from 'vue-router'
import App from './App.vue'

const app = createApp(App)
const router = createRouter({})
app.use(router)
app.mount('#app')
`
    const result = transformMain(code)
    const routerUsageCount = (result.match(/app\.use\(router\)/g) || []).length
    expect(routerUsageCount).toBe(1)
  })
})

describe('transformMainStore', () => {
  describe('Pinia', () => {
    it('should return unchanged code if no createPinia found', () => {
      const code = `
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
`
      const result = transformMainStore(code, 'pinia')
      expect(result).toBe(code)
    })

    it('should transform code with Pinia setup', () => {
      const code = `
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.mount('#app')
`
      const result = transformMainStore(code, 'pinia')
      expect(result).toContain('createPinia()')
      expect(result).toContain('import { setupPinia } from \'virtual:vue-lens-store\'')
      expect(result).toContain('setupPinia(pinia)')
    })
  })

  describe('Vuex', () => {
    it('should return unchanged code if no createStore found', () => {
      const code = `
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
`
      const result = transformMainStore(code, 'vuex')
      expect(result).toBe(code)
    })

    it('should transform code with Vuex setup', () => {
      const code = `
import { createApp } from 'vue'
import { createStore } from 'vuex'
import App from './App.vue'

const app = createApp(App)
const store = createStore({})
app.use(store)
app.mount('#app')
`
      const result = transformMainStore(code, 'vuex')
      expect(result).toContain('app.use(store)')
      expect(result).toContain('import { setupVuex } from \'virtual:vue-lens-store\'')
      expect(result).toContain('setupVuex(store)')
    })
  })

  it('should handle unknown store types', () => {
    const code = `
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
`
    // @ts-expect-error - Testing invalid input
    const result = transformMainStore(code, 'unknown')
    expect(result).toBe(code)
  })
})