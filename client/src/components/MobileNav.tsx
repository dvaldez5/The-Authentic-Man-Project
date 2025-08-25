import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { scrollToTop } from '@/lib/utils';

interface MobileNavProps {
  isOpen: boolean;
  navLinks: { name: string; path: string }[];
  currentPath: string;
  onClose: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, navLinks, currentPath, onClose }) => {
  // If menu is not open, don't render anything to save performance
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 top-[84px] bg-black/90 z-50 flex items-center justify-center md:hidden"
      onClick={onClose}
    >
      <div 
        className="bg-white w-[85%] max-w-md rounded-lg p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <nav className="flex flex-col space-y-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`text-2xl text-center font-bold text-gray-800 hover:text-primary transition duration-300 ${
                currentPath === link.path ? 'text-primary' : ''
              }`}
              onClick={() => {
                onClose();
                scrollToTop();
              }}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-6 mt-2 border-t border-border/30">
            <Link 
              href="/join" 
              onClick={() => {
                onClose();
                scrollToTop();
              }}
            >
              <Button 
                variant="default" 
                className="bg-primary text-primary-foreground hover:opacity-90 w-full py-6 text-xl mt-4"
              >
                Become a Member
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileNav;