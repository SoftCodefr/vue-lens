import { panelStore } from '../store'

class RoutesTab extends HTMLElement {
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
    const scrollTop = this.shadowRoot!.querySelector<HTMLElement>('.scroll')?.scrollTop ?? 0

    const rows = panelStore.routeEvents.length === 0
      ? `<div class="empty">No navigation yet</div>`
      : panelStore.routeEvents.map(e => `
          <div class="row">
            <span class="ts">${new Date(e.ts).toLocaleTimeString('fr')}</span>
            <div class="nav">
              <span class="from">${e.from}</span>
              <span class="arrow"> → </span>
              <span class="to">${e.to}</span>
            </div>
          </div>
        `).join('')

    this.shadowRoot!.innerHTML = `
      <style>
        .empty { color: #444; font-size: 11px; }

        .row {
          margin-bottom: 8px;
          line-height: 1.6;
          padding-bottom: 8px;
          border-bottom: 1px solid #111;
        }

        .row:last-child { border-bottom: none; }

        .ts    { color: #444; font-size: 10px; display: block; margin-bottom: 2px; }
        .from  { color: #555; }
        .arrow { color: #333; }
        .to    { color: #a78bfa; }
      </style>
      ${rows}
    `

    const scrollEl = this.shadowRoot!.querySelector<HTMLElement>('.scroll')
    if (scrollEl) scrollEl.scrollTop = scrollTop
  }
}

customElements.define('vl-routes-tab', RoutesTab)