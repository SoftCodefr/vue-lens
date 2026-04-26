import { describe, it, expect } from 'vitest'
import type { DebugEvent, RenderEvent, RouteEvent, StoreEvent, NetworkEvent } from '../types'

describe('Types', () => {
  describe('RenderEvent', () => {
    it('should have correct structure', () => {
      const event: RenderEvent = {
        type: 'render',
        component: 'MyComponent',
        file: '/path/to/component.vue',
        uid: 'comp-123',
        reason: 'props changed',
        ts: Date.now()
      }

      expect(event.type).toBe('render')
      expect(event.component).toBe('MyComponent')
      expect(event.file).toBe('/path/to/component.vue')
      expect(event.uid).toBe('comp-123')
      expect(event.reason).toBe('props changed')
      expect(typeof event.ts).toBe('number')
    })

    it('should allow null reason', () => {
      const event: RenderEvent = {
        type: 'render',
        component: 'MyComponent',
        file: '/path/to/component.vue',
        uid: 'comp-123',
        reason: null,
        ts: Date.now()
      }

      expect(event.reason).toBeNull()
    })
  })

  describe('RouteEvent', () => {
    it('should have correct structure', () => {
      const event: RouteEvent = {
        type: 'route',
        from: '/home',
        to: '/about',
        ts: Date.now()
      }

      expect(event.type).toBe('route')
      expect(event.from).toBe('/home')
      expect(event.to).toBe('/about')
      expect(typeof event.ts).toBe('number')
    })
  })

  describe('StoreEvent', () => {
    it('should have correct structure', () => {
      const event: StoreEvent = {
        type: 'store',
        store: 'userStore',
        event: 'increment',
        ts: Date.now()
      }

      expect(event.type).toBe('store')
      expect(event.store).toBe('userStore')
      expect(event.event).toBe('increment')
      expect(typeof event.ts).toBe('number')
    })
  })

  describe('NetworkEvent', () => {
    it('should have correct structure without GraphQL', () => {
      const event: NetworkEvent = {
        type: 'network',
        method: 'GET',
        url: '/api/users',
        status: 200,
        duration: 150,
        ts: Date.now()
      }

      expect(event.type).toBe('network')
      expect(event.method).toBe('GET')
      expect(event.url).toBe('/api/users')
      expect(event.status).toBe(200)
      expect(event.duration).toBe(150)
      expect(typeof event.ts).toBe('number')
      expect(event.gql).toBeUndefined()
    })

    it('should have correct structure with GraphQL', () => {
      const event: NetworkEvent = {
        type: 'network',
        method: 'POST',
        url: '/graphql',
        status: 200,
        duration: 250,
        gql: {
          operationName: 'GetUsers',
          operationType: 'query'
        },
        ts: Date.now()
      }

      expect(event.type).toBe('network')
      expect(event.method).toBe('POST')
      expect(event.url).toBe('/graphql')
      expect(event.status).toBe(200)
      expect(event.duration).toBe(250)
      expect(event.gql).toEqual({
        operationName: 'GetUsers',
        operationType: 'query'
      })
      expect(typeof event.ts).toBe('number')
    })

    it('should allow null GraphQL fields', () => {
      const event: NetworkEvent = {
        type: 'network',
        method: 'POST',
        url: '/graphql',
        status: 200,
        duration: 250,
        gql: {
          operationName: null,
          operationType: null
        },
        ts: Date.now()
      }

      expect(event.gql?.operationName).toBeNull()
      expect(event.gql?.operationType).toBeNull()
    })
  })

  describe('DebugEvent union type', () => {
    it('should accept all event types', () => {
      const events: DebugEvent[] = [
        {
          type: 'render',
          component: 'MyComponent',
          file: '/path/to/component.vue',
          uid: 'comp-123',
          reason: 'props changed',
          ts: Date.now()
        },
        {
          type: 'route',
          from: '/home',
          to: '/about',
          ts: Date.now()
        },
        {
          type: 'store',
          store: 'userStore',
          event: 'increment',
          ts: Date.now()
        },
        {
          type: 'network',
          method: 'GET',
          url: '/api/users',
          status: 200,
          duration: 150,
          ts: Date.now()
        }
      ]

      expect(events).toHaveLength(4)
      expect(events[0].type).toBe('render')
      expect(events[1].type).toBe('route')
      expect(events[2].type).toBe('store')
      expect(events[3].type).toBe('network')
    })
  })
})