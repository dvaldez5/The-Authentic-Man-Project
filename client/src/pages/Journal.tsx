import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { usePWADetection } from "@/hooks/use-pwa-detection";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { getTopPadding } from "@/utils/responsive-styles";
import {
  MessageCircle,
  Plus,
  Pin,
  PinOff,
  Calendar,
  BookOpen,
  Target,
  Users,
  Lightbulb,
  Heart,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { JournalPrompt } from "@/components/JournalPrompt";
import { LessonReflectionForm } from "@/components/LessonReflectionForm";
import { ScenarioReflectionForm } from "@/components/scenarios/ScenarioReflectionForm";
import { InteractiveAIReflection } from "@/components/InteractiveAIReflection";


interface AIReflection {
  questions: string[];
  affirmation: string;
  insight: string;
}

interface JournalEntry {
  id: number;
  content?: string;
  text?: string;
  aiReflection: AIReflection | null;
  aiResponseThreads?: { questionIndex: number; userResponse: string; aiFollowUp?: string }[];
  pinned: boolean;
  lessonId: number | null;
  challengeId: number | null;
  scenarioId: number | null;
  createdAt: string;
}

export default function Journal() {
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isPWA } = usePWADetection();
  const { isMobile } = useMobileDetection();

  // Extract prompt and metadata from URL parameters for reflections
  const [prePopulatedPrompt, setPrePopulatedPrompt] = useState("");
  const [scenarioMetadata, setScenarioMetadata] = useState<{
    scenarioId?: string;
    selectedOptionIndex?: string;
    lessonId?: string;
    lessonTitle?: string;
  } | null>(null);

  const { data: allEntries = [], isLoading, error } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal'],
    enabled: !!user
  });

  // Sort entries: Personal entries first, then lesson reflections
  const entries = allEntries.sort((a, b) => {
    // Personal entries (no lessonId) come first
    if (!a.lessonId && b.lessonId) return -1;
    if (a.lessonId && !b.lessonId) return 1;
    // Within same type, sort by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Debug logging for PWA issues
  useEffect(() => {
    console.log('Journal Component Debug:', {
      user: !!user,
      isPWA,
      entriesCount: entries.length,
      isLoading,
      error: error?.message,
      userAgent: navigator.userAgent.substring(0, 50)
    });
  }, [user, isPWA, entries.length, isLoading, error]);

  // Handle reflection URLs (scenarios, lessons, challenges)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      console.log('Parsing journal URL params:', window.location.search);
      
      // Extract scenario and lesson metadata
      const scenarioId = urlParams.get('scenarioId');
      const selectedOptionIndex = urlParams.get('selectedOptionIndex');
      const lessonId = urlParams.get('lessonId');
      const lessonTitle = urlParams.get('lessonTitle');
      
      // If we have scenario or lesson data, auto-expand the entry form
      if ((scenarioId && selectedOptionIndex) || (lessonId && lessonTitle)) {
        setShowNewEntry(true);
        
        // Scroll to the add entry section after a short delay
        setTimeout(() => {
          const addEntryElement = document.querySelector('[data-scroll-target="add-entry"]');
          if (addEntryElement) {
            addEntryElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start'
            });
          }
        }, 300);
      }
      
      const prompt = urlParams.get('prompt');
      
      console.log('Extracted params:', { 
        prompt: prompt?.slice(0, 100), 
        scenarioId, 
        selectedOptionIndex,
        lessonId, 
        lessonTitle 
      });
      
      if (prompt && prompt.trim() && lessonId && lessonTitle) {
        // For lesson reflections, use structured form instead of basic prompt
        setPrePopulatedPrompt(prompt);
      } else if (prompt && prompt.trim()) {
        // For other prompts (scenarios, challenges), use basic prompt
        setPrePopulatedPrompt(prompt);
      }
      
      if (scenarioId || selectedOptionIndex || lessonId) {
        setScenarioMetadata({ 
          scenarioId: scenarioId || undefined, 
          selectedOptionIndex: selectedOptionIndex || undefined,
          lessonId: lessonId || undefined,
          lessonTitle: lessonTitle || undefined
        });
      }
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
      // Clear the URL to prevent further errors
      window.history.replaceState({}, '', '/journal');
    }
  }, []);

  const pinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: number; pinned: boolean }) => {
      const endpoint = pinned ? `/api/journal/${id}/unpin` : `/api/journal/${id}/pin`;
      await apiRequest('POST', endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
    }
  });

  const handlePin = (id: number, currentlyPinned: boolean) => {
    pinMutation.mutate({ id, pinned: currentlyPinned });
  };

  const getEntryIcon = (entry: JournalEntry) => {
    if (entry.lessonId) return <BookOpen className="h-4 w-4 text-primary" />;
    if (entry.challengeId) return <Target className="h-4 w-4 text-primary" />;
    if (entry.scenarioId) return <Users className="h-4 w-4 text-primary" />;
    return <MessageCircle className="h-4 w-4 text-primary" />;
  };

  const getEntryType = (entry: JournalEntry) => {
    if (entry.lessonId) return "Lesson Reflection";
    if (entry.challengeId) return "Challenge Entry";
    if (entry.scenarioId) return "Scenario Response";
    return "Personal Entry";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="challenge-header text-4xl md:text-6xl">Journal</h1>
          <p className="challenge-body text-lg text-muted-foreground">
            Loading your reflections...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className={`container mx-auto px-4 ${getTopPadding(isPWA, isMobile, 'main')} pb-8 space-y-8`}>
      {/* Header */}
      <div className="text-center space-y-4" data-tour="journal-header">
        <h1 className="challenge-header text-4xl md:text-6xl" data-tour="journal-title">Your Journal</h1>
        <p className="challenge-body text-lg text-muted-foreground max-w-2xl mx-auto">
          A space for reflection, insights, and personal development guided by AI-powered wisdom.
        </p>
      </div>

      {/* Why Journaling Transforms Your Growth */}
      <Card className="challenge-card w-full max-w-4xl mx-auto border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="h-6 w-6 text-primary" />
            <h2 className="challenge-header text-2xl">Why Journaling Transforms Your Growth</h2>
          </div>
          
          <div className="grid gap-6">
            <div className="flex gap-4">
              <div className="w-8 h-16 rounded-full bg-primary/20 flex flex-col items-center justify-start pt-2 flex-shrink-0">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Process Experiences</h3>
                <p className="challenge-body leading-relaxed">
                  Transform daily events into meaningful insights through structured reflection.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-16 rounded-full bg-primary/20 flex flex-col items-center justify-start pt-2 flex-shrink-0">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Track Progress</h3>
                <p className="challenge-body leading-relaxed">
                  Document your journey and celebrate growth milestones along the way.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-16 rounded-full bg-primary/20 flex flex-col items-center justify-start pt-2 flex-shrink-0">
                <Heart className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Build Self-Awareness</h3>
                <p className="challenge-body leading-relaxed">
                  Develop deeper understanding of your patterns, triggers, and strengths.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-16 rounded-full bg-primary/20 flex flex-col items-center justify-start pt-2 flex-shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AI-Guided Reflection</h3>
                <p className="challenge-body leading-relaxed">
                  Receive personalized insights and thought-provoking questions from AM.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Use Your Journal Effectively */}
      <Card className="border-gray-700 bg-transparent w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="challenge-header text-2xl">How to Use Your Journal Effectively</h2>
          </div>
          
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex flex-col items-center mb-4">
                <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Daily Reflection</h3>
              <p className="challenge-body leading-relaxed">
                Write about your experiences, challenges, and victories. Be honest and detailed.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex flex-col items-center mb-4">
                <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">AI Insights</h3>
              <p className="challenge-body leading-relaxed">
                Receive personalized reflections, affirmations, and questions to deepen your understanding.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex flex-col items-center mb-4">
                <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Review & Growth</h3>
              <p className="challenge-body leading-relaxed">
                Pin important entries and review them regularly to track your personal evolution.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Types of Journal Entries */}
      <Card className="border-gray-700 bg-transparent w-full max-w-4xl mx-auto" data-tour="entry-types">
        <CardContent className="p-6">
          <h2 className="challenge-header text-2xl mb-6">Types of Journal Entries</h2>
          
          <div className="grid gap-4">
            <Card className="bg-card border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Lesson Reflections</h3>
                    <p className="challenge-body text-sm">Auto-generated from course completions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Challenge Entries</h3>
                    <p className="challenge-body text-sm">Document your challenge experiences</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Scenario Responses</h3>
                    <p className="challenge-body text-sm">Reflect on social scenarios</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Personal Entries</h3>
                    <p className="challenge-body text-sm">Your daily thoughts and reflections</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Add New Entry Section */}
      <Card className="challenge-card w-full max-w-4xl mx-auto border-gray-700" data-scroll-target="add-entry">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="challenge-header text-2xl">Add New Entry</h2>
            <Button 
              onClick={() => {
                if (showNewEntry) {
                  // Reset all state when canceling
                  setPrePopulatedPrompt('');
                  setScenarioMetadata(null);
                  setShowNewEntry(false);
                  // Clear URL parameters
                  window.history.replaceState({}, '', '/journal');
                } else {
                  setShowNewEntry(true);
                }
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-tour="new-entry-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showNewEntry ? 'Cancel' : 'New Entry'}
            </Button>
          </div>
          

          
          {showNewEntry && (
            <div className="mt-4">
              {scenarioMetadata?.lessonId && scenarioMetadata?.lessonTitle ? (
                <LessonReflectionForm
                  lessonContent={prePopulatedPrompt?.split('What stood out to you?')[0] || ''}
                  lessonTitle={scenarioMetadata.lessonTitle}
                  lessonId={scenarioMetadata.lessonId}
                  onComplete={() => {
                    queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
                    setShowNewEntry(false);
                    setPrePopulatedPrompt('');
                    setScenarioMetadata(null);
                    // Clear URL parameters
                    window.history.replaceState({}, '', '/journal');
                  }}
                  onCancel={() => {
                    // Reset to normal journal entry and close form
                    setPrePopulatedPrompt('');
                    setScenarioMetadata(null);
                    setShowNewEntry(false);
                    // Clear URL parameters
                    window.history.replaceState({}, '', '/journal');
                  }}
                />
              ) : scenarioMetadata?.scenarioId && scenarioMetadata?.selectedOptionIndex !== undefined ? (
                <ScenarioReflectionForm
                  scenarioMetadata={{
                    scenarioId: scenarioMetadata.scenarioId!,
                    selectedOptionIndex: scenarioMetadata.selectedOptionIndex!
                  }}
                  onComplete={() => {
                    queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
                    setShowNewEntry(false);
                    setPrePopulatedPrompt('');
                    setScenarioMetadata(null);
                    // Clear URL parameters
                    window.history.replaceState({}, '', '/journal');
                  }}
                  onCancel={() => {
                    // Reset to normal journal entry and close form
                    setPrePopulatedPrompt('');
                    setScenarioMetadata(null);
                    setShowNewEntry(false);
                    // Clear URL parameters
                    window.history.replaceState({}, '', '/journal');
                  }}
                />
              ) : (
                <JournalPrompt 
                  initialPrompt={prePopulatedPrompt}
                  scenarioMetadata={scenarioMetadata}
                  onComplete={() => {
                    queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
                    setShowNewEntry(false);
                  }}
                />
              )}
            </div>
          )}
          
          {!showNewEntry && (
            <p className="challenge-body text-muted-foreground">
              Click "New Entry" to start reflecting on your experiences and receive AI-guided insights.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Journal Entries */}
      <div className="w-full max-w-4xl mx-auto space-y-6" data-tour="journal-entries">
        <div className="flex items-center justify-between">
          <h2 className="challenge-header text-2xl">Your Entries</h2>
          <Link to="/journal/pinned">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Pin className="h-4 w-4 mr-2" />
              View Pinned
            </Button>
          </Link>
        </div>

        {entries.length === 0 ? (
          <Card className="challenge-card border-gray-700" data-scroll-target="add-entry">
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="challenge-header text-xl mb-2">Start Your Journey</h3>
              <p className="challenge-body mb-6">
                Your journal is empty. Begin by writing your first reflection above.
              </p>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} data-entry-id={entry.id} className="border-gray-700 bg-transparent">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getEntryIcon(entry)}
                    <div>
                      <Badge variant="secondary" className="text-white text-xs" style={{ backgroundColor: '#1A1A1A' }}>
                        {getEntryType(entry)}
                      </Badge>
                      <p className="challenge-body text-sm mt-1">
                        {format(new Date(entry.createdAt), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePin(entry.id, entry.pinned)}
                      className="text-muted-foreground hover:text-[#C47F00]"
                    >
                      {entry.pinned ? (
                        <PinOff className="h-4 w-4" />
                      ) : (
                        <Pin className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                      className="text-muted-foreground hover:text-[#C47F00]"
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${
                        expandedEntry === entry.id ? 'rotate-180' : ''
                      }`} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="prose prose-invert max-w-none">
                    <div className="challenge-body leading-relaxed whitespace-pre-wrap">
                      {entry.lessonId || entry.scenarioId ? (
                        // Format structured reflection content properly for both lessons and scenarios
                        entry.content?.split('\n').map((line, index) => {
                          if (line.startsWith('**') && line.endsWith('**')) {
                            // Handle markdown bold headers for scenario reflections
                            const headerText = line.replace(/\*\*/g, '');
                            return <div key={index} className="font-semibold text-[#C47F00] mt-4 mb-2 text-lg">{headerText}</div>;
                          } else if (line.startsWith('Personal Reflection:') || line.startsWith('Key Insights:') || line.startsWith('Action Steps:') || line.startsWith('The Situation') || line.startsWith('My Choice') || line.startsWith('Choice Feedback')) {
                            return <div key={index} className="font-semibold text-[#C47F00] mt-4 mb-2 text-lg">{line}</div>;
                          } else if (line.match(/^\d+\. /)) {
                            return <div key={index} className="ml-4 mb-1 text-white text-base">{line}</div>;
                          } else if (line.trim()) {
                            // Handle markdown formatting for bold text
                            const processedLine = line
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>');
                            
                            if (processedLine !== line) {
                              return <div key={index} className="mb-2 text-white text-base" dangerouslySetInnerHTML={{ __html: processedLine }} />;
                            }
                            return <div key={index} className="mb-2 text-white text-base">{line}</div>;
                          }
                          return <div key={index} className="mb-1"></div>;
                        })
                      ) : (
                        // Regular personal entry with basic markdown processing
                        <div className="text-white">
                          {(entry.content || entry.text || '').split('\n').map((line, index) => {
                            const processedLine = line
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>');
                            
                            if (processedLine !== line) {
                              return <div key={index} className="mb-2 text-base" dangerouslySetInnerHTML={{ __html: processedLine }} />;
                            }
                            return <div key={index} className="mb-2 text-base">{line}</div>;
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {expandedEntry === entry.id && entry.aiReflection && (
                    <InteractiveAIReflection
                      entryId={entry.id}
                      aiReflection={entry.aiReflection}
                      responseThreads={(entry as any).aiResponseThreads || []}
                      className="mt-4"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

        {/* Footer Message */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="challenge-body text-muted-foreground italic">
            "Growth happens when reflection meets action."
          </p>
        </div>
      </div>
    </div>
  );
}