# @softcodefr/vue-lens

Development-only Vue 3 inspector for renders, route changes, store mutations, and network requests.

`@softcodefr/vue-lens` is a Vite plugin that injects a floating debug panel into a Vue app during local development. It runs only in `vite dev` and is excluded from production builds.

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
    vueLens(),
  ],
})
```

The panel mounts itself automatically in development. No Vue component needs to be added to the app.

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
| `store` | `false` | Tracks Pinia or Vuex mutations. The plugin detects `pinia` or `vuex` from the app `package.json`. |
| `network` | `false` | Wraps `window.fetch` to track requests, status codes, durations, and basic GraphQL metadata. |

## How It Works

The plugin transforms Vue SFCs and the app entry during development:

- `.vue` files with `<script setup>` are instrumented with render tracking.
- `main.ts` or `main.js` imports the virtual panel module.
- Optional router, store, and network helpers are injected when enabled.

Because the plugin uses `apply: 'serve'`, it is active only while running the Vite dev server.

## Package Scripts

```bash
pnpm typecheck
pnpm build
pnpm dev
```

