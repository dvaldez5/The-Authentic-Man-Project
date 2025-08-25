import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { 
  Pin, 
  PenTool, 
  BookOpen, 
  Target, 
  Play, 
  MessageCircle,
  Calendar,
  Plus,
  Lightbulb
} from 'lucide-react';
import { format } from 'date-fns';

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
  pinned: boolean;
  lessonId: number | null;
  challengeId: number | null;
  scenarioId: number | null;
  createdAt: string;
}

export default function PinnedJournalCard() {
  const { data: pinnedEntry, isLoading } = useQuery<{ entry: JournalEntry | null }>({
    queryKey: ['/api/journal/pinned'],
  });

  const getEntryIcon = (entry: JournalEntry) => {
    if (entry.lessonId) return <BookOpen className="h-3 w-3" />;
    if (entry.challengeId) return <Target className="h-3 w-3" />;
    if (entry.scenarioId) return <Play className="h-3 w-3" />;
    return <MessageCircle className="h-3 w-3" />;
  };

  const getEntryType = (entry: JournalEntry) => {
    if (entry.lessonId) return "Lesson Reflection";
    if (entry.challengeId) return "Challenge Reflection";
    if (entry.scenarioId) return "Scenario Reflection";
    return "Personal Reflection";
  };

  if (isLoading) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-black flex items-center">
            <Pin className="h-5 w-5 mr-2 text-[#C47F00]" />
            Pinned Reflection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pinnedEntry?.entry) {
    return (
      <Card className="bg-black border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Pin className="h-5 w-5 mr-2 text-[#C47F00]" />
            Pinned Reflection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <PenTool className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300 text-sm mb-4">
              Pin a journal entry to keep it visible on your dashboard.
            </p>
            <Button 
              className="bg-[#C47F00] hover:bg-[#8B5A00] text-black"
              asChild
            >
              <Link href="/journal">
                <Plus className="h-4 w-4 mr-2" />
                Create Entry
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const entry = pinnedEntry.entry;

  return (
    <Card className="bg-black border-[#C47F00] border-2">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header with entry type and pinned badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getEntryIcon(entry)}
              <span className="text-white text-sm font-medium">{getEntryType(entry)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Pin className="h-4 w-4 text-[#C47F00]" />
              <Badge className="bg-[#C47F00] text-black text-xs font-medium px-2 py-1">
                Pinned
              </Badge>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Calendar className="h-4 w-4" />
            {format(new Date(entry.createdAt), 'MMM d, yyyy • h:mm a')}
          </div>

          {/* Section: Your Reflection */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-3 font-serif">Your Reflection</h3>
            <div className="text-white text-sm leading-relaxed">
              {(entry.content || entry.text || '').length > 200 
                ? `${(entry.content || entry.text || '').substring(0, 200)}...`
                : (entry.content || entry.text || 'No content available')
              }
            </div>
          </div>

          {/* AI Reflection Preview */}
          {entry.aiReflection && (
            <div className="border border-[#C47F00] rounded-lg p-3 bg-black">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-4 w-4 text-[#C47F00]" />
                <span className="text-[#C47F00] text-sm font-medium">AM's Reflection</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-[#C47F00]" />
                <span className="text-white text-sm font-medium">Insight</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {entry.aiReflection.insight.length > 150
                  ? `${entry.aiReflection.insight.substring(0, 150)}...`
                  : entry.aiReflection.insight
                }
              </p>
            </div>
          )}

          {/* View Full Entry Button */}
          <Button 
            className="w-full bg-[#C47F00] hover:bg-[#B8710A] text-black font-medium"
            asChild
          >
            <Link href="/journal/pinned">
              View Full Entry
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}