// Replit-specific cache clearing for React instance conflicts
export async function clearReplitCaches(): Promise<boolean> {
  try {
    // Clear all browser caches programmatically
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    
    // Clear all cache storage
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      await caches.delete(cacheName);
    }
    
    // Clear localStorage that might store stale React references
    localStorage.clear();
    sessionStorage.clear();
    
    // Force page reload with cache bypass
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('Cache clearing failed:', error);
    // Fallback: still try to reload
    window.location.reload();
    return false;
  }
}

// Auto-detect React conflicts and clear caches
export function detectAndClearReactConflicts() {
  // Check if we have the React hook error
  const hasReactError = window.console.error.toString().includes('useState') || 
                       document.querySelector('[data-react-error]') !== null;
  
  // Check for multiple React renderers
  const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  const rendererCount = hook?.renderers ? Object.keys(hook.renderers).length : 0;
  
  if (hasReactError || rendererCount === 0) {
    console.log('🔧 React conflict detected, clearing Replit caches...');
    clearReplitCaches();
  }
}