<script lang="ts">
import { Component, Vue, toNative } from 'vue-facing-decorator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

@Component({
  components: {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Button,
    Separator,
    Badge
  }
})
class CounterCardClassComponent extends Vue {
  count = 0
  increment() {
    this.count++
  }
}

export default toNative(CounterCardClassComponent)
</script>

<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Counter Demo</CardTitle>
        <CardDescription>Test local state and Pinia store reactivity</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Local count</p>
            <p class="text-3xl font-bold">{{ count }}</p>
          </div>
          <Button @click="increment()">Increment local</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>