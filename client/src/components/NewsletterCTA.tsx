import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { scrollToTop } from '@/lib/utils';

type NewsletterCTAProps = {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
};

const NewsletterCTA = ({ variant = 'primary', fullWidth = false }: NewsletterCTAProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  if (fullWidth) {
    return (
      <div className="py-16 bg-black rounded-xl relative overflow-hidden shadow-lg border border-primary/10">
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl z-0"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-2xl z-0"></div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"></path>
                <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"></path>
              </svg>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Build Unshakable Discipline?</h2>
            
            <div className="flex items-center justify-center mb-6">
              <div className="h-0.5 bg-primary/30 w-16"></div>
            </div>
            
            <p className="text-xl mb-8 text-white/90">
              Join a community of men committed to authentic leadership. Access tools, accountability, and brotherhood — or start with our free newsletter and get The AM Reset instantly.
            </p>
            
            <p className="text-lg mb-8 font-semibold text-primary">
              No fluff. No empty hype. Just tools that work.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/join" onClick={() => scrollToTop()}>
                <Button 
                  className="bg-primary text-white hover:opacity-90 px-8 py-4 text-lg font-semibold transition duration-300 shadow-lg font-serif transform hover:scale-105"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  Become a Member
                </Button>
              </Link>
              <Link href="/join#newsletter">
                <Button 
                  variant="outline"
                  className="border-primary text-white hover:bg-primary/10 px-8 py-4 text-lg font-semibold transition duration-300 shadow-lg font-serif transform hover:scale-105"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  Get Free AM Reset
                </Button>
              </Link>
            </div>
            
            <p className="text-sm mt-6 text-white/70">
              The AM Reset downloads instantly when you subscribe
            </p>
            <p className="text-xs mt-2 text-white/60">
              Join hundreds of men committed to living with purpose and discipline.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-8 text-center">
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/join" onClick={() => scrollToTop()}>
          <Button
            className="bg-primary text-white hover:opacity-90 px-8 py-4 text-lg font-semibold transition duration-300 font-serif transform hover:scale-105"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Become a Member
          </Button>
        </Link>
        <Link href="/join#newsletter">
          <Button
            variant="outline"
            className="border-primary text-white hover:bg-primary/10 px-8 py-4 text-lg font-semibold transition duration-300 font-serif transform hover:scale-105"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Get Free AM Reset
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NewsletterCTA;
