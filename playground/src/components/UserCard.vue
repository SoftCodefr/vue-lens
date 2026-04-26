<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../stores/user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const user = useUserStore()
const email = ref('john@example.com')
const newName = ref('')
</script>

<template>
  <div class="space-y-6">
    <Card class="max-w-md">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>User Session</CardTitle>
          <Badge :variant="user.isLoggedIn ? 'default' : 'secondary'">
            {{ user.isLoggedIn ? 'Online' : 'Offline' }}
          </Badge>
        </div>
        <CardDescription>Test Pinia actions: login, logout, updateProfile</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-if="!user.isLoggedIn" class="space-y-3">
          <div class="space-y-2">
            <label class="text-sm font-medium">Email</label>
            <input 
              v-model="email"
              type="email"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="your@email.com"
            />
          </div>
          <Button 
            class="w-full" 
            @click="user.login(email)"
            :disabled="user.isLoading"
          >
            {{ user.isLoading ? 'Logging in...' : 'Login' }}
          </Button>
        </div>

        <div v-else class="space-y-4">
          <div class="rounded-lg bg-muted p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {{ user.user?.name.charAt(0) }}
              </div>
              <div>
                <p class="font-medium">{{ user.user?.name }}</p>
                <p class="text-sm text-muted-foreground">{{ user.user?.email }}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div class="space-y-2">
            <label class="text-sm font-medium">Update name</label>
            <div class="flex gap-2">
              <input 
                v-model="newName"
                type="text"
                class="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="New name"
              />
              <Button 
                variant="secondary"
                @click="user.updateProfile(newName); newName = ''"
                :disabled="!newName"
              >
                Update
              </Button>
            </div>
          </div>

          <Button variant="outline" class="w-full" @click="user.logout()">
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
