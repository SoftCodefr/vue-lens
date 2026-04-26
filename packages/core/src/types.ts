export type RenderEvent = {
    type: 'render'
    component: string
    file: string
    ts: number
  }
  
  export type DebugEvent = RenderEvent