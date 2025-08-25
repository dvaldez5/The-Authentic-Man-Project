import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronDown, MessageCircle, Mail, ExternalLink, Brain, Clock, Dumbbell, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';
import MetaTags from '@/components/MetaTags';
import CanonicalLink from '@/components/CanonicalLink';
import { useExitIntent } from '@/hooks/use-exit-intent';
import ExitIntentModal from '@/components/ExitIntentModal';
import { OrganizationStructuredData, WebPageStructuredData } from '@/components/StructuredData';
import { scrollToElement, scrollToTop } from '@/lib/utils';
// import UnifiedAMChat from '@/components/UnifiedAMChat'; // DISABLED
import TestimonialSection from '@/components/TestimonialSection';
import { trackPageView, trackNewsletterSignup, trackPDFDownload } from '@/lib/google-ads';
import { useMarketingPageAnalytics } from '@/hooks/use-behavior-analytics';
import { trackButtonClick, trackFormInteraction, trackContentEngagement } from '@/lib/user-behavior-tracking';

const newsletterFormSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type NewsletterFormValues = z.infer<typeof newsletterFormSchema>;

const ResetDiscipline = () => {
  const [showArrow, setShowArrow] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const { toast } = useToast();
  
  // Comprehensive behavior tracking
  const { trackCTAClick, trackFormStart, trackTestimonialView, trackInteraction } = useMarketingPageAnalytics('Reset Discipline Landing');
  
  // Exit intent detection
  const { getTimeOnPage, getScrollDepth } = useExitIntent(
    (data) => {
      if (!showExitModal) {
        setShowExitModal(true);
      }
    },
    { delay: 3000 }
  );

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  useEffect(() => {
    // Track page view for ResetDiscipline landing page
    trackPageView('Reset Discipline Landing', { 
      page_category: 'landing',
      content_type: 'lead_magnet'
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
  }, []);

  async function onSubmit(data: NewsletterFormValues) {
    setIsSubmitting(true);
    trackFormInteraction('complete', 'newsletter_signup', 'email');
    try {
      const response = await apiRequest('POST', '/api/newsletter', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email
      });
      
      const responseData = await response.json();
      
      // Track newsletter signup conversion
      trackNewsletterSignup({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        transactionId: responseData.subscriberId?.toString()
      });
      
      // Trigger PDF download
      const link = document.createElement('a');
      link.href = '/The_AM_Reset.pdf';
      link.download = 'The AM Reset - 6 Grounded Practices.pdf';
      link.click();
      
      // Track PDF download conversion
      trackPDFDownload({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName
      });
      
      toast({
        title: "Success!",
        description: "The AM Reset is downloading now. Check your email for more great content.",
        duration: 5000,
      });
      
      form.reset();
    } catch (error: any) {
      // If the email is already subscribed, still trigger the download
      if (error?.message?.includes('already subscribe') || error?.status === 409) {
        // Trigger PDF download for existing subscribers
        const link = document.createElement('a');
        link.href = '/The_AM_Reset.pdf';
        link.download = 'The AM Reset - 6 Grounded Practices.pdf';
        link.click();
        
        toast({
          title: "Welcome back!",
          description: "You're already subscribed. The AM Reset is downloading now.",
          duration: 5000,
        });
        
        form.reset();
      } else {
        toast({
          title: "Something went wrong",
          description: "Please try again or contact support if the problem persists.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleTalkToAM = () => {
    trackCTAClick('Talk to AM', 'hero');
    setShowChatModal(true);
  };

  const handleNewsletterClick = () => {
    trackCTAClick('Get the Free AM Reset', 'hero');
    scrollToElement('newsletter-section');
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <MetaTags
        title="Mental Fitness App for Men | The AM Project"
        description="Like the gym—but for your mind. Mental fitness app for men ready to build discipline, regain clarity, and reflect with purpose. Start your free trial today."
        image="/images/logo-inverted.svg"
      />
      <CanonicalLink path="/reset-discipline" />
      <OrganizationStructuredData
        url="https://theamproject.com"
        logo="https://theamproject.com/images/logo-inverted.svg"
        name="The AM Project"
        description="The AM Project helps men build strength, integrity, and purpose through actionable content and community."
        sameAs={[
          "https://www.instagram.com/theauthenticmanproject/",
          "https://twitter.com/theamproject",
          "https://youtube.com/@theauthenticmanproject",
          "https://linkedin.com/company/the-am-project"
        ]}
      />
      <WebPageStructuredData
        url="https://theamproject.com/reset-discipline"
        name="Mental Fitness App for Men | The AM Project"
        description="Like the gym—but for your mind. Mental fitness app for men ready to build discipline, regain clarity, and reflect with purpose. Start your free trial today."
        image="/images/logo-inverted.svg"
        dateModified="2025-06-28"
      />
      
      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-20">
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
                Build unshakeable discipline through daily mental fitness training. The accountability app that keeps men on track.
              </p>
              <div className="flex flex-col gap-4">
                <Link href="/auth?mode=signup" onClick={() => scrollToTop()}>
                  <Button 
                    className="bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:opacity-90 transition duration-300 shadow-lg w-full sm:w-auto"
                  >
                    Start 7-Day Free Trial
                  </Button>
                </Link>
                <p className="text-sm text-center text-muted-foreground">
                  Try everything free for 7 days. Cancel anytime.
                </p>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-8 bg-card/50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm font-semibold text-center mb-2">What you get:</p>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Full access for 7 days - completely free</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>No commitment - cancel anytime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Then $9.99/month if you continue</span>
                  </div>
                </div>
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
                onClick={() => scrollToElement('philosophy-section')} 
                className="text-accent animate-bounce"
                aria-label="Scroll to philosophy section"
              >
                <ChevronDown size={24} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Credibility Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Built by men who understand the struggle</h2>
            
            {/* Testimonials */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <p className="text-sm text-muted-foreground mb-4 italic">
                  "The AM Project gave me a clear roadmap when I felt aimless. I didn't need another 'guru'—I needed something real. This gave me tools I could actually use."
                </p>
                <p className="font-semibold">Nick Estevez</p>
                <p className="text-sm text-muted-foreground">Young Business Professional, Married</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <p className="text-sm text-muted-foreground mb-4 italic">
                  "This wasn't about motivation. It was about responsibility. AM helped me reconnect with my purpose—and show up consistently for my daughter."
                </p>
                <p className="font-semibold">Cory Eckles</p>
                <p className="text-sm text-muted-foreground">Father & Husband</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <p className="text-sm text-muted-foreground mb-4 italic">
                  "As a leader at work and a dad at home, I needed to be grounded. The AM Project helped me rebuild that foundation—quietly, without hype, just results."
                </p>
                <p className="font-semibold">Ruben Galvan</p>
                <p className="text-sm text-muted-foreground">Fire Chief, Husband, Father</p>
              </div>
            </div>
            
            <p className="text-muted-foreground">
              Join the founding members building real discipline
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">The statistics don't lie</h2>
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">4x</div>
                  <p className="text-sm text-muted-foreground">more likely to die by suicide<br/>than women their age</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">3x</div>
                  <p className="text-sm text-muted-foreground">more likely to die of<br/>drug overdose than women</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">15%</div>
                  <p className="text-sm text-muted-foreground">of men report having<br/>no close friends</p>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">You know you're capable of more...</h3>
              <p className="text-lg text-muted-foreground mb-6">
                But staying consistent feels impossible. You start strong, then life gets in the way. 
                The gym membership sits unused. The books stay unread. The goals get pushed to "tomorrow."
              </p>
              <p className="text-lg font-semibold">
                What if there was a system that kept you accountable every single day?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Summary */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Get Your Challenge</h3>
                <p className="text-muted-foreground">Receive a daily challenge designed to build discipline (takes 2 minutes)</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Complete & Track</h3>
                <p className="text-muted-foreground">Take action and log your progress to build momentum</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Build Momentum</h3>
                <p className="text-muted-foreground">Small wins compound into unshakeable discipline</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/join" onClick={() => scrollToTop()}>
                <Button 
                  variant="outline"
                  className="border-primary text-primary px-8 py-4 text-lg font-semibold hover:bg-primary/10 transition duration-300"
                >
                  See the Full App Preview
                </Button>
              </Link>
              <Link href="/auth?mode=signup" onClick={() => scrollToTop()}>
                <Button 
                  className="bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:opacity-90 transition duration-300"
                >
                  Become a Member
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why the AM Project Section */}
      <section id="philosophy-section" className="py-20 bg-secondary relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -left-20 top-1/2 w-40 h-40 bg-accent/5 rounded-full z-0"></div>
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl z-0"></div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-12">
              <div className="h-0.5 bg-primary w-8 md:w-16 hidden sm:block"></div>
              <h2 className="text-2xl md:text-3xl font-bold px-2 md:px-4 text-center">What It Means to Be a Man Today Is Changing.</h2>
              <div className="h-0.5 bg-primary w-8 md:w-16 hidden sm:block"></div>
            </div>
            
            <div className="prose prose-lg max-w-none text-center">
              <p className="text-lg mb-6 text-muted-foreground">
                You're told to be strong—but not too hard.<br />
                To lead—but never push against the trend.<br />
                To provide—yet stay quiet about the pride you take in doing it.
              </p>
              
              <p className="text-xl font-semibold mb-6 text-primary">
                We believe something different.
              </p>
              
              <p className="text-lg mb-8 text-muted-foreground">
                We believe real strength still matters—discipline, courage, integrity, purpose.<br />
                Leadership starts by mastering yourself and showing up every day for the people who count on you.<br />
                No fluff. No empty motivation. Just a clear standard and tools that work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet AM Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute right-0 top-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl z-0"></div>
        <div className="absolute left-0 bottom-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl z-0"></div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              AM Isn't a Coach. He's Your <span className="text-primary">24/7 Guide.</span>
            </h2>
            
            <p className="text-lg mb-8 text-muted-foreground max-w-3xl mx-auto">
              AM is your personal accountability partner—designed specifically for men who want to rebuild discipline, reset direction, and lead with strength.
            </p>
            
            <p className="text-lg mb-8 text-muted-foreground max-w-3xl mx-auto">
              Ask AM anything. Share your setbacks. Get honest feedback—anytime.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold mb-2">Break bad habits and stay consistent</h3>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold mb-2">Track daily progress and reflect with purpose</h3>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold mb-2">Get grounded feedback when you're off course</h3>
              </div>
            </div>
            
            <p className="text-lg mb-8 text-muted-foreground">
              No judgment. No hype. Just clear, practical guidance—on your terms.
            </p>
            
            <Button 
              onClick={handleTalkToAM}
              className="bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:opacity-90 transition duration-300"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Talk to AM
            </Button>
          </div>
        </div>
      </section>

      {/* Membership Benefits Section */}
      <section className="py-20 bg-secondary relative overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What You Get as a Member</h2>
            <p className="text-lg text-muted-foreground mb-8">Everything you need to build discipline that lasts</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Get Support Anytime</h3>
                <p className="text-sm text-muted-foreground">Never handle struggles alone - chat with AM 24/7 for guidance and accountability</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Build Consistent Habits</h3>
                <p className="text-sm text-muted-foreground">Get a simple daily challenge that takes 2 minutes but builds lasting discipline</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Track Your Progress</h3>
                <p className="text-sm text-muted-foreground">See exactly how you're growing with weekly check-ins that keep you moving forward</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <ExternalLink className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Practice Hard Decisions</h3>
                <p className="text-sm text-muted-foreground">Train yourself to make tough choices before you're in the pressure moment</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Start Strong Today</h3>
                <p className="text-sm text-muted-foreground">Get the AM Reset guide - 6 practices you can use right now to build discipline</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Connect With Real Men</h3>
                <p className="text-sm text-muted-foreground">Join other men who are doing the work - no posturing, just real accountability</p>
              </div>
            </div>
            
            <div className="bg-card border border-primary/20 rounded-lg p-6 mb-8 max-w-lg mx-auto shadow-sm">
              <p className="text-lg font-semibold text-primary mb-2">Start Your Free Trial</p>
              <p className="text-lg mb-1 text-foreground">Try everything for <span className="font-bold">7 days free</span></p>
              <p className="text-sm text-muted-foreground">If you continue, just $9.99/month. Cancel anytime.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?mode=signup" onClick={() => scrollToTop()}>
                <Button className="bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:opacity-90 transition duration-300 shadow-lg">
                  Start 7-Day Free Trial
                </Button>
              </Link>
              <Button 
                onClick={handleNewsletterClick}
                variant="outline" 
                className="border-primary text-primary px-8 py-4 text-lg font-semibold hover:bg-primary/10 transition duration-300"
              >
                Get Free AM Reset
              </Button>
            </div>
          </div>
        </div>
      </section>



      {/* The AM Standard Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              No Trends. No Posturing. <span className="text-primary">Just a Code of Conduct.</span>
            </h2>
            
            <p className="text-lg mb-8 text-muted-foreground max-w-3xl mx-auto">
              The AM Standard lays out how strong men show up—when no one's watching.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
              <div className="text-left">
                <ul className="space-y-3 text-lg">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Own your word
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Lead at home
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Master your time
                  </li>
                </ul>
              </div>
              <div className="text-left">
                <ul className="space-y-3 text-lg">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Train your body
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Build discipline through action
                  </li>
                </ul>
              </div>
            </div>
            
            <p className="text-lg mb-8 text-muted-foreground">
              This isn't inspiration. It's alignment.
            </p>
            
            <Link href="/standard" onClick={() => scrollToTop()}>
              <Button 
                variant="outline" 
                className="border-primary text-primary px-8 py-4 text-lg font-semibold hover:bg-primary/10 transition duration-300"
              >
                Read The AM Standard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AM Reset Newsletter Section */}
      <section id="newsletter-section" className="py-20 bg-secondary relative overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Not Ready Yet? <span className="text-primary">Start with the AM Reset</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                6 practices that work. No fluff. Free download.
              </p>
            </div>
            
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Get Free AM Reset</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your first name" 
                                {...field}
                                onFocus={() => {
                                  trackFormInteraction('focus', 'newsletter_signup', 'firstName');
                                  trackFormStart('newsletter_signup');
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your last name" 
                                {...field}
                                onFocus={() => trackFormInteraction('focus', 'newsletter_signup', 'lastName')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your email address" 
                              type="email" 
                              {...field}
                              onFocus={() => trackFormInteraction('focus', 'newsletter_signup', 'email')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-primary-foreground py-3 text-lg font-semibold hover:opacity-90 transition duration-300"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Download The AM Reset"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>



      {/* Final CTA Section */}
      <section className="py-20 bg-black text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl z-0"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-2xl z-0"></div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build Unshakable Discipline?</h2>
            <p className="text-xl mb-6 text-white/90">
              Every day you wait is another day you stay the same.
            </p>
            
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 mb-8 max-w-md mx-auto">
              <p className="text-sm font-semibold text-white mb-1">Start your free trial today</p>
              <p className="text-sm text-white/80">7 days to try everything. No risk.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?mode=signup" onClick={() => {
                trackCTAClick('Start 7-Day Free Trial', 'final_cta');
                scrollToTop();
              }}>
                <Button 
                  className="bg-primary text-white hover:opacity-90 px-8 py-4 text-lg font-semibold transition duration-300 shadow-lg"
                >
                  Start 7-Day Free Trial
                </Button>
              </Link>
              <Button 
                onClick={() => {
                  trackCTAClick('Get the Free AM Reset', 'final_cta');
                  handleNewsletterClick();
                }}
                variant="outline" 
                className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold transition duration-300"
              >
                Get the Free AM Reset
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AM Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* <UnifiedAMChat type="homepage" /> */}
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed border-gray-300 rounded-lg">
              AM Chat temporarily disabled
            </div>
            <div className="p-4 border-t">
              <Button 
                onClick={() => setShowChatModal(false)}
                variant="outline" 
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {showExitModal && (
        <ExitIntentModal 
          isOpen={showExitModal}
          onClose={() => setShowExitModal(false)}
          currentPage="reset-discipline"
          timeOnPage={getTimeOnPage()}
          scrollDepth={getScrollDepth()}
        />
      )}
    </>
  );
};

export default ResetDiscipline;