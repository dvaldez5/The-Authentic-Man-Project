import { useState } from 'react';
import NewsletterCTA from '@/components/NewsletterCTA';
import MetaTags from '@/components/MetaTags';
import { useExitIntent } from '@/hooks/use-exit-intent';
import { useAnalytics } from '@/hooks/use-analytics';
import ExitIntentModal from '@/components/ExitIntentModal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// AM Standards overview data
const amStandards = [
  {
    id: "self",
    title: "Self",
    icon: "circle-info",
    summary: "Master your body and mind. Build confidence through action and seek discomfort on purpose.",
    keyPoints: ["Physical training", "Mental discipline", "Confidence building"]
  },
  {
    id: "family",
    title: "Family", 
    icon: "briefcase",
    summary: "Be the protector and provider. Lead through vulnerability and emotional presence.",
    keyPoints: ["Protection", "Provision", "Leadership"]
  },
  {
    id: "partner",
    title: "Partner",
    icon: "circles",
    summary: "Create true partnership based on shared values. Be steady, open, and fully present.",
    keyPoints: ["Partnership", "Presence", "Intimacy"]
  },
  {
    id: "friends",
    title: "Friends",
    icon: "users",
    summary: "Challenge and encourage those around you. Be the steady presence who shows up.",
    keyPoints: ["Accountability", "Loyalty", "Leadership"]
  },
  {
    id: "community",
    title: "Community & Society",
    icon: "check-circle",
    summary: "Live with integrity. Be a contributor, not a complainer. Honor the past, evolve for the future.",
    keyPoints: ["Integrity", "Contribution", "Evolution"]
  },
  {
    id: "financial",
    title: "Financial Stewardship",
    icon: "target",
    summary: "Be a provider now and later. Use money as a tool for freedom, security, and legacy.",
    keyPoints: ["Ethical earning", "Wise spending", "Legacy building"]
  },
  {
    id: "purpose",
    title: "Purpose & Spiritual Grounding",
    icon: "handshake",
    summary: "Live for something bigger than yourself. Practice stillness and seek honest answers.",
    keyPoints: ["Greater purpose", "Reflection", "Spiritual growth"]
  },
  {
    id: "play",
    title: "Play & Creative Expression",
    icon: "sparkles",
    summary: "Find joy in challenge. Make space for adventure, creativity, and experiences that matter.",
    keyPoints: ["Joy", "Adventure", "Creativity"]
  },
  {
    id: "learning",
    title: "Continuous Learning & Humility",
    icon: "book",
    summary: "Stay a student of life. Keep ego down and standards high.",
    keyPoints: ["Growth mindset", "Humility", "Continuous improvement"]
  }
];

const AMStandard = () => {
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
  
  // Smooth scroll to detailed section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`detailed-${sectionId}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };
  
  return (
    <div className="pt-20">
      <MetaTags
        title="The AM Standard | The AM Project"
        description="Redefining what it means to be a man—honoring timeless strengths while evolving with the times."
        image="/images/mountain-climbers.jpg"
      />
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">The AM Standard</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-center">
              Redefining what it means to be a man—honoring timeless strengths while evolving with the times.
            </p>
            <div className="w-20 h-1 bg-primary mx-auto mt-6"></div>
          </div>
          
          {/* Hero Image */}
          <div className="mb-16">
            <div className="flex flex-col md:flex-row gap-12 items-start mb-10">
              <div className="w-full">
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full z-0"></div>
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary/20 rounded-full z-0"></div>
                  <img 
                    src="/images/mountain-climbers.jpg" 
                    alt="Men ascending a mountain - demonstrating strength, courage and determination" 
                    className="rounded-lg w-full shadow-xl relative z-10 border border-primary/20" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-16 text-lg">
            <p className="mb-6 text-xl font-medium">
              In a world full of noise about what men should or shouldn't be, the strongest men lead themselves first.
            </p>
            <p className="mb-6">
              The AM Standard isn't a trend or performance. It's strength, discipline, courage, and purpose—evolved for today's world.
            </p>
            <p className="mb-10 font-bold text-xl text-center">
              These are the standards we live by. Every day. In every area of life.
            </p>
          </div>
          
          {/* Unified Standards Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">The 9 Standards</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Each standard defines how strong men show up. Click to explore the detailed principles and practices.
              </p>
            </div>
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              {amStandards.map((standard) => (
                <AccordionItem key={standard.id} value={standard.id} className="rounded-xl shadow-lg border border-border">
                  <AccordionTrigger className="text-left p-6 hover:no-underline">
                    <div className="flex items-start w-full">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-xl font-bold mb-2">{standard.title}</h3>
                        <p className="text-sm text-muted-foreground font-normal leading-relaxed">
                          {standard.summary}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {standard.keyPoints.map((point, index) => (
                            <span 
                              key={index}
                              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium"
                            >
                              {point}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-6 pt-0">
                    {standard.id === 'self' && (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          <span className="font-bold">Master Your Body.</span> Train hard. Stand tall. Your physical presence reflects your inner discipline.
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-bold">Earn Your Confidence.</span> Do hard things. Keep promises to yourself. Confidence is built, not found.
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-bold">Seek Discomfort.</span> Growth lives beyond your comfort zone. Choose challenge over ease.
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-bold">Control Your Desires.</span> Master food, alcohol, and pleasure. Freedom comes from discipline, not excess.
                        </p>
                        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mt-6">
                          "A man's relationship with anything is healthy when he controls it. It becomes a problem when it controls him."
                        </blockquote>
                      </div>
                    )}
                    {standard.id === 'family' && (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          <span className="font-bold text-foreground">Protect and Provide.</span> Your presence brings safety. You provide time, leadership, and emotional security. No task is beneath you.
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-bold text-foreground">Lead Through Vulnerability.</span> Master your emotions, don't suppress them. Model resilience and strength under control.
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-bold text-foreground">Show Up Completely.</span> Be fully present—physically, emotionally, mentally. Your consistency builds trust and security.
                        </p>
                      </div>
                    )}
                    {standard.id === 'partner' && (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          <span className="font-bold text-foreground">Be Steady and Open.</span> Bring calm to chaos. Stay honest about fears and hopes.
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-bold text-foreground">Build True Partnership.</span> Reject old scripts. Create a relationship based on shared values, not gender roles.
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-bold text-foreground">Rise Together.</span> Support their ambitions. Don't compete—elevate each other.
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-bold text-foreground">Show Up in Intimacy.</span> Be present physically, emotionally, mentally. Engage openly and honestly. Build trust through respect and connection.
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-bold text-foreground">Choose Connection Over Escape.</span> Direct your desire toward real experiences that strengthen intimacy, not hollow distractions.
                        </p>
                      </div>
                    )}
                    {standard.id === 'friends' && (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          <span className="font-bold text-foreground">Challenge and Encourage.</span> Push others to greatness. Hold them accountable and celebrate their wins.
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-bold text-foreground">Show Up When It Matters.</span> Be the one who appears without being asked.
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-bold text-foreground">Lead by Example.</span> Your discipline speaks louder than words.
                        </p>
                      </div>
                    )}
                    {standard.id === 'community' && (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          <span className="font-bold text-foreground">Live with Integrity.</span> Align words and actions—even when inconvenient.
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-bold text-foreground">Contribute, Don't Complain.</span> Change the world by taking responsibility for your corner of it.
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-bold text-foreground">Honor Past, Evolve Forward.</span> Stay rooted in timeless virtues while embracing modern progress.
                        </p>
                      </div>
                    )}
                    {standard.id === 'financial' && (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          <span className="font-bold">Provide and Build Legacy.</span> Money is a tool for freedom, security, and future generations. Earn ethically, spend wisely.
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-bold">Avoid Excess Trap.</span> Don't confuse materialism with success. Measure wealth by mission, not ego.
                        </p>
                      </div>
                    )}
                    {standard.id === 'purpose' && (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          <span className="font-bold">Serve Something Bigger.</span> Find clarity in purpose beyond personal comfort—whether faith, family, or mission.
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-bold">Practice Stillness.</span> In a loud world, discipline yourself to quiet reflection. Ask hard questions.
                        </p>
                      </div>
                    )}
                    {standard.id === 'play' && (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          <span className="font-bold">Find Joy in Challenge.</span> Strength is built in struggle and revealed in joy. Make space for adventure and creativity.
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-bold">Keep the Fire Alive.</span> Art, building, exploring, creating—play is critical to a life well lived.
                        </p>
                      </div>
                    )}
                    {standard.id === 'learning' && (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          <span className="font-bold">Stay a Student.</span> Remain open to growth. Hold strong beliefs but change them when truth demands it.
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-bold">Ego Down, Standards High.</span> Your presence, character, and consistency speak louder than words.
                        </p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          <div className="text-center mt-8 mb-16">
            <p className="text-xl font-bold mb-8">
              The AM Standard isn't just talked about. It's lived. Every day. In every area of life.
            </p>
            <NewsletterCTA />
          </div>
        </div>
      </section>
      
      {showExitModal && (
        <ExitIntentModal 
          isOpen={showExitModal}
          onClose={() => setShowExitModal(false)}
          currentPage="am-standard"
          timeOnPage={getTimeOnPage()}
          scrollDepth={getScrollDepth()}
        />
      )}
    </div>
  );
};

export default AMStandard;
