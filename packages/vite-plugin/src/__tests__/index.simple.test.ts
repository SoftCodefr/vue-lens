import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { VueLensOptions } from '../index'
import type { Plugin, ResolvedConfig } from 'vite'

// Create a simpler test focused on the plugin interface without complex mocking

describe('vueLens - Simple Tests', () => {
  // Import dynamically to avoid hoisting issues
  let vueLens: (options?: VueLensOptions) => Plugin

  beforeEach(async () => {
    // Dynamic import to avoid mock issues
    const module = await import('../index')
    vueLens = module.vueLens
  })

  describe('plugin configuration', () => {
    it('should return a valid Vite plugin', () => {
      const plugin = vueLens()
      
      expect(plugin).toBeDefined()
      expect(plugin.name).toBe('vue-lens')
      expect(plugin.enforce).toBe('pre')
      expect(plugin.apply).toBe('serve')
      expect(typeof plugin.configResolved).toBe('function')
      expect(typeof plugin.resolveId).toBe('function')
      expect(typeof plugin.load).toBe('function')
      expect(typeof plugin.transform).toBe('function')
    })

    it('should accept options', () => {
      const options: VueLensOptions = {
        router: true,
        store: true,
        network: true
      }
      const plugin = vueLens(options)
      
      expect(plugin).toBeDefined()
      expect(plugin.name).toBe('vue-lens')
    })

    it('should work with empty options', () => {
      const plugin = vueLens({})
      
      expect(plugin).toBeDefined()
      expect(plugin.name).toBe('vue-lens')
    })
  })

  describe('resolveId', () => {
    it('should resolve virtual module IDs', () => {
      const plugin = vueLens() as Plugin
      
      expect(plugin.resolveId!('virtual:vue-lens-panel')).toBe('\0virtual:vue-lens-panel')
      expect(plugin.resolveId!('virtual:vue-lens-router')).toBe('\0virtual:vue-lens-router')
      expect(plugin.resolveId!('virtual:vue-lens-store')).toBe('\0virtual:vue-lens-store')
      expect(plugin.resolveId!('virtual:vue-lens-network')).toBe('\0virtual:vue-lens-network')
    })

    it('should return undefined for non-virtual modules', () => {
      const plugin = vueLens() as Plugin
      
      expect(plugin.resolveId!('some-regular-module')).toBeUndefined()
    })
  })

  describe('transform', () => {
    it('should return null for non-Vue and non-main files', () => {
      const plugin = vueLens() as Plugin
      const result = plugin.transform!('some-code', 'utils.ts')
      
      expect(result).toBeNull()
    })

    it('should transform main files by adding panel import', () => {
      const plugin = vueLens({}) as Plugin
      const result = plugin.transform!('console.log("main")', 'src/main.ts')
      
      expect(result).toContain('import \'virtual:vue-lens-panel\'')
      expect(result).toContain('console.log("main")')
    })

    it('should add network setup when network option is enabled', () => {
      const plugin = vueLens({ network: true }) as Plugin
      const result = plugin.transform!('console.log("main")', 'src/main.js')
      
      expect(result).toContain('import { setupNetwork } from \'virtual:vue-lens-network\'')
      expect(result).toContain('setupNetwork()')
    })
  })
})