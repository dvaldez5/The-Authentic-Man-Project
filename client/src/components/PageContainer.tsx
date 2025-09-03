import { detectSimplePWAMode } from '@/lib/simple-pwa';
import { getTopPadding } from '@/utils/responsive-styles';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export function PageContainer({ 
  children, 
  maxWidth = "max-w-7xl",
  className = ""
}: PageContainerProps) {
  const isPWA = detectSimplePWAMode();
  
  const paddingClass = getTopPadding(isPWA, 'default');
  
  return (
    <div className={`min-h-screen ${paddingClass} ${className}`}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidth}`}>
        {children}
      </div>
    </div>
  );
}