<script setup lang="ts">
import { useCartStore } from '../stores/cart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const cart = useCartStore()

const products = [
  { id: 1, name: 'Vue.js T-Shirt', price: 29 },
  { id: 2, name: 'Pinia Mug', price: 15 },
  { id: 3, name: 'Vite Stickers', price: 5 },
]
</script>

<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Shopping Cart</CardTitle>
          <Badge v-if="cart.itemCount > 0">{{ cart.itemCount }} items</Badge>
        </div>
        <CardDescription>Test Pinia actions: addToCart, removeFromCart, clearCart</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-3">
          <div 
            v-for="product in products" 
            :key="product.id"
            class="flex items-center justify-between rounded-lg border p-3"
          >
            <div>
              <p class="font-medium">{{ product.name }}</p>
              <p class="text-sm text-muted-foreground">{{ product.price }}€</p>
            </div>
            <Button size="sm" @click="cart.addToCart(product)">
              Add to cart
            </Button>
          </div>
        </div>

        <Separator v-if="cart.items.length > 0" />

        <div v-if="cart.items.length > 0" class="space-y-3">
          <p class="text-sm font-medium text-muted-foreground">Cart items:</p>
          <div 
            v-for="item in cart.items" 
            :key="item.id"
            class="flex items-center justify-between rounded-md bg-muted p-2"
          >
            <div class="flex items-center gap-2">
              <span>{{ item.name }}</span>
              <Badge variant="outline">x{{ item.quantity }}</Badge>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm">{{ item.price * item.quantity }}€</span>
              <Button 
                variant="ghost" 
                size="sm"
                @click="cart.removeFromCart(item.id)"
              >
                ✕
              </Button>
            </div>
          </div>

          <Separator />

          <div class="flex items-center justify-between">
            <span class="font-semibold">Total: {{ cart.total }}€</span>
            <Button variant="destructive" size="sm" @click="cart.clearCart()">
              Clear cart
            </Button>
          </div>
        </div>

        <p v-else class="text-center text-sm text-muted-foreground">
          Cart is empty. Add some products!
        </p>
      </CardContent>
    </Card>
  </div>
</template>
