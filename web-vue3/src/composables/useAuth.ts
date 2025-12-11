import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();

  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const user = computed(() => authStore.user);
  const currentClinic = computed(() => authStore.currentClinic);

  async function login(email: string, password: string) {
    try {
      await authStore.login({ email, password });

      if (authStore.user?.clinics?.length === 1) {
        await authStore.selectClinic(authStore.user.clinics[0].id);
        router.push('/dashboard');
      } else {
        router.push('/select-clinic');
      }
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    authStore.logout();
    router.push('/login');
  }

  return {
    isAuthenticated,
    user,
    currentClinic,
    login,
    logout,
  };
}
