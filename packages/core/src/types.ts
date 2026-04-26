export type RenderEvent = {
  type: 'render'
  component: string
  file: string
  ts: number
}

export type RouteEvent = {
  type: 'route'
  from: string
  to: string
  ts: number
}

export type DebugEvent = RenderEvent | RouteEvent
