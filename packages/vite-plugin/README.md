# @softcodefr/vue-lens

Zero-config debug panel for Vue 3. Add one line to your Vite config and get real-time visibility into renders, routing, store mutations, network requests, and user interactions.

`@softcodefr/vue-lens` is a Vite plugin that injects a floating debug panel and horizontal timeline into a Vue app during local development. It runs only in `vite dev` and is excluded from production builds.

![screen](https://github.com/SoftCodefr/vue-lens/blob/main/assets/screen.png?raw=true)

## Installation

```bash
pnpm add -D @softcodefr/vue-lens
```

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { vueLens } from '@softcodefr/vue-lens'

export default defineConfig({
  plugins: [
    vue(),
    vueLens({
      router: true,     // track Vue Router navigations
      store: true,      // track Pinia/Vuex mutations (auto-detected)
      network: true,    // track fetch requests + GraphQL
      timeline: true,   // show horizontal timeline panel
    }),
  ],
})
```

The panel mounts itself automatically in development. **No Vue component needs to be added** to the app.

## Configuration Options

| Option | Default | Description |
| --- | --- | --- |
| `router` | `false` | Tracks Vue Router navigations by instrumenting `router.afterEach`. |
| `store` | `false` | Tracks Pinia or Vuex mutations. Auto-detects from `package.json`. |
| `network` | `false` | Wraps `window.fetch` to track HTTP requests with GraphQL support. |
| `timeline` | `false` | Enables horizontal timeline panel with interaction tracking. |

## Features

### Main Panel
- **Renders tab**: Component re-render count with heat map, hover to highlight DOM elements
- **Routes tab**: Navigation history with from/to paths and timestamps  
- **Store tab**: Real-time mutation log for Pinia/Vuex with store + action names
- **Network tab**: HTTP requests with status codes, durations, and GraphQL operation names
- **Draggable**: Reposition anywhere on screen
- **Shadow DOM**: Isolated styles, no conflicts with your app

### Timeline Panel (when `timeline: true`)
- Horizontal scrollable timeline at bottom of screen
- Groups events by causal activity (100ms window)
- Click groups to expand render/route/store/network children
- Hover render events to highlight components in DOM
- Shows user interactions (clicks, inputs, form submits) as trigger events

## How It Works

### SFC Transform
The plugin automatically instruments Vue Single File Components:

```vue
<!-- Your component -->
<script setup>
const count = ref(0)
</script>

<!-- What gets compiled -->
<script setup>
import { onRenderTriggered, onMounted, getCurrentInstance } from 'vue'
import { collector } from '@softcodefr/vue-lens-core'

const __vlUid = Math.random().toString(36).slice(2)

onRenderTriggered((event) => {
  collector.emit({
    type: 'render',
    component: 'MyComponent',
    uid: __vlUid,
    reason: event.key,
    ts: Date.now()
  })
})

onMounted(() => {
  const el = getCurrentInstance()?.proxy?.$el
  if (el?.setAttribute) el.setAttribute('data-vue-lens-id', __vlUid)
})

const count = ref(0)
</script>
```

### Class Component Support
Components using `vue-facing-decorator` are also instrumented automatically.

### Virtual Module Injection
The panel is injected via virtual modules into your app's main entry file, requiring zero manual imports.

### Store Auto-Detection
Reads your `package.json` to detect Pinia or Vuex automatically.

## Development

```bash
# Build the plugin
pnpm build

# Run in watch mode  
pnpm dev

# Type checking
pnpm typecheck
```

## Core Package

This plugin depends on `@softcodefr/vue-lens-core` for event collection and buffering.

```ts
import { collector } from '@softcodefr/vue-lens-core'

// Listen to all events
collector.on((event) => {
  console.log(event.type) // 'render' | 'route' | 'store' | 'network' | 'interaction'
})
```

