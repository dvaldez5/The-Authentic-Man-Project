import { useEffect, useState } from "react";

export function detectPWAMode(): boolean {
  if (typeof window === "undefined") return false;

  /* ----------------------------------------------------------- *
   * 0️⃣  If we already decided "PWA" in this tab, honour it      *
   * ----------------------------------------------------------- */
  const stored = localStorage.getItem("pwaMode") === "true";
  
  /* ----------------------------------------------------------- *
   * 1️⃣  URL override — works with ?pwa, ?pwa=1, ?pwa=true       *
   * ----------------------------------------------------------- */
  const qs = window.location.search;
  const hasPwaParam = /[\?&]pwa(=true|=1|(&|$))/.test(qs);
  
  console.log('PWA DETECTION DEBUG:', {
    search: qs,
    hasPwaParam,
    stored,
    hostname: window.location.hostname,
    userAgent: navigator.userAgent.substring(0, 80)
  });
  
  if (hasPwaParam) {
    localStorage.setItem("pwaMode", "true");
    console.log('PWA MODE SET BY URL PARAM');
    return true;
  }

  /* ----------------------------------------------------------- *
   * 2️⃣  Real standalone installs (Android WebAPK or iOS A2HS)   *
   * ----------------------------------------------------------- */
  const isStandalone   = window.matchMedia("(display-mode: standalone)").matches;
  const isIOSStandalone = (window.navigator as any).standalone === true;
  if (isStandalone || isIOSStandalone) {
    localStorage.setItem("pwaMode", "true");
    console.log('PWA MODE SET BY STANDALONE');
    return true;
  }

  /* ----------------------------------------------------------- *
   * 3️⃣  Replit-IDE preview guard *only*                         *
   *     – DO NOT treat generic WebView ("wv)") as dev           *
   * ----------------------------------------------------------- */
  const ua = navigator.userAgent;
  const inReplitIDE = /Replit-Bonsai/.test(ua) ||
                      window.location.hostname.includes("replit.dev");
  if (inReplitIDE) {
    console.log('IN REPLIT IDE, USING STORED:', stored);
    return stored;               // keep whatever we decided earlier
  }

  /* ----------------------------------------------------------- *
   * 4️⃣  Mobile browser without PWA param should never use PWA   *
   *     Clear stored PWA mode if no explicit PWA triggers       *
   * ----------------------------------------------------------- */
  if (!hasPwaParam && !isStandalone && !isIOSStandalone) {
    if (stored) {
      console.log('CLEARING STORED PWA MODE FOR MOBILE BROWSER');
      localStorage.removeItem("pwaMode");
    }
    return false;
  }

  /* ----------------------------------------------------------- *
   * 5️⃣  Fallback to whatever we stored earlier                  *
   * ----------------------------------------------------------- */
  console.log('FALLBACK TO STORED:', stored);
  return stored;
}

export function usePWADetection() {
  const [isPWA, setIsPWA] = useState(() => {
    const detected = detectPWAMode();
    
    console.log('PWA DETECTION:', {
      detected,
      isReplitDev: /Replit-Bonsai/.test(navigator.userAgent),
      userAgent: navigator.userAgent.substring(0, 80)
    });
    
    return detected;
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleDisplayModeChange = () => {
      const newDetection = detectPWAMode();
      if (newDetection !== isPWA) {
        setIsPWA(newDetection);
      }
    };

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, [isPWA]);

  return { isPWA, isLoading };
}