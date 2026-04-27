export type RenderEvent = {
  type: 'render'
  component: string
  file: string
  uid: string
  reason: string | null
  ts: number
}

export type RouteEvent = {
  type: 'route'
  from: string
  to: string
  ts: number
}

export type StoreEvent = {
  type: 'store'
  store: string
  event: string
  ts: number
}

export type NetworkEvent = {
  type: 'network'
  method: string
  url: string
  status: number
  duration: number
  callKey: string
  gql?: {
    operationName: string | null
    operationType: 'query' | 'mutation' | 'subscription' | null
    variables?: Record<string, unknown>
  }
  ts: number
}

export type InteractionEvent = {
  type: 'interaction'
  kind: 'click' | 'input' | 'submit'
  target: string
  component: string | null
  ts: number
}

export type DebugEvent = RenderEvent | RouteEvent | StoreEvent | NetworkEvent | InteractionEvent