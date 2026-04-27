import { collector } from '@softcodefr/vue-lens-core'

function getSelector(el: Element): string {
  const tag = el.tagName.toLowerCase()
  const id = el.id ? `#${el.id}` : ''
  const classes = Array.from(el.classList).slice(0, 2).map(c => `.${c}`).join('')
  const text = el.textContent?.trim().slice(0, 20)
  return `${tag}${id}${classes}${text ? ` "${text}"` : ''}`
}

function getComponentFromTarget(el: Element): string | null {
  let current: Element | null = el
  while (current) {
    const name = current.getAttribute('data-vue-lens')
    if (name) return name
    current = current.parentElement
  }
  return null
}

export function setupInteractions() {
  document.addEventListener('click', (e) => {
    const target = e.target as Element
    if (!target?.tagName) return
    // Ignore les clicks sur le panel lui-même
    if (target.closest('vue-lens-panel') || target.closest('vue-lens-timeline')) return

    collector.emit({
      type: 'interaction',
      kind: 'click',
      target: getSelector(target),
      component: getComponentFromTarget(target),
      ts: Date.now()
    })
  })

  document.addEventListener('submit', (e) => {
    const target = e.target as Element
    if (!target?.tagName) return

    collector.emit({
      type: 'interaction',
      kind: 'submit',
      target: getSelector(target),
      component: getComponentFromTarget(target),
      ts: Date.now()
    })
  })

  document.addEventListener('input', (e) => {
    const target = e.target as Element
    if (!target?.tagName) return
    if (target.closest('vue-lens-panel') || target.closest('vue-lens-timeline')) return

    collector.emit({
      type: 'interaction',
      kind: 'input',
      target: getSelector(target),
      component: getComponentFromTarget(target),
      ts: Date.now()
    })
  })
}