<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="min-h-screen bg-background">
    <nav class="border-b">
      <div class="container mx-auto flex h-14 items-center gap-4 px-4">
        <span class="text-lg font-semibold">VueLens Playground</span>
        <div class="flex gap-2">
          <RouterLink to="/" custom v-slot="{ navigate, isActive }">
            <Button
              :variant="isActive ? 'default' : 'ghost'"
              size="sm"
              @click="navigate"
            >
              Counter
            </Button>
          </RouterLink>
          <RouterLink to="/class-component" custom v-slot="{ navigate, isActive }">
            <Button
              :variant="isActive ? 'default' : 'ghost'"
              size="sm"
              @click="navigate"
            >
              Counter (Vue Facing Decorator)
            </Button>
          </RouterLink>
          <RouterLink to="/timer" custom v-slot="{ navigate, isActive }">
            <Button
              :variant="isActive ? 'default' : 'ghost'"
              size="sm"
              @click="navigate"
            >
              Timer
            </Button>
          </RouterLink>
          <RouterLink to="/cart" custom v-slot="{ navigate, isActive }">
            <Button
              :variant="isActive ? 'default' : 'ghost'"
              size="sm"
              @click="navigate"
            >
              Cart
            </Button>
          </RouterLink>
          <RouterLink to="/user" custom v-slot="{ navigate, isActive }">
            <Button
              :variant="isActive ? 'default' : 'ghost'"
              size="sm"
              @click="navigate"
            >
              User
            </Button>
          </RouterLink>
        </div>
      </div>
    </nav>
    <main class="container mx-auto p-4">
      <RouterView />
    </main>
  </div>
</template>