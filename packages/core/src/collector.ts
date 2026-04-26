import type { DebugEvent } from './types'

type Listener = (event: DebugEvent) => void

class Collector {
  private buffer: DebugEvent[] = []
  private listeners: Listener[] = []
  private maxSize: number

  constructor(maxSize = 200) {
    this.maxSize = maxSize
  }

  emit(event: DebugEvent) {
    this.buffer.push(event)
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift()
    }
    this.listeners.forEach(fn => fn(event))
  }

  on(fn: Listener) {
    this.listeners.push(fn)
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn)
    }
  }

  getBuffer(): ReadonlyArray<DebugEvent> {
    return this.buffer
  }

  reset() {
    this.buffer = []
  }
}

export const collector = new Collector()