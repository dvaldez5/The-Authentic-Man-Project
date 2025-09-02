import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, Clock, ChevronDown, ChevronUp, MessageCircle, Lightbulb, Heart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
// Removed useToast to fix React hook errors
import type { Challenge, UserChallenge } from "@shared/schema";
import { ReflectionModal } from "./ReflectionModal";
import { broadcastUpdate } from "@/hooks/use-cross-instance-sync";

interface DailyChallengeCardProps {
  userChallenge: UserChallenge;
  challenge: Challenge;
}

export function DailyChallengeCard({ userChallenge, challenge }: DailyChallengeCardProps) {
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [showAmFeedback, setShowAmFeedback] = useState(false);
  const [, setLocation] = useLocation();
  // Removed useToast to fix React hook errors
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: async (reflection: string) => {
      return apiRequest('POST', '/api/complete-challenge', { challengeId: challenge.id, reflection });
    },
    onSuccess: (data) => {
      // Force immediate cache refresh with proper strategy
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/daily-challenge'], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['/api/challenges/progress'], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['/api/challenges/history'], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['/api/journal'], refetchType: 'active' })
      ]).then(() => {
        // Force immediate refetch to ensure UI synchronization
        queryClient.refetchQueries({ queryKey: ['/api/daily-challenge'] });
        queryClient.refetchQueries({ queryKey: ['/api/dashboard/stats'] });
      });
      
      // Broadcast update to all other instances (desktop, mobile browser, PWA)
      broadcastUpdate('challenge_complete', { challengeId: challenge.id });
      
      console.log("Challenge Complete: Keep going. Consistency—not perfection—is what builds character.");
      setShowReflectionModal(false);
    },
    onError: (error) => {
      console.error("Error: Failed to complete challenge. Try again.");
    }
  });

  const isCompleted = userChallenge.status === "completed";

  // Navigate to journal page - user can scroll to find challenge entries
  const navigateToJournalEntry = () => {
    if (isCompleted && userChallenge.reflection) {
      setLocation('/journal');
    }
  };

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

  return (
    <>
      <Card 
        className={`challenge-card w-full max-w-2xl mx-auto ${
          isCompleted && userChallenge.reflection ? 'cursor-pointer hover:border-[#C47F00]/50 transition-colors' : ''
        }`}
        onClick={isCompleted && userChallenge.reflection ? navigateToJournalEntry : undefined}
      >
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-accent" />
            ) : (
              <Clock className="h-6 w-6 text-primary" />
            )}
            <Badge variant={isCompleted ? "default" : "outline"} className="bg-primary text-primary-foreground">
              {challenge.stage}
            </Badge>
          </div>
          <CardTitle className="challenge-header text-2xl md:text-3xl">
            {challenge.text}
          </CardTitle>
          {challenge.description && (
            <p className="challenge-body text-lg text-muted-foreground">
              {challenge.description}
            </p>
          )}
          
          {/* Visualization Exercise */}
          {challenge.visualizationPrompt && (
            <div className="bg-gradient-to-r from-[#C47F00]/10 to-[#D4A574]/10 border border-[#C47F00]/20 p-4 rounded-lg">
              <h4 className="text-[#C47F00] font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Visualization Exercise
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {challenge.visualizationPrompt}
              </p>
              {challenge.visualizationGoals && challenge.visualizationGoals.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {challenge.visualizationGoals.map((goal: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs bg-[#C47F00]/5 border-[#C47F00]/30 text-[#C47F00]"
                    >
                      {goal}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          {!isCompleted ? (
            <Button 
              className="button-primary px-8 py-3 text-lg"
              onClick={() => setShowReflectionModal(true)}
            >
              Complete Challenge
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-accent">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Challenge Completed</span>
              </div>
              
              {userChallenge.reflection && (
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-4 rounded-lg text-left">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-[#C47F00]" />
                    Your Reflection
                  </h4>
                  <p className="text-gray-300 leading-relaxed mb-4">{userChallenge.reflection}</p>
                  
                  {userChallenge.aiFeedback && (
                    <Collapsible open={showAmFeedback} onOpenChange={setShowAmFeedback}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between text-[#C47F00] hover:text-[#D4A574] hover:bg-[#2A2A2A] p-3 border border-[#C47F00]/20 hover:border-[#C47F00]/40 transition-all"
                        >
                          <span className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            <span>AM Reflection</span>
                            {!showAmFeedback && (
                              <span className="text-xs bg-[#C47F00]/20 px-2 py-0.5 rounded-full text-[#C47F00]">
                                Tap for insights
                              </span>
                            )}
                          </span>
                          {showAmFeedback ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4 animate-pulse" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3">
                        <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded-lg space-y-3">
                          {formatAiFeedback(userChallenge.aiFeedback)}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                  
                  {/* Review Response Button */}
                  <Button 
                    variant="outline"
                    className="w-full mt-4 border-[#C47F00]/30 text-[#C47F00] hover:bg-[#C47F00]/10 hover:border-[#C47F00]/50"
                    onClick={navigateToJournalEntry}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Review Response
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ReflectionModal
        isOpen={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
        onSubmit={(reflection: string) => completeMutation.mutate(reflection)}
        isSubmitting={completeMutation.isPending}
      />
    </>
  );
}