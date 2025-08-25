/**
 * Dynamic Landing Page - TRUE PROGRAMMATIC SEO
 * 
 * LOCKED DESIGN ELEMENTS (never change):
 * - Hero section design: compass animations, gradients, layout, spacing
 * - Section layouts and visual hierarchy
 * - All CSS classes and styling
 * - Navigation and overall structure
 * 
 * DYNAMIC CONTENT (adapts to search query):
 * - Hero tagline (getTagline function)
 * - Philosophy section content (getPhilosophyContent function)
 * - AM introduction content (getAMIntroduction function)
 * - Featured blog articles (getFeaturedArticles function)
 * - Meta tags, titles, and SEO content
 * 
 * This creates search-intent-matched content while preserving
 * exact visual design across all programmatically generated pages.
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

const DynamicLandingPage: React.FC = () => {
  const [, params] = useRoute('/landing/:slug');
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
  
  // DYNAMIC CONTENT FUNCTIONS - Content adapts to search query while design stays locked
  
  // Dynamic tagline generation with white/brown color split
  const getTagline = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    // Mental fitness & wellness
    if (lowerQuery.includes('mental well-being') || lowerQuery.includes('mental fitness') || lowerQuery.includes('therapy') || lowerQuery.includes('anxiety') || lowerQuery.includes('depression')) {
      return { white: 'Build Mental', brown: 'Strength & Resilience' };
    }
    
    // Discipline & habits
    if (lowerQuery.includes('discipline') || lowerQuery.includes('habit') || lowerQuery.includes('self control') || lowerQuery.includes('willpower')) {
      return { white: 'Master Your', brown: 'Discipline & Daily Habits' };
    }
    
    // Leadership & business
    if (lowerQuery.includes('executive') || lowerQuery.includes('leader') || lowerQuery.includes('business') || lowerQuery.includes('management') || lowerQuery.includes('ceo')) {
      return { white: 'Develop Authentic', brown: 'Leadership Skills' };
    }
    
    // Fatherhood & family
    if (lowerQuery.includes('father') || lowerQuery.includes('dad') || lowerQuery.includes('parenting') || lowerQuery.includes('family')) {
      return { white: 'Become the Father', brown: 'You Want to Be' };
    }
    
    // Relationships & emotional intelligence
    if (lowerQuery.includes('relationship') || lowerQuery.includes('emotional') || lowerQuery.includes('communication') || lowerQuery.includes('dating')) {
      return { white: 'Build Stronger', brown: 'Relationships & Emotional Intelligence' };
    }
    
    // Personal development & growth
    if (lowerQuery.includes('personal development') || lowerQuery.includes('growth') || lowerQuery.includes('self improvement') || lowerQuery.includes('confidence')) {
      return { white: 'Unlock Your', brown: 'Full Potential & Personal Growth' };
    }
    
    // Stress & burnout
    if (lowerQuery.includes('stress') || lowerQuery.includes('burnout') || lowerQuery.includes('overwhelm') || lowerQuery.includes('pressure')) {
      return { white: 'Master Stress &', brown: 'Prevent Burnout' };
    }
    
    // Masculinity & identity
    if (lowerQuery.includes('masculinity') || lowerQuery.includes('identity') || lowerQuery.includes('authentic') || lowerQuery.includes('masculine')) {
      return { white: 'Discover Authentic', brown: 'Masculinity & Purpose' };
    }
    
    // Default homepage tagline
    return { white: 'Like the gym—but for', brown: 'your mind.' };
  };
  
  const tagline = getTagline(searchQuery);

  // Dynamic philosophy content based on search query
  const getPhilosophyContent = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('mental well-being') || lowerQuery.includes('mental fitness') || lowerQuery.includes('therapy') || lowerQuery.includes('anxiety') || lowerQuery.includes('depression')) {
      return {
        intro: "In today's world, mental well-being has become more critical than ever for men. You're expected to handle stress silently, never show vulnerability, and carry emotional burdens alone.",
        belief: "At The AM Project we believe mental strength isn't about suppressing emotions—it's about building resilience.",
        strength: "We believe in developing practical tools for managing stress, anxiety, and mental challenges. Real mental fitness comes from understanding your mind, not avoiding difficult feelings.",
        evolution: "But mental strength also evolves.",
        modern: "A mentally strong man doesn't just 'tough it out'—he develops emotional intelligence, seeks support when needed, and builds sustainable practices for long-term mental fitness."
      };
    }
    
    if (lowerQuery.includes('discipline') || lowerQuery.includes('habit') || lowerQuery.includes('self control') || lowerQuery.includes('willpower')) {
      return {
        intro: "In today's world, distractions are everywhere and discipline feels impossible. You're bombarded with notifications, instant gratification, and endless excuses to avoid hard work.",
        belief: "At The AM Project we believe discipline isn't about perfection—it's about consistency.",
        strength: "We believe in building small, daily wins that compound into unshakable habits. The same systematic approach that built empires can build your morning routine, your fitness, your focus.",
        evolution: "But real discipline also evolves.",
        modern: "A disciplined man doesn't just force himself through willpower—he designs systems, removes friction from good choices, and builds momentum through strategic wins."
      };
    }
    
    if (lowerQuery.includes('executive') || lowerQuery.includes('leader') || lowerQuery.includes('business') || lowerQuery.includes('management') || lowerQuery.includes('ceo')) {
      return {
        intro: "In today's business world, leadership has become more complex than ever. You're expected to be authoritative but collaborative, decisive but inclusive, strong but emotionally available.",
        belief: "At The AM Project we believe leadership starts with leading yourself first.",
        strength: "We believe in developing the inner discipline, emotional regulation, and clear thinking that great leaders possess. The same qualities that built successful companies start with personal mastery.",
        evolution: "But modern leadership also evolves.",
        modern: "A strong leader doesn't just command—he inspires through example, makes tough decisions with wisdom, and builds teams through authentic connection and clear vision."
      };
    }
    
    if (lowerQuery.includes('father') || lowerQuery.includes('dad') || lowerQuery.includes('parenting') || lowerQuery.includes('family')) {
      return {
        intro: "In today's world, fatherhood comes without a manual. You're expected to provide but also be present, be strong but also emotionally available, lead but also listen.",
        belief: "At The AM Project we believe great fathers are made, not born.",
        strength: "We believe in developing the patience, wisdom, and strength that effective fathers possess. The same qualities that protected families for generations—discipline, integrity, presence—are still essential today.",
        evolution: "But modern fatherhood also evolves.",
        modern: "A strong father doesn't just provide—he models character, teaches life skills through example, and creates safety for his children to grow into their own strength."
      };
    }
    
    // Default philosophy
    return {
      intro: "In today's world, it's harder than ever to know what it really means to live as a good man. You're told to be strong, but not too hard. To lead, but never stand firm against the trend. To provide, but hide the pride you take in doing it.",
      belief: "At The AM Project we believe something different.",
      strength: "We believe in embracing the timeless strengths that built civilizations—strength, courage, discipline, leadership. The same instincts that protected families, forged legacies, and carried men through hardship are still alive today. They should be honored, not repressed.",
      evolution: "But real strength also evolves.",
      modern: "A modern man doesn't just carry the physical weight—he carries emotional presence, shows up for his relationships with vulnerability, and leads without clinging to outdated roles. He knows his power, and he also knows when to hold it back."
    };
  };

  // Dynamic AM introduction based on search query
  const getAMIntroduction = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('mental well-being') || lowerQuery.includes('mental fitness') || lowerQuery.includes('anxiety') || lowerQuery.includes('depression')) {
      return {
        main: "AM is your personal mental fitness coach, designed specifically for men who want to build genuine emotional resilience and mental strength.",
        details: "Whether you're dealing with stress, anxiety, overwhelming thoughts, or just want to build better mental habits, AM provides practical guidance rooted in proven psychological principles.",
        cta: "Ask AM about stress management, anxiety techniques, or building mental resilience. Available 24/7 for members."
      };
    }
    
    if (lowerQuery.includes('discipline') || lowerQuery.includes('habit') || lowerQuery.includes('self control') || lowerQuery.includes('willpower')) {
      return {
        main: "AM is your personal discipline coach, designed specifically for men who want to build unshakable habits and self-control.",
        details: "Whether you're struggling with consistency, motivation, or breaking bad habits, AM provides practical systems and accountability to help you build lasting discipline.",
        cta: "Ask AM about habit formation, willpower techniques, or building daily discipline. Available 24/7 for members."
      };
    }
    
    if (lowerQuery.includes('executive') || lowerQuery.includes('leader') || lowerQuery.includes('business') || lowerQuery.includes('management') || lowerQuery.includes('ceo')) {
      return {
        main: "AM is your personal leadership development coach, designed specifically for men who want to lead with integrity and authentic authority.",
        details: "Whether you're dealing with team challenges, decision-making pressure, or developing executive presence, AM provides practical guidance rooted in proven leadership principles.",
        cta: "Ask AM about leadership skills, team management, or executive development. Available 24/7 for members."
      };
    }
    
    if (lowerQuery.includes('father') || lowerQuery.includes('dad') || lowerQuery.includes('parenting') || lowerQuery.includes('family')) {
      return {
        main: "AM is your personal fatherhood mentor, designed specifically for men who want to lead their families with wisdom and strength.",
        details: "Whether you're dealing with parenting challenges, work-life balance, or modeling character for your children, AM provides practical guidance for modern fathers.",
        cta: "Ask AM about parenting strategies, family leadership, or fatherhood challenges. Available 24/7 for members."
      };
    }
    
    // Default introduction
    return {
      main: "AM is your personal mentor and accountability partner, designed specifically for men who want to lead themselves with integrity, discipline, and purpose.",
      details: "Unlike generic AI assistants, AM understands the unique challenges men face today. Whether you're dealing with career pressure, relationship dynamics, personal discipline, or life transitions, AM provides practical guidance rooted in proven principles.",
      cta: "Ask AM anything. Share your struggles. Get honest feedback. Available 24/7 for members—because strong men support each other."
    };
  };

  // Dynamic blog articles based on search query
  const getFeaturedArticles = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('mental well-being') || lowerQuery.includes('mental fitness') || lowerQuery.includes('anxiety') || lowerQuery.includes('stress')) {
      return [
        {
          category: "MENTAL FITNESS",
          title: "Managing Anxiety: A Man's Guide to Mental Strength",
          description: "Practical tools for handling stress, pressure, and overwhelming thoughts without losing your edge.",
          link: "/blog/managing-anxiety-mental-strength"
        },
        {
          category: "RESILIENCE", 
          title: "Building Emotional Resilience in High-Pressure Situations",
          description: "How to stay grounded and clear-headed when everything is falling apart.",
          link: "/blog/emotional-resilience-pressure"
        },
        {
          category: "MINDSET",
          title: "The Mental Fitness Framework: Training Your Mind Like Your Body",
          description: "A systematic approach to developing unshakable mental strength and clarity.",
          link: "/blog/mental-fitness-framework"
        }
      ];
    }
    
    if (lowerQuery.includes('discipline') || lowerQuery.includes('habit') || lowerQuery.includes('self control')) {
      return [
        {
          category: "DISCIPLINE",
          title: "How to Build Unshakable Discipline in 30 Days",
          description: "Small, daily wins that compound into unstoppable momentum—and the exact checklist to keep you honest.",
          link: "/blog/5-30-club-early-risers"
        },
        {
          category: "HABITS",
          title: "The Discipline Stack: Building Systems That Run Themselves",
          description: "How to design your environment so good choices become automatic.",
          link: "/blog/discipline-stack-systems"
        },
        {
          category: "WILLPOWER",
          title: "Beyond Willpower: The Science of Sustainable Self-Control",
          description: "Why motivation fails and what actually works for long-term discipline.",
          link: "/blog/beyond-willpower-self-control"
        }
      ];
    }
    
    if (lowerQuery.includes('executive') || lowerQuery.includes('leader') || lowerQuery.includes('business') || lowerQuery.includes('management')) {
      return [
        {
          category: "LEADERSHIP",
          title: "Executive Presence: Leading With Authentic Authority",
          description: "How to command respect without intimidation and lead through influence.",
          link: "/blog/executive-presence-authority"
        },
        {
          category: "BUSINESS",
          title: "Decision-Making Under Pressure: A Leader's Framework",
          description: "Clear thinking and decisive action when the stakes are highest.",
          link: "/blog/decision-making-pressure"
        },
        {
          category: "MANAGEMENT",
          title: "Building High-Performance Teams Through Character",
          description: "Why the best leaders focus on who they are, not just what they do.",
          link: "/blog/high-performance-teams-character"
        }
      ];
    }
    
    if (lowerQuery.includes('father') || lowerQuery.includes('dad') || lowerQuery.includes('parenting') || lowerQuery.includes('family')) {
      return [
        {
          category: "FATHERHOOD",
          title: "Lead at Home: 5 Rules I'm Teaching My Kids About Courage",
          description: "Fatherhood lessons forged on the front lines.",
          link: "/blog/art-fatherhood-family-leadership"
        },
        {
          category: "PARENTING",
          title: "The Dad's Guide to Raising Strong, Resilient Kids",
          description: "How to model strength while teaching emotional intelligence.",
          link: "/blog/raising-strong-resilient-kids"
        },
        {
          category: "FAMILY",
          title: "Work-Life Integration: Being Present When It Matters",
          description: "How high-achieving fathers balance ambition with family presence.",
          link: "/blog/work-life-integration-presence"
        }
      ];
    }
    
    // Default articles
    return [
      {
        category: "DISCIPLINE",
        title: "How to Build Unshakable Discipline in 30 Days",
        description: "Small, daily wins that compound into unstoppable momentum—and the exact checklist to keep you honest.",
        link: "/blog/5-30-club-early-risers"
      },
      {
        category: "PHYSICAL",
        title: "The Lost Art of Physical Confidence",
        description: "Why mastering your body changes how you move through the world.",
        link: "/blog/beyond-gym-complete-physical-practice"
      },
      {
        category: "LEADERSHIP",
        title: "Lead at Home: 5 Rules I'm Teaching My Kids About Courage",
        description: "Fatherhood lessons forged on the front lines.",
        link: "/blog/art-fatherhood-family-leadership"
      }
    ];
  };

  // Dynamic section content - these sections adapt to search intent
  const getStatsSection = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('mental well-being') || lowerQuery.includes('mental fitness') || lowerQuery.includes('anxiety') || lowerQuery.includes('stress')) {
      return {
        title: 'Why mental fitness matters more than ever',
        subtitle: 'In a world that tells men to figure it out alone, we\'re building something different. A place where mental fitness isn\'t just talked about—it\'s trained.',
        stats: [
          { number: '76%', description: 'of men report feeling overwhelmed by daily stress and pressure' },
          { number: '68%', description: 'struggle with anxiety but never seek help or support' },
          { number: '84%', description: 'want practical mental fitness tools, not just therapy sessions' }
        ],
        conclusion: 'The AM Project was built by men, for men who are ready to build genuine mental strength and emotional resilience.'
      };
    }
    
    if (lowerQuery.includes('discipline') || lowerQuery.includes('habit') || lowerQuery.includes('self control') || lowerQuery.includes('willpower')) {
      return {
        title: 'Why building discipline matters more than ever',
        subtitle: 'In a world of constant distractions and instant gratification, we\'re building something different. A place where discipline isn\'t just talked about—it\'s systematically built.',
        stats: [
          { number: '82%', description: 'of men report struggling with consistency in their goals and habits' },
          { number: '71%', description: 'start strong but lose momentum within the first month' },
          { number: '89%', description: 'want practical discipline systems, not motivational speeches' }
        ],
        conclusion: 'The AM Project was built by men, for men who are tired of starting over and ready to build unshakable discipline.'
      };
    }
    
    if (lowerQuery.includes('executive') || lowerQuery.includes('leader') || lowerQuery.includes('business') || lowerQuery.includes('management') || lowerQuery.includes('ceo')) {
      return {
        title: 'Why leadership development matters more than ever',
        subtitle: 'In a world that demands authentic leadership at every level, we\'re building something different. A place where leadership isn\'t just discussed—it\'s developed from the inside out.',
        stats: [
          { number: '79%', description: 'of executives report feeling unprepared for leadership challenges' },
          { number: '65%', description: 'struggle with decision-making under pressure and uncertainty' },
          { number: '91%', description: 'want practical leadership tools, not theoretical frameworks' }
        ],
        conclusion: 'The AM Project was built by men, for men who want to lead with integrity and authentic authority.'
      };
    }
    
    if (lowerQuery.includes('father') || lowerQuery.includes('dad') || lowerQuery.includes('parenting') || lowerQuery.includes('family')) {
      return {
        title: 'Why intentional fatherhood matters more than ever',
        subtitle: 'In a world that offers no manual for modern fathers, we\'re building something different. A place where fatherhood isn\'t just figured out—it\'s intentionally developed.',
        stats: [
          { number: '74%', description: 'of fathers report feeling unprepared for parenting challenges' },
          { number: '63%', description: 'struggle with balancing work demands and family presence' },
          { number: '88%', description: 'want practical fatherhood guidance, not parenting theories' }
        ],
        conclusion: 'The AM Project was built by men, for men who want to lead their families with wisdom and strength.'
      };
    }
    
    // Default stats section
    return {
      title: 'Why mental fitness matters more than ever',
      subtitle: 'In a world that tells men to figure it out alone, we\'re building something different. A place where mental fitness isn\'t just talked about—it\'s trained.',
      stats: [
        { number: '73%', description: 'of men report feeling stuck in their personal growth' },
        { number: '81%', description: 'struggle with consistency in building positive habits' },
        { number: '92%', description: 'want practical tools, not just motivation' }
      ],
      conclusion: 'The AM Project was built by men, for men who are tired of surface-level solutions. We focus on mental fitness because that\'s where real change happens.'
    };
  };

  const getSolutionSection = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('mental well-being') || lowerQuery.includes('mental fitness') || lowerQuery.includes('anxiety') || lowerQuery.includes('stress')) {
      return {
        title: 'The Solution',
        subtitle: 'The AM Project gives you the framework, community, and daily practice to build unshakeable mental strength and emotional resilience.',
        features: [
          'Daily mental fitness challenges that build real emotional resilience',
          'AI coaching for stress management and anxiety techniques',
          'Community of men who understand mental fitness struggles',
          'Progress tracking for your mental wellness journey'
        ],
        cta: {
          title: 'Ready to Build Mental Strength?',
          subtitle: 'Join thousands of men who are building mental fitness and redefining what it means to be emotionally strong.',
          button: 'Start Building Mental Fitness'
        }
      };
    }
    
    if (lowerQuery.includes('discipline') || lowerQuery.includes('habit') || lowerQuery.includes('self control') || lowerQuery.includes('willpower')) {
      return {
        title: 'The Solution',
        subtitle: 'The AM Project gives you the framework, community, and daily practice to build unshakeable discipline and lasting habits.',
        features: [
          'Daily discipline challenges that build real self-control',
          'AI coaching for habit formation and willpower strategies',
          'Community of men who are committed to consistent growth',
          'Progress tracking for your discipline and habit development'
        ],
        cta: {
          title: 'Ready to Master Your Discipline?',
          subtitle: 'Join thousands of men who are building unshakeable habits and redefining what it means to be consistent.',
          button: 'Start Building Discipline'
        }
      };
    }
    
    if (lowerQuery.includes('executive') || lowerQuery.includes('leader') || lowerQuery.includes('business') || lowerQuery.includes('management') || lowerQuery.includes('ceo')) {
      return {
        title: 'The Solution',
        subtitle: 'The AM Project gives you the framework, community, and daily practice to build authentic leadership and executive presence.',
        features: [
          'Daily leadership challenges that build real authority and influence',
          'AI coaching for decision-making and executive presence',
          'Community of men who are leading at the highest levels',
          'Progress tracking for your leadership development journey'
        ],
        cta: {
          title: 'Ready to Lead with Authority?',
          subtitle: 'Join thousands of men who are building authentic leadership and redefining what it means to lead.',
          button: 'Start Building Leadership'
        }
      };
    }
    
    if (lowerQuery.includes('father') || lowerQuery.includes('dad') || lowerQuery.includes('parenting') || lowerQuery.includes('family')) {
      return {
        title: 'The Solution',
        subtitle: 'The AM Project gives you the framework, community, and daily practice to build intentional fatherhood and family leadership.',
        features: [
          'Daily fatherhood challenges that build real parenting skills',
          'AI coaching for family leadership and parenting decisions',
          'Community of men who are committed to being great fathers',
          'Progress tracking for your growth as a father and leader'
        ],
        cta: {
          title: 'Ready to Lead Your Family?',
          subtitle: 'Join thousands of men who are building intentional fatherhood and redefining what it means to be a dad.',
          button: 'Start Building Fatherhood Skills'
        }
      };
    }
    
    // Default solution section
    return {
      title: 'The Solution',
      subtitle: 'The AM Project gives you the framework, community, and daily practice to build unshakeable mental fitness.',
      features: [
        'Daily challenges that build real discipline',
        'AI coaching for the hard decisions',
        'Community of men who get it',
        'Progress you can actually measure'
      ],
      cta: {
        title: 'Ready to Start?',
        subtitle: 'Join thousands of men who are building mental fitness and redefining what it means to be strong.',
        button: 'Start Building Mental Fitness'
      }
    };
  };

  const philosophyContent = getPhilosophyContent(searchQuery);
  const amIntroduction = getAMIntroduction(searchQuery);
  const featuredArticles = getFeaturedArticles(searchQuery);
  const statsSection = getStatsSection(searchQuery);
  const solutionSection = getSolutionSection(searchQuery);

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
      <CanonicalLink path={`/landing/${params?.slug}`} />
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
        url={`https://theamproject.com/landing/${params?.slug}`}
        name={`The AM Project - Mental Fitness App - ${searchQuery}`}
        description="Mental fitness app for men ready to build discipline, regain clarity, and reflect with purpose. Like the gym—but for your mind."
        image="/images/logo-inverted.svg"
        dateModified="2025-08-19"
      />
      
      {/* Exit Intent Modal */}
      <ExitIntentModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        timeOnPage={getTimeOnPage()}
        scrollDepth={getScrollDepth()}
        currentPage="landing"
      />

      {/* LOCKED HERO SECTION - DO NOT MODIFY DESIGN/ANIMATIONS */}
      {/* Only tagline text content should be dynamic via getTagline() */}
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
              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-left">
                {tagline.white} <br />
                <span className="text-primary">{tagline.brown}</span>
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

      {/* DYNAMIC STATS SECTION - First opportunity for dynamic content */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute left-0 top-1/2 w-40 h-40 bg-primary/5 rounded-full blur-3xl z-0"></div>
        <div className="absolute right-0 bottom-1/4 w-64 h-64 bg-primary/10 rounded-full blur-2xl z-0"></div>
        
        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">
              {statsSection.title}
            </h2>
            <p className="text-xl mb-12 text-gray-600 max-w-4xl mx-auto">
              {statsSection.subtitle}
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {statsSection.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-5xl md:text-6xl font-bold text-primary mb-4">
                    {stat.number}
                  </div>
                  <p className="text-lg text-gray-600">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="bg-black p-8 rounded-xl border border-primary/20 max-w-4xl mx-auto">
              <p className="text-xl text-center font-medium text-white">
                {statsSection.conclusion}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC SOLUTION SECTION - Second opportunity for dynamic content */}
      <section className="py-20 bg-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute right-0 top-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl z-0"></div>
        <div className="absolute left-0 bottom-1/4 w-80 h-80 bg-primary/10 rounded-full blur-2xl z-0"></div>
        
        <div className="container relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {solutionSection.title}
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
                {solutionSection.subtitle}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Features List */}
              <div>
                <h3 className="text-2xl font-bold mb-8">What You Get:</h3>
                <div className="space-y-6">
                  {solutionSection.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <p className="text-lg">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* CTA Card */}
              <div className="bg-background p-8 rounded-xl shadow-lg border border-primary/20">
                <h3 className="text-2xl font-bold mb-4">
                  {solutionSection.cta.title}
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  {solutionSection.cta.subtitle}
                </p>
                <Link href="/join" onClick={() => {
                  scrollToTop();
                  trackInteraction('solution_cta_click', 'solution_section');
                }}>
                  <Button 
                    size="lg" 
                    className="bg-primary text-primary-foreground px-8 py-4 text-lg w-full"
                  >
                    {solutionSection.cta.button}
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction/Philosophy Section - Builds Credibility */}
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
              {philosophyContent.intro}
            </p>
            
            <div className="flex items-center mb-8">
              <div className="h-12 w-1 bg-primary mr-4 rounded-full"></div>
              <p className="text-xl font-semibold">
                {philosophyContent.belief}
              </p>
            </div>
            
            <p className="text-lg mb-8 text-muted-foreground">
              {philosophyContent.strength}
            </p>
            
            <div className="flex items-center mb-8">
              <div className="h-12 w-1 bg-primary mr-4 rounded-full"></div>
              <p className="text-xl font-semibold">
                {philosophyContent.evolution}
              </p>
            </div>
            
            <p className="text-lg mb-8 text-muted-foreground">
              {philosophyContent.modern}
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

      {/* Meet AM Section - Introduction to the chat widget */}
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
                  {amIntroduction.main}
                </p>
                <p className="text-lg text-black leading-relaxed mb-6">
                  {amIntroduction.details}
                </p>
                <p className="text-lg text-black leading-relaxed">
                  {amIntroduction.cta}
                </p>
              </div>
            </div>
            
            {/* <UnifiedAMChat type="homepage" /> */}
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed border-gray-300 rounded-lg">
              AM Chat temporarily disabled
            </div>
          </div>
        </div>
      </section>

      {/* AM Standard Section - Core brand content */}
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

      {/* Featured Blog Section - SEO and content depth */}
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
            {featuredArticles.map((article, index) => {
              // Map dynamic categories to existing icon files
              const getIconSrc = (category: string) => {
                const lowerCategory = category.toLowerCase();
                if (lowerCategory.includes('mental') || lowerCategory.includes('resilience') || lowerCategory.includes('mindset')) {
                  return '/icons/discipline-icon.svg';
                }
                if (lowerCategory.includes('discipline') || lowerCategory.includes('habits') || lowerCategory.includes('willpower')) {
                  return '/icons/discipline-icon.svg';
                }
                if (lowerCategory.includes('leadership') || lowerCategory.includes('business') || lowerCategory.includes('management')) {
                  return '/icons/leadership-icon.svg';
                }
                if (lowerCategory.includes('father') || lowerCategory.includes('parenting') || lowerCategory.includes('family')) {
                  return '/icons/leadership-icon.svg';
                }
                if (lowerCategory.includes('physical')) {
                  return '/icons/physical-icon.svg';
                }
                return '/icons/discipline-icon.svg'; // Default fallback
              };

              return (
                <div key={index} className="bg-background p-8 rounded-xl shadow-lg border border-primary/10 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-16 h-16 mb-5 mx-auto">
                    <img 
                      src={getIconSrc(article.category)}
                      alt={article.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="mb-1 text-sm text-primary font-semibold">{article.category}</div>
                  <h3 className="text-xl font-bold mb-3">{article.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {article.description}
                  </p>
                  <Link href={article.link} className="group flex items-center text-primary font-semibold hover:text-primary/80">
                    Read Article 
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 group-hover:translate-x-1 transition-transform duration-300">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              );
            })}
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


    </>
  );
};

export default DynamicLandingPage;