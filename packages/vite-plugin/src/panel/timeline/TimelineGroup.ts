import type { TimelineGroup, TriggerEvent } from '../store'
import type { DebugEvent } from '@softcodefr/vue-lens-core'
import { shortUrl } from '../utils'
import { isInteraction, isNetwork } from './TimelinePanel'

function triggerIcon(trigger: TriggerEvent): string {
  if (trigger.type === 'interaction') {
    return trigger.kind === 'click' ? '🖱' : trigger.kind === 'input' ? '⌨️' : '↵'
  }
  return '🌐'
}

function triggerLabel(trigger: TriggerEvent): string {
  if (isInteraction(trigger)) {
    return `${trigger.kind}${trigger.component ? ` <${trigger.component}/>` : ''}`
  }
  if (isNetwork(trigger)) {
    const isGql = !!trigger.gql?.operationName
    if (isGql) {
      return `${trigger.gql?.operationType ?? 'gql'} · ${trigger.gql?.operationName}`
    }
    return `${trigger.method} ${shortUrl(trigger.url)}`
  }
  return ''
}

function childIcon(event: DebugEvent): string {
  if (event.type === 'render')  return '⚛'
  if (event.type === 'store')   return '🗄'
  if (event.type === 'route')   return '🔀'
  if (event.type === 'network') return !!(event as any).gql ? 'gql' : '🌐'
  return '·'
}

function childLabel(event: DebugEvent): string {
  if (event.type === 'render')  return `<${event.component}/>`
  if (event.type === 'store')   return `${event.store}.${event.event}`
  if (event.type === 'route')   return `→ ${event.to}`
  if (event.type === 'network') {
    const isGql = !!(event as any).gql
    if (isGql) {
      const op = (event as any).gql
      return `${op.operationType ?? 'gql'} ${op.operationName ?? '?'} ${event.status} ${event.duration}ms`
    }
    return `${event.method} ${shortUrl(event.url)} ${event.status} ${event.duration}ms`
  }
  return ''
}

export function renderGroup(group: TimelineGroup, isOpen: boolean): string {
  const time = new Date(group.ts).toLocaleTimeString('fr')
  const icon = triggerIcon(group.trigger)
  const label = triggerLabel(group.trigger)

  return `
    <div class="group" data-group-id="${group.id}">
      <div class="trigger" data-toggle="${group.id}">
        <span class="chevron">${isOpen ? '▾' : '▸'}</span>
        <span class="icon">${icon}</span>
        <span class="label" title="${label}">${label}</span>
        <span class="meta">
          <span class="time">${time}</span>
          <span class="badge">${group.children.length}</span>
        </span>
      </div>

      ${isOpen && group.children.length > 0 ? `
        <div class="children">
          ${group.children.map(child => `
            <div class="child child-${child.type}">
              <span class="child-icon">${childIcon(child)}</span>
              <span class="child-label">${childLabel(child)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${isOpen && group.children.length === 0 ? `
        <div class="children">
          <div class="empty-children">no events</div>
        </div>
      ` : ''}
    </div>
  `
}