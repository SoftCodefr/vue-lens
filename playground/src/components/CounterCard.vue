<script setup lang="ts">
import { ref } from 'vue'
import { useCounterStore } from '../stores/counter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

const count = ref(0)
const store = useCounterStore()
const result = ref<string | null>(null)
const loading = ref(false)

async function testRest() {
  loading.value = true
  const res = await fetch('https://jsonplaceholder.typicode.com/todos/1')
  const data = await res.json()
  result.value = `REST → ${data.title}`
  loading.value = false
}

async function testGraphQL() {
  loading.value = true
  const res = await fetch('https://countries.trevorblades.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operationName: 'GetCountry',
      query: `query GetCountry { country(code: "FR") { name capital currency } }`
    })
  })
  const data = await res.json()
  result.value = `GraphQL → ${data.data.country.name}`
  loading.value = false
}
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
          <Button @click="count++">Increment local</Button>
        </div>

        <Separator />

        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Store count (Pinia)</p>
            <p class="text-3xl font-bold">{{ store.count }}</p>
          </div>
          <Button variant="secondary" @click="store.increment()">Increment store</Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Network Requests</CardTitle>
        <CardDescription>Test REST and GraphQL fetch tracking</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex gap-2">
          <Button variant="outline" @click="testRest" :disabled="loading">
            Fetch REST
          </Button>
          <Button variant="outline" @click="testGraphQL" :disabled="loading">
            Fetch GraphQL
          </Button>
        </div>

        <div v-if="loading" class="flex items-center gap-2">
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span class="text-sm text-muted-foreground">Loading...</span>
        </div>

        <div v-if="result" class="rounded-md bg-muted p-3">
          <Badge variant="secondary" class="mb-2">Response</Badge>
          <p class="text-sm">{{ result }}</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>