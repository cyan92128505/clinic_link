import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authAPI } from '@/api/auth';
import type { LoginRequest } from '@/api/auth';

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<any>(null);
  const selectedClinicId = ref<string | null>(
    localStorage.getItem('selectedClinicId'),
  );

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const currentClinic = computed(() => {
    if (!user.value || !selectedClinicId.value) return null;
    return user.value.clinics?.find(
      (c: any) => c.id === selectedClinicId.value,
    );
  });

  // Actions
  async function login(credentials: LoginRequest) {
    try {
      const { data } = await authAPI.login(credentials);
      token.value = data.access_token;
      user.value = data.user;
      localStorage.setItem('token', data.access_token);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async function selectClinic(clinicId: string) {
    await authAPI.selectClinic(clinicId);
    selectedClinicId.value = clinicId;
    localStorage.setItem('selectedClinicId', clinicId);
  }

  function logout() {
    token.value = null;
    user.value = null;
    selectedClinicId.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('selectedClinicId');
  }

  return {
    token,
    user,
    selectedClinicId,
    isAuthenticated,
    currentClinic,
    login,
    selectClinic,
    logout,
  };
});
