import { panelStore } from '../store'
import type { TimelineGroup } from '../store'
import { highlight, clearHighlight } from '../utils'
import type { DebugEvent, InteractionEvent, NetworkEvent } from '@softcodefr/vue-lens-core'

type TriggerEvent = InteractionEvent | NetworkEvent

function isInteraction(trigger: TriggerEvent): trigger is InteractionEvent {
  return (trigger as InteractionEvent).type === 'interaction'
}

function isNetwork(trigger: TriggerEvent): trigger is NetworkEvent {
  return (trigger as NetworkEvent).type === 'network'
}

function triggerIcon(trigger: TriggerEvent): string {
  if (isInteraction(trigger)) {
    return trigger.kind === 'click' ? '🖱' : trigger.kind === 'input' ? '⌨️' : '↵'
  }
  return '🌐'
}

function triggerLabel(trigger: TriggerEvent): string {
  if (isInteraction(trigger)) {
    return `${trigger.kind}${trigger.component ? ` <${trigger.component}/>` : ''}`
  }
  if (isNetwork(trigger)) {
    return trigger.gql?.operationName
      ? trigger.gql.operationName
      : `${trigger.method} ${trigger.url.split('/').pop()}`
  }
  return ''
}

function childIcon(event: DebugEvent): string {
  if (event.type === 'render')  return '⚛'
  if (event.type === 'store')   return '🗄'
  if (event.type === 'route')   return '🔀'
  if (event.type === 'network') return '🌐'
  return '·'
}

function childLabel(event: DebugEvent): string {
  if (event.type === 'render')  return event.component ? `&lt;${event.component}/&gt;` : '&lt;Unknown/&gt;'
  if (event.type === 'store')   return `${event.store}.${event.event}`
  if (event.type === 'route')   return `→ ${event.to}`
  if (event.type === 'network') return `${event.method} ${event.status} ${event.duration}ms`
  return ''
}

function childColor(event: DebugEvent): string {
  if (event.type === 'render')  return '#a78bfa'
  if (event.type === 'store')   return '#22c55e'
  if (event.type === 'route')   return '#60a5fa'
  if (event.type === 'network') return '#f97316'
  return '#555'
}

class TimelinePanel extends HTMLElement {
  private unsubscribe?: () => void
  private openGroups = new Set<string>()

  connectedCallback() {
    this.attachShadow({ mode: 'open' })
    this.unsubscribe = panelStore.subscribe(() => this.render())
    this.render()
    this.shadowRoot!.addEventListener('click', (e) => this.handleClick(e))
  }

  disconnectedCallback() {
    this.unsubscribe?.()
  }

  private handleClick(e: Event) {
    const target = e.target as HTMLElement

    if (target.dataset.close !== undefined) {
      this.dispatchEvent(new CustomEvent('vl-timeline-close', { bubbles: true, composed: true }))
      return
    }

    if (target.dataset.reset !== undefined) {
      panelStore.reset()
      return
    }

    const groupId = target.closest<HTMLElement>('[data-group]')?.dataset.group
    if (groupId) {
      if (this.openGroups.has(groupId)) {
        this.openGroups.delete(groupId)
      } else {
        this.openGroups.add(groupId)
      }
      this.render()
    }
  }

  private renderGroup(group: TimelineGroup): string {
    const time = new Date(group.ts).toLocaleTimeString('fr')
    const icon = triggerIcon(group.trigger)
    const label = triggerLabel(group.trigger)
    const isOpen = this.openGroups.has(group.id)
    const isTriggerNetwork = group.trigger.type === 'network'

    return `
      <div class="group" data-group="${group.id}">
        <div class="group-line"></div>

        <div class="trigger ${isOpen ? 'open' : ''}" title="${label}">
          <div class="trigger-icon ${isTriggerNetwork ? 'network' : 'interaction'}">${icon}</div>
          <div class="trigger-label">${label}</div>
          <div class="trigger-time">${time}</div>
          ${group.children.length > 0 ? `
            <div class="trigger-badge">${group.children.length}</div>
          ` : ''}
        </div>

        ${isOpen && group.children.length > 0 ? `
          <div class="children">
            ${group.children.map(child => {
              const uid = child.type === 'render' ? ` data-uid="${child.uid}"` : ''
              return `
                <div class="child child-${child.type}"${uid} style="border-color:${childColor(child)}" title="${childLabel(child)}">
                  <span class="child-icon">${childIcon(child)}</span>
                  <span class="child-label" style="color:${childColor(child)}">${childLabel(child)}</span>
                </div>
              `
            }).join('')}
          </div>
        ` : ''}
      </div>
    `
  }

  private render() {
    const groups = [...panelStore.timelineGroups].reverse()

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 99998;
          font-family: monospace;
          font-size: 12px;
        }

        .panel {
          background: rgba(10,10,12,0.97);
          border-top: 1px solid #222;
          color: #e2e0d8;
          backdrop-filter: blur(8px);
          display: flex;
          flex-direction: column;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 16px;
          border-bottom: 1px solid #1a1a1e;
          flex-shrink: 0;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;
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

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .reset-btn, .close-btn {
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
        .close-btn { font-size: 14px; }
        .close-btn:hover { color: #e2e0d8; }

        .content {
          display: flex;
          align-items: flex-start;
          gap: 0;
          overflow-x: auto;
          padding: 12px 16px 16px;
          min-height: 80px;
          max-height: 180px;
          scrollbar-width: thin;
          scrollbar-color: #222 transparent;
        }

        .content::-webkit-scrollbar { height: 4px; }
        .content::-webkit-scrollbar-track { background: transparent; }
        .content::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }

        .empty {
          color: #444;
          font-size: 11px;
          align-self: center;
          padding: 8px 0;
        }

        .group {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          position: relative;
        }

        .group-line {
          position: absolute;
          top: 20px;
          left: 50%;
          right: -100%;
          height: 1px;
          background: #1a1a1e;
          z-index: 0;
        }

        .group:last-child .group-line { display: none; }

        .trigger {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 0 16px;
          cursor: pointer;
          position: relative;
          z-index: 1;
          transition: opacity 0.15s;
        }

        .trigger:hover { opacity: 0.8; }

        .trigger-icon {
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          border: 1px solid #222;
          transition: border-color 0.15s;
        }

        .trigger-icon.interaction { background: #0e0e14; border-color: #a78bfa33; }
        .trigger-icon.network     { background: #130f08; border-color: #f9731633; }

        .open .trigger-icon.interaction { border-color: #a78bfa; }
        .open .trigger-icon.network     { border-color: #f97316; }

        .trigger-label {
          color: #888;
          font-size: 10px;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: center;
        }

        .trigger-time {
          color: #444;
          font-size: 9px;
        }

        .trigger-badge {
          position: absolute;
          top: -4px;
          right: 10px;
          background: #1e1e24;
          color: #555;
          border-radius: 10px;
          padding: 0 4px;
          font-size: 9px;
          min-width: 14px;
          text-align: center;
        }

        .children {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 6px 16px 0;
          max-width: 120px;
        }

        .child {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #0d0d0f;
          border: 1px solid;
          border-radius: 4px;
          padding: 2px 6px;
          white-space: nowrap;
          font-size: 10px;
        }

        .child-icon  { font-size: 9px; flex-shrink: 0; }
        .child-label { overflow: hidden; text-overflow: ellipsis; }
      </style>

      <div class="panel">
        <div class="header">
          <div class="header-left">
            <span class="dot"></span>
            <span class="title">timeline</span>
          </div>
          <div class="header-right">
            <button class="reset-btn" data-reset>reset ↺</button>
            <button class="close-btn" data-close>✕</button>
          </div>
        </div>

        <div class="content">
          ${groups.length === 0
            ? `<div class="empty">No activity yet — interact with the app</div>`
            : groups.map(g => this.renderGroup(g)).join('')
          }
        </div>
      </div>
    `

    const highlightEls: HTMLElement[] = []

    this.shadowRoot!.querySelectorAll<HTMLElement>('.child[data-uid]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        const uid = el.dataset.uid!
        const component = el.querySelector('.child-label')?.textContent?.replace(/[<>/]/g, '') ?? ''
        highlight(uid, component, highlightEls)
      })
      el.addEventListener('mouseleave', () => {
        clearHighlight(highlightEls)
      })
    })

    // Auto-scroll à droite pour voir les derniers events
    const content = this.shadowRoot!.querySelector<HTMLElement>('.content')
    if (content) content.scrollLeft = content.scrollWidth
  }
}

customElements.define('vue-lens-timeline', TimelinePanel)