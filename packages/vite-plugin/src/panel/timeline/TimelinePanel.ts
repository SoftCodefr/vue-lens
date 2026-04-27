import { panelStore } from '../store'
import { renderGroup } from './TimelineGroup'

class TimelinePanel extends HTMLElement {
  private unsubscribe?: () => void
  private openGroups = new Set<string>()

  connectedCallback() {
    this.attachShadow({ mode: 'open' })
    this.unsubscribe = panelStore.subscribe(() => this.render())
    this.render()
    this.shadowRoot!.addEventListener('click', (e) => this.handleClick(e))
    this.setupDrag()
  }

  disconnectedCallback() {
    this.unsubscribe?.()
  }

  private handleClick(e: Event) {
    const target = e.target as HTMLElement
    const toggleId = target.closest<HTMLElement>('[data-toggle]')?.dataset.toggle
    if (toggleId) {
      if (this.openGroups.has(toggleId)) {
        this.openGroups.delete(toggleId)
      } else {
        this.openGroups.add(toggleId)
      }
      this.render()
    }

    if (target.dataset.reset !== undefined) {
      panelStore.reset()
    }
  }

  private isDragging = false
  private dragOffsetX = 0
  private dragOffsetY = 0

  private setupDrag() {
    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging) return
      const x = e.clientX - this.dragOffsetX
      const y = e.clientY - this.dragOffsetY
      const rect = this.getBoundingClientRect()
      const maxX = window.innerWidth - rect.width
      const maxY = window.innerHeight - rect.height
      this.style.left   = `${Math.min(Math.max(0, x), maxX)}px`
      this.style.top    = `${Math.min(Math.max(0, y), maxY)}px`
      this.style.right  = 'auto'
      this.style.bottom = 'auto'
    }

    const onMouseUp = () => {
      this.isDragging = false
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  private render() {
    const scrollTop = this.shadowRoot!.querySelector<HTMLElement>('.content')?.scrollTop ?? 0
    const groups = panelStore.timelineGroups

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          position: fixed;
          bottom: 20px;
          right: 340px;
          z-index: 99999;
          font-family: monospace;
          font-size: 12px;
        }

        .panel {
          background: rgba(10,10,12,0.95);
          border: 1px solid #222;
          border-radius: 10px;
          width: 320px;
          color: #e2e0d8;
          backdrop-filter: blur(8px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .header {
          padding: 8px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: grab;
          border-bottom: 1px solid #1a1a1e;
        }

        .header:active { cursor: grabbing; }

        .header-left {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dot {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #a78bfa;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(0.7); }
        }

        .title {
          color: #555;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-size: 10px;
        }

        .reset-btn {
          background: none;
          border: none;
          color: #444;
          font-family: monospace;
          font-size: 10px;
          cursor: pointer;
          padding: 0;
          letter-spacing: 0.05em;
          transition: color 0.15s;
        }

        .reset-btn:hover { color: #888; }

        .content {
          overflow-y: auto;
          max-height: 400px;
          padding: 8px 0;
        }

        .empty {
          color: #444;
          font-size: 11px;
          padding: 12px;
        }

        .group {
          border-bottom: 1px solid #111;
        }

        .group:last-child { border-bottom: none; }

        .trigger {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          cursor: pointer;
          transition: background 0.1s;
        }

        .trigger:hover { background: rgba(255,255,255,0.02); }

        .chevron { color: #444; font-size: 9px; flex-shrink: 0; }
        .icon    { font-size: 11px; flex-shrink: 0; }

        .label {
          color: #888;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 11px;
        }

        .meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .time  { color: #444; font-size: 10px; }

        .badge {
          background: #1e1e24;
          color: #555;
          border-radius: 10px;
          padding: 0 5px;
          font-size: 10px;
          min-width: 16px;
          text-align: center;
        }

        .children {
          padding: 4px 12px 8px 32px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .child {
          display: flex;
          align-items: baseline;
          gap: 6px;
          font-size: 11px;
          line-height: 1.6;
        }

        .child-icon  { font-size: 10px; flex-shrink: 0; }
        .child-label { color: #555; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .child-render .child-label { color: #a78bfa; }
        .child-store  .child-label { color: #22c55e; }
        .child-route  .child-label { color: #60a5fa; }
        .child-network .child-label { color: #f97316; }

        .empty-children { color: #333; font-size: 10px; }
      </style>

      <div class="panel">
        <div class="header">
          <div class="header-left">
            <span class="dot"></span>
            <span class="title">timeline</span>
          </div>
          <button class="reset-btn" data-reset>reset ↺</button>
        </div>

        <div class="content">
          ${groups.length === 0
            ? `<div class="empty">No activity yet — interact with the app</div>`
            : groups.map(group => renderGroup(group, this.openGroups.has(group.id))).join('')
          }
        </div>
      </div>
    `

    const header = this.shadowRoot!.querySelector<HTMLElement>('.header')
    header?.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement
      if (target.closest('button')) return
      this.isDragging = true
      document.body.style.userSelect = 'none'
      const rect = this.getBoundingClientRect()
      this.dragOffsetX = e.clientX - rect.left
      this.dragOffsetY = e.clientY - rect.top
    })

    const content = this.shadowRoot!.querySelector<HTMLElement>('.content')
    if (content) content.scrollTop = scrollTop
  }
}

customElements.define('vue-lens-timeline', TimelinePanel)