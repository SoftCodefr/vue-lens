<script setup lang="ts">
import { ref } from 'vue'
import { useCounterStore } from '../stores/counter'

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
  <div>
    <p>Local count : {{ count }}</p>
    <button @click="count++">Increment local</button>

    <p>Store count : {{ store.count }}</p>
    <button @click="store.increment()">Increment store</button>

    <hr />

    <button @click="testRest" :disabled="loading">Fetch REST</button>
    <button @click="testGraphQL" :disabled="loading">Fetch GraphQL</button>

    <p v-if="loading">Loading...</p>
    <p v-if="result">{{ result }}</p>
  </div>
</template>