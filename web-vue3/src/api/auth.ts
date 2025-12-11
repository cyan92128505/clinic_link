import apiClient from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    clinics: Array<{
      id: string;
      name: string;
    }>;
  };
}

export const authAPI = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/api/v1/auth/login', data),

  register: (data: any) => apiClient.post('/api/v1/auth/register', data),

  selectClinic: (clinicId: string) =>
    apiClient.post('/api/v1/auth/select-clinic', { clinicId }),

  getCurrentUser: () => apiClient.get('/api/v1/auth/user'),
};
