/**
 * Dynamic Landing Page - EXACT copy of homepage with only tagline changes
 */

import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronDown, ArrowRight } from 'lucide-react';
import NewsletterCTA from '@/components/NewsletterCTA';
import MetaTags from '@/components/MetaTags';
import CanonicalLink from '@/components/CanonicalLink';
import { OrganizationStructuredData, WebPageStructuredData } from '@/components/StructuredData';
import { scrollToElement, scrollToTop } from '@/lib/utils';
// import UnifiedAMChat from '@/components/UnifiedAMChat'; // DISABLED
import { trackPageView } from '@/lib/google-ads';
import { useMarketingAnalytics } from '@/hooks/use-marketing-analytics';
import ExitIntentModal from '@/components/ExitIntentModal';
import { useExitIntent } from '@/hooks/use-exit-intent';

const TestLandingPage: React.FC = () => {
  const [, params] = useRoute('/test-landing/:slug');
  const [showArrow, setShowArrow] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  
  // Initialize marketing analytics for bounce rate tracking
  const { trackInteraction } = useMarketingAnalytics();

  // Exit intent detection
  const { getTimeOnPage, getScrollDepth } = useExitIntent(
    (data) => {
      if (!showExitModal) {
        setShowExitModal(true);
      }
    },
    {
      sensitivity: 30,
      delay: 5000,
      debounce: 2000
    }
  );

  // Clean search query - remove "app" suffix if present  
  const rawQuery = params?.slug?.replace(/-/g, ' ') || 'mental fitness';
  const searchQuery = rawQuery.replace(/ app$/i, '').replace(/mental fitness/gi, 'mental well-being');
  
  // Simple tagline generation - only changes the tagline part
  const getTagline = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('mental well-being') || lowerQuery.includes('mental fitness') || lowerQuery.includes('therapy')) return 'your mental strength.';
    if (lowerQuery.includes('discipline') || lowerQuery.includes('habit')) return 'your discipline.';
    if (lowerQuery.includes('father') || lowerQuery.includes('dad')) return 'your leadership.';
    if (lowerQuery.includes('emotional') || lowerQuery.includes('relationships')) return 'your relationships.';
    if (lowerQuery.includes('executive') || lowerQuery.includes('leader') || lowerQuery.includes('business')) return 'your leadership.';
    if (lowerQuery.includes('personal development') || lowerQuery.includes('growth')) return 'your potential.';
    
    return 'your mind.'; // Default homepage tagline
  };
  
  const tagline = getTagline(searchQuery);

  useEffect(() => {
    // Track landing page view
    trackPageView('Dynamic Landing Page', { 
      page_category: 'landing',
      content_type: 'dynamic_landing',
      search_query: searchQuery
    });

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      setShowArrow(scrollPosition < windowHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [searchQuery]);

  return (
    <>
      {/* SEO Meta Tags */}
      <MetaTags
        title={`The AM Project - Mental Fitness App for Men | ${searchQuery}`}
        description="Mental fitness app for men struggling with stress, anxiety, and lack of direction. Build discipline, overcome challenges, and develop authentic masculinity. Like the gym—but for your mind. Start 7-day free trial."
        image="/images/logo-inverted.svg"
      />
      <CanonicalLink path={`/test-landing/${params?.slug}`} />
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
        url={`https://theamproject.com/test-landing/${params?.slug}`}
        name={`The AM Project - Mental Fitness App - ${searchQuery}`}
        description="Mental fitness app for men ready to build discipline, regain clarity, and reflect with purpose. Like the gym—but for your mind."
        image="/images/logo-inverted.svg"
        dateModified="2025-08-19"
      />
      
      {/* Hero Section - EXACT copy from Home.tsx */}
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
                <span className="text-primary">{tagline}</span>
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
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 font-black text-lg md:text-2xl text-white -translate-y-6 md:-translate-y-10">N</div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 font-black text-lg md:text-2xl text-white translate-y-6 md:translate-y-10">S</div>
                      <div className="absolute top-1/2 left-0 -translate-y-1/2 font-black text-lg md:text-2xl text-white -translate-x-6 md:-translate-x-10">W</div>
                      <div className="absolute top-1/2 right-0 -translate-y-1/2 font-black text-lg md:text-2xl text-white translate-x-6 md:translate-x-10">E</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </div>
      </section>

      {/* Why Now Section - Context Aware */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why mental fitness matters more than ever
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              In a world that tells men to figure it out alone, we're building something different. 
              A place where mental fitness isn't just talked about—it's trained.
            </p>
            
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">73%</div>
                <p className="text-sm text-muted-foreground">
                  of men report feeling stuck in their personal growth
                </p>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">81%</div>
                <p className="text-sm text-muted-foreground">
                  struggle with consistency in building positive habits
                </p>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">92%</div>
                <p className="text-sm text-muted-foreground">
                  want practical tools, not just motivation
                </p>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground">
              The AM Project was built by men, for men who are tired of surface-level solutions. 
              We focus on mental fitness because that's where real change happens.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">The Solution</h2>
            <p className="text-xl text-muted-foreground mb-12">
              The AM Project gives you the framework, community, and daily practice to build unshakeable mental fitness.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-6">What You Get:</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-lg">Daily challenges that build real discipline</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-lg">AI coaching for the hard decisions</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-lg">Community of men who get it</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-lg">Progress you can actually measure</span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary p-8 rounded-lg">
                <h4 className="text-xl font-bold mb-4">Ready to Start?</h4>
                <p className="text-muted-foreground mb-6">
                  Join thousands of men who are building mental fitness and redefining what it means to be strong.
                </p>
                <Link href="/join">
                  <Button size="lg" className="w-full">
                    Start Building Mental Fitness
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Join the Movement
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Build the mental fitness you need to lead. 7-day free trial.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/join">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-gray-100"
                >
                  Start Building Mental Fitness
                </Button>
              </Link>
              <Link href="/about">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to start building?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of men who are taking control of their growth. 
              Start your 7-day free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/join">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg"
                >
                  Start Building Mental Fitness
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link href="/about">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Debug Info - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
          <p>Dynamic Landing Page | Query: "{searchQuery}"</p>
          <p>Tagline: "Like the gym—but for {tagline}"</p>
        </div>
      )}
    </>
  );
};

export default TestLandingPage;