export function statusColor(status: number): string {
  if (status >= 500) return '#ef4444'
  if (status >= 400) return '#f97316'
  if (status >= 300) return '#facc15'
  return '#22c55e'
}

export function methodColor(method: string): string {
  const map: Record<string, string> = {
    GET: '#22c55e', POST: '#a78bfa', PUT: '#facc15',
    PATCH: '#fb923c', DELETE: '#ef4444'
  }
  return map[method] ?? '#6b7280'
}

export function shortUrl(url: string): string {
  try { return new URL(url).pathname } catch { return url }
}

export function highlight(uid: string, component: string, highlightEls: HTMLElement[]) {
  clearHighlight(highlightEls)
  const target = document.querySelector<HTMLElement>(`[data-vue-lens-id="${uid}"]`)
  if (!target) return

  const rect = target.getBoundingClientRect()
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position:fixed;top:${rect.top}px;left:${rect.left}px;
    width:${rect.width}px;height:${rect.height}px;
    border:2px solid #a78bfa;border-radius:4px;
    background:rgba(167,139,250,0.08);
    pointer-events:none;z-index:99998;
  `
  const label = document.createElement('div')
  label.style.cssText = `
    position:absolute;top:-20px;left:0;
    background:#a78bfa;color:#0d0d0f;
    font-family:monospace;font-size:10px;
    padding:2px 6px;border-radius:3px;white-space:nowrap;
  `
  label.textContent = `<${component}/>`
  overlay.appendChild(label)
  document.body.appendChild(overlay)
  highlightEls.push(overlay)
}

export function clearHighlight(highlightEls: HTMLElement[]) {
  highlightEls.forEach(el => el.remove())
  highlightEls.length = 0
}