import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, MessageCircle, Lightbulb, Heart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { broadcastUpdate } from "@/hooks/use-cross-instance-sync";
// import { JournalModal } from "@/components/journal/JournalModal";
import type { Scenario } from "@shared/schema";

interface ScenarioPlayerProps {
  scenario: Scenario;
  onComplete?: () => void;
  existingResponse?: {
    selectedOptionIndex: number;
    id: number;
    userId: number;
    scenarioId: number;
    completedAt: string;
  };
}

export function ScenarioPlayer({ scenario, onComplete, existingResponse }: ScenarioPlayerProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(existingResponse?.selectedOptionIndex ?? null);
  const [showFeedback, setShowFeedback] = useState(!!existingResponse);
  const [showReflectionPrompt, setShowReflectionPrompt] = useState(false);
  const [showAmFeedback, setShowAmFeedback] = useState(false);
  
  // Get feedback from scenario options if we have an existing response
  const getFeedbackFromResponse = () => {
    if (!existingResponse || !scenario.options) return "";
    const options = Array.isArray(scenario.options) ? scenario.options : [];
    const selectedOptionData = options[existingResponse.selectedOptionIndex];
    return selectedOptionData?.feedback || "";
  };
  
  const [feedback, setFeedback] = useState<string>(getFeedbackFromResponse());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const respondMutation = useMutation({
    mutationFn: async (selectedOptionIndex: number) => {
      setIsSubmitting(true);
      setSubmissionError(null);
      const response = await apiRequest("POST", `/api/scenarios/${scenario.id}/respond`, {
        selectedOptionIndex
      });
      return response.json();
    },
    onSuccess: (data) => {
      setFeedback(data.scenario.selectedOption.feedback);
      setShowFeedback(true);
      setIsSubmitting(false);
      
      // Invalidate scenario-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios'] });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios/weekly'] });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      // Broadcast scenario completion to all other instances
      broadcastUpdate('scenario_complete', { scenarioId: scenario.id });
      
      toast({
        title: "Response Recorded",
        description: "Your choice has been saved.",
      });
    },
    onError: (error) => {
      setIsSubmitting(false);
      setSubmissionError("Something went wrong saving your choice. Your response wasn't recorded. Please tap again or refresh and try once more.");
      console.error("Scenario response error:", error);
      toast({
        title: "Error",
        description: "Failed to record your response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleOptionSelect = (optionIndex: number) => {
    if (showFeedback) return; // Prevent changes after submission
    setSelectedOption(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    respondMutation.mutate(selectedOption);
  };

  const handleReflectionComplete = () => {
    setShowReflectionPrompt(false);
    onComplete?.();
  };

  const openJournalWithPrompt = () => {
    // Navigate to journal with structured reflection form
    const params = new URLSearchParams({
      scenarioId: scenario.id.toString(),
      selectedOptionIndex: (selectedOption || 0).toString()
    });
    
    console.log('Navigating to journal with structured scenario reflection:', params.toString());
    setLocation(`/journal?${params.toString()}`);
  };

  // Navigate to journal entry for this scenario
  const navigateToJournalEntry = () => {
    if (showFeedback) {
      setLocation(`/journal?highlight=scenario-${scenario.id}`);
    }
  };

  return (
    <>
      <Card 
        className="scenario-card max-w-4xl mx-auto"
      >
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {scenario.stage && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {scenario.stage}
              </Badge>
            )}
          </div>
          <CardTitle className="scenario-header text-2xl font-bold">
            {scenario.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Scenario Prompt */}
          <div className="bg-muted/20 p-6 rounded-lg">
            <p className="scenario-body text-lg leading-relaxed whitespace-pre-line">
              {scenario.prompt}
            </p>
          </div>

          {/* Response Options */}
          <div className="space-y-4">
            <h3 className="scenario-header text-lg font-semibold">
              What do you do?
            </h3>
            
            <div className="space-y-3">
              {(scenario.options as any[]).map((option: any, index: number) => (
                <Button
                  key={index}
                  variant={selectedOption === index ? "default" : "outline"}
                  className={`w-full text-left p-4 h-auto min-h-16 justify-start scenario-option ${
                    showFeedback && selectedOption !== index ? 'opacity-50' : ''
                  }`}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showFeedback || respondMutation.isPending}
                >
                  <div className="text-left w-full">
                    <div className="font-medium break-words overflow-wrap-anywhere hyphens-auto max-w-full">
                      {option.text}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          {!showFeedback && (
            <div className="flex flex-col items-center pt-4">
              <Button
                onClick={handleSubmit}
                disabled={selectedOption === null || isSubmitting}
                className="px-8 py-3"
                size="lg"
              >
                {isSubmitting ? "Recording your choice..." : "Submit Choice"}
              </Button>
              
              {/* Submission Error Display */}
              {submissionError && (
                <p className="text-red-500 text-sm mt-3 text-center max-w-md">
                  {submissionError}
                </p>
              )}
            </div>
          )}

          {/* Feedback Section */}
          {showFeedback && (
            <div className="space-y-6 pt-4 border-t border-muted">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 rounded-lg">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-[#C47F00]" />
                  Your Choice Impact
                </h4>
                <p className="text-gray-300 leading-relaxed mb-4">{feedback}</p>
                
                {/* AM Reflection Collapsible */}
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
                      {formatAiFeedback("This choice reveals your instincts under pressure. Notice how you balanced immediate action with long-term thinking. Your response shows developing leadership awareness - the ability to see beyond the surface situation. Growth happens when we examine not just what we chose, but why we chose it.")}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Journal Prompt */}
              <div className="text-center space-y-4">
                <h4 className="scenario-header text-lg font-semibold">
                  What stuck with you?
                </h4>
                <Button
                  onClick={() => openJournalWithPrompt()}
                  variant="outline"
                  className="px-6 py-3"
                >
                  Reflect on This Moment
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reflection Prompt */}
      {showReflectionPrompt && (
        <div className="mt-6 p-6 bg-muted/20 rounded-lg">
          <h4 className="text-[#333333] text-sm mt-4 mb-2 font-semibold font-['Montserrat']">
            What did this surface for you?
          </h4>
          <p className="text-sm font-['Montserrat'] mb-4 text-[#333333]">
            This is your space. No one else sees it.
          </p>
          <div className="flex gap-3">
            <Button 
              onClick={() => openJournalWithPrompt()}
              className="bg-[#7C4A32] hover:bg-[#E4B768] text-white"
              size="sm"
            >
              Write About It
            </Button>
            <Button 
              onClick={handleReflectionComplete}
              variant="outline"
              className="border-[#7C4A32] text-[#7C4A32] hover:bg-[#7C4A32] hover:text-white"
              size="sm"
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </>
  );
}