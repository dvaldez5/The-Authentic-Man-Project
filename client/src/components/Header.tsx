import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut } from 'lucide-react';
import { scrollToTop } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { XPChip } from '@/components/gamification/XPChip';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // For marketing site (when user is not logged in), all "Become a Member" buttons go to auth with signup
  // Only shows when user is not logged in anyway, so this affects all marketing pages
  const memberButtonHref = '/auth?mode=signup';
  
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

  // Navigation links based on authentication status
  const navLinks = user ? [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Challenges', path: '/challenges' },
    { name: 'Learning', path: '/learning' },
    { name: 'Community', path: '/community' },
    { name: 'Journal', path: '/journal' },
    { name: 'Reflections', path: '/weekly-reflections' },
    { name: 'Settings', path: '/settings' },
    { name: 'Blog', path: '/blog' },
  ] : [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'The AM Standard', path: '/standard' },
    { name: 'Blog', path: '/blog' },
    { name: 'Why Join', path: '/join' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      <header className={`fixed w-full bg-white z-50 border-b border-border/30 ${isScrolled ? 'shadow-md' : ''}`}>
        <div className="container py-2">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" onClick={() => scrollToTop()} className="flex items-center">
              <img src="/header-logo.png?v=2" alt="The AM Project Logo" className="h-12 mr-3" />
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
              
              {user ? (
                <div className="flex items-center space-x-3">
                  <XPChip />
                  <span className="text-sm text-gray-600">Welcome, {user.fullName}</span>
                  <Button 
                    onClick={handleLogout}
                    variant="outline" 
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth" onClick={() => scrollToTop()}>
                    <Button variant="outline" className="flex items-center space-x-1 px-3">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">Sign In</span>
                    </Button>
                  </Link>
                  <Link href={memberButtonHref} onClick={() => scrollToTop()}>
                    <Button variant="default" className="bg-primary text-primary-foreground hover:opacity-90 px-3">
                      <span className="hidden sm:inline">Become a Member</span>
                      <span className="sm:hidden">Join</span>
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation - Full screen overlay with transparent black background */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/90 z-40 md:hidden">
          <div className="flex flex-col items-center justify-center pt-24 h-full pb-20">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-2xl font-bold text-white hover:text-primary transition duration-300 py-4 ${
                  location === link.path ? 'text-primary' : ''
                }`}
                onClick={() => {setMobileMenuOpen(false); scrollToTop();}}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="mt-6 w-4/5 max-w-xs space-y-4">
              {user ? (
                <div className="text-center space-y-4">
                  <p className="text-white text-lg">Welcome, {user.fullName}</p>
                  <Button 
                    onClick={() => {handleLogout(); setMobileMenuOpen(false);}}
                    variant="outline" 
                    className="w-full py-6 text-xl flex items-center justify-center space-x-2"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/auth" onClick={() => {setMobileMenuOpen(false); scrollToTop();}}>
                    <Button variant="outline" className="w-full py-6 text-xl flex items-center justify-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Sign In</span>
                    </Button>
                  </Link>
                  <Link href={memberButtonHref} onClick={() => {setMobileMenuOpen(false); scrollToTop();}}>
                    <Button variant="default" className="bg-primary text-primary-foreground hover:opacity-90 w-full py-6 text-xl">
                      Become a Member
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;