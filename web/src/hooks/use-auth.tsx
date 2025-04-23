import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/models";

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

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<AuthResponse, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<AuthResponse, Error, RegisterData>;
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
    queryKey: ["/api/v1/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!localStorage.getItem("token"), // Only run if token exists
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/v1/auth/login", credentials);
      const response = await res.json();
      return response.data;
    },
    onSuccess: (data: AuthResponse) => {
      // Save token to localStorage
      localStorage.setItem("token", data.token);
      
      // Update user data in the cache
      queryClient.setQueryData(["/api/v1/auth/user"], data.user);
      
      toast({
        title: "登入成功",
        description: `歡迎回來，${data.user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "登入失敗",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/v1/auth/register", userData);
      const response = await res.json();
      return response.data;
    },
    onSuccess: (data: AuthResponse) => {
      // Save token to localStorage
      localStorage.setItem("token", data.token);
      
      // Update user data in the cache
      queryClient.setQueryData(["/api/v1/auth/user"], data.user);
      
      toast({
        title: "註冊成功",
        description: `歡迎加入，${data.user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "註冊失敗",
        description: error.message,
        variant: "destructive",
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
      localStorage.removeItem("token");
      
      // Clear user data from cache
      queryClient.setQueryData(["/api/v1/auth/user"], null);
      
      toast({
        title: "登出成功",
        description: "您已成功登出系統",
      });
    },
  });

  // Check token on mount and window focus
  useEffect(() => {
    const token = localStorage.getItem("token");
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}