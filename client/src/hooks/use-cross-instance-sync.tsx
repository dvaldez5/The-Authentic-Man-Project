import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Cross-instance synchronization using localStorage events
export function useCrossInstanceSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Only respond to our sync events
      if (e.key === 'am_sync_update' && e.newValue) {
        const syncData = JSON.parse(e.newValue);
        
        // Invalidate relevant queries based on the update type
        switch (syncData.type) {
          case 'challenge_complete':
            Promise.all([
              queryClient.invalidateQueries({ queryKey: ['/api/daily-challenge'], refetchType: 'active' }),
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'], refetchType: 'active' }),
              queryClient.invalidateQueries({ queryKey: ['/api/challenges/progress'], refetchType: 'active' }),
              queryClient.invalidateQueries({ queryKey: ['/api/challenges/history'], refetchType: 'active' }),
              queryClient.invalidateQueries({ queryKey: ['/api/journal'], refetchType: 'active' })
            ]).then(() => {
              // Force immediate refetch for critical UI synchronization
              queryClient.refetchQueries({ queryKey: ['/api/daily-challenge'] });
              queryClient.refetchQueries({ queryKey: ['/api/dashboard/stats'] });
            });
            break;
          case 'lesson_complete':
            queryClient.invalidateQueries({ queryKey: ['/api/learning/courses'] });
            queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
            queryClient.invalidateQueries({ queryKey: ['/api/learning/lessons', syncData.lessonId] });
            break;
          case 'journal_entry':
            queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
            queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
            break;
          case 'scenario_complete':
            queryClient.invalidateQueries({ queryKey: ['/api/scenarios'] });
            queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
            break;
          case 'weekly_reflection':
            queryClient.invalidateQueries({ queryKey: ['/api/weekly-reflections'] });
            queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
            break;
          case 'pod_update':
            queryClient.invalidateQueries({ queryKey: ['/api/pod'] });
            break;
          case 'community_message':
            if (syncData.channelId) {
              queryClient.invalidateQueries({ queryKey: [`/api/community/channels/${syncData.channelId}/messages`] });
            }
            queryClient.invalidateQueries({ queryKey: ['/api/community/channels'] });
            break;
          case 'all':
            // Invalidate all user data
            queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
            queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
            queryClient.invalidateQueries({ queryKey: ['/api/daily-challenge'] });
            queryClient.invalidateQueries({ queryKey: ['/api/learning/courses'] });
            queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
            queryClient.invalidateQueries({ queryKey: ['/api/scenarios'] });
            queryClient.invalidateQueries({ queryKey: ['/api/weekly-reflections'] });
            queryClient.invalidateQueries({ queryKey: ['/api/pod'] });
            queryClient.invalidateQueries({ queryKey: ['/api/community'] });
            break;
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [queryClient]);
}

// Broadcast an update to all other instances
export function broadcastUpdate(type: string, data?: any) {
  const syncData = {
    type,
    timestamp: Date.now(),
    ...data
  };
  
  // Use localStorage to trigger storage events in other tabs/instances
  localStorage.setItem('am_sync_update', JSON.stringify(syncData));
  
  // Remove the item immediately to allow for repeated broadcasts of the same type
  setTimeout(() => {
    localStorage.removeItem('am_sync_update');
  }, 100);
}