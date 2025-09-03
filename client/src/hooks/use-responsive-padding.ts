import { detectSimplePWAMode } from '@/lib/simple-pwa';

export function useResponsivePadding(pageType: 'main' | 'lesson' | 'default' = 'default') {
  const isPWA = detectSimplePWAMode();
  
  if (isPWA) {
    return 'pt-2';
  }
  
  // For non-PWA (mobile browser and desktop)
  switch (pageType) {
    case 'main':
      return 'pt-8 md:pt-32';
    case 'lesson':
      return 'pt-6';
    default:
      return 'pt-8 md:pt-32';
  }
}