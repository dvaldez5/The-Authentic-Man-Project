import { ReactNode } from 'react';
import { usePWADetection } from '@/hooks/use-pwa-detection';
import { getTopPadding } from '@/utils/responsive-styles';

interface LearningPageContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  pageType?: 'main' | 'lesson';
}

export function LearningPageContainer({ 
  children, 
  maxWidth = '3xl',
  pageType = 'main'
}: LearningPageContainerProps) {
  const { isPWA } = usePWADetection();
  
  const maxWidthClass = {
    'sm': 'max-w-sm',
    'md': 'max-w-md', 
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl'
  }[maxWidth];

  const paddingClass = getTopPadding(isPWA, pageType);

  return (
    <div className="min-h-screen bg-black">
      <div className={`${maxWidthClass} mx-auto w-full px-6 ${paddingClass} pb-12`}>
        {children}
      </div>
    </div>
  );
}