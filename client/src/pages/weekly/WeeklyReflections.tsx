import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { 
  Pin, 
  PinOff, 
  Calendar, 
  Lightbulb, 
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Target,
  TrendingUp,
  MessageCircle,
  Heart
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import WeeklyReflectionCard from '@/components/weekly/WeeklyReflectionCard';
import AmReflectionBlock from '@/components/weekly/AmReflectionBlock';
import { useToast } from '@/hooks/use-toast';
import { usePWADetection } from '@/hooks/use-pwa-detection';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { getTopPadding } from '@/utils/responsive-styles';
import { GOAL_CATEGORIES } from '@/lib/visualization-prompts';

interface WeeklyReflection {
  id: number;
  userId: number;
  weekStartDate: string;
  weekEndDate: string;
  reflection: string;
  emoji: string;
  pinned: boolean;
  lessonsCompleted: number[];
  challengesCompleted: number[];
  milestonesUnlocked: string[];
  weeklyGoals?: {goal: string, category: string}[];
  goalVisualizations?: string[];
  goalCompletions?: boolean[];
  amSummary?: string;
  createdAt: string;
}

export default function WeeklyReflections() {
  const { user } = useAuth();
  const { isPWA } = usePWADetection();
  const { isMobile } = useMobileDetection();
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
  const [expandedAmFeedback, setExpandedAmFeedback] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const paddingClass = getTopPadding(isPWA, isMobile, 'main');

  // Format AI feedback with icons like journal entries
  const formatAiFeedback = (feedback: string) => {
    const lines = feedback.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;
      
      // Determine icon based on content
      let icon = <MessageCircle className="h-4 w-4 text-[#C47F00] flex-shrink-0 mt-0.5" />;
      if (trimmedLine.toLowerCase().includes('insight') || trimmedLine.toLowerCase().includes('understand')) {
        icon = <Lightbulb className="h-4 w-4 text-[#C47F00] flex-shrink-0 mt-0.5" />;
      } else if (trimmedLine.toLowerCase().includes('strength') || trimmedLine.toLowerCase().includes('growth')) {
        icon = <Heart className="h-4 w-4 text-[#C47F00] flex-shrink-0 mt-0.5" />;
      }
      
      return (
        <div key={index} className="flex items-start gap-3 text-sm">
          {icon}
          <span className="text-gray-300 leading-relaxed">{trimmedLine}</span>
        </div>
      );
    }).filter(Boolean);
  };

  // Mock data for demonstration purposes
  const mockData = {
    lessons: [
      { id: 1, title: "Building Mental Resilience" },
      { id: 2, title: "Emotional Intelligence Foundations" },
      { id: 3, title: "Leadership Under Pressure" }
    ],
    challenges: [
      { id: 1, title: "Morning Routine Consistency" },
      { id: 2, title: "Deep Work Sessions" },
      { id: 3, title: "Gratitude Practice" },
      { id: 4, title: "Physical Exercise" },
      { id: 5, title: "Quality Sleep Schedule" }
    ],
    milestones: [
      "Learning Momentum - 3+ lessons completed",
      "Challenge Champion - 5+ challenges completed",
      "Balanced Growth - Both learning and challenges"
    ]
  };

  const { data: reflections = [], isLoading } = useQuery<WeeklyReflection[]>({
    queryKey: ['/api/weekly-reflections'],
    enabled: !!user,
  });

  const { data: promptCheck } = useQuery<{
    shouldShow: boolean;
    windowType: 'optimal' | 'grace' | 'closed';
    reflectionWindow: string;
    currentDay: string;
    message?: string;
  }>({
    queryKey: ['/api/weekly-reflections/prompt-check'],
    enabled: !!user,
  });

  // Check if current week already has a reflection
  const getCurrentWeekDates = () => {
    const now = new Date();
    // Adjust for timezone consistency with server (EST adjustment)
    const localTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
    // Monday-Sunday week structure for reflections
    const startOfWeek = new Date(localTime);
    startOfWeek.setDate(localTime.getDate() - localTime.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    endOfWeek.setHours(23, 59, 59, 999);
    
    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    };
  };

  const currentWeek = getCurrentWeekDates();
  const hasCurrentWeekReflection = reflections.some(r => 
    r.weekStartDate === currentWeek.start && r.weekEndDate === currentWeek.end
  );

  const currentWeekReflection = reflections.find(r => 
    r.weekStartDate === currentWeek.start && r.weekEndDate === currentWeek.end
  );

  const submitReflectionMutation = useMutation({
    mutationFn: async (reflectionData: { reflection: string; emoji: string; pinned: boolean }) => {
      console.log('submitReflectionMutation: Starting submission');
      console.log('Reflection data received:', reflectionData);
      
      const now = new Date();
      // Adjust for timezone consistency with server
      const localTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
      // Monday-Sunday week structure
      const startOfWeek = new Date(localTime);
      startOfWeek.setDate(localTime.getDate() - localTime.getDay() + 1); // Monday
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
      endOfWeek.setHours(23, 59, 59, 999);

      const payload = {
        ...reflectionData,
        weekStartDate: startOfWeek.toISOString().split('T')[0],
        weekEndDate: endOfWeek.toISOString().split('T')[0],
      };

      console.log('API payload:', payload);

      try {
        const result = await apiRequest('POST', '/api/weekly-reflections', payload);
        console.log('API response:', result);
        return result;
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('submitReflectionMutation: Success', data);
      queryClient.invalidateQueries({ queryKey: ['/api/weekly-reflections'] });
      toast({
        title: "Reflection saved",
        description: "Your weekly reflection has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('submitReflectionMutation: Error', error);
      toast({
        title: "Error",
        description: "Failed to save reflection. Please try again.",
        variant: "destructive",
      });
    },
  });

  const pinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: number; pinned: boolean }) => {
      const endpoint = pinned ? `/api/weekly-reflections/${id}/unpin` : `/api/weekly-reflections/${id}/pin`;
      await apiRequest('POST', endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/weekly-reflections'] });
    }
  });

  const handlePin = (id: number, currentlyPinned: boolean) => {
    pinMutation.mutate({ id, pinned: currentlyPinned });
  };

  // Sort reflections with pinned ones first, then by date descending
  const sortedReflections = [...reflections].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center my-10">Loading reflections...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className={`container mx-auto px-4 ${paddingClass} pb-8 space-y-8`}>
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 data-tour="weekly-reflections-title" className="challenge-header text-4xl md:text-6xl">Weekly Reflections</h1>
          <p className="challenge-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Every 7 days, pause to look back before moving forward. Your weekly moment of honesty, clarity, and accountability.
          </p>
        </div>

        {/* How to Use Weekly Reflections */}
        <Card className="bg-[#1A1A1A] border-[#C47F00]/20 w-full max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-6 w-6 text-[#C47F00]" />
              <h2 className="challenge-header text-2xl text-white">How to Use Weekly Reflections</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex flex-col items-center mb-4">
                  <div className="w-12 h-12 bg-[#C47F00]/20 rounded-full flex items-center justify-center text-[#C47F00] font-bold text-lg">
                    1
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Weekly Pause</h3>
                <p className="challenge-body leading-relaxed text-neutral-300">
                  Reflect on your growth, challenges, and victories from the past week.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex flex-col items-center mb-4">
                  <div className="w-12 h-12 bg-[#C47F00]/20 rounded-full flex items-center justify-center text-[#C47F00] font-bold text-lg">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Honest Assessment</h3>
                <p className="challenge-body leading-relaxed text-neutral-300">
                  Be truthful about your progress, setbacks, and learnings.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex flex-col items-center mb-4">
                  <div className="w-12 h-12 bg-[#C47F00]/20 rounded-full flex items-center justify-center text-[#C47F00] font-bold text-lg">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">AM Insight</h3>
                <p className="challenge-body leading-relaxed text-neutral-300">
                  Receive personalized insights to guide your continued growth.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create New Reflection Card */}
        <div data-tour="reflection-prompt">
          <WeeklyReflectionCard 
            data={{
              ...mockData,
              weeklyGoalsCount: currentWeekReflection?.weeklyGoals?.length || 0
            }}
            onSubmit={(reflectionData) => submitReflectionMutation.mutate(reflectionData)}
            isSubmitting={submitReflectionMutation.isPending}
            isCompleted={hasCurrentWeekReflection}
            windowType={promptCheck?.windowType || 'optimal'}
          />
        </div>

        {/* AM Project Principle */}
        <div className="bg-[#1A1A1A] border-[#C47F00]/20 rounded-lg p-6 mb-8 text-center">
          <blockquote>
            <p className="text-xl font-serif font-bold text-[#C47F00] mb-2">
              "The man who looks back, moves forward."
            </p>
            <footer className="text-sm text-muted-foreground font-sans">
              — The AM Project Principle
            </footer>
          </blockquote>
        </div>

        {/* Weekly Reflections */}
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="challenge-header text-2xl">Your Weekly Reflections</h2>
            <Badge variant="outline" className="border-primary text-primary bg-transparent font-sans">
              <Calendar className="h-4 w-4 mr-2" />
              {reflections.length} {reflections.length === 1 ? 'Week' : 'Weeks'}
            </Badge>
          </div>

          {sortedReflections.length === 0 ? (
            <Card className="bg-[#1A1A1A] border-gray-700">
              <CardContent className="p-8 text-center">
                <div className="mb-4">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                </div>
                <h3 className="text-lg font-serif font-bold mb-3 text-foreground">No reflections yet</h3>
                <blockquote className="text-sm text-muted-foreground font-sans italic mb-3">
                  "Real progress isn't a streak—it's a story."
                </blockquote>
                <footer className="text-xs text-muted-foreground font-sans">
                  — The AM Project
                </footer>
              </CardContent>
            </Card>
          ) : (
            sortedReflections.map((reflection) => (
              <Card 
                key={reflection.id} 
                className={`bg-[#1A1A1A] transition-all duration-200 ${reflection.pinned ? 'border-primary bg-primary/5' : 'border-gray-700 hover:border-primary/50'}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="border-primary text-primary bg-transparent font-sans text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          Week of {format(new Date(reflection.weekStartDate), 'MMM d')} – {format(new Date(reflection.weekEndDate), 'MMM d, yyyy')}
                        </Badge>
                        {reflection.emoji && (
                          <span className="text-lg">{reflection.emoji}</span>
                        )}
                        {reflection.pinned && (
                          <Badge variant="secondary" className="text-xs bg-primary text-primary-foreground font-sans">
                            <Pin className="h-3 w-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePin(reflection.id, reflection.pinned)}
                        disabled={pinMutation.isPending}
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        {reflection.pinned ? (
                          <PinOff className="h-4 w-4" />
                        ) : (
                          <Pin className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedEntry(
                          expandedEntry === reflection.id ? null : reflection.id
                        )}
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <ChevronDown 
                          className={`h-4 w-4 transition-transform ${
                            expandedEntry === reflection.id ? 'rotate-180' : ''
                          }`} 
                        />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-4 rounded-lg">
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-[#C47F00]" />
                        Your Weekly Reflection
                      </h4>
                      <p className="text-gray-300 leading-relaxed mb-4">{reflection.reflection}</p>
                      
                      {reflection.amSummary && (
                        <Collapsible 
                          open={expandedAmFeedback === reflection.id} 
                          onOpenChange={(open) => setExpandedAmFeedback(open ? reflection.id : null)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-between text-[#C47F00] hover:text-[#D4A574] hover:bg-[#2A2A2A] p-3 border border-[#C47F00]/20 hover:border-[#C47F00]/40 transition-all"
                            >
                              <span className="flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" />
                                <span>AM Reflection</span>
                                {expandedAmFeedback !== reflection.id && (
                                  <span className="text-xs bg-[#C47F00]/20 px-2 py-0.5 rounded-full text-[#C47F00]">
                                    Tap for insights
                                  </span>
                                )}
                              </span>
                              {expandedAmFeedback === reflection.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4 animate-pulse" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-3">
                            <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded-lg space-y-3">
                              {formatAiFeedback(reflection.amSummary)}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>

                    {expandedEntry === reflection.id && (
                      <>
                        <div className="border-t border-gray-700 my-4"></div>
                        <div className="mb-2 text-primary font-sans font-semibold text-sm">This Week You Completed:</div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm font-sans">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="h-4 w-4 text-primary" />
                              <span className="font-medium text-foreground">Lessons</span>
                            </div>
                            <p className="text-muted-foreground">
                              {reflection.lessonsCompleted?.length || 0} completed
                            </p>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-primary" />
                              <span className="font-medium text-foreground">Challenges</span>
                            </div>
                            <p className="text-muted-foreground">
                              {reflection.challengesCompleted?.length || 0} completed
                            </p>
                          </div>
                          
                          {reflection.milestonesUnlocked && reflection.milestonesUnlocked.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Award className="h-4 w-4 text-primary" />
                                <span className="font-medium text-foreground">Milestones</span>
                              </div>
                              <div className="space-y-1">
                                {reflection.milestonesUnlocked.map((milestone, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs border-primary text-primary bg-transparent font-sans">
                                    {milestone}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Weekly Goals Section */}
                        {reflection.weeklyGoals && reflection.weeklyGoals.length > 0 && (
                          <>
                            <div className="border-t border-gray-700 my-4"></div>
                            <div className="mb-2 text-primary font-sans font-semibold text-sm flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Weekly Goals Set:
                            </div>
                            <div className="space-y-3">
                              {reflection.weeklyGoals.map((goal, idx) => (
                                <div key={idx} className="bg-[#0A0A0A] border border-[#2A2A2A] p-3 rounded-lg">
                                  <div className="flex items-start justify-between mb-2">
                                    <span className="text-gray-300 text-sm flex-1">{goal.goal}</span>
                                    <Badge variant="outline" className="text-xs border-primary text-primary bg-transparent ml-2">
                                      {GOAL_CATEGORIES[goal.category as keyof typeof GOAL_CATEGORIES] || goal.category}
                                    </Badge>
                                  </div>
                                  {reflection.goalVisualizations && reflection.goalVisualizations[idx] && (
                                    <div className="bg-gradient-to-r from-[#C47F00]/5 to-[#D4A574]/5 border border-[#C47F00]/20 p-2 rounded text-xs text-gray-400 leading-relaxed">
                                      <span className="text-[#C47F00] font-medium">Visualization: </span>
                                      {reflection.goalVisualizations[idx]}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}