import { useState, useEffect } from "react";
import { usePWA } from "@/hooks/use-pwa";
import PWAInstallationGuide from "@/components/PWAInstallationGuide";

export default function InstallPrompt() {
  const [dismissed, setDismissed] = useState(false);
  const { isInstalled, isInstallable } = usePWA();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    // Check if already dismissed
    const isDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed, dismissed, or not installable
  if (isInstalled || dismissed || (!isInstallable && !isIOS)) {
    return null;
  }

  return (
    <PWAInstallationGuide 
      onDismiss={handleDismiss}
      showDismiss={true}
    />
  );
}