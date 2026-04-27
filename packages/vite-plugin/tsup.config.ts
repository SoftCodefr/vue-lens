import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/panel/index.ts',
    'src/panel/timeline/index.ts',
    'src/router.ts',
    'src/store.ts',
    'src/network.ts',
    'src/interaction.ts'
  ],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false, // Désactive le code splitting
  sourcemap: false,
  clean: true,
  minify: false,
  bundle: true,
  external: ['vite', 'vue'] // Externalise les dépendances peer
})