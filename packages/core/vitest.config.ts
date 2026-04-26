import { defineConfig, mergeConfig } from 'vitest/config'
import { sharedConfig } from '../../vitest.config.shared'

export default mergeConfig(sharedConfig, defineConfig({
  test: {
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'] // Just exports, no logic to test
    }
  }
}))