import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Shield, Flame, GraduationCap, Users, Target, Zap, Heart } from 'lucide-react';
import NewsletterCTA from '@/components/NewsletterCTA';
import MetaTags from '@/components/MetaTags';
import CanonicalLink from '@/components/CanonicalLink';
import { WebPageStructuredData } from '@/components/StructuredData';
import { useExitIntent } from '@/hooks/use-exit-intent';
import { useAnalytics } from '@/hooks/use-analytics';
import ExitIntentModal from '@/components/ExitIntentModal';

const About = () => {
  const [showExitModal, setShowExitModal] = useState(false);
  
  // Analytics tracking
  useAnalytics();
  
  // Exit intent detection
  const { getTimeOnPage, getScrollDepth } = useExitIntent(
    (data) => {
      if (!showExitModal) {
        setShowExitModal(true);
      }
    },
    { delay: 3000 }
  );
  
  // Daniel's credibility timeline
  const timeline = [
    {
      icon: <Shield className="text-primary" size={24} />,
      title: 'Military Veteran',
      description: 'Served his country with honor',
      years: 'Early Career'
    },
    {
      icon: <Flame className="text-primary" size={24} />,
      title: 'Firefighter',
      description: 'Life-or-death decision making',
      years: 'Public Service'
    },
    {
      icon: <GraduationCap className="text-primary" size={24} />,
      title: 'MBA + Top Consulting',
      description: 'Strategic leadership expertise',
      years: 'Business World'
    },
    {
      icon: <Heart className="text-primary" size={24} />,
      title: 'Father of Five',
      description: 'Leading where it matters most',
      years: 'Real Life'
    }
  ];

  const principles = [
    {
      icon: <Target className="text-primary" />,
      title: 'Discipline Over Motivation',
      description: 'Systems that work when feelings fail.',
    },
    {
      icon: <Users className="text-primary" />,
      title: 'Community Over Isolation',
      description: 'Men challenging each other to be better.',
    },
    {
      icon: <Zap className="text-primary" />,
      title: 'Action Over Theory',
      description: 'Real results in the real world.',
    },
  ];

  return (
    <div className="pt-20">
      <MetaTags
        title="About Us | The AM Project - Our Mission and Values"
        description="Learn about The AM Project's mission - a men's development app helping men build strength, integrity, and purpose through practical guidance and community support."
        image="/images/mountain-climbers.jpg"
      />
      <CanonicalLink path="/about" />
      <WebPageStructuredData
        url="https://theamproject.com/about"
        name="About Us | The AM Project - Our Mission and Values"
        description="Learn about The AM Project's mission - a men's development app helping men build strength, integrity, and purpose through practical guidance and community support."
        image="/images/mountain-climbers.jpg"
        dateModified="2025-05-16"
      />
      {/* Hero Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-12 md:items-start items-center">
            <div className="md:w-1/2">
              <div className="relative">
                <img 
                  src="/founder-web.jpg" 
                  alt="Daniel Valdez - Founder of The AM Project" 
                  className="rounded-lg shadow-xl w-full h-auto border border-primary/20" 
                  loading="eager"
                  decoding="async"
                  width="600"
                  height="900"
                />
              </div>
            </div>
            
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">About The AM Project</h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Founded by a veteran, firefighter, business strategist, and father of five who believes strong men build strong families—and strong families build a better world.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {timeline.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-secondary rounded-lg border border-primary/10">
                    <div className="flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-lg font-medium text-center md:text-left">
                This is where experience meets mission. Welcome to The AM Project.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Now Section */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Now?</h2>
            <div className="w-20 h-1 bg-primary mx-auto"></div>
          </div>
          
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl mb-8 text-muted-foreground">
              Society throws conflicting messages at men. Chase success but stay humble. Be strong but not too hard. Lead but follow trends.
            </p>
            <p className="text-2xl font-bold mb-8">
              In that confusion, too many men lose their direction.
            </p>
            <p className="text-lg text-muted-foreground">
              Disconnected from purpose, health, and the people who matter most. The AM Project exists to change that—not with empty motivation, but with real systems that work.
            </p>
          </div>
        </div>
      </section>

      {/* Daniel's Journey */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Man Behind the Mission</h2>
            <div className="w-20 h-1 bg-primary mx-auto"></div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
              <div>
                <h3 className="text-2xl font-bold mb-4">Daniel Valdez</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  From chaos to clarity. Daniel grew up surrounded by hardship and chose a different path—one defined by service, discipline, and purpose.
                </p>
                <p className="text-lg text-muted-foreground">
                  Military service taught him leadership under pressure. Firefighting showed him courage in crisis. Business strategy developed his systems thinking. But fatherhood? That's where everything came together.
                </p>
              </div>
              <div className="bg-secondary p-6 rounded-xl">
                <blockquote className="text-xl italic text-center">
                  "Being a man today isn't about status or appearance—it's about discipline, integrity, and becoming the man your family and community can count on."
                </blockquote>
                <p className="text-center mt-4 font-semibold">— Daniel Valdez</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* What We're Building */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What We're Building Together</h2>
            <div className="w-20 h-1 bg-primary mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {principles.map((principle, index) => (
              <Card key={index} className="p-8 rounded-xl border border-primary/20 text-center">
                <div className="text-primary text-3xl mb-4 flex justify-center">{principle.icon}</div>
                <h3 className="text-xl font-bold mb-4">{principle.title}</h3>
                <p className="text-muted-foreground">{principle.description}</p>
              </Card>
            ))}
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-6">Join the Movement</h3>
            <p className="text-lg text-muted-foreground mb-8">
              We're just getting started, but the foundation is solid. This isn't about perfect men—it's about men committed to getting better. Men who understand that strength comes from discipline, purpose drives direction, and community accelerates growth.
            </p>
            <p className="text-xl font-semibold mb-8">
              The world needs more men willing to lead by example. Welcome to The AM Project.
            </p>
          </div>
          
          <NewsletterCTA />
        </div>
      </section>
      
      {showExitModal && (
        <ExitIntentModal 
          isOpen={showExitModal}
          onClose={() => setShowExitModal(false)}
          currentPage="about"
          timeOnPage={getTimeOnPage()}
          scrollDepth={getScrollDepth()}
        />
      )}
    </div>
  );
};

export default About;
