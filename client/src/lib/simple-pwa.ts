// Simple PWA utilities that don't use React hooks
// Workaround for multiple React instances issue

export interface SimplePWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  installApp: () => Promise<void>;
}

// Global PWA state without React hooks
let globalPWAState: SimplePWAState = {
  isInstallable: false,
  isInstalled: false,
  installApp: async () => {
    throw new Error('Install prompt not available');
  }
};

// Initialize PWA detection without React hooks
export function initSimplePWA(): SimplePWAState {
  if (typeof window === 'undefined') return globalPWAState;

  // Check if already installed
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as any).standalone === true;
  
  globalPWAState.isInstalled = isStandalone || isIOSStandalone;

  // Listen for install prompt
  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    const prompt = e as any; // BeforeInstallPromptEvent
    globalPWAState.isInstallable = true;
    
    // Create install function
    globalPWAState.installApp = async () => {
      try {
        if (prompt && prompt.prompt) {
          await prompt.prompt();
          const { outcome } = await prompt.userChoice;
          if (outcome === 'accepted') {
            globalPWAState.isInstalled = true;
          }
          globalPWAState.isInstallable = false;
        }
      } catch (error) {
        console.error('Install failed:', error);
        throw error;
      }
    };
  };

  // Listen for app installed
  const handleAppInstalled = () => {
    globalPWAState.isInstalled = true;
    globalPWAState.isInstallable = false;
  };

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);

  return globalPWAState;
}

// Get current PWA state
export function getSimplePWAState(): SimplePWAState {
  return globalPWAState;
}

// Simple PWA detection (replaces usePWADetection hook)
export function detectSimplePWAMode(): boolean {
  if (typeof window === "undefined") return false;
  
  const stored = localStorage.getItem("pwaMode") === "true";
  const qs = window.location.search;
  const hasPwaParam = /[\?&]pwa(=true|=1|(&|$))/.test(qs);
  
  if (hasPwaParam) {
    localStorage.setItem("pwaMode", "true");
    return true;
  }
  
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const isIOSStandalone = (window.navigator as any).standalone === true;
  if (isStandalone || isIOSStandalone) {
    localStorage.setItem("pwaMode", "true");
    return true;
  }
  
  const ua = navigator.userAgent;
  const inReplitIDE = /Replit-Bonsai/.test(ua) || window.location.hostname.includes("replit.dev");
  if (inReplitIDE) {
    return stored;
  }
  
  if (!hasPwaParam && !isStandalone && !isIOSStandalone) {
    if (stored) {
      localStorage.removeItem("pwaMode");
    }
    return false;
  }
  
  return stored;
}

// Initialize on load
if (typeof window !== 'undefined') {
  initSimplePWA();
}