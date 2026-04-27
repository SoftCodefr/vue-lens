import { collector } from '@softcodefr/vue-lens-core'
import type { DebugEvent } from '@softcodefr/vue-lens-core'

export interface Instance {
  component: string
  uid: string
  count: number
  lastReason: string | null
}

export interface RouteEvent {
  from: string
  to: string
  ts: number
}

export interface StoreEvent {
  store: string
  event: string
  ts: number
}

export interface NetworkEvent {
  method: string
  url: string
  status: number
  duration: number
  gql?: { operationName: string | null; operationType: string | null }
  ts: number
}

export interface InteractionEvent {
  kind: 'click' | 'input' | 'submit'
  target: string
  component: string | null
  ts: number
}

export type TriggerEvent = InteractionEvent | NetworkEvent

export interface TimelineGroup {
  id: string
  trigger: TriggerEvent
  children: DebugEvent[]
  ts: number
}

type Listener = () => void

class PanelStore {
  instances: Record<string, Instance> = {}
  routeEvents: RouteEvent[] = []
  storeEvents: StoreEvent[] = []
  networkEvents: NetworkEvent[] = []
  timelineGroups: TimelineGroup[] = []
  private currentGroup: TimelineGroup | null = null
  private readonly WINDOW_MS = 100

  private listeners: Listener[] = []

  constructor() {
    collector.on((event: DebugEvent) => {
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
      if (event.type === 'interaction') {
        this.openGroup(event)
      }
  
      if (event.type === 'network') {
        // Network ouvre un nouveau groupe ET est ajouté comme child si un groupe est ouvert
        if (this.currentGroup && event.ts - this.currentGroup.ts <= this.WINDOW_MS) {
          this.currentGroup.children.push(event)
        } else {
          this.openGroup(event)
        }
      }
  
      if (['render', 'route', 'store'].includes(event.type)) {
        if (this.currentGroup && event.ts - this.currentGroup.ts <= this.WINDOW_MS) {
          this.currentGroup.children.push(event)
          this.timelineGroups = [...this.timelineGroups]
        }
      }
      this.notify()
    })
  }

  subscribe(fn: Listener) {
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
    this.timelineGroups = []
    this.currentGroup = null
    this.notify()
  }

  max() {
    return Math.max(1, ...Object.values(this.instances).map(i => i.count))
  }

  private openGroup(trigger: TriggerEvent) {
    const group: TimelineGroup = {
      id: Math.random().toString(36).slice(2),
      trigger,
      children: [],
      ts: trigger.ts
    }
    this.currentGroup = group
    this.timelineGroups = [group, ...this.timelineGroups].slice(0, 50)
  }
}

export const panelStore = new PanelStore()

