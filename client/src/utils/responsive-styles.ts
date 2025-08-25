/**
 * Centralized responsive styling utilities to prevent cross-contamination
 * between PWA and browser modes
 */

export function getTopPadding(isPWA: boolean, isMobile: boolean = false, pageType: 'main' | 'lesson' | 'default' = 'default'): string {
  if (isPWA) {
    return 'pt-8'; // Reduced padding for PWA
  }
  
  // Mobile browser gets different padding than desktop browser
  if (isMobile) {
    switch (pageType) {
      case 'main':
        return 'pt-28';
      case 'lesson':
        return 'pt-16';
      default:
        return 'pt-28';
    }
  }
  
  // Desktop browser padding
  switch (pageType) {
    case 'main':
      return 'pt-32 md:pt-48';
    case 'lesson':
      return 'pt-16';
    default:
      return 'pt-32 md:pt-48';
  }
}

export function getChatBubblePosition(isPWA: boolean, navVisible: boolean): string {
  if (isPWA) {
    // PWA mode: position above bottom navigation with more clearance
    return navVisible ? 'bottom-[120px]' : 'bottom-6';
  } else {
    // Browser mode: always use standard bottom position
    return 'bottom-4';
  }
}