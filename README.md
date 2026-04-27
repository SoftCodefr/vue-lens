# @softcodefr/vue-lens

> Zero-config debug panel for Vue 3. Add one line to your Vite config and get real-time visibility into renders, routing, store mutations, network requests, and user interactions — all in one floating panel.

![status](https://img.shields.io/badge/status-beta-orange)
![vue](https://img.shields.io/badge/vue-3.x-brightgreen)
![vite](https://img.shields.io/badge/vite-5.x-646cff)

---

## What it does

vue-lens injects a floating debug panel and a horizontal timeline into your app during development. Zero component modifications required — everything is instrumented automatically via the Vite plugin.

```
┌─ @SoftCode/vue-lens ──────────────── [timeline] [reset] ▾ ┐
│  renders  routes  store  network                           │
│                                                            │
│  <TimerCard/>   #a3f2  ████  24   ↳ time                  │
│  <CounterCard/> #b7c1  ██     8   ↳ count                 │
│  <App/>         #e9d4  █      2                            │
└────────────────────────────────────────────────────────────┘

┌─ timeline ──────────────────────────────────────────────── ✕ ┐
│  🖱 click        🌐 POST /api     🖱 click                    │
│  <CounterCard/>  GetCountry       <CartCard/>                │
│  14:32:05        14:32:08         14:32:15                   │
└──────────────────────────────────────────────────────────────┘
```

---

## Installation

```bash
pnpm add -D @softcodefr/vue-lens-vite-plugin
```

---

## Setup

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { vueLens } from '@softcodefr/vue-lens-vite-plugin'

export default defineConfig({
  plugins: [
    vue(),
    vueLens({
      router:   true,   // track Vue Router navigations
      store:    true,   // track Pinia or Vuex mutations (auto-detected)
      network:  true,   // track fetch requests (REST + GraphQL)
      timeline: true,   // show horizontal timeline panel
    })
  ]
})
```

The panel appears automatically in development. **Nothing is included in production builds** (`apply: 'serve'`).

---

## Features

### Renders tab
- Re-render count **per component instance**
- Last render reason (which `ref` or `prop` triggered it)
- Color-coded heat map — orange for hot components, purple for warm
- **Hover to highlight** the exact instance in the DOM

### Routes tab
- Full navigation history with timestamps
- From / to path for each transition

### Store tab
- Real-time mutation log for **Pinia** and **Vuex**
- Store name + action name + timestamp
- Auto-detected from `package.json` — no config needed

### Network tab
- All `fetch` requests intercepted automatically
- **GraphQL support** — displays `operationName` and `operationType` instead of raw URL
- Status code color-coded (green / orange / red)
- Request duration in ms

### Timeline panel
- Horizontal scrollable timeline at the bottom of the screen
- Groups events by **causal activity** — renders and mutations triggered by the same click or network call are grouped together
- Click a group to expand its children
- **Hover a render child to highlight** the component in the DOM
- 100ms grouping window

### Panel UX
- **Draggable** — reposition anywhere on screen
- **Toggle** open/close from the header
- **Reset** button to clear all counters
- Isolated via **Shadow DOM** — no style conflicts with your app

---

## How it works

### Transform

For every `.vue` file with `<script setup>`, the plugin injects `onRenderTriggered` automatically:

```vue
<!-- your component — untouched -->
<script setup>
const count = ref(0)
</script>

<!-- what Vite actually compiles -->
<script setup>
import { onRenderTriggered, onMounted, getCurrentInstance } from 'vue'
import { collector } from '@softcodefr/vue-lens-core'

const __vlUid = Math.random().toString(36).slice(2)

onMounted(() => {
  const el = getCurrentInstance()?.proxy?.$el
  if (el?.setAttribute) el.setAttribute('data-vue-lens-id', __vlUid)
})

onRenderTriggered((event) => {
  collector.emit({ type: 'render', component: 'MyComponent', uid: __vlUid, reason: event.key, ... })
})

const count = ref(0)
</script>
```

### vue-facing-decorator support

Components using `@Component` + `extends Vue` are also instrumented automatically via `renderTriggered()` injection into the class body. Compatible with `toNative()`.

### Panel injection

The plugin injects a virtual module import into `main.ts` at dev server startup. The panel mounts itself as a Web Component (`<vue-lens-panel>`) with no `<VueLensPanel />` to add anywhere.

### Store auto-detection

The plugin reads your `package.json` at startup and detects whether you use Pinia or Vuex — no manual config needed.

---

## Packages

```
@softcodefr/vue-lens-core          # Event collector & ring buffer
@softcodefr/vue-lens-vite-plugin   # Vite plugin + SFC transform + panel UI
```

### `@softcodefr/vue-lens-core`

```ts
import { collector } from '@softcodefr/vue-lens-core'

// Subscribe to events
const unsubscribe = collector.on((event) => {
  console.log(event)
  // { type: 'render', component: 'MyComponent', uid: '...', reason: 'count', ts: ... }
  // { type: 'route', from: '/', to: '/dashboard', ts: ... }
  // { type: 'store', store: 'cart', event: 'addToCart', ts: ... }
  // { type: 'network', method: 'POST', url: '...', status: 200, duration: 342, ts: ... }
  // { type: 'interaction', kind: 'click', target: 'button "Add to cart"', component: 'CartCard', ts: ... }
})

// Read the buffer (last 200 events)
collector.getBuffer()

// Reset
collector.reset()
```

---

## Monorepo structure

```
vue-lens/
├── packages/
│   ├── core/                    # Event types + collector
│   └── vite-plugin/             # Vite plugin + transforms + panel
│       └── src/
│           ├── index.ts         # Plugin entry
│           ├── transform.ts     # SFC + class component transform
│           ├── router.ts        # Vue Router tracker
│           ├── store.ts         # Pinia/Vuex tracker
│           ├── network.ts       # fetch interceptor
│           ├── interaction.ts   # DOM interaction tracker
│           └── panel/
│               ├── index.ts     # Panel entry
│               ├── store.ts     # Panel state singleton
│               ├── utils.ts     # Shared helpers + highlight
│               ├── VueLensPanel.ts
│               ├── tabs/
│               │   ├── RendersTab.ts
│               │   ├── RoutesTab.ts
│               │   ├── StoreTab.ts
│               │   └── NetworkTab.ts
│               └── timeline/
│                   ├── index.ts
│                   └── TimelinePanel.ts
└── playground/                  # Vue 3 test app
```

---

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start the playground
pnpm dev
```

Watch mode for active development:

```bash
# Terminal 1 — rebuild packages on change
cd packages/vite-plugin && pnpm dev

# Terminal 2 — playground
cd playground && pnpm dev
```

---

## Publishing

Triggered automatically on git tag push:

```bash
git tag v0.1.0
git push origin v0.1.0
```

GitHub Actions builds both packages and publishes them to npm under the `@softcodefr` organization.

---

## Roadmap

- [x] Re-render tracking per instance
- [x] Render reason (which ref/prop triggered)
- [x] Vue Router navigation tracking
- [x] Pinia / Vuex mutation tracking
- [x] Network tracking (REST + GraphQL)
- [x] Interaction tracking (click, input, submit)
- [x] Horizontal timeline with causal grouping
- [x] Component highlight on hover
- [x] vue-facing-decorator support
- [x] Web Components panel (Shadow DOM isolated)
- [x] Draggable panel
- [ ] Performance budgets & alerts
- [ ] Time travel (Pinia state history)
- [ ] Session sharing + DOM streaming

---

## License

MIT — built by [SoftCode](https://softcode.fr)