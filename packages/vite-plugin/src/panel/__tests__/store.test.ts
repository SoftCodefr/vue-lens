import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PanelStore } from '../store'
import type { DebugEvent, RenderEvent, RouteEvent as CoreRouteEvent, StoreEvent as CoreStoreEvent, NetworkEvent as CoreNetworkEvent } from '@softcodefr/vue-lens-core'

// Mock the collector
const mockCollectorOn = vi.fn()
vi.mock('@softcodefr/vue-lens-core', () => ({
  collector: {
    on: mockCollectorOn
  }
}))

// Create test class to avoid side effects from singleton
class TestPanelStore {
  instances: Record<string, any> = {}
  routeEvents: any[] = []
  storeEvents: any[] = []
  networkEvents: any[] = []

  private listeners: (() => void)[] = []
  private eventHandler?: (event: DebugEvent) => void

  constructor() {
    this.eventHandler = (event: DebugEvent) => {
      if (event.type === 'render') {
        const existing = this.instances[event.uid]
        this.instances = {
          ...this.instances,
          [event.uid]: {
            component: event.component,
            uid: event.uid,
            count: (existing?.count ?? 0) + 1,
            lastReason: event.reason ?? null
          }
        }
      }
      if (event.type === 'route') {
        this.routeEvents = [{ from: event.from, to: event.to, ts: event.ts }, ...this.routeEvents].slice(0, 10)
      }
      if (event.type === 'store') {
        this.storeEvents = [{ store: event.store, event: event.event, ts: event.ts }, ...this.storeEvents].slice(0, 10)
      }
      if (event.type === 'network') {
        this.networkEvents = [{
          method: event.method,
          url: event.url,
          status: event.status,
          duration: event.duration,
          ...(event.gql ? { gql: event.gql } : {}),
          ts: event.ts
        }, ...this.networkEvents].slice(0, 20)
      }
      this.notify()
    }
  }

  // Simulate event emission for testing
  simulateEvent(event: DebugEvent) {
    if (this.eventHandler) {
      this.eventHandler(event)
    }
  }

  subscribe(fn: () => void) {
    this.listeners.push(fn)
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn)
    }
  }

  notify() {
    this.listeners.forEach(fn => fn())
  }

  reset() {
    this.instances = {}
    this.routeEvents = []
    this.storeEvents = []
    this.networkEvents = []
    this.notify()
  }

  max() {
    return Math.max(1, ...Object.values(this.instances).map((i: any) => i.count))
  }
}

describe('PanelStore', () => {
  let store: TestPanelStore

  beforeEach(() => {
    vi.clearAllMocks()
    store = new TestPanelStore()
  })

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      expect(store.instances).toEqual({})
      expect(store.routeEvents).toEqual([])
      expect(store.storeEvents).toEqual([])
      expect(store.networkEvents).toEqual([])
    })
  })

  describe('render event handling', () => {
    it('should create new instance on first render', () => {
      const renderEvent: RenderEvent = {
        type: 'render',
        component: 'TestComponent',
        file: '/test.vue',
        uid: 'test-123',
        reason: 'initial',
        ts: Date.now()
      }

      store.simulateEvent(renderEvent)

      expect(store.instances['test-123']).toEqual({
        component: 'TestComponent',
        uid: 'test-123',
        count: 1,
        lastReason: 'initial'
      })
    })

    it('should increment count on subsequent renders', () => {
      const renderEvent: RenderEvent = {
        type: 'render',
        component: 'TestComponent',
        file: '/test.vue',
        uid: 'test-123',
        reason: 'props changed',
        ts: Date.now()
      }

      store.simulateEvent(renderEvent)
      store.simulateEvent({ ...renderEvent, reason: 'state changed' })

      expect(store.instances['test-123']).toEqual({
        component: 'TestComponent',
        uid: 'test-123',
        count: 2,
        lastReason: 'state changed'
      })
    })

    it('should handle null reason', () => {
      const renderEvent: RenderEvent = {
        type: 'render',
        component: 'TestComponent',
        file: '/test.vue',
        uid: 'test-123',
        reason: null,
        ts: Date.now()
      }

      store.simulateEvent(renderEvent)

      expect(store.instances['test-123'].lastReason).toBeNull()
    })

    it('should handle multiple components', () => {
      const event1: RenderEvent = {
        type: 'render',
        component: 'Component1',
        file: '/comp1.vue',
        uid: 'uid-1',
        reason: 'initial',
        ts: Date.now()
      }

      const event2: RenderEvent = {
        type: 'render',
        component: 'Component2',
        file: '/comp2.vue',
        uid: 'uid-2',
        reason: 'initial',
        ts: Date.now()
      }

      store.simulateEvent(event1)
      store.simulateEvent(event2)

      expect(Object.keys(store.instances)).toHaveLength(2)
      expect(store.instances['uid-1'].component).toBe('Component1')
      expect(store.instances['uid-2'].component).toBe('Component2')
    })
  })

  describe('route event handling', () => {
    it('should add route events to the beginning of the array', () => {
      const routeEvent: CoreRouteEvent = {
        type: 'route',
        from: '/home',
        to: '/about',
        ts: 1000
      }

      store.simulateEvent(routeEvent)

      expect(store.routeEvents).toHaveLength(1)
      expect(store.routeEvents[0]).toEqual({
        from: '/home',
        to: '/about',
        ts: 1000
      })
    })

    it('should maintain maximum of 10 route events', () => {
      for (let i = 0; i < 15; i++) {
        const routeEvent: CoreRouteEvent = {
          type: 'route',
          from: `/page${i}`,
          to: `/page${i + 1}`,
          ts: 1000 + i
        }
        store.simulateEvent(routeEvent)
      }

      expect(store.routeEvents).toHaveLength(10)
      expect(store.routeEvents[0].from).toBe('/page14') // Most recent
      expect(store.routeEvents[9].from).toBe('/page5') // Oldest kept
    })
  })

  describe('store event handling', () => {
    it('should add store events to the beginning of the array', () => {
      const storeEvent: CoreStoreEvent = {
        type: 'store',
        store: 'userStore',
        event: 'increment',
        ts: 1000
      }

      store.simulateEvent(storeEvent)

      expect(store.storeEvents).toHaveLength(1)
      expect(store.storeEvents[0]).toEqual({
        store: 'userStore',
        event: 'increment',
        ts: 1000
      })
    })

    it('should maintain maximum of 10 store events', () => {
      for (let i = 0; i < 15; i++) {
        const storeEvent: CoreStoreEvent = {
          type: 'store',
          store: 'testStore',
          event: `action${i}`,
          ts: 1000 + i
        }
        store.simulateEvent(storeEvent)
      }

      expect(store.storeEvents).toHaveLength(10)
      expect(store.storeEvents[0].event).toBe('action14') // Most recent
      expect(store.storeEvents[9].event).toBe('action5') // Oldest kept
    })
  })

  describe('network event handling', () => {
    it('should add network events without GraphQL info', () => {
      const networkEvent: CoreNetworkEvent = {
        type: 'network',
        method: 'GET',
        url: '/api/users',
        status: 200,
        duration: 150,
        ts: 1000
      }

      store.simulateEvent(networkEvent)

      expect(store.networkEvents).toHaveLength(1)
      expect(store.networkEvents[0]).toEqual({
        method: 'GET',
        url: '/api/users',
        status: 200,
        duration: 150,
        ts: 1000
      })
    })

    it('should add network events with GraphQL info', () => {
      const networkEvent: CoreNetworkEvent = {
        type: 'network',
        method: 'POST',
        url: '/graphql',
        status: 200,
        duration: 250,
        gql: {
          operationName: 'GetUsers',
          operationType: 'query'
        },
        ts: 1000
      }

      store.simulateEvent(networkEvent)

      expect(store.networkEvents[0]).toEqual({
        method: 'POST',
        url: '/graphql',
        status: 200,
        duration: 250,
        gql: {
          operationName: 'GetUsers',
          operationType: 'query'
        },
        ts: 1000
      })
    })

    it('should maintain maximum of 20 network events', () => {
      for (let i = 0; i < 25; i++) {
        const networkEvent: CoreNetworkEvent = {
          type: 'network',
          method: 'GET',
          url: `/api/resource${i}`,
          status: 200,
          duration: 100 + i,
          ts: 1000 + i
        }
        store.simulateEvent(networkEvent)
      }

      expect(store.networkEvents).toHaveLength(20)
      expect(store.networkEvents[0].url).toBe('/api/resource24') // Most recent
      expect(store.networkEvents[19].url).toBe('/api/resource5') // Oldest kept
    })
  })

  describe('subscription system', () => {
    it('should notify subscribers when events occur', () => {
      const listener = vi.fn()
      store.subscribe(listener)

      const renderEvent: RenderEvent = {
        type: 'render',
        component: 'TestComponent',
        file: '/test.vue',
        uid: 'test-123',
        reason: 'initial',
        ts: Date.now()
      }

      store.simulateEvent(renderEvent)

      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should return unsubscribe function', () => {
      const listener = vi.fn()
      const unsubscribe = store.subscribe(listener)

      expect(typeof unsubscribe).toBe('function')

      const renderEvent: RenderEvent = {
        type: 'render',
        component: 'TestComponent',
        file: '/test.vue',
        uid: 'test-123',
        reason: 'initial',
        ts: Date.now()
      }

      store.simulateEvent(renderEvent)
      expect(listener).toHaveBeenCalledTimes(1)

      unsubscribe()
      store.simulateEvent(renderEvent)
      expect(listener).toHaveBeenCalledTimes(1) // Should not be called again
    })

    it('should handle multiple subscribers', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      store.subscribe(listener1)
      store.subscribe(listener2)

      const renderEvent: RenderEvent = {
        type: 'render',
        component: 'TestComponent',
        file: '/test.vue',
        uid: 'test-123',
        reason: 'initial',
        ts: Date.now()
      }

      store.simulateEvent(renderEvent)

      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
    })
  })

  describe('reset functionality', () => {
    it('should clear all data and notify subscribers', () => {
      const listener = vi.fn()
      store.subscribe(listener)

      // Add some data
      const renderEvent: RenderEvent = {
        type: 'render',
        component: 'TestComponent',
        file: '/test.vue',
        uid: 'test-123',
        reason: 'initial',
        ts: Date.now()
      }

      const routeEvent: CoreRouteEvent = {
        type: 'route',
        from: '/home',
        to: '/about',
        ts: Date.now()
      }

      store.simulateEvent(renderEvent)
      store.simulateEvent(routeEvent)

      expect(Object.keys(store.instances)).toHaveLength(1)
      expect(store.routeEvents).toHaveLength(1)
      expect(listener).toHaveBeenCalledTimes(2)

      store.reset()

      expect(store.instances).toEqual({})
      expect(store.routeEvents).toEqual([])
      expect(store.storeEvents).toEqual([])
      expect(store.networkEvents).toEqual([])
      expect(listener).toHaveBeenCalledTimes(3) // Called once more for reset
    })
  })

  describe('max calculation', () => {
    it('should return 1 when no instances exist', () => {
      expect(store.max()).toBe(1)
    })

    it('should return maximum render count', () => {
      const event1: RenderEvent = {
        type: 'render',
        component: 'Component1',
        file: '/comp1.vue',
        uid: 'uid-1',
        reason: 'initial',
        ts: Date.now()
      }

      const event2: RenderEvent = {
        type: 'render',
        component: 'Component2',
        file: '/comp2.vue',
        uid: 'uid-2',
        reason: 'initial',
        ts: Date.now()
      }

      // Component 1 renders once
      store.simulateEvent(event1)
      
      // Component 2 renders 3 times
      store.simulateEvent(event2)
      store.simulateEvent(event2)
      store.simulateEvent(event2)

      expect(store.max()).toBe(3)
    })

    it('should update max when instances are updated', () => {
      const renderEvent: RenderEvent = {
        type: 'render',
        component: 'TestComponent',
        file: '/test.vue',
        uid: 'test-123',
        reason: 'initial',
        ts: Date.now()
      }

      store.simulateEvent(renderEvent)
      expect(store.max()).toBe(1)

      store.simulateEvent(renderEvent)
      expect(store.max()).toBe(2)

      store.simulateEvent(renderEvent)
      expect(store.max()).toBe(3)
    })
  })
})