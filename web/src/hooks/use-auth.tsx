import { createContext, ReactNode, useContext, useEffect } from 'react';
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from '@tanstack/react-query';
import { getQueryFn, apiRequest, queryClient } from '../lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/models';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { auth, browserPopupRedirectResolver } from '@/lib/firebase';

// Define types for our application
type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
  name: string;
  phone?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
};

type AuthResponse = {
  token: string;
  user: User;
};

type FirebaseLoginMethod = 'password' | 'google';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<AuthResponse, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<AuthResponse, Error, RegisterData>;
  firebaseLoginMutation: UseMutationResult<
    AuthResponse,
    Error,
    { method: FirebaseLoginMethod; data?: LoginData }
  >;
  firebaseLogoutMutation: UseMutationResult<void, Error, void>;
  firebaseRegisterMutation: UseMutationResult<
    AuthResponse,
    Error,
    RegisterData
  >;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Use query to get current user data
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/v1/auth/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!localStorage.getItem('token'), // Only run if token exists
  });

  const exchangeFirebaseTokenForJWT = async (
    userCredential: UserCredential,
  ) => {
    // 獲取 Firebase ID token
    const idToken = await userCredential.user.getIdToken();

    // 將 Firebase ID token 發送到後端以換取 JWT
    const res = await apiRequest('POST', '/api/v1/auth/firebase', {
      token: idToken,
    });
    const response = await res.json();
    return response.data;
  };

  const firebaseLoginMutation = useMutation({
    mutationFn: async ({
      method,
      data,
    }: {
      method: FirebaseLoginMethod;
      data?: LoginData;
    }) => {
      let userCredential: UserCredential;

      // 依據不同方法進行 Firebase 登入
      switch (method) {
        case 'password':
          if (!data) throw new Error('Email and password are required');
          userCredential = await signInWithEmailAndPassword(
            auth,
            data.email,
            data.password,
          );
          break;
        case 'google':
          const provider = new GoogleAuthProvider();
          userCredential = await signInWithPopup(
            auth,
            provider,
            browserPopupRedirectResolver,
          );
          break;
        default:
          throw new Error('Unsupported login method');
      }

      // 用 Firebase token 交換後端 JWT
      return await exchangeFirebaseTokenForJWT(userCredential);
    },
    onSuccess: (data: AuthResponse) => {
      // 儲存 token 到 localStorage
      localStorage.setItem('token', data.token);

      // 更新 user 資料到快取
      queryClient.setQueryData(['/api/v1/auth/user'], data.user);

      toast({
        title: '登入成功',
        description: `歡迎回來，${data.user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: '登入失敗',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest('POST', '/api/v1/auth/login', credentials);
      const response = await res.json();
      return response.data;
    },
    onSuccess: (data: AuthResponse) => {
      // Save token to localStorage
      localStorage.setItem('token', data.token);

      // Update user data in the cache
      queryClient.setQueryData(['/api/v1/auth/user'], data.user);

      toast({
        title: '登入成功',
        description: `歡迎回來，${data.user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: '登入失敗',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest('POST', '/api/v1/auth/register', userData);
      const response = await res.json();
      return response.data;
    },
    onSuccess: (data: AuthResponse) => {
      // Save token to localStorage
      localStorage.setItem('token', data.token);

      // Update user data in the cache
      queryClient.setQueryData(['/api/v1/auth/user'], data.user);

      toast({
        title: '註冊成功',
        description: `歡迎加入，${data.user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: '註冊失敗',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const firebaseRegisterMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      // 使用 Firebase 建立帳號
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password,
      );

      // 用 Firebase token 交換後端 JWT，同時傳送使用者資料
      const idToken = await userCredential.user.getIdToken();

      // 移除密碼再傳送，密碼已經由 Firebase 處理
      const { password, ...userDataWithoutPassword } = userData;

      const res = await apiRequest('POST', '/api/v1/auth/firebase/register', {
        token: idToken,
        userData: userDataWithoutPassword,
      });

      const response = await res.json();
      return response.data;
    },
    onSuccess: (data: AuthResponse) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(['/api/v1/auth/user'], data.user);

      toast({
        title: '註冊成功',
        description: `歡迎加入，${data.user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: '註冊失敗',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // No need to call API for logout with JWT
      // Just remove the token from localStorage
    },
    onSuccess: () => {
      // Remove token from localStorage
      localStorage.removeItem('token');

      // Clear user data from cache
      queryClient.setQueryData(['/api/v1/auth/user'], null);

      toast({
        title: '登出成功',
        description: '您已成功登出系統',
      });
    },
  });

  const firebaseLogoutMutation = useMutation({
    mutationFn: async () => {
      // Firebase 登出
      await signOut(auth);

      // 可選：呼叫後端 API 通知登出
      // await apiRequest("POST", "/api/v1/auth/logout");
    },
    onSuccess: () => {
      // 清除 localStorage 中的 token
      localStorage.removeItem('token');

      // 清除快取中的使用者資料
      queryClient.setQueryData(['/api/v1/auth/user'], null);

      toast({
        title: '登出成功',
        description: '您已成功登出系統',
      });
    },
  });

  // Check token on mount and window focus
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      refetch();
    }
  }, [refetch, user]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        firebaseLoginMutation,
        firebaseRegisterMutation,
        firebaseLogoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
