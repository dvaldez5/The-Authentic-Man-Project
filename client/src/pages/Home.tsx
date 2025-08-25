import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import NewsletterCTA from '@/components/NewsletterCTA';
import MetaTags from '@/components/MetaTags';
import CanonicalLink from '@/components/CanonicalLink';
import { OrganizationStructuredData, WebPageStructuredData } from '@/components/StructuredData';
import { scrollToElement, scrollToTop } from '@/lib/utils';
import UnifiedAMChat from '@/components/UnifiedAMChat';
import { trackPageView } from '@/lib/google-ads';
import { useMarketingAnalytics } from '@/hooks/use-marketing-analytics';
import ExitIntentModal from '@/components/ExitIntentModal';
import { useExitIntent } from '@/hooks/use-exit-intent';

const Home = () => {
  const [showArrow, setShowArrow] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  
  // Initialize marketing analytics for bounce rate tracking
  const { trackInteraction } = useMarketingAnalytics();

  // Exit intent detection
  const { getTimeOnPage, getScrollDepth } = useExitIntent(
    (data) => {
      // Only show modal if it's not already shown
      if (!showExitModal) {
        setShowExitModal(true);
      }
    },
    {
      sensitivity: 30, // Trigger when mouse is within 30px of top
      delay: 5000, // Wait 5 seconds before enabling
      debounce: 2000 // Don't trigger again for 2 seconds
    }
  );

  useEffect(() => {
    // Track homepage view
    trackPageView('Homepage', { 
      page_category: 'landing',
      content_type: 'main_homepage'
    });
    
    // REMOVED: Mobile device failsafe that was causing PWA flow contamination
    // Home component should only render when explicitly chosen by PWA detection logic

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      setShowArrow(scrollPosition < windowHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      <MetaTags
        title="The AM Project - Mental Fitness App for Men | Build Discipline & Purpose"
        description="Mental fitness app for men struggling with stress, anxiety, and lack of direction. Build discipline, overcome challenges, and develop authentic masculinity. Like the gym—but for your mind. Start 7-day free trial."
        image="/images/logo-inverted.svg"
      />
      <CanonicalLink path="/" />
      <OrganizationStructuredData
        url="https://theamproject.com"
        logo="https://theamproject.com/images/logo-inverted.svg"
        name="The AM Project"
        description="Mental fitness app for men ready to build discipline, regain clarity, and reflect with purpose. Like the gym—but for your mind."
        sameAs={[
          "https://www.instagram.com/theauthenticmanproject/",
          "https://twitter.com/theamproject",
          "https://youtube.com/@theauthenticmanproject",
          "https://linkedin.com/company/the-am-project"
        ]}
      />
      <WebPageStructuredData
        url="https://theamproject.com"
        name="The AM Project - Mental Fitness App"
        description="Mental fitness app for men ready to build discipline, regain clarity, and reflect with purpose. Like the gym—but for your mind."
        image="/images/logo-inverted.svg"
        dateModified="2025-05-16"
      />
      
      {/* Hero Section */}
      <section id="home-hero" className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-20">
        {/* Background with gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-background via-background/95 to-background/80"></div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl z-0"></div>
        <div className="absolute left-0 bottom-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl z-0"></div>
        
        <div className="container py-16 z-10 relative">
          {/* Mobile Hero Image - Only visible on small screens */}
          <div className="block md:hidden mb-8">
            {/* Hero image for mobile */}
            <div className="relative h-[300px] w-full flex justify-center items-center">
              {/* Background glow effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute w-48 h-48 bg-primary/10 rounded-full blur-2xl"></div>
              </div>
              
              {/* Logo container with animated elements */}
              <div className="relative w-[250px] h-[250px]">
                {/* Main logo */}
                <img 
                  src="/images/logo-inverted.svg" 
                  alt="The AM Project Logo" 
                  className="w-full h-full z-20 relative animate-[rotate_120s_infinite_linear]"
                />
                
                {/* Animated ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[220px] h-[220px] border-2 border-white rounded-full animate-pulse"></div>
                </div>
                
                {/* Spinning sunburst behind the compass */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[160px] h-[160px] opacity-40 animate-[spin_20s_linear_infinite]">
                    {/* Brown circle in the background that pulses */}
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                    
                    {/* Sun rays that spin in the background */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-[80px] bg-white/40" style={{clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)'}}></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-[80px] bg-white/40" style={{clipPath: 'polygon(0% 0%, 100% 0%, 60% 100%, 40% 100%)'}}></div>
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 h-1 w-[80px] bg-white/40" style={{clipPath: 'polygon(0% 40%, 0% 60%, 100% 100%, 100% 0%)'}}></div>
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 h-1 w-[80px] bg-white/40" style={{clipPath: 'polygon(0% 0%, 0% 100%, 100% 60%, 100% 40%)'}}></div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-2 w-8 h-8 bg-primary/10 rounded-full blur-lg"></div>
                <div className="absolute -bottom-2 -left-4 w-10 h-10 bg-primary/15 rounded-full blur-xl"></div>
                <div className="absolute top-1/4 -left-6 w-4 h-4 bg-primary/20 rounded-full blur-md"></div>
                
                {/* Fixed compass directional elements that don't rotate */}
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div className="w-[200px] h-[200px] opacity-70">
                    {/* Static compass rays */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-10 bg-white/80" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-10 bg-white/80" style={{clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)'}}></div>
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-10 h-2 bg-white/80" style={{clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)'}}></div>
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-10 h-2 bg-white/80" style={{clipPath: 'polygon(0% 0%, 0% 100%, 100% 50%)'}}></div>
                  
                    {/* Compass direction labels */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 font-black text-lg text-white -translate-y-6">N</div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 font-black text-lg text-white translate-y-6">S</div>
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 font-black text-lg text-white -translate-x-6">W</div>
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 font-black text-lg text-white translate-x-6">E</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Like the gym—but for <br />
                <span className="text-primary">your mind.</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
                A mental fitness app for men ready to build discipline, regain clarity, and reflect with purpose.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/join" onClick={() => {
                  scrollToTop();
                  trackInteraction('become_member_click', 'hero_section');
                }}>
                  <Button 
                    className="bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:opacity-90 transition duration-300"
                  >
                    Become a Member
                  </Button>
                </Link>
                <Link href="/join#newsletter" onClick={() => {
                  trackInteraction('free_reset_click', 'hero_section');
                }}>
                  <Button 
                    variant="outline" 
                    className="border-primary text-primary px-8 py-4 text-lg font-semibold hover:bg-primary/10 transition duration-300"
                  >
                    Get Free AM Reset
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Desktop Hero Image - Hidden on mobile */}
            <div className="relative hidden md:block">
              {/* Animated logo hero image */}
              <div className="hero-image-container relative h-[300px] md:h-[500px] w-full flex justify-center items-center">
                {/* Background glow effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full blur-3xl"></div>
                  <div className="absolute w-48 md:w-64 h-48 md:h-64 bg-primary/10 rounded-full blur-2xl"></div>
                </div>
                
                {/* Logo container with animated elements */}
                <div className="relative w-[250px] h-[250px] md:w-[400px] md:h-[400px]">
                  {/* Main logo */}
                  <img 
                    src="/images/logo-inverted.svg" 
                    alt="The AM Project Logo" 
                    className="w-full h-full z-20 relative"
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
            </div>
          </div>
        </div>
        
        {/* Scroll Down Indicator */}
        {showArrow && (
          <div className="absolute bottom-0 w-full py-6 bg-gradient-to-t from-background to-transparent z-10">
            <div className="container flex justify-center">
              <button 
                onClick={() => scrollToElement('intro-section')} 
                className="text-accent animate-bounce"
                aria-label="Scroll to about section"
              >
                <ChevronDown size={24} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Introduction Section */}
      <section id="intro-section" className="py-20 bg-secondary relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -left-20 top-1/2 w-40 h-40 bg-accent/5 rounded-full z-0"></div>
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl z-0"></div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-12">
              <div className="h-0.5 bg-primary w-16"></div>
              <h2 className="text-3xl font-bold px-4">Our Philosophy</h2>
              <div className="h-0.5 bg-primary w-16"></div>
            </div>
            
            <p className="text-lg mb-8 text-muted-foreground">
              In today's world, it's harder than ever to know what it really means to live as a good man. You're told to be strong, but not too hard. To lead, but never stand firm against the trend. To provide, but hide the pride you take in doing it.
            </p>
            
            <div className="flex items-center mb-8">
              <div className="h-12 w-1 bg-primary mr-4 rounded-full"></div>
              <p className="text-xl font-semibold">
                At The AM Project we believe something different.
              </p>
            </div>
            
            <p className="text-lg mb-8 text-muted-foreground">
              We believe in embracing the timeless strengths that built civilizations—strength, courage, discipline, leadership. The same instincts that protected families, forged legacies, and carried men through hardship are still alive today. They should be honored, not repressed.
            </p>
            
            <div className="flex items-center mb-8">
              <div className="h-12 w-1 bg-primary mr-4 rounded-full"></div>
              <p className="text-xl font-semibold">
                But real strength also evolves.
              </p>
            </div>
            
            <p className="text-lg mb-8 text-muted-foreground">
              A modern man doesn't just carry the physical weight—he carries emotional presence, shows up for his relationships with vulnerability, and leads without clinging to outdated roles. He knows his power, and he also knows when to hold it back.
            </p>
            
            <p className="text-lg mb-8 text-muted-foreground">
              This is about becoming the man your family, your community, and—most importantly—you can count on.
            </p>
            
            <div className="bg-black p-6 rounded-lg border border-primary/20 mb-12 text-center">
              <p className="text-xl font-semibold mb-2 text-white">
                No empty motivation. No recycled self-help trends.
              </p>
              <p className="text-gray-300">
                Just clear standards, real tools, and a call to live a life you're proud of.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AM Chat Section - Positioned after Our Philosophy */}
      <section className="am-section-spacing bg-white relative overflow-hidden">
        {/* Decorative elements matching the section style */}
        <div className="absolute left-0 top-1/2 w-40 h-40 bg-[#7C4A32]/10 rounded-full z-0"></div>
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-[#7C4A32]/20 rounded-full blur-3xl z-0"></div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* AM Context Section */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="h-0.5 bg-primary w-16"></div>
                <h2 className="text-3xl md:text-4xl font-bold px-4 text-black">Meet AM</h2>
                <div className="h-0.5 bg-primary w-16"></div>
              </div>
              <div className="max-w-3xl mx-auto">
                <p className="text-xl text-black leading-relaxed mb-6">
                  AM is your personal mentor and accountability partner, designed specifically for men who want to lead themselves with integrity, discipline, and purpose.
                </p>
                <p className="text-lg text-black leading-relaxed mb-6">
                  Unlike generic AI assistants, AM understands the unique challenges men face today. Whether you're dealing with career pressure, relationship dynamics, personal discipline, or life transitions, AM provides practical guidance rooted in proven principles.
                </p>
                <p className="text-lg text-black leading-relaxed">
                  Ask AM anything. Share your struggles. Get honest feedback. Available 24/7 for members—because strong men support each other.
                </p>
              </div>
            </div>
            
            <UnifiedAMChat type="homepage" />
          </div>
        </div>
      </section>

      {/* AM Standard Section */}
      <section id="standard-section" className="py-20 bg-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute right-0 top-20 w-72 h-72 bg-primary/5 rounded-full blur-2xl z-0"></div>
        <div className="absolute -left-20 bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-xl z-0"></div>
        
        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="h-0.5 bg-primary w-16"></div>
              <h2 className="text-3xl md:text-4xl font-bold px-4 text-center">The AM Standard: How Strong Men Show Up</h2>
              <div className="h-0.5 bg-primary w-16"></div>
            </div>
            
            <p className="text-xl text-center mb-6 text-muted-foreground">
              Strength isn't a performance. It's how you live when no one is watching.
            </p>
            <p className="text-lg text-center mb-12 text-muted-foreground">
              The AM Standard lays out the non-negotiables for modern manhood—showing up for yourself, your family, your partner, your friends, and your community with discipline, clarity, and unwavering character.
            </p>
            
            <div className="text-center mt-10">
              <Link href="/standard">
                <Button 
                  variant="default" 
                  className="bg-primary text-primary-foreground px-10 py-4 text-lg font-semibold hover:opacity-90 transition duration-300"
                >
                  Read The AM Standard →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Blog Section */}
      <section id="blog-section" className="py-20 bg-secondary relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute left-0 top-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl z-0"></div>
        <div className="absolute right-0 bottom-20 w-80 h-80 bg-primary/10 rounded-full blur-2xl z-0"></div>
        
        <div className="container relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="h-0.5 bg-primary w-16"></div>
            <h2 className="text-3xl font-bold px-4 text-center">From the Blog: Real-World Tactics for Modern Men</h2>
            <div className="h-0.5 bg-primary w-16"></div>
          </div>
          <p className="text-xl text-center mb-12 text-muted-foreground">
            Real-world tactics for modern men. No fluff, just tools that work.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-background p-8 rounded-xl shadow-lg border border-primary/10 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 mb-5 mx-auto">
                <img 
                  src="/icons/discipline-icon.svg" 
                  alt="Building discipline" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mb-1 text-sm text-primary font-semibold">DISCIPLINE</div>
              <h3 className="text-xl font-bold mb-3">How to Build Unshakable Discipline in 30 Days</h3>
              <p className="text-muted-foreground mb-4">
                Small, daily wins that compound into unstoppable momentum—and the exact checklist to keep you honest.
              </p>
              <Link href="/blog/5-30-club-early-risers" className="group flex items-center text-primary font-semibold hover:text-primary/80">
                Read Article 
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 group-hover:translate-x-1 transition-transform duration-300">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </div>
            
            <div className="bg-background p-8 rounded-xl shadow-lg border border-primary/10 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 mb-5 mx-auto">
                <img 
                  src="/icons/physical-icon.svg" 
                  alt="Physical confidence" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mb-1 text-sm text-primary font-semibold text-center">PHYSICAL</div>
              <h3 className="text-xl font-bold mb-3 text-center">The Lost Art of Physical Confidence</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Why mastering your body changes how you move through the world.
              </p>
              <Link href="/blog/beyond-gym-complete-physical-practice" className="group flex items-center text-primary font-semibold hover:text-primary/80">
                Read Article 
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 group-hover:translate-x-1 transition-transform duration-300">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </div>
            
            <div className="bg-background p-8 rounded-xl shadow-lg border border-primary/10 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 mb-5 mx-auto">
                <img 
                  src="/icons/leadership-icon.svg" 
                  alt="Leadership at home" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mb-1 text-sm text-primary font-semibold text-center">LEADERSHIP</div>
              <h3 className="text-xl font-bold mb-3 text-center">Lead at Home: 5 Rules I'm Teaching My Kids About Courage</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Fatherhood lessons forged on the front lines.
              </p>
              <Link href="/blog/art-fatherhood-family-leadership" className="group flex items-center text-primary font-semibold hover:text-primary/80">
                Read Article 
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 group-hover:translate-x-1 transition-transform duration-300">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="text-center mb-16">
            <Link href="/blog" onClick={() => scrollToTop()}>
              <Button 
                variant="default" 
                className="bg-primary text-primary-foreground px-10 py-4 text-lg font-semibold hover:opacity-90 transition duration-300"
              >
                Explore All Articles →
              </Button>
            </Link>
          </div>
          
          <NewsletterCTA fullWidth variant="secondary" />
        </div>
      </section>

      {/* Exit Intent Modal */}
      <ExitIntentModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        currentPage="homepage"
        timeOnPage={getTimeOnPage()}
        scrollDepth={getScrollDepth()}
      />
    </>
  );
};

export default Home;
