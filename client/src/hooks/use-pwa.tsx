import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAContextType {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstallable: boolean;
  isInstalled: boolean;
  installApp: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: ReactNode }) {
  // Temporarily disable PWA functionality to avoid React hook dispatcher issues
  console.warn('PWA functionality temporarily disabled due to React hook initialization issues');
  
  // Provide default PWA context values
  const defaultContext: PWAContextType = {
    deferredPrompt: null,
    isInstallable: false,
    isInstalled: false,
    installApp: async () => {
      console.warn('PWA install not available - PWA provider disabled');
      throw new Error('PWA functionality temporarily disabled');
    }
  };
  
  return (
    <PWAContext.Provider value={defaultContext}>
      {children}
    </PWAContext.Provider>
  );
  
  // Original hook-based code disabled until React dispatcher issue is resolved
  /*
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isStandalone);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(prompt);
      setIsInstallable(true);
      
      // Make it globally available for click handlers
      (window as any).deferredPrompt = prompt;
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);


  const installApp = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers without install prompt
      throw new Error('Install prompt not available');
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
      (window as any).deferredPrompt = null;
    } catch (error) {
      console.error('Install failed:', error);
      throw error;
    }
  };

  return (
    <PWAContext.Provider value={{
      deferredPrompt,
      isInstallable,
      isInstalled,
      installApp
    }}>
      {children}
    </PWAContext.Provider>
  );
  */
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}