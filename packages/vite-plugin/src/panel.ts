import { collector } from '@softcodefr/vue-lens-core'
import type { DebugEvent } from '@softcodefr/vue-lens-core'

const counts: Record<string, number> = {}
const listeners: Array<() => void> = []

collector.on((event: DebugEvent) => {
  if (event.type !== 'render') return
  counts[event.component] = (counts[event.component] ?? 0) + 1
  listeners.forEach(fn => fn())
})

function subscribe(fn: () => void) {
  listeners.push(fn)
  return () => {
    const i = listeners.indexOf(fn)
    if (i > -1) listeners.splice(i, 1)
  }
}

function mount() {
  const el = document.createElement('div')
  el.id = '__vue-debug-panel__'
  el.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 99999;
    font-family: monospace;
    font-size: 12px;
    background: rgba(10,10,12,0.95);
    border: 1px solid #222;
    border-radius: 10px;
    padding: 12px;
    min-width: 220px;
    max-height: 400px;
    overflow-y: auto;
    color: #e2e0d8;
    backdrop-filter: blur(8px);
  `
  document.body.appendChild(el)

  function render() {
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
    const max = Math.max(1, ...entries.map(e => e[1]))

    el.innerHTML = `
      <div style="color:#555;letter-spacing:0.1em;text-transform:uppercase;font-size:10px;margin-bottom:10px">
        ● SoftCode/vue-lens
      </div>
      ${entries.map(([name, count]) => {
        const pct = Math.round((count / max) * 100)
        const color = pct > 70 ? '#f97316' : pct > 30 ? '#a78bfa' : '#6b7280'
        return `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="color:#888;flex:1">&lt;${name}/&gt;</span>
            <div style="width:40px;height:3px;background:#1a1a1e;border-radius:2px">
              <div style="width:${pct}%;height:100%;background:${color};border-radius:2px"></div>
            </div>
            <span style="color:${color};min-width:24px;text-align:right">${count}</span>
          </div>
        `
      }).join('')}
    `
  }

  render()
  subscribe(render)
}

mount()