import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "wouter";
import { detectSimplePWAMode } from '@/lib/simple-pwa';
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { getTopPadding } from "@/utils/responsive-styles";
import {
  MessageCircle,
  Pin,
  Calendar,
  BookOpen,
  Target,
  Users,
  ArrowLeft,
  PenTool
} from "lucide-react";
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

export default function JournalPinned() {
  const isPWA = detectSimplePWAMode();
  const { isMobile } = useMobileDetection();

  const { data: pinnedEntry, isLoading } = useQuery<{ entry: JournalEntry | null }>({
    queryKey: ['/api/journal/pinned'],
  });

  const getEntryIcon = (entry: JournalEntry) => {
    if (entry.lessonId) return <BookOpen className="h-5 w-5 text-primary" />;
    if (entry.challengeId) return <Target className="h-5 w-5 text-primary" />;
    if (entry.scenarioId) return <Users className="h-5 w-5 text-primary" />;
    return <MessageCircle className="h-5 w-5 text-primary" />;
  };

  const getEntryType = (entry: JournalEntry) => {
    if (entry.lessonId) return "Lesson Reflection";
    if (entry.challengeId) return "Challenge Entry";
    if (entry.scenarioId) return "Scenario Response";
    return "Personal Entry";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className={`container mx-auto px-4 ${getTopPadding(isPWA, isMobile, 'main')} pb-8 space-y-8`}>
          <div className="text-center space-y-4">
            <h1 className="challenge-header text-4xl md:text-6xl">Pinned Reflection</h1>
            <p className="challenge-body text-lg text-muted-foreground">
              Loading your pinned entry...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className={`container mx-auto px-4 ${getTopPadding(isPWA, isMobile, 'main')} pb-8 space-y-8`}>
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Link to="/journal">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Journal
              </Button>
            </Link>
          </div>
          <h1 className="challenge-header text-4xl md:text-6xl">Pinned Reflection</h1>
          <p className="challenge-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Your most important reflection, always accessible for review and growth.
          </p>
        </div>

        {/* Pinned Entry Content */}
        <div className="w-full max-w-4xl mx-auto">
          {!pinnedEntry?.entry ? (
            <Card className="challenge-card border-gray-700">
              <CardContent className="p-8 text-center">
                <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="challenge-header text-xl mb-2">No Pinned Entry</h3>
                <p className="challenge-body mb-6">
                  You haven't pinned any journal entries yet. Pin an important reflection to keep it easily accessible.
                </p>
                <Link to="/journal">
                  <Button className="bg-primary hover:bg-primary/80 text-primary-foreground">
                    Go to Journal
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-700 bg-transparent">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {getEntryIcon(pinnedEntry.entry)}
                    <div>
                      <Badge variant="secondary" className="text-white text-xs" style={{ backgroundColor: '#1A1A1A' }}>
                        {getEntryType(pinnedEntry.entry)}
                      </Badge>
                      <p className="challenge-body text-sm mt-1 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(pinnedEntry.entry.createdAt), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pin className="h-5 w-5 text-primary" />
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                      Pinned
                    </Badge>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Entry Content */}
                  <div className="prose prose-invert max-w-none">
                    <h3 className="challenge-header text-xl mb-4">Your Reflection</h3>
                    <p className="challenge-body leading-relaxed whitespace-pre-wrap text-lg">
                      {pinnedEntry.entry.content || pinnedEntry.entry.text}
                    </p>
                  </div>

                  {/* AI Reflection */}
                  {pinnedEntry.entry.aiReflection && (
                    <div className="mt-8">
                      <InteractiveAIReflection
                        entryId={pinnedEntry.entry.id}
                        aiReflection={pinnedEntry.entry.aiReflection}
                        responseThreads={pinnedEntry.entry.aiResponseThreads || []}
                        className="mt-4"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer Message */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="challenge-body text-muted-foreground italic">
            "Your pinned reflection is a beacon guiding your continued growth."
          </p>
        </div>
      </div>
    </div>
  );
}