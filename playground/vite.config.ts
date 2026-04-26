import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { vueLens } from '@softcodefr/vue-lens-vite-plugin'

export default defineConfig({
  plugins: [vue(), vueLens({ router: true, store: true })],
})
