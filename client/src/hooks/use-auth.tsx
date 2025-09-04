import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  email: string;
  fullName: string;
  personaTag?: string;
  onboardingComplete: boolean;
  createdAt: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<any, Error, LoginData>;
  logoutMutation: UseMutationResult<{ ok?: boolean; redirect?: string }, Error, void>;
  registerMutation: UseMutationResult<any, Error, RegisterData>;
  token: string | null;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  });

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | undefined, Error>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      if (!token) return undefined;
      
      const res = await fetch("/api/auth/me", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (res.status === 401) {
        // Token is invalid, clear it
        localStorage.removeItem('auth_token');
        setToken(null);
        return undefined;
      }
      
      if (!res.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      return await res.json();
    },
    enabled: !!token,
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return await res.json();
    },
    onSuccess: (data) => {
      const { user, token: authToken } = data;
      localStorage.setItem('auth_token', authToken);
      setToken(authToken);
      queryClient.setQueryData(["/api/auth/me"], user);
      toast({
        title: "Welcome back!",
        description: `Good to see you again, ${user.fullName}`,
      });
      // Redirect to appropriate destination
      window.location.href = user.onboardingComplete ? "/dashboard" : "/onboarding";
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", credentials);
      return await res.json();
    },
    onSuccess: (data) => {
      console.log('AuthHook: Registration success', data);
      // Store registration key for payment completion, but don't set user yet
      localStorage.setItem('registrationKey', data.registrationKey);
      localStorage.setItem('pendingEmail', data.email);
      // Account will be created only after successful payment
      toast({
        title: "Registration prepared!",
        description: "Complete your payment to activate your account",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await apiRequest("POST", "/api/auth/logout", {}); // sends Authorization if token present
        return await res.json(); // { ok?: boolean; redirect?: string }
      } catch {
        // Token missing/expired or network hiccup: still complete logout UX
        return { ok: true, redirect: "/?loggedOut=1" };
      }
    },
    onSuccess: (data: { ok?: boolean; redirect?: string }) => {
      try { localStorage.removeItem("auth_token"); } catch {}
      setToken(null);
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
      // Redirect immediately; skip toast to avoid flicker during unload
      window.location.replace(data?.redirect || "/?loggedOut=1");
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        token,
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