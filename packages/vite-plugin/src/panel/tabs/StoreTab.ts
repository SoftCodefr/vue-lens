import { panelStore } from '../store'

class StoreTab extends HTMLElement {
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

    const rows = panelStore.storeEvents.length === 0
      ? `<div class="empty">No mutations yet</div>`
      : panelStore.storeEvents.map(e => `
          <div class="row">
            <span class="ts">${new Date(e.ts).toLocaleTimeString('fr')}</span>
            <div class="mutation">
              <span class="store-name">${e.store}</span>
              <span class="sep"> · </span>
              <span class="event">${e.event}</span>
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

        .ts         { color: #444; font-size: 10px; display: block; margin-bottom: 2px; }
        .store-name { color: #22c55e; }
        .sep        { color: #333; }
        .event      { color: #555; }
      </style>
      ${rows}
    `

    const scrollEl = this.shadowRoot!.querySelector<HTMLElement>('.scroll')
    if (scrollEl) scrollEl.scrollTop = scrollTop
  }
}

customElements.define('vl-store-tab', StoreTab)