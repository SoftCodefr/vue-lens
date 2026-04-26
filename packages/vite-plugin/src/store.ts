import { collector } from '@softcodefr/vue-lens-core'

export function setupPinia(pinia: any) {
  pinia.use(({ store }: { store: any }) => {
    store.$subscribe((mutation: any) => {
      collector.emit({
        type: 'store',
        store: mutation.storeId,
        event: mutation.type,
        ts: Date.now()
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