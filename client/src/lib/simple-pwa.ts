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

// Initialize on load
if (typeof window !== 'undefined') {
  initSimplePWA();
}