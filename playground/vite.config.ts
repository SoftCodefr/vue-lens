import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { vueDebug } from '@vue-debug/vite-plugin'

export default defineConfig({
  plugins: [
    vue(),
    vueDebug(),
  ]
})
