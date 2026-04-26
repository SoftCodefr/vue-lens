import { collector } from '@softcodefr/vue-lens-core'
import type { DebugEvent } from '@softcodefr/vue-lens-core'

const renderCounts: Record<string, number> = {}
const routeEvents: Array<{ from: string; to: string; ts: number }> = []
const listeners: Array<() => void> = []

collector.on((event: DebugEvent) => {
  if (event.type === 'render') {
    renderCounts[event.component] = (renderCounts[event.component] ?? 0) + 1
  }
  if (event.type === 'route') {
    routeEvents.unshift({ from: event.from, to: event.to, ts: event.ts })
    if (routeEvents.length > 10) routeEvents.pop()
  }
  listeners.forEach(fn => fn())
})

function subscribe(fn: () => void) {
  listeners.push(fn)
  return () => {
    const i = listeners.indexOf(fn)
    if (i > -1) listeners.splice(i, 1)
  }
}

function max() {
  return Math.max(1, ...Object.values(renderCounts))
}

function entries(counts: Record<string, number>, maxVal: number) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => [name, count, Math.round((count / maxVal) * 100)] as const)
}

type Tab = 'renders' | 'routes'
let activeTab: Tab = 'renders'
let isOpen = true

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
    min-width: 260px;
    color: #e2e0d8;
    backdrop-filter: blur(8px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `

  const style = document.createElement('style')
  style.textContent = `
    @keyframes vl-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.3; transform: scale(0.7); }
    }
  `
  document.head.appendChild(style)
  document.body.appendChild(el)

  el.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.dataset.tab) {
      activeTab = target.dataset.tab as Tab
      render()
    }
    if (target.dataset.toggle !== undefined) {
      isOpen = !isOpen
      render()
    }
  })

  function render() {
    el.style.maxHeight = isOpen ? '400px' : 'none'

    el.innerHTML = `
      <div style="padding:8px 12px;display:flex;align-items:center;justify-content:space-between;cursor:pointer" data-toggle>
        <span style="display:inline-flex;align-items:center;gap:6px;pointer-events:none">
          <span style="
            display:inline-block;
            width:6px;height:6px;
            border-radius:50%;
            background:#22c55e;
            animation:vl-pulse 2s ease-in-out infinite;
          "></span>
          <span style="color:#555;letter-spacing:0.1em;text-transform:uppercase;font-size:10px">@SoftCode/vue-lens</span>
        </span>
        <span style="color:#444;font-size:10px;pointer-events:none">${isOpen ? '▾' : '▸'}</span>
      </div>

      ${isOpen ? `
        <div style="padding:0 12px 6px;display:flex;gap:4px;border-top:1px solid #1a1a1e">
          <button data-tab="renders" style="
            background:${activeTab === 'renders' ? '#1e1e24' : 'none'};
            border:1px solid ${activeTab === 'renders' ? '#333' : 'transparent'};
            color:${activeTab === 'renders' ? '#e2e0d8' : '#555'};
            border-radius:4px;padding:2px 8px;font-family:monospace;font-size:10px;cursor:pointer;margin-top:6px
          ">renders</button>
          <button data-tab="routes" style="
            background:${activeTab === 'routes' ? '#1e1e24' : 'none'};
            border:1px solid ${activeTab === 'routes' ? '#333' : 'transparent'};
            color:${activeTab === 'routes' ? '#e2e0d8' : '#555'};
            border-radius:4px;padding:2px 8px;font-family:monospace;font-size:10px;cursor:pointer;margin-top:6px
          ">routes</button>
        </div>

        <div style="padding:10px 12px;overflow-y:auto;flex:1;max-height:280px">
          ${activeTab === 'renders' ? `
            ${entries(renderCounts, max()).length === 0
              ? `<div style="color:#444;font-size:11px">No renders yet</div>`
              : entries(renderCounts, max()).map(([name, count, pct]) => {
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
                }).join('')
            }
          ` : `
            ${routeEvents.length === 0
              ? `<div style="color:#444;font-size:11px">No navigation yet</div>`
              : routeEvents.map(e => {
                  const time = new Date(e.ts).toLocaleTimeString('fr')
                  return `
                    <div style="margin-bottom:8px;line-height:1.6">
                      <span style="color:#444;font-size:10px">${time}</span><br/>
                      <span style="color:#555">${e.from}</span>
                      <span style="color:#333"> → </span>
                      <span style="color:#a78bfa">${e.to}</span>
                    </div>
                  `
                }).join('')
            }
          `}
        </div>

        <div style="flex-shrink:0;padding:0 8px 8px;display:flex;justify-content:flex-end">
          <!-- ton lien SoftCode ici -->
        </div>
      ` : ''}
    `
  }

  render()
  subscribe(render)
}

mount()