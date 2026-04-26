import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { vueDebug } from '@softcodefr/vue-lens-vite-plugin'

export default defineConfig({
  plugins: [
    vue(),
    vueDebug(),
  ]
})
