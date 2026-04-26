import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: number
  name: string
  email: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  const isLoggedIn = computed(() => user.value !== null)

  async function login(email: string) {
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    user.value = {
      id: 1,
      name: 'John Doe',
      email
    }
    isLoading.value = false
  }

  function logout() {
    user.value = null
  }

  function updateProfile(name: string) {
    if (user.value) {
      user.value.name = name
    }
  }

  return { user, isLoading, isLoggedIn, login, logout, updateProfile }
})
