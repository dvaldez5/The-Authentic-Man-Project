import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { scrollToTop } from '@/lib/utils';

const NewHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Navigation links
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'The AM Standard', path: '/standard' },
    { name: 'Blog', path: '/blog' },
    { name: 'Join', path: '/join' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className={`fixed w-full bg-white z-50 border-b border-border/30 ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="container py-2">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" onClick={() => scrollToTop()} className="flex items-center">
            <img src="/header-logo.png?v=2" alt="The AM Project Logo" className="h-20 mr-3" />
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-3 rounded-md bg-black text-white focus:outline-none shadow-lg border border-primary"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="h-7 w-7" />
            ) : (
              <Menu className="h-7 w-7" />
            )}
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 items-center">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                onClick={() => scrollToTop()}
                className={`text-gray-800 hover:text-primary transition duration-300 ${
                  location === link.path ? 'text-primary font-semibold' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link href="/join" onClick={() => scrollToTop()}>
              <Button variant="default" className="bg-primary text-primary-foreground hover:opacity-90">
                Become a Member
              </Button>
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Mobile Navigation - Positioned absolutely */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[84px] bg-black/90 z-50 md:hidden">
          <div className="flex flex-col items-center justify-center pt-10 h-full pb-20">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-2xl font-bold text-white hover:text-primary transition duration-300 py-4 ${
                  location === link.path ? 'text-primary' : ''
                }`}
                onClick={() => scrollToTop()}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-6 w-4/5 max-w-xs">
              <Link href="/join" onClick={() => scrollToTop()}>
                <Button variant="default" className="bg-primary text-primary-foreground hover:opacity-90 w-full py-6 text-xl mt-4">
                  Become a Member
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default NewHeader;