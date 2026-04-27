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
  gql?: {
    operationName: string | null
    operationType: 'query' | 'mutation' | 'subscription' | null
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