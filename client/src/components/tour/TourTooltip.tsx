import React, { useEffect, useRef, useState } from 'react';
import { useOnboardingTour } from '@/contexts/OnboardingTourContext';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';

export function TourTooltip() {
  const { 
    isActive, 
    activeTour, 
    currentStep, 
    nextStep, 
    prevStep, 
    skipTour, 
    endTour 
  } = useOnboardingTour();

  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    if (!isActive || !activeTour) {
      setIsVisible(false);
      return;
    }

    const currentTourStep = activeTour.steps[currentStep];
    if (!currentTourStep) {
      setIsVisible(false);
      return;
    }

    const updatePosition = () => {
      const targetElement = document.querySelector(`[data-tour="${currentTourStep.target}"]`);
      
      if (!targetElement) {
        console.warn(`Tour target element not found: [data-tour="${currentTourStep.target}"]`);
        console.warn('Available tour elements:', Array.from(document.querySelectorAll('[data-tour]')).map(el => el.getAttribute('data-tour')));
        
        // Show fallback tooltip
        setPosition({ top: 200, left: 50 });
        setIsVisible(true);
        return;
      }

      const rect = targetElement.getBoundingClientRect();


      // Calculate position with better logic
      const placement = currentTourStep.placement || 'bottom';
      const tooltipWidth = 320;
      const tooltipHeight = 250;
      
      let calculatedTop = rect.bottom + 32;
      let calculatedLeft = rect.left + (rect.width / 2) - (tooltipWidth / 2);

      // Calculate position with better logic
      if (placement === 'top') {
        calculatedTop = rect.top - tooltipHeight - 32;
        // Ensure top placement doesn't go above viewport
        if (calculatedTop < 32) {
          calculatedTop = rect.bottom + 32; // Fallback to bottom with more spacing
        }
      } else if (placement === 'left') {
        calculatedTop = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        calculatedLeft = rect.left - tooltipWidth - 16;
      } else if (placement === 'right') {
        calculatedTop = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        calculatedLeft = rect.right + 16;
      }

      // Keep within viewport bounds
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Horizontal bounds
      if (calculatedLeft < 16) {
        calculatedLeft = 16;
      } else if (calculatedLeft + tooltipWidth > viewportWidth - 16) {
        calculatedLeft = viewportWidth - tooltipWidth - 16;
      }
      
      // Vertical bounds - ensure tooltip stays visible with more spacing
      if (calculatedTop < 32) {
        calculatedTop = 32;
      } else if (calculatedTop + tooltipHeight > viewportHeight - 80) {
        calculatedTop = viewportHeight - tooltipHeight - 80;
        if (calculatedTop < 32) {
          calculatedTop = 32;
        }
      }


      setPosition({ top: calculatedTop, left: calculatedLeft });
      setIsVisible(true);

      // Add highlight - ensure it's always visible
      targetElement.classList.add('tour-highlight');
      
      // Force inline styles for XP chip highlighting
      if (currentTourStep.target === 'xp-chip') {
        targetElement.style.outline = '2px solid #C47F00';
        targetElement.style.outlineOffset = '4px';
        targetElement.style.borderRadius = '8px';
        targetElement.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.3)';
        targetElement.style.position = 'relative';
        targetElement.style.zIndex = '60';
      }
      
      if (targetElement.classList.contains('tour-target')) {
        targetElement.style.transform = 'scale(1.02)';
      }

      // Execute any step actions (like navigation)
      if (currentTourStep.action) {
        setTimeout(() => {
          currentTourStep.action!();
        }, 500);
      }

      // Conditional scrolling with page-specific behavior
      setTimeout(() => {
        const elementRect = targetElement.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementTop = elementRect.top;
        const elementBottom = elementRect.bottom;
        
        // Weekly reflections gets FORCED aggressive scrolling for EVERY step
        if (window.location.pathname === '/weekly-reflections') {
          console.log('🔄 WEEKLY REFLECTIONS FORCED SCROLL - Element:', currentTourStep.target);
          console.log('🔄 Element rect:', elementRect);
          
          const currentScrollY = window.scrollY;
          const elementAbsoluteTop = currentScrollY + elementTop;
          const targetScrollY = elementAbsoluteTop - 200; // Position 200px from top for better visibility
          
          console.log('🔄 Scroll calculation:', {
            currentScrollY,
            elementTop,
            elementAbsoluteTop,
            targetScrollY
          });
          
          // FORCE scroll immediately
          window.scrollTo({
            top: Math.max(0, targetScrollY),
            behavior: 'smooth'
          });
          
          // Additional forced scroll after delay to ensure it happens
          setTimeout(() => {
            console.log('🔄 SECONDARY FORCED SCROLL for weekly reflections');
            window.scrollTo({
              top: Math.max(0, targetScrollY),
              behavior: 'smooth'
            });
          }, 300);
        } else {
          // Other pages use conservative scrolling only when needed
          const topPadding = 150;
          const bottomPadding = 100;
          
          if (elementTop < topPadding || elementBottom > windowHeight - bottomPadding) {
            const elementCenter = elementRect.top + elementRect.height / 2;
            const targetScrollTop = window.scrollY + elementCenter - windowHeight / 2;
            
            window.scrollTo({
              top: Math.max(0, targetScrollTop),
              behavior: 'smooth'
            });
          }
        }
      }, 150);
    };

    // Update position
    setTimeout(updatePosition, 100);

    // Cleanup highlights
    return () => {
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
        // Reset all inline styles
        const htmlEl = el as HTMLElement;
        htmlEl.style.transform = '';
        htmlEl.style.outline = '';
        htmlEl.style.outlineOffset = '';
        htmlEl.style.borderRadius = '';
        htmlEl.style.boxShadow = '';
        htmlEl.style.position = '';
        htmlEl.style.zIndex = '';
      });
    };
  }, [isActive, activeTour, currentStep]);

  if (!isActive || !activeTour) return null;

  const currentTourStep = activeTour.steps[currentStep];
  if (!currentTourStep) return null;



  return (
    <div
      ref={tooltipRef}
      className={`fixed z-[100] bg-white border-2 border-blue-500 rounded-lg shadow-xl p-6 w-80 transition-all duration-300 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {currentTourStep.title}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={endTour}
          className="p-1 h-auto"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="mb-6">
        <p className="text-gray-700 text-sm leading-relaxed">
          {currentTourStep.content}
        </p>
      </div>

      {/* Progress */}
      {activeTour.showProgress && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Step {currentStep + 1} of {activeTour.steps.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / activeTour.steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {currentTourStep.showPrev && currentStep > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {currentTourStep.showSkip && activeTour.allowSkip && (
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="flex items-center gap-1 text-gray-500"
            >
              <SkipForward className="h-3 w-3" />
              Skip
            </Button>
          )}
          
          {currentTourStep.isLastStep ? (
            <Button
              size="sm"
              onClick={endTour}
              className="flex items-center gap-1"
            >
              Finish
            </Button>
          ) : currentTourStep.showNext !== false && (
            <Button
              size="sm"
              onClick={nextStep}
              className="flex items-center gap-1"
            >
              Next
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}