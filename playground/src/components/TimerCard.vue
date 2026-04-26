<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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
  <div>
    <p>Time : {{ time }}</p>
  </div>
</template>
