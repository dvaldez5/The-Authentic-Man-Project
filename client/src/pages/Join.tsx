import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { scrollToTop, scrollToElement } from '@/lib/utils';
import { Target, Users, Brain, ArrowRight, MessageCircle, BookOpen, Calendar, BarChart3, TrendingUp, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { trackNewsletterSignup, trackPDFDownload, trackPageView } from '@/lib/google-ads';
import { useMarketingAnalytics } from '@/hooks/use-marketing-analytics';
import { useMarketingPageAnalytics } from '@/hooks/use-behavior-analytics';
import { useGoogleAdsConversions } from '@/hooks/use-google-ads-conversions';
import ExitIntentModal from '@/components/ExitIntentModal';
import { useExitIntent } from '@/hooks/use-exit-intent';
import TestimonialSection from '@/components/TestimonialSection';

const newsletterSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  privacy: z.boolean().refine(val => val === true, {
    message: 'You must accept the privacy policy',
  }),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

// Problem-Solution Theater Component
const ProblemSolutionTheater = () => {
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  
  const scenarios = [
    {
      id: 1,
      title: "Career Setback",
      problem: "Got passed over for promotion again. Second-guessing every decision, losing confidence in meetings.",
      traditionalFail: "Read motivational quotes, complain to friends, nothing changes",
      amSolution: "Daily scenario practice builds decision confidence. AI coaching for tough workplace situations.",
      icon: <TrendingUp className="w-6 h-6" />,
      result: "Makes decisions faster, speaks up in meetings, leads projects confidently"
    },
    {
      id: 2,
      title: "Relationship Conflict",
      problem: "Same arguments with partner. Can't communicate without it escalating. Feel like walking on eggshells.",
      traditionalFail: "Bottle it up, blow up later, apologize, repeat cycle",
      amSolution: "Reflection tools identify patterns. Practice difficult conversations through AI scenarios.",
      icon: <MessageCircle className="w-6 h-6" />,
      result: "Stays calm during conflict, addresses issues directly, builds stronger connection"
    },
    {
      id: 3,
      title: "Daily Discipline",
      problem: "Start strong Monday, burnt out by Wednesday. Can't stick to habits, feel like a constant failure.",
      traditionalFail: "Try harder with willpower, burn out, give up, start over next month",
      amSolution: "Micro-habits that build momentum. Daily challenges calibrated to your energy levels.",
      icon: <Target className="w-6 h-6" />,
      result: "Consistent daily actions, builds unbreakable streak mentality, genuine self-trust"
    }
  ];

  return (
    <div className="mb-16">
      <h3 className="text-2xl font-bold mb-8 text-center">Real Challenges Men Face Daily</h3>
      <p className="text-lg text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
        Click any scenario to see how traditional approaches fail—and how The AM Project actually works.
      </p>
      
      <div className="grid md:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <Card 
            key={scenario.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              activeScenario === scenario.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveScenario(activeScenario === scenario.id ? null : scenario.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  {scenario.icon}
                </div>
                <h4 className="font-bold text-lg">{scenario.title}</h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{scenario.problem}</p>
                </div>
                
                {activeScenario === scenario.id && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-2">
                      <X className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Traditional Approach Fails:</p>
                        <p className="text-sm text-muted-foreground">{scenario.traditionalFail}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-primary mb-1">AM Project Solution:</p>
                        <p className="text-sm text-muted-foreground">{scenario.amSolution}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border">
                      <p className="text-sm font-bold text-black mb-1">Real Result:</p>
                      <p className="text-sm text-black">{scenario.result}</p>
                    </div>
                  </div>
                )}
                
                {activeScenario !== scenario.id && (
                  <Button variant="ghost" size="sm" className="w-full text-accent hover:text-accent-foreground">
                    See How AM Project Solves This <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// App Interface Preview Component
const AppInterfacePreview = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const handleStepClick = (index: number) => {
    setActiveStep(index);
    // On mobile, briefly scroll the mockup into view after state update
    if (window.innerWidth < 1024) { // lg breakpoint
      setTimeout(() => {
        const mockupElement = document.getElementById('app-mockup');
        if (mockupElement) {
          mockupElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  };
  
  const dayInTheLife = [
    {
      time: "6:30 AM",
      activity: "Morning Reflection",
      description: "Quick check-in with AI-powered prompts",
      screen: {
        title: "Good morning! How are you feeling today?",
        content: "Today's reflection: What's one thing you want to approach differently than yesterday?",
        interface: "journal"
      }
    },
    {
      time: "12:00 PM",
      activity: "Daily Challenge",
      description: "Micro-action that builds momentum",
      screen: {
        title: "Today's Challenge: Leadership Moment",
        content: "Next meeting, ask one clarifying question before giving your opinion. +100 XP",
        interface: "challenge"
      }
    },
    {
      time: "7:00 PM",
      activity: "Scenario Practice",
      description: "Safe space to practice tough decisions",
      screen: {
        title: "Scenario: Difficult Team Conversation",
        content: "Your team member missed another deadline. How do you address this?",
        interface: "scenario"
      }
    },
    {
      time: "9:30 PM",
      activity: "Evening Review",
      description: "Process the day, plan tomorrow",
      screen: {
        title: "How did today's challenge go?",
        content: "Reflect on what you learned and how you'll apply it tomorrow.",
        interface: "reflection"
      }
    }
  ];

  const getScreenMockup = (screen: any) => {
    const baseClasses = "bg-background border border-border rounded-lg p-4 max-w-sm mx-auto";
    
    switch (screen.interface) {
      case 'journal':
        return (
          <div className={baseClasses}>
            <div className="flex items-center mb-3">
              <BookOpen className="w-5 h-5 text-primary mr-2" />
              <span className="text-sm font-medium">Journal Entry</span>
            </div>
            <h4 className="font-semibold mb-2 text-sm">{screen.title}</h4>
            <p className="text-xs text-muted-foreground mb-3">{screen.content}</p>
            <div className="bg-secondary p-2 rounded text-xs">Your response here...</div>
          </div>
        );
      case 'challenge':
        return (
          <div className={baseClasses}>
            <div className="flex items-center mb-3">
              <Target className="w-5 h-5 text-primary mr-2" />
              <span className="text-sm font-medium">Daily Challenge</span>
            </div>
            <h4 className="font-semibold mb-2 text-sm">{screen.title}</h4>
            <p className="text-xs text-muted-foreground mb-3">{screen.content}</p>
            <Button size="sm" className="w-full text-xs">Mark Complete</Button>
          </div>
        );
      case 'scenario':
        return (
          <div className={baseClasses}>
            <div className="flex items-center mb-3">
              <Users className="w-5 h-5 text-primary mr-2" />
              <span className="text-sm font-medium">Scenario Training</span>
            </div>
            <h4 className="font-semibold mb-2 text-sm">{screen.title}</h4>
            <p className="text-xs text-muted-foreground mb-3">{screen.content}</p>
            <div className="space-y-1">
              <div className="bg-secondary p-1 rounded text-xs">A) Address directly</div>
              <div className="bg-secondary p-1 rounded text-xs">B) Give another chance</div>
              <div className="bg-secondary p-1 rounded text-xs">C) Escalate to manager</div>
            </div>
          </div>
        );
      case 'reflection':
        return (
          <div className={baseClasses}>
            <div className="flex items-center mb-3">
              <Calendar className="w-5 h-5 text-primary mr-2" />
              <span className="text-sm font-medium">Evening Reflection</span>
            </div>
            <h4 className="font-semibold mb-2 text-sm">{screen.title}</h4>
            <p className="text-xs text-muted-foreground mb-3">{screen.content}</p>
            <div className="bg-accent/10 p-2 rounded text-xs">
              <div className="flex items-center">
                <CheckCircle className="w-3 h-3 text-primary mr-1" />
                <span className="text-primary">Challenge completed!</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-16">
      <h3 className="text-2xl font-bold mb-8 text-center">See Your Day With The AM Project</h3>
      <p className="text-lg text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
        This is what your actual app experience looks like—real screens, real progress, real growth.
      </p>
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Timeline */}
        <div className="space-y-6 lg:order-1">
          {dayInTheLife.map((step, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-all duration-300 ${
                activeStep === index ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
              }`}
              onClick={() => handleStepClick(index)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      activeStep === index ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{step.time}</p>
                      <p className="text-xs text-muted-foreground">{step.activity}</p>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 transition-transform ${
                    activeStep === index ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <p className="text-sm text-muted-foreground mt-2">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* App Screen Mockup */}
        <div id="app-mockup" className="flex flex-col items-center lg:sticky lg:top-8 lg:order-2">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-center">
              {dayInTheLife[activeStep].time} - {dayInTheLife[activeStep].activity}
            </h4>
          </div>
          
          <div className="transition-all duration-500 transform">
            {getScreenMockup(dayInTheLife[activeStep].screen)}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {dayInTheLife[activeStep].description}
            </p>
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Progress tracked automatically</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <Card className="bg-accent/10 border border-accent/20 p-6 max-w-2xl mx-auto">
          <h4 className="font-bold text-lg mb-2">This Is Your Real Dashboard</h4>
          <p className="text-muted-foreground">
            Every interaction builds your profile, tracks your growth, and adapts to your progress. 
            No mock screens—this is the actual app interface you'll use daily.
          </p>
        </Card>
      </div>
    </div>
  );
};

const Join = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const { toast } = useToast();
  
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
      sensitivity: 30, 
      delay: 5000, 
      debounce: 2000 
    }
  );
  
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      privacy: false,
    },
  });

  useEffect(() => {
    // Track page view
    trackPageView('Join Page', { 
      page_category: 'landing',
      content_type: 'newsletter_signup'
    });
    
    // Check for newsletter fragment in URL and scroll to it
    if (window.location.hash === '#newsletter') {
      setTimeout(() => {
        scrollToElement('newsletter');
      }, 100);
    }
  }, []);

  async function onSubmit(data: NewsletterFormValues) {
    setIsSubmitting(true);
    
    // Track newsletter form submission engagement
    trackInteraction('newsletter_form_submit', 'newsletter_section');
    
    try {
      console.log('Submitting newsletter form with data:', data);
      const response = await apiRequest('POST', '/api/newsletter', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email
      });
      
      const responseData = await response.json();
      console.log('Newsletter subscription success:', responseData);
      
      // Track newsletter signup conversion
      trackNewsletterSignup({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        transactionId: responseData.subscriberId?.toString()
      });
      
      // Track successful newsletter signup engagement
      trackInteraction('newsletter_signup_success', 'newsletter_section');
      
      // Trigger PDF download
      const link = document.createElement('a');
      link.href = '/The_AM_Reset.pdf';
      link.download = 'The AM Reset - 6 Grounded Practices.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Track PDF download conversion
      trackPDFDownload({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName
      });
      
      // Track PDF download engagement
      trackInteraction('pdf_download_triggered', 'newsletter_section');

      toast({
        title: "Success!",
        description: "You've been added to our newsletter. The AM Reset is downloading now!",
      });
      
      form.reset();
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="pt-20">
      {/* Primary: App Membership Content */}
      <section className="py-20 bg-background relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-accent/20 via-transparent to-accent/10"></div>
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-3xl md:text-4xl font-bold mb-6">Join The AM Project</h1>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Where Men Build Unshakeable Self-Leadership</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Stop second-guessing yourself. Start leading with clarity, discipline, and purpose.
              </p>
            </div>

            {/* Problem-Solution Theater */}
            <ProblemSolutionTheater />

            {/* How The System Works */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold mb-8 text-center">How The System Works</h3>
              <Card className="bg-accent/10 border border-accent/20 p-8">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-accent-foreground" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">Daily Practice</h4>
                    <p className="text-muted-foreground">Quick challenges and reflection that fit your schedule. No lengthy requirements—just consistent small actions that build momentum.</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-accent-foreground" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">Peer Support</h4>
                    <p className="text-muted-foreground">Connect with other men through community discussions and accountability groups. Share experiences, get perspectives, stay motivated.</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 h-8 text-accent-foreground" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">AI Guidance</h4>
                    <p className="text-muted-foreground">24/7 access to personalized support and scenario training. Practice difficult decisions, get instant feedback, build confidence.</p>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <p className="text-muted-foreground text-lg">
                    Simple daily habits → peer accountability → AI-powered growth → lasting transformation.
                  </p>
                </div>
              </Card>
            </div>

            {/* What Members Actually Achieve */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold mb-6">What Members Actually Achieve</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex gap-3">
                  <span className="text-accent font-bold text-lg">✓</span>
                  <p className="text-muted-foreground">Make decisions faster with confidence</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-accent font-bold text-lg">✓</span>
                  <p className="text-muted-foreground">Handle conflict without losing composure</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-accent font-bold text-lg">✓</span>
                  <p className="text-muted-foreground">Build habits that stick long-term</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-accent font-bold text-lg">✓</span>
                  <p className="text-muted-foreground">Lead their families and teams effectively</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-accent font-bold text-lg">✓</span>
                  <p className="text-muted-foreground">Stop the cycle of starting and quitting</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-accent font-bold text-lg">✓</span>
                  <p className="text-muted-foreground">Develop unshakeable self-trust</p>
                </div>
              </div>
            </div>

            {/* App Interface Preview */}
            <AppInterfacePreview />

            {/* App Convenience */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold mb-6">Access Your Tools Anywhere: Progressive Web App</h3>
              <p className="text-lg mb-6">The AM Project works like a native app on any device. Install it directly from your browser—no App Store hassle, no extra downloads.</p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <Card className="bg-secondary border border-border p-6">
                  <h4 className="text-lg font-semibold text-foreground mb-3">Mobile & Desktop Ready</h4>
                  <p className="text-muted-foreground">
                    Install on your phone for quick daily check-ins and journaling. Use on desktop for deeper course work and planning sessions. Your progress syncs seamlessly across all devices.
                  </p>
                </Card>

                <Card className="bg-secondary border border-border p-6">
                  <h4 className="text-lg font-semibold text-foreground mb-3">Works Offline</h4>
                  <p className="text-muted-foreground">
                    No internet? No problem. Journal, review courses, and track habits even when disconnected. Everything syncs when you're back online.
                  </p>
                </Card>

                <Card className="bg-secondary border border-border p-6">
                  <h4 className="text-lg font-semibold text-foreground mb-3">Full-Screen Focus</h4>
                  <p className="text-muted-foreground">
                    Distraction-free environment for deep work. No browser tabs, no notifications—just you and your development tools.
                  </p>
                </Card>

                <Card className="bg-secondary border border-border p-6">
                  <h4 className="text-lg font-semibold text-foreground mb-3">Privacy First</h4>
                  <p className="text-muted-foreground">
                    Your data stays secure. Nothing gets shared without your permission. Your reflections and progress remain completely private.
                  </p>
                </Card>
              </div>
            </div>

            {/* Final Call to Action */}
            <div className="text-center">
              <div className="mb-8">
                <p className="text-xl text-muted-foreground mb-2">You don't need perfect conditions—just a clear path.</p>
                <p className="text-xl text-muted-foreground mb-2">The AM Project App equips you with that path.</p>
                <p className="text-xl text-muted-foreground">Where you go next is your call.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth?mode=signup" onClick={() => scrollToTop()}>
                  <Button className="bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:opacity-90 transition duration-300">
                    Become a Member
                  </Button>
                </Link>
                <Link href="/" onClick={() => scrollToTop()}>
                  <Button variant="outline" className="px-8 py-4 text-lg font-semibold">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Divider */}
      <div className="bg-border h-px"></div>

      {/* Testimonials Section */}
      <TestimonialSection />

      {/* Secondary: Newsletter Signup */}
      <section id="newsletter" className="py-20 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto bg-secondary p-8 md:p-12 rounded-lg shadow-xl border border-border">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Or Start With Our Newsletter</h2>
              <p className="text-muted-foreground text-lg">
                Join the free AM Project newsletter and get instant access to The AM Reset — 6 grounded practices to help you rebuild clarity, discipline, and purpose.
              </p>
            </div>
            
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
                            placeholder="Your first name" 
                            className="bg-background text-foreground border border-border focus:ring-accent" 
                            {...field} 
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
                            placeholder="Your last name" 
                            className="bg-background text-foreground border border-border focus:ring-accent" 
                            {...field} 
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="your.email@example.com" 
                          className="bg-background text-foreground border border-border focus:ring-accent" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="privacy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          I agree to receive AM Project emails and accept the{" "}
                          <Link href="/privacy" className="text-accent hover:underline">
                            privacy policy
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transition duration-300 py-3 text-lg font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Subscribing..." : "Get The AM Reset (Free)"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </section>

      {/* Exit Intent Modal */}
      <ExitIntentModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        currentPage="join"
        timeOnPage={getTimeOnPage()}
        scrollDepth={getScrollDepth()}
      />
    </div>
  );
};

export default Join;