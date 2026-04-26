import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { statusColor, methodColor, shortUrl, highlight, clearHighlight } from '../utils'

// Mock DOM methods
Object.defineProperty(window, 'URL', {
  writable: true,
  value: class URL {
    pathname: string
    constructor(url: string) {
      // Simple mock implementation
      if (url.includes('://')) {
        const parts = url.split('/')
        this.pathname = '/' + parts.slice(3).join('/')
      } else {
        throw new Error('Invalid URL')
      }
    }
  }
})

describe('utils', () => {
  describe('statusColor', () => {
    it('should return red for 5xx status codes', () => {
      expect(statusColor(500)).toBe('#ef4444')
      expect(statusColor(503)).toBe('#ef4444')
      expect(statusColor(599)).toBe('#ef4444')
    })

    it('should return orange for 4xx status codes', () => {
      expect(statusColor(400)).toBe('#f97316')
      expect(statusColor(404)).toBe('#f97316')
      expect(statusColor(499)).toBe('#f97316')
    })

    it('should return yellow for 3xx status codes', () => {
      expect(statusColor(300)).toBe('#facc15')
      expect(statusColor(301)).toBe('#facc15')
      expect(statusColor(399)).toBe('#facc15')
    })

    it('should return green for 2xx and 1xx status codes', () => {
      expect(statusColor(200)).toBe('#22c55e')
      expect(statusColor(201)).toBe('#22c55e')
      expect(statusColor(299)).toBe('#22c55e')
      expect(statusColor(100)).toBe('#22c55e')
      expect(statusColor(199)).toBe('#22c55e')
    })
  })

  describe('methodColor', () => {
    it('should return correct colors for HTTP methods', () => {
      expect(methodColor('GET')).toBe('#22c55e')
      expect(methodColor('POST')).toBe('#a78bfa')
      expect(methodColor('PUT')).toBe('#facc15')
      expect(methodColor('PATCH')).toBe('#fb923c')
      expect(methodColor('DELETE')).toBe('#ef4444')
    })

    it('should return default color for unknown methods', () => {
      expect(methodColor('OPTIONS')).toBe('#6b7280')
      expect(methodColor('HEAD')).toBe('#6b7280')
      expect(methodColor('UNKNOWN')).toBe('#6b7280')
    })

    it('should be case sensitive', () => {
      expect(methodColor('get')).toBe('#6b7280')
      expect(methodColor('post')).toBe('#6b7280')
    })
  })

  describe('shortUrl', () => {
    it('should extract pathname from valid URLs', () => {
      expect(shortUrl('https://example.com/api/users')).toBe('/api/users')
      expect(shortUrl('http://localhost:3000/test/path')).toBe('/test/path')
      expect(shortUrl('https://api.example.com/v1/users/123')).toBe('/v1/users/123')
    })

    it('should return root path for domain-only URLs', () => {
      expect(shortUrl('https://example.com')).toBe('/')
      expect(shortUrl('http://localhost:3000')).toBe('/')
    })

    it('should return original string for invalid URLs', () => {
      expect(shortUrl('/api/users')).toBe('/api/users')
      expect(shortUrl('invalid-url')).toBe('invalid-url')
      expect(shortUrl('')).toBe('')
    })
  })

  describe('DOM manipulation functions', () => {
    beforeEach(() => {
      // Reset document.body
      document.body.innerHTML = ''
      
      // Mock getBoundingClientRect
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        top: 100,
        left: 200,
        width: 300,
        height: 150,
        bottom: 250,
        right: 500,
        x: 200,
        y: 100,
        toJSON: vi.fn()
      }))
    })

    afterEach(() => {
      document.body.innerHTML = ''
      vi.restoreAllMocks()
    })

    describe('highlight', () => {
      it('should create highlight overlay when element is found', () => {
        // Create a target element
        const targetElement = document.createElement('div')
        targetElement.setAttribute('data-vue-lens-id', 'test-uid')
        document.body.appendChild(targetElement)

        const highlightEls: HTMLElement[] = []
        
        highlight('test-uid', 'TestComponent', highlightEls)

        expect(highlightEls).toHaveLength(1)
        expect(document.body.children).toHaveLength(2) // target + overlay
        
        const overlay = highlightEls[0]
        expect(overlay.style.position).toBe('fixed')
        expect(overlay.style.top).toBe('100px')
        expect(overlay.style.left).toBe('200px')
        expect(overlay.style.width).toBe('300px')
        expect(overlay.style.height).toBe('150px')
        
        // Check label
        const label = overlay.children[0] as HTMLElement
        expect(label.textContent).toBe('<TestComponent/>')
      })

      it('should not create overlay when element is not found', () => {
        const highlightEls: HTMLElement[] = []
        
        highlight('non-existent-uid', 'TestComponent', highlightEls)

        expect(highlightEls).toHaveLength(0)
        expect(document.body.children).toHaveLength(0)
      })

      it('should clear previous highlights before adding new one', () => {
        // Create target element
        const targetElement = document.createElement('div')
        targetElement.setAttribute('data-vue-lens-id', 'test-uid')
        document.body.appendChild(targetElement)

        const highlightEls: HTMLElement[] = []
        
        // Add some existing highlight elements
        const existingHighlight = document.createElement('div')
        document.body.appendChild(existingHighlight)
        highlightEls.push(existingHighlight)

        highlight('test-uid', 'TestComponent', highlightEls)

        // Should have cleared the existing highlight and added a new one
        expect(highlightEls).toHaveLength(1)
        expect(document.body.contains(existingHighlight)).toBe(false)
      })
    })

    describe('clearHighlight', () => {
      it('should remove all highlight elements', () => {
        const highlightEls: HTMLElement[] = []
        
        // Create some highlight elements
        const highlight1 = document.createElement('div')
        const highlight2 = document.createElement('div')
        
        document.body.appendChild(highlight1)
        document.body.appendChild(highlight2)
        highlightEls.push(highlight1, highlight2)

        expect(document.body.children).toHaveLength(2)
        expect(highlightEls).toHaveLength(2)

        clearHighlight(highlightEls)

        expect(document.body.children).toHaveLength(0)
        expect(highlightEls).toHaveLength(0)
      })

      it('should handle empty highlight array', () => {
        const highlightEls: HTMLElement[] = []
        
        expect(() => clearHighlight(highlightEls)).not.toThrow()
        expect(highlightEls).toHaveLength(0)
      })

      it('should not affect non-highlight elements', () => {
        const highlightEls: HTMLElement[] = []
        
        // Create a non-highlight element
        const otherElement = document.createElement('div')
        document.body.appendChild(otherElement)
        
        // Create highlight elements
        const highlight1 = document.createElement('div')
        document.body.appendChild(highlight1)
        highlightEls.push(highlight1)

        clearHighlight(highlightEls)

        expect(document.body.children).toHaveLength(1)
        expect(document.body.contains(otherElement)).toBe(true)
        expect(document.body.contains(highlight1)).toBe(false)
      })
    })
  })
})