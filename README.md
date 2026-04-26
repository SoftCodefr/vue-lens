# @softcodefr/vue-lens

> Development-only Vue 3 inspector for renders, route changes, store mutations, and network requests.

![status](https://img.shields.io/badge/status-poc-orange)
![vue](https://img.shields.io/badge/vue-3.x-brightgreen)
![vite](https://img.shields.io/badge/vite-5.x-646cff)

`@softcodefr/vue-lens` is a Vite plugin that injects a floating debug panel into your Vue app during local development. It requires no component changes and is excluded from production builds.

```
┌─ @SoftCode/vue-lens ─────────────┐
│ renders  routes  store  network  │
│                                  │
│ <TimerCard/>          ████  24   │
│ <CounterCard/>        ██    8    │
│ <App/>                █     2    │
└──────────────────────────────────┘
```

## Features

- Tracks Vue component re-renders from `<script setup>` components.
- Shows Vue Router navigations when router tracking is enabled.
- Shows Pinia or Vuex mutations when store tracking is enabled.
- Shows `fetch` requests, status codes, durations, and basic GraphQL metadata when network tracking is enabled.
- Keeps recent events in a small in-memory collector.
- Runs only in `vite dev` via `apply: 'serve'`.

## Installation

```bash
pnpm add -D @softcodefr/vue-lens
```

## Setup

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { vueLens } from '@softcodefr/vue-lens'

export default defineConfig({
  plugins: [
    vue(),
    vueLens(),
  ],
})
```

The panel appears automatically in development. It mounts itself into the DOM, so you do not need to add a Vue component to your app.

## Options

Render tracking is enabled by default. Router, store, and network tracking are opt-in.

```ts
vueLens({
  router: true,
  store: true,
  network: true,
})
```

| Option | Default | Description |
| --- | --- | --- |
| `router` | `false` | Tracks Vue Router navigations by instrumenting `router.afterEach`. |
| `store` | `false` | Tracks Pinia or Vuex mutations. The plugin detects `pinia` or `vuex` from `package.json`. |
| `network` | `false` | Wraps `window.fetch` to track requests, response status, duration, and GraphQL operation info when available. |

### Router Tracking

Router tracking expects the app entry to contain the usual pattern:

```ts
app.use(router)
```

When enabled, the plugin injects `setupVueLensRouter(router)` after that call.

### Store Tracking

Store tracking currently supports Pinia and Vuex.

For Pinia, the plugin looks for:

```ts
const pinia = createPinia()
app.use(pinia)
```

For Vuex, the plugin looks for:

```ts
const store = createStore({})
app.use(store)
```

### Network Tracking

Network tracking wraps `window.fetch`. It records:

- HTTP method
- URL
- response status
- request duration
- GraphQL operation name and type when the request body contains a GraphQL query

## How It Works

The Vite plugin transforms Vue SFCs and the app entry during development.

For every `.vue` file with a `<script setup>`, it injects `onRenderTriggered`:

```vue
<!-- your component -->
<script setup>
const count = ref(0)
</script>

<!-- compiled by Vite with vue-lens enabled -->
<script setup>
import { onRenderTriggered } from 'vue'
import { collector } from '@softcodefr/vue-lens-core'

onRenderTriggered(() => {
  collector.emit({
    type: 'render',
    component: 'MyComponent',
    file: '/path/to/MyComponent.vue',
    ts: Date.now(),
  })
})

const count = ref(0)
</script>
```

The plugin also injects a virtual panel module into `main.ts` or `main.js`. The panel subscribes to the collector and renders the latest debug information in the browser.

## Collector API

`@softcodefr/vue-lens-core` exposes the event collector used by the panel.

```ts
import { collector } from '@softcodefr/vue-lens-core'

const unsubscribe = collector.on((event) => {
  console.log(event)
})

const events = collector.getBuffer()

collector.reset()
unsubscribe()
```

Event types currently emitted:

```ts
type DebugEvent =
  | { type: 'render'; component: string; file: string; ts: number }
  | { type: 'route'; from: string; to: string; ts: number }
  | { type: 'store'; store: string; event: string; ts: number }
  | {
      type: 'network'
      method: string
      url: string
      status: number
      duration: number
      gql?: {
        operationName: string | null
        operationType: 'query' | 'mutation' | 'subscription' | null
      }
      ts: number
    }
```

## Monorepo Structure

```
@softcodefr/vue-lens/
├── packages/
│   ├── core/           # Event collector and debug event types
│   └── vite-plugin/    # Vite plugin, transforms, virtual modules, panel UI
└── playground/         # Vue 3 app for local development
```

## Development

```bash
# install dependencies
pnpm install

# build all packages
pnpm build

# run type checks
pnpm typecheck

# start the playground
pnpm dev
```

To work on the Vite plugin with live rebuilds:

```bash
cd packages/vite-plugin
pnpm dev
```

Then start the playground in another terminal:

```bash
cd playground
pnpm dev
```

## Current Limitations

- Render tracking only instruments Vue SFCs that use `<script setup>`.
- Entry-file transforms currently target `main.ts` and `main.js`.
- Router and store instrumentation expects common setup names such as `router`, `pinia`, and `store`.
- Network tracking currently covers `window.fetch`, not `XMLHttpRequest`.

## Roadmap

- [x] Re-render tracking per component
- [x] Automatic injection via Vite plugin
- [x] Floating development panel
- [x] Vue Router navigation tracking
- [x] Pinia/Vuex mutation tracking
- [x] Network request tracking
- [ ] Session sharing
- [ ] More robust app entry detection
- [ ] Component support beyond `<script setup>`

## License

MIT
