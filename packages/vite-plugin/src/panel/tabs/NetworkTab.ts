import { panelStore } from '../store'
import { statusColor, methodColor, shortUrl } from '../utils'

class NetworkTab extends HTMLElement {
  private unsubscribe?: () => void

  connectedCallback() {
    this.attachShadow({ mode: 'open' })
    this.unsubscribe = panelStore.subscribe(() => this.render())
    this.render()
  }

  disconnectedCallback() {
    this.unsubscribe?.()
  }

  private render() {
    const scrollTop = this.shadowRoot!.querySelector<HTMLElement>('.content')?.scrollTop ?? 0
  
    const rows = panelStore.networkEvents.length === 0
      ? `<div class="empty">No requests yet</div>`
      : panelStore.networkEvents.map(e => {
          const isGql = !!e.gql
          const sc = statusColor(e.status)
          const mc = methodColor(e.method)
          const url = isGql && e.gql?.operationName ? e.gql.operationName : shortUrl(e.url)
          const count = panelStore.networkCallCounts[e.callKey] ?? 1
          const isDuplicate = count > 1
  
          return `
            <div class="row">
              <div class="main">
                <span class="method" style="color:${mc}">${isGql ? 'GQL' : e.method}</span>
                <span class="url" title="${e.url}">${url}</span>
                ${isDuplicate ? `<span class="badge" title="Called ${count} times">×${count}</span>` : ''}
                <span class="status" style="color:${sc}">${e.status}</span>
              </div>
              <div class="meta">
                <span class="ts">${new Date(e.ts).toLocaleTimeString('fr')}</span>
                <span class="duration">${e.duration}ms</span>
                ${isGql ? `<span class="gql-type">${e.gql?.operationType ?? ''}</span>` : ''}
              </div>
            </div>
          `
        }).join('')
  
    this.shadowRoot!.innerHTML = `
      <style>
        .empty    { color: #444; font-size: 11px; }
        .row      { margin-bottom: 10px; line-height: 1.7; border-left: 2px solid #1a1a1e; padding-left: 8px; }
        .main     { display: flex; align-items: center; gap: 6px; }
        .method   { font-size: 10px; font-weight: bold; flex-shrink: 0; }
        .url      { color: #555; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .status   { font-size: 10px; flex-shrink: 0; }
        .meta     { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
        .ts       { color: #444; font-size: 10px; }
        .duration { color: #333; font-size: 10px; }
        .gql-type { color: #6b7280; font-size: 10px; }
  
        .badge {
          background: #1e1e24;
          border: 1px solid #f97316;
          color: #f97316;
          border-radius: 10px;
          padding: 0 5px;
          font-size: 9px;
          flex-shrink: 0;
        }
      </style>
      ${rows}
    `
  
    const content = this.shadowRoot!.querySelector<HTMLElement>('.content')
    if (content) content.scrollTop = scrollTop
  }
}

customElements.define('vl-network-tab', NetworkTab)