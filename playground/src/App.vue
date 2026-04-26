<script setup lang="ts">
</script>

<template>
  <div>
    <nav>
      <RouterLink to="/">Counter</RouterLink>
      <RouterLink to="/timer">Timer</RouterLink>
    </nav>
    <RouterView />
    <RouterView />
  </div>
</template>