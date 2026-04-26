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
    padding: 0;
    display: flex;
    flex-direction: column;
    min-width: 220px;
    max-height: 400px;
    overflow-y: auto;
    color: #e2e0d8;
    backdrop-filter: blur(8px);
  `
  document.body.appendChild(el)

  const linkStyle = document.createElement('style')
  linkStyle.textContent = '#__vue-debug-panel__ .vl-softcode-link:hover{opacity:1!important}'
  document.head.appendChild(linkStyle)

  function render() {
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
    const max = Math.max(1, ...entries.map(e => e[1]))

    el.innerHTML = `
      <div style="flex:1;min-height:0;overflow-y:auto;padding:12px 12px 4px">
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
      </div>
      <div style="flex-shrink:0;padding:0 8px 8px;display:flex;justify-content:flex-end">
        <a class="vl-softcode-link" href="https://softcode.fr/" target="_blank" rel="noopener noreferrer" title="softcode.fr" style="line-height:0;opacity:0.85;transition:opacity 0.15s">
          <svg width="12" height="12" viewBox="0 0 86 88" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M84.6689 45.4258C82.3684 33.5028 80.0625 21.5798 77.762 9.65677C77.4007 8.66146 77.023 6.19443 72.2837 2.62063C67.6529 -0.871258 60.2184 0.0302258 59.1664 0.325709C48.3651 2.05196 37.5695 3.702 26.757 5.36759C25.6333 5.55888 23.6229 6.06587 21.4552 7.25817C19.5956 8.2794 18.389 9.35092 17.7249 10.1752C12.5872 17.4327 7.45482 24.6901 2.31713 31.9476C1.94522 32.3934 1.58393 32.9118 1.25453 33.5028C-0.32344 36.3643 -0.0631024 39.2881 0.191923 40.7603C2.31713 53.0306 4.44234 65.2958 6.56754 77.5661C7.41975 82.6956 11.8221 84.6785 12.9432 85.342C17.9746 88.328 23.5373 87.6644 25.1631 87.4156L59.6977 81.7133C60.7391 81.5319 62.2958 81.1275 63.9481 80.1581C66.2806 78.7896 67.5823 76.9959 68.1986 76.011C72.8049 69.6192 77.406 63.2222 82.0124 56.8305C82.7669 55.9336 84.0314 54.1815 84.6689 51.6465C85.3649 48.8731 84.9558 46.5715 84.6689 45.4258ZM77.2998 53.7979C75.0471 56.9497 71.6786 57.7221 70.9454 57.8724C59.8306 59.9097 48.7104 61.947 37.5956 63.9791C37.0165 64.145 33.2761 65.1403 29.6526 62.963C26.4861 61.0554 25.5988 58.0331 25.4181 57.3644L19.0638 22.2433C19.0106 21.2688 18.9681 18.1377 21.1837 15.1154C23.8189 11.523 27.7399 10.6936 28.5953 10.5329C38.8282 8.83771 49.0664 7.13738 59.2993 5.44224C61.4829 5.07937 65.9443 5.37796 68.6959 7.38258C71.3035 9.28249 72.5127 11.891 72.9803 13.2907C73.3841 15.0377 78.0011 35.2031 78.8884 46.1671C79.0371 47.9763 79.2231 51.1126 77.2998 53.8031V53.7979Z" fill="#4C4C4C"/>
            <path d="M32.9679 50.0913C30.7843 49.7958 28.776 49.1893 26.9536 48.2718L29.0841 42.8131C32.2029 44.2231 35.2844 44.6638 38.3341 44.1402C39.7739 43.8914 40.8471 43.487 41.5485 42.9323C42.2498 42.3725 42.5261 41.7089 42.3879 40.9417C42.2551 40.2004 41.7132 39.6405 40.7621 39.2725C39.8111 38.9044 38.2066 38.6089 35.9538 38.3964C32.6226 38.1216 30.0776 37.4166 28.3297 36.2814C26.5817 35.1461 25.5031 33.4613 25.0994 31.2322C24.8178 29.6667 24.9825 28.2048 25.5935 26.857C26.2045 25.5092 27.2458 24.3532 28.7175 23.4045C30.1892 22.4558 31.9956 21.7923 34.1474 21.4242C36.1876 21.0717 38.1906 21.0354 40.1458 21.3154C42.1063 21.5953 43.9446 22.1448 45.666 22.9742L43.4665 28.2826C42.3507 27.7071 41.0597 27.3132 39.5933 27.1006C38.1216 26.8881 36.7349 26.8933 35.4279 27.1214C34.259 27.3235 33.3664 27.6812 32.7607 28.1944C32.1497 28.7076 31.9106 29.2986 32.0275 29.9622C32.1497 30.6516 32.6385 31.1752 33.4886 31.5381C34.3387 31.9009 35.8635 32.1912 38.0684 32.4142C41.5803 32.7407 44.2528 33.4872 46.0911 34.6484C47.9294 35.8096 49.0451 37.4944 49.4436 39.6976C49.7411 41.346 49.5339 42.8805 48.822 44.3009C48.11 45.7265 46.9518 46.9291 45.3526 47.9193C43.748 48.9094 41.8194 49.5937 39.5614 49.9825C37.3565 50.3609 35.1622 50.4024 32.9732 50.1121L32.9679 50.0913Z" fill="#4C4C4C"/>
            <path d="M55.3411 46.416C52.8811 45.5503 50.8516 44.1299 49.247 42.1445C47.6425 40.1642 46.5852 37.79 46.0858 35.0269C45.597 32.3157 45.7564 29.7601 46.5693 27.3444C47.3822 24.9338 48.7795 22.9069 50.7559 21.2636C52.7324 19.6255 55.1604 18.5524 58.0454 18.06C62.7527 17.2513 67.1147 18.4021 71.1314 21.5176L67.6354 26.6393C66.4665 25.6077 65.1914 24.8924 63.8153 24.4828C62.4393 24.0785 61.0419 23.9955 59.6234 24.2392C58.072 24.5088 56.765 25.0894 55.7077 25.981C54.6504 26.8778 53.9065 28.0027 53.4762 29.3609C53.0512 30.7191 52.9768 32.1965 53.269 33.7932C53.5612 35.4105 54.1456 36.7843 55.0223 37.9092C55.8989 39.0341 57.004 39.8324 58.3429 40.3145C59.6765 40.7966 61.1376 40.9003 62.7155 40.6308C65.8449 40.0916 68.2251 38.355 69.8562 35.4209L74.9355 39.0652C73.7347 41.2736 72.1302 43.0309 70.1219 44.3476C68.1136 45.6643 65.8715 46.5352 63.3956 46.9655C60.4841 47.4683 57.7957 47.2869 55.3411 46.4212V46.416Z" fill="#4C4C4C"/>
          </svg>
        </a>
      </div>
    `
  }

  render()
  subscribe(render)
}

mount()