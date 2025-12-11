
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/client'

const authStore = useAuthStore()
const stats = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await apiClient.get('/api/v1/stats/dashboard')
    stats.value = data
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <p class="text-gray-600">Welcome, {{ authStore.user?.name }}</p>
      <p class="text-sm text-gray-500">Clinic: {{ authStore.currentClinic?.name }}</p>
    </div>
    
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
    
    <div v-else-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-gray-500 text-sm">Today's Appointments</h3>
        <p class="text-3xl font-bold mt-2">{{ stats.todayAppointments || 0 }}</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-gray-500 text-sm">Waiting</h3>
        <p class="text-3xl font-bold mt-2">{{ stats.waitingCount || 0 }}</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-gray-500 text-sm">In Progress</h3>
        <p class="text-3xl font-bold mt-2">{{ stats.inProgressCount || 0 }}</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-gray-500 text-sm">Completed</h3>
        <p class="text-3xl font-bold mt-2">{{ stats.completedCount || 0 }}</p>
      </div>
    </div>
  </div>
</template>