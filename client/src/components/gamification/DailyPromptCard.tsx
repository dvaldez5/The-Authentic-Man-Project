import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Calendar, Plus, Star } from "lucide-react";
import { JournalPrompt } from "@/components/JournalPrompt";

interface DailyPrompt {
  id: number;
  date: string;
  prompt: string;
  theme: string;
  citation: string | null;
  createdAt: string;
}

interface JournalEntry {
  id: number;
  content?: string;
  text?: string;
  createdAt: string;
}

export function DailyPromptCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showJournalPrompt, setShowJournalPrompt] = useState(false);
  const queryClient = useQueryClient();

  const { data: dailyPrompt } = useQuery<DailyPrompt>({
    queryKey: ['/api/gamification/daily-prompt'],
  });

  const { data: journalEntries = [] } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal'],
  });

  const showDailyPrompts = true; // Always show daily prompts in production

  if (!showDailyPrompts || !dailyPrompt) {
    return null;
  }

  // Check if user has already written an entry today
  const today = new Date().toISOString().split('T')[0];
  const hasWrittenToday = journalEntries.some(entry => 
    entry.createdAt.split('T')[0] === today
  );

  const handleJournalComplete = () => {
    setShowJournalPrompt(false);
    setIsExpanded(false);
    queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
  };

  if (hasWrittenToday) {
    return null; // Don't show if user already wrote today
  }

  return (
    <Card className="border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/5 to-transparent">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-[#D4AF37]" />
              Daily Reflection
              <Badge variant="outline" className="bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37] text-xs">
                +50 XP
              </Badge>
            </CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <div className="space-y-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
              {dailyPrompt.theme}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {dailyPrompt.prompt}
            </p>
            {dailyPrompt.citation && (
              <p className="text-xs text-muted-foreground italic">
                — {dailyPrompt.citation}
              </p>
            )}
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {!showJournalPrompt ? (
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Take a few minutes to reflect on today's prompt and earn 50 XP.
                </p>
                <Button 
                  onClick={() => setShowJournalPrompt(true)}
                  className="bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start Writing
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <JournalPrompt
                  initialPrompt={`Daily Reflection - ${new Date().toLocaleDateString()}

Prompt: ${dailyPrompt.prompt}

My thoughts:
`}
                  onComplete={handleJournalComplete}
                />
                <div className="text-center">
                  <Button 
                    variant="outline"
                    onClick={() => setShowJournalPrompt(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}