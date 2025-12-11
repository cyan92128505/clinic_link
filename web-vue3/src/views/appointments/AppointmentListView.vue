
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/api/client'

interface Appointment {
  id: string
  appointmentNumber: string
  patientName: string
  status: string
  appointmentTime: string
}

const appointments = ref<Appointment[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await apiClient.get('/api/v1/appointments')
    appointments.value = data
  } finally {
    loading.value = false
  }
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    WAITING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Appointments</h1>
    
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
    
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="apt in appointments" :key="apt.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">{{ apt.appointmentNumber }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ apt.patientName }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ new Date(apt.appointmentTime).toLocaleString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusColor(apt.status)]">
                {{ apt.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>