<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const time = ref(new Date().toLocaleTimeString())
let interval: ReturnType<typeof setInterval>

onMounted(() => {
  interval = setInterval(() => {
    time.value = new Date().toLocaleTimeString()
  }, 1000)
})

onUnmounted(() => clearInterval(interval))
</script>

<template>
  <Card class="max-w-md">
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>Timer</CardTitle>
        <Badge variant="outline">Live</Badge>
      </div>
      <CardDescription>Real-time clock with lifecycle hooks</CardDescription>
    </CardHeader>
    <CardContent>
      <p class="text-5xl font-bold tabular-nums tracking-tight">{{ time }}</p>
      <p class="mt-2 text-sm text-muted-foreground">
        Updates every second using <code class="rounded bg-muted px-1 py-0.5 text-xs">setInterval</code>
      </p>
    </CardContent>
  </Card>
</template>
