import { collector } from '@softcodefr/vue-lens-core'

export function setupPinia(pinia: any) {
  pinia.use(({ store }: { store: any }) => {
    store.$onAction(({ name, store: actionStore, after, onError }: any) => {
      const startTs = Date.now()
      
      after(() => {
        collector.emit({
          type: 'store',
          store: actionStore.$id,
          event: name,
          ts: startTs
        })
      })

      onError(() => {
        collector.emit({
          type: 'store',
          store: actionStore.$id,
          event: `${name} (error)`,
          ts: startTs
        })
      })
    })
  })
}

export function setupVuex(store: any) {
  store.subscribe((mutation: any) => {
    collector.emit({
      type: 'store',
      store: 'vuex',
      event: mutation.type,
      ts: Date.now()
    })
  })
}