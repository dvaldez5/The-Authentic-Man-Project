import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Splash() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash for minimum 4 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash && !isLoading) {
      if (user) {
        // Force navigation to dashboard
        window.location.href = "/dashboard";
      } else {
        // Force navigation to auth
        window.location.href = "/auth";
      }
    }
  }, [showSplash, isLoading, user, setLocation]);

  return (
    <div className="min-h-screen flex flex-col justify-center relative overflow-hidden bg-gradient-to-r from-background via-background/95 to-background/80">
      {/* Background decorative elements - exact from homepage */}
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl z-0"></div>
      <div className="absolute left-0 bottom-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl z-0"></div>

      {/* Main splash content */}
      <div className="container py-16 z-10 relative flex flex-col items-center justify-center space-y-8">
        {/* Exact homepage hero compass element */}
        <div className="relative h-[400px] w-full flex justify-center items-center">
          {/* Background glow effect - exact from homepage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute w-48 md:w-64 h-48 md:h-64 bg-primary/10 rounded-full blur-2xl"></div>
          </div>
          
          {/* Logo container with animated elements - EXACT FROM HOMEPAGE */}
          <div className="relative w-[250px] h-[250px] md:w-[400px] md:h-[400px]">
            {/* Main logo */}
            <img 
              src="/images/logo-inverted.svg" 
              alt="The AM Project Logo" 
              className="w-full h-full z-20 relative animate-[rotate_120s_infinite_linear]"
            />
            
            {/* Animated ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[220px] h-[220px] md:w-[350px] md:h-[350px] border-2 border-white rounded-full animate-pulse"></div>
            </div>
            
            {/* Fixed compass with rays */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[200px] h-[200px] md:w-[320px] md:h-[320px] opacity-70">
                {/* Static compass rays */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-10 md:h-16 bg-white/80" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-10 md:h-16 bg-white/80" style={{clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)'}}></div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-10 md:w-16 h-2 bg-white/80" style={{clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)'}}></div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-10 md:w-16 h-2 bg-white/80" style={{clipPath: 'polygon(0% 0%, 0% 100%, 100% 50%)'}}></div>
              
                {/* Compass direction labels */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 font-black text-lg md:text-xl text-white -translate-y-6 md:-translate-y-8">N</div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 font-black text-lg md:text-xl text-white translate-y-6 md:translate-y-8">S</div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 font-black text-lg md:text-xl text-white -translate-x-6 md:-translate-x-10">W</div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 font-black text-lg md:text-xl text-white translate-x-6 md:translate-x-10">E</div>
              </div>
            </div>
            
            {/* Spinning sunburst behind the compass */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[160px] h-[160px] md:w-[280px] md:h-[280px] opacity-40 animate-[spin_20s_linear_infinite]">
                {/* Sun rays that spin in the background */}
                <div className="absolute inset-0 bg-primary/20 rounded-full"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-[80px] md:h-[140px] bg-white/40" style={{clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)'}}></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-[80px] md:h-[140px] bg-white/40" style={{clipPath: 'polygon(0% 0%, 100% 0%, 60% 100%, 40% 100%)'}}></div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 h-1 w-[80px] md:w-[140px] bg-white/40" style={{clipPath: 'polygon(0% 40%, 0% 60%, 100% 100%, 100% 0%)'}}></div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 h-1 w-[80px] md:w-[140px] bg-white/40" style={{clipPath: 'polygon(0% 0%, 0% 100%, 100% 60%, 100% 40%)'}}></div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-8 -right-4 w-16 h-16 bg-primary/10 rounded-full blur-lg"></div>
            <div className="absolute -bottom-4 -left-8 w-20 h-20 bg-primary/15 rounded-full blur-xl"></div>
            <div className="absolute top-1/4 -left-12 w-8 h-8 bg-primary/20 rounded-full blur-md"></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-4 mt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            The AM Project
          </h1>
          <p className="text-xl text-muted-foreground animate-pulse">
            Loading your journey...
          </p>
          
          {/* Loading dots */}
          <div className="flex justify-center space-x-1 mt-6">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}