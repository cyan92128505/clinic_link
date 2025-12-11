import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
    },
    {
      path: '/select-clinic',
      name: 'select-clinic',
      component: () => import('@/views/auth/SelectClinicView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/DashboardView.vue'),
      meta: { requiresAuth: true, requiresClinic: true },
    },
    {
      path: '/appointments',
      name: 'appointments',
      component: () => import('@/views/appointments/AppointmentListView.vue'),
      meta: { requiresAuth: true, requiresClinic: true },
    },
  ],
});

// Navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' });
  } else if (to.meta.requiresClinic && !authStore.selectedClinicId) {
    next({ name: 'select-clinic' });
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;
