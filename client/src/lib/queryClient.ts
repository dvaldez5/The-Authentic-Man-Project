import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: 30000, // Refetch every 30 seconds for critical data
      refetchOnWindowFocus: true, // Refetch when switching between instances
      staleTime: 10000, // Data becomes stale after 10 seconds
      retry: false,
      refetchIntervalInBackground: true, // Keep refetching even when tab is not focused
    },
    mutations: {
      retry: false,
    },
  },
});

// Global cache invalidation for cross-instance sync (moved after queryClient declaration)
export function invalidateAllUserData() {
  queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
  queryClient.invalidateQueries({ queryKey: ['/api/daily-challenge'] });
  queryClient.invalidateQueries({ queryKey: ['/api/learning/courses'] });
  queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
  queryClient.invalidateQueries({ queryKey: ['/api/scenarios'] });
  queryClient.invalidateQueries({ queryKey: ['/api/weekly-reflections'] });
}
