# @SoftCodefr/vue-lens

> Zero-config re-render tracker for Vue 3. Add one line to your Vite config, see every component re-render in real time.

![status](https://img.shields.io/badge/status-poc-orange)
![vue](https://img.shields.io/badge/vue-3.x-brightgreen)
![vite](https://img.shields.io/badge/vite-5.x-646cff)

---

## What it does

@softcodefr/vue-lens injects a floating panel into your app during development. It tracks how many times each component re-renders and displays the results in real time — no component modifications required.

```
┌─ @SoftCode/vue-lens ─────────────┐
│  <TimerCard/>          ████  24  │
│  <CounterCard/>        ██    8   │
│  <App/>                █     2   │
└──────────────────────────────────┘
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
import { vueDebug } from '@softcodefr/vue-lens-vite-plugin'

export default defineConfig({
  plugins: [
    vue(),
    vueDebug(), // that's it
  ],
})
```

The panel appears automatically in development. It is never included in production builds.

---

## How it works

The plugin operates in two steps at dev server startup.

**Transform** — for every `.vue` file with a `<script setup>`, the plugin injects `onRenderTriggered` automatically:

```vue
<!-- your component — untouched -->
<script setup>
const count = ref(0)
</script>

<!-- what Vite actually compiles -->
<script setup>
import { onRenderTriggered } from 'vue'
import { collector } from '@softcodefr/vue-lens-core'

onRenderTriggered(() => {
  collector.emit({ type: 'render', component: 'MyComponent', ... })
})

const count = ref(0)
</script>
```

**Panel injection** — the plugin injects a virtual module import into `main.ts` at runtime. The panel mounts itself into the DOM with no `<VueDebugPanel />` component to add anywhere.

---

## Monorepo structure

```
@softcodefr/vue-lens/
├── packages/
│   ├── core/           # Event collector & ring buffer
│   └── vite-plugin/    # Vite plugin + SFC transform + panel UI
└── playground/         # Vue 3 app for local development
```

### `@softcodefr/vue-lens-core`

Framework-agnostic event bus. Collects render events in a fixed-size ring buffer (default: 200 events) and notifies subscribers in real time.

```ts
import { collector } from '@softcodefr/vue-lens-core'

// subscribe to events
const unsubscribe = collector.on((event) => {
  console.log(event) // { type: 'render', component: 'MyComponent', file: '...', ts: 1234567890 }
})

// read the buffer
collector.getBuffer()

// reset
collector.reset()
```

### `@softcodefr/vue-lens-vite-plugin`

Vite plugin that handles transform, virtual module resolution, and panel injection. Only active during `vite dev` (`apply: 'serve'`).

---

## Development

```bash
# install dependencies
pnpm install

# build all packages
pnpm build

# start the playground
pnpm dev
```

To work on a package with live rebuild:

```bash
cd packages/vite-plugin
pnpm dev   # tsup --watch
```

Then in another terminal:

```bash
cd playground
pnpm dev
```

---

## Roadmap

- [x] Re-render tracking per component
- [x] Automatic injection via Vite plugin
- [x] Zero config setup
- [x] Pinia/VueX mutation tracking
- [x] Vue Router navigation tracking
- [x] Network request tracking
- [ ] Session sharing (cloud)

---

## License

MIT
