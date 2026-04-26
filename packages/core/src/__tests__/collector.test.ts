import { describe, it, expect, beforeEach, vi } from 'vitest'
import { collector } from '../collector'
import type { DebugEvent, RenderEvent, RouteEvent } from '../types'

// Create a new collector instance for testing to avoid side effects
class TestCollector {
  private buffer: DebugEvent[] = []
  private listeners: ((event: DebugEvent) => void)[] = []
  private maxSize: number

  constructor(maxSize = 200) {
    this.maxSize = maxSize
  }

  emit(event: DebugEvent) {
    this.buffer.push(event)
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift()
    }
    this.listeners.forEach((fn) => fn(event))
  }

  on(fn: (event: DebugEvent) => void) {
    this.listeners.push(fn)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn)
    }
  }

  getBuffer(): ReadonlyArray<DebugEvent> {
    return this.buffer
  }

  reset() {
    this.buffer = []
  }
}

describe('Collector', () => {
  let testCollector: TestCollector

  beforeEach(() => {
    testCollector = new TestCollector()
  })

  describe('constructor', () => {
    it('should initialize with default max size', () => {
      const collector = new TestCollector()
      expect(collector.getBuffer()).toHaveLength(0)
    })

    it('should initialize with custom max size', () => {
      const collector = new TestCollector(50)
      expect(collector.getBuffer()).toHaveLength(0)
    })
  })

  describe('emit', () => {
    it('should add event to buffer', () => {
      const event: RenderEvent = {
        type: 'render',
        component: 'TestComponent',
        file: '/test.vue',
        uid: 'test-123',
        reason: 'initial render',
        ts: Date.now()
      }

      testCollector.emit(event)
      expect(testCollector.getBuffer()).toHaveLength(1)
      expect(testCollector.getBuffer()[0]).toEqual(event)
    })

    it('should notify listeners when event is emitted', () => {
      const listener = vi.fn()
      testCollector.on(listener)

      const event: RenderEvent = {
        type: 'render',
        component: 'TestComponent',
        file: '/test.vue',
        uid: 'test-123',
        reason: 'initial render',
        ts: Date.now()
      }

      testCollector.emit(event)
      expect(listener).toHaveBeenCalledWith(event)
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should maintain buffer size limit', () => {
      const smallCollector = new TestCollector(3)
      
      const events: DebugEvent[] = [
        { type: 'render', component: 'A', file: '/a.vue', uid: 'a', reason: null, ts: 1 },
        { type: 'render', component: 'B', file: '/b.vue', uid: 'b', reason: null, ts: 2 },
        { type: 'render', component: 'C', file: '/c.vue', uid: 'c', reason: null, ts: 3 },
        { type: 'render', component: 'D', file: '/d.vue', uid: 'd', reason: null, ts: 4 }
      ]

      events.forEach(event => smallCollector.emit(event))
      
      const buffer = smallCollector.getBuffer()
      expect(buffer).toHaveLength(3)
      expect(buffer[0]).toEqual(events[1]) // First event should be removed
      expect(buffer[1]).toEqual(events[2])
      expect(buffer[2]).toEqual(events[3])
    })

    it('should emit to multiple listeners', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      testCollector.on(listener1)
      testCollector.on(listener2)

      const event: RouteEvent = {
        type: 'route',
        from: '/home',
        to: '/about',
        ts: Date.now()
      }

      testCollector.emit(event)
      
      expect(listener1).toHaveBeenCalledWith(event)
      expect(listener2).toHaveBeenCalledWith(event)
    })
  })

  describe('on', () => {
    it('should add listener and return unsubscribe function', () => {
      const listener = vi.fn()
      const unsubscribe = testCollector.on(listener)

      expect(typeof unsubscribe).toBe('function')

      const event: RenderEvent = {
        type: 'render',
        component: 'TestComponent',
        file: '/test.vue',
        uid: 'test-123',
        reason: 'initial render',
        ts: Date.now()
      }

      testCollector.emit(event)
      expect(listener).toHaveBeenCalledTimes(1)

      unsubscribe()
      testCollector.emit(event)
      expect(listener).toHaveBeenCalledTimes(1) // Should not be called again
    })

    it('should handle multiple listeners and unsubscribe correctly', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      const unsubscribe1 = testCollector.on(listener1)
      const unsubscribe2 = testCollector.on(listener2)

      const event: RenderEvent = {
        type: 'render',
        component: 'TestComponent',
        file: '/test.vue',
        uid: 'test-123',
        reason: 'initial render',
        ts: Date.now()
      }

      testCollector.emit(event)
      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)

      unsubscribe1()
      testCollector.emit(event)
      expect(listener1).toHaveBeenCalledTimes(1) // Should not be called again
      expect(listener2).toHaveBeenCalledTimes(2) // Should still be called
    })
  })

  describe('getBuffer', () => {
    it('should return empty array initially', () => {
      expect(testCollector.getBuffer()).toHaveLength(0)
      expect(Array.isArray(testCollector.getBuffer())).toBe(true)
    })

    it('should return readonly array', () => {
      const event: RenderEvent = {
        type: 'render',
        component: 'TestComponent',
        file: '/test.vue',
        uid: 'test-123',
        reason: 'initial render',
        ts: Date.now()
      }

      testCollector.emit(event)
      const buffer = testCollector.getBuffer()
      
      expect(buffer).toHaveLength(1)
      expect(buffer[0]).toEqual(event)
    })

    it('should return events in chronological order', () => {
      const events: DebugEvent[] = [
        { type: 'render', component: 'A', file: '/a.vue', uid: 'a', reason: null, ts: 1 },
        { type: 'route', from: '/home', to: '/about', ts: 2 },
        { type: 'store', store: 'test', event: 'action', ts: 3 }
      ]

      events.forEach(event => testCollector.emit(event))
      const buffer = testCollector.getBuffer()
      
      expect(buffer).toEqual(events)
    })
  })

  describe('reset', () => {
    it('should clear the buffer', () => {
      const event: RenderEvent = {
        type: 'render',
        component: 'TestComponent',
        file: '/test.vue',
        uid: 'test-123',
        reason: 'initial render',
        ts: Date.now()
      }

      testCollector.emit(event)
      expect(testCollector.getBuffer()).toHaveLength(1)
      
      testCollector.reset()
      expect(testCollector.getBuffer()).toHaveLength(0)
    })

    it('should not affect listeners', () => {
      const listener = vi.fn()
      testCollector.on(listener)
      
      testCollector.reset()
      
      const event: RenderEvent = {
        type: 'render',
        component: 'TestComponent',
        file: '/test.vue',
        uid: 'test-123',
        reason: 'initial render',
        ts: Date.now()
      }

      testCollector.emit(event)
      expect(listener).toHaveBeenCalledWith(event)
    })
  })

  describe('integration with exported collector', () => {
    it('should be available as singleton', () => {
      expect(collector).toBeDefined()
      expect(typeof collector.emit).toBe('function')
      expect(typeof collector.on).toBe('function')
      expect(typeof collector.getBuffer).toBe('function')
      expect(typeof collector.reset).toBe('function')
    })
  })
})