<script setup lang="ts">
import { ref } from 'vue'
import { useCounterStore } from '../stores/counter'

const count = ref(0)
const store = useCounterStore()
</script>

<template>
  <div>
    <p>Local count : {{ count }}</p>
    <button @click="count++">Increment local</button>
    <p>Store count : {{ store.count }}</p>
    <button @click="store.increment()">Increment store</button>
  </div>
</template>