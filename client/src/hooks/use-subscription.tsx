import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionStatus: string | null;
  isDevAccount: boolean;
}

export function useSubscription() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: subscriptionData, isLoading: subscriptionLoading, error } = useQuery<SubscriptionStatus>({
    queryKey: ['/api/subscription-status'],
    enabled: !!user && !authLoading,
    retry: false,
  });

  return {
    hasActiveSubscription: subscriptionData?.hasActiveSubscription ?? false,
    subscriptionStatus: subscriptionData?.subscriptionStatus ?? null,
    isDevAccount: subscriptionData?.isDevAccount ?? false,
    isLoading: authLoading || subscriptionLoading,
    error,
  };
}