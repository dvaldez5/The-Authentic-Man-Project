import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, MessageCircle, Heart, Lightbulb, HelpCircle } from 'lucide-react';
import { InteractiveAIReflection } from './InteractiveAIReflection';
import { broadcastUpdate } from '@/hooks/use-cross-instance-sync';

interface JournalPromptProps {
  lessonId?: number;
  challengeId?: number;
  scenarioId?: number;
  onComplete?: () => void;
  initialPrompt?: string;
  scenarioMetadata?: {
    scenarioId?: string;
    selectedOptionIndex?: string;
    lessonId?: string;
    lessonTitle?: string;
  } | null;
}

interface AIReflection {
  questions: string[];
  affirmation: string;
  insight: string;
}

interface JournalEntry {
  id: number;
  content: string;
  aiReflection: AIReflection;
  createdAt: string;
}

export function JournalPrompt({ lessonId, challengeId, scenarioId, onComplete, initialPrompt, scenarioMetadata }: JournalPromptProps) {
  const [content, setContent] = useState(initialPrompt || '');
  const [submittedEntry, setSubmittedEntry] = useState<JournalEntry | null>(null);
  const [showForm, setShowForm] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get appropriate prompt based on reflection type
  const getPromptText = () => {
    if (challengeId) return "What hit today?";
    if (scenarioId) return "What stuck with you?";
    return "Just write.";
  };

  const getHelperText = () => {
    if (challengeId) return "Was it easy? Hard? What showed up when you pushed?";
    if (scenarioId) return "What clicked? What felt off? What would you do differently next time?";
    return "This is your space. No rules. No filter.";
  };

  const createJournalMutation = useMutation({
    mutationFn: async (journalData: { content: string; lessonId?: number; challengeId?: number; scenarioId?: number }) => {
      const response = await apiRequest('POST', '/api/journal', journalData);
      return response.json();
    },
    onSuccess: (data: any) => {
      setSubmittedEntry(data.entry);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      // Broadcast journal entry to all other instances
      broadcastUpdate('journal_entry', { entryId: data.entry?.id });
      
      toast({
        title: "Journal entry created",
        description: "Your reflection has been saved with AI insights.",
      });
      // Delay completion to show the result briefly
      setTimeout(() => {
        onComplete?.();
      }, 3000);
    },
    onError: (error) => {
      toast({
        title: "Failed to save journal entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Please write something",
        description: "Your journal entry cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    createJournalMutation.mutate({
      content: content.trim(),
      lessonId,
      challengeId,
      scenarioId
    });
  };

  return (
    <Card className="bg-[#1A1A1A] border-none mb-8">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center gap-2 font-playfair">
          <MessageCircle className="h-5 w-5 text-amber-500" />
          {submittedEntry ? "Reflection Complete" : getPromptText()}
        </CardTitle>
        <p className="text-sm text-neutral-400">
          {submittedEntry ? "Your reflection has been saved with AI insights." : getHelperText()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!submittedEntry ? (
          <>
            <Textarea
              placeholder={getPromptText()}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-neutral-500 focus:border-amber-500 resize-none"
              disabled={createJournalMutation.isPending}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={createJournalMutation.isPending || !content.trim()}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white border-none"
              >
                {createJournalMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reflecting...
                  </>
                ) : (
                  'Submit Reflection'
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* User's Journal Entry */}
            <div className="p-4 bg-amber-50/10 border border-amber-500/30 rounded-lg">
              <h4 className="text-amber-400 font-semibold mb-2">Your Reflection</h4>
              <p className="text-neutral-300 leading-relaxed">{submittedEntry.content}</p>
            </div>

            {/* Interactive AI Reflection */}
            {submittedEntry.aiReflection && (
              <InteractiveAIReflection
                entryId={submittedEntry.id}
                aiReflection={submittedEntry.aiReflection}
                responseThreads={[]}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}