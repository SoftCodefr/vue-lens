import { defineConfig, mergeConfig } from 'vitest/config'
import { sharedConfig } from '../../vitest.config.shared'

export default mergeConfig(sharedConfig, defineConfig({
  test: {
    coverage: {
      include: ['src/**/*.ts'],
      exclude: [
        'src/index.ts', // Minimal logic, mostly exports
        'src/panel/index.ts', // Just exports
        'src/panel/**/*.ts' // Panel components are UI-focused, hard to test in isolation
      ]
    }
  }
}))