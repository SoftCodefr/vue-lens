import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'

import { collector } from '@softcodefr/vue-lens-core'
collector.on((event) => {
  if (event.type === 'network') console.log('[vue-lens]', event)
})

const pinia = createPinia()
const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')