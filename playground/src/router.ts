import { createRouter, createWebHistory } from 'vue-router'
import CounterCard from './components/CounterCard.vue'
import CounterCardClassComponent from './components/CounterCardClassComponent.vue'
import TimerCard from './components/TimerCard.vue'
import CartCard from './components/CartCard.vue'
import UserCard from './components/UserCard.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: CounterCard },
    { path: '/class-component', component: CounterCardClassComponent },
    { path: '/timer', component: TimerCard },
    { path: '/cart', component: CartCard },
    { path: '/user', component: UserCard }
  ]
})