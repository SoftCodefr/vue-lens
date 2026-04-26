import { panelStore } from '../store'
import { highlight, clearHighlight } from '../utils'

class RendersTab extends HTMLElement {
  private unsubscribe?: () => void
  private highlightEls: HTMLElement[] = []

  connectedCallback() {
    this.attachShadow({ mode: 'open' })
    this.unsubscribe = panelStore.subscribe(() => this.render())
    this.render()
  }

  disconnectedCallback() {
    this.unsubscribe?.()
    clearHighlight(this.highlightEls)
  }

  private render() {
    const sorted = Object.values(panelStore.instances).sort((a, b) => b.count - a.count)
    const max = panelStore.max()

    const rows = sorted.length === 0
      ? `<div class="empty">No renders yet</div>`
      : sorted.map(instance => {
          const pct = Math.round((instance.count / max) * 100)
          const color = pct > 70 ? '#f97316' : pct > 30 ? '#a78bfa' : '#6b7280'
          const shortUid = instance.uid.slice(0, 4)
          return `
            <div
              class="row"
              data-uid="${instance.uid}"
              data-component="${instance.component}"
            >
              <div class="main">
                <span class="name">
                  &lt;${instance.component}/&gt;
                  <span class="uid">#${shortUid}</span>
                </span>
                <div class="bar-wrap">
                  <div class="bar" style="width:${pct}%;background:${color}"></div>
                </div>
                <span class="count" style="color:${color}">${instance.count}</span>
              </div>
              ${instance.lastReason
                ? `<span class="reason">↳ ${instance.lastReason}</span>`
                : ''}
            </div>
          `
        }).join('')

    this.shadowRoot!.innerHTML = `
      <style>
        .empty { color: #444; font-size: 11px; }

        .row {
          display: flex;
          flex-direction: column;
          margin-bottom: 8px;
          cursor: default;
          border-radius: 4px;
          padding: 2px 4px;
          transition: background 0.15s;
        }

        .row:hover { background: rgba(255,255,255,0.02); }

        .main { display: flex; align-items: center; gap: 8px; }

        .name { color: #888; flex: 1; }
        .uid  { color: #333; }

        .bar-wrap {
          width: 40px; height: 3px;
          background: #1a1a1e;
          border-radius: 2px;
          overflow: hidden;
        }

        .bar { height: 100%; border-radius: 2px; }

        .count { min-width: 24px; text-align: right; font-size: 12px; }

        .reason { color: #555; font-size: 10px; margin-top: 2px; padding-left: 2px; }
      </style>
      ${rows}
    `

    // Attache les events hover après le re-render
    this.shadowRoot!.querySelectorAll<HTMLElement>('.row').forEach(row => {
      row.addEventListener('mouseenter', () => {
        highlight(row.dataset.uid!, row.dataset.component!, this.highlightEls)
      })
      row.addEventListener('mouseleave', () => {
        clearHighlight(this.highlightEls)
      })
    })
  }
}

customElements.define('vl-renders-tab', RendersTab)