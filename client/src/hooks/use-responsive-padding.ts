import { usePWADetection } from '@/hooks/use-pwa-detection';

export function useResponsivePadding(pageType: 'main' | 'lesson' | 'default' = 'default') {
  const { isPWA } = usePWADetection();
  
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