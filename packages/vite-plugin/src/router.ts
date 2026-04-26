import { collector } from '@softcodefr/vue-lens-core'

export function setupVueLensRouter(router: any) {
  router.afterEach((to: { path: string }, from: { path: string }) => {
    collector.emit({
      type: 'route',
      from: from.path,
      to: to.path,
      ts: Date.now()
    })
  })
}