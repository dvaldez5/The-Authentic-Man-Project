import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Lightbulb, Heart, HelpCircle, Send, ChevronDown, ChevronUp } from "lucide-react";

interface AIReflection {
  questions: string[];
  affirmation: string;
  insight: string;
}

interface ResponseThread {
  questionIndex: number;
  userResponse: string;
  aiFollowUp?: string;
}

interface InteractiveAIReflectionProps {
  entryId: number;
  aiReflection: AIReflection;
  responseThreads?: ResponseThread[];
  className?: string;
}

export function InteractiveAIReflection({ 
  entryId, 
  aiReflection, 
  responseThreads = [],
  className = "" 
}: InteractiveAIReflectionProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [responses, setResponses] = useState<{ [key: number]: string }>({});
  const queryClient = useQueryClient();

  const responseMutation = useMutation({
    mutationFn: async ({ questionIndex, userResponse }: { questionIndex: number; userResponse: string }) => {
      return apiRequest('POST', `/api/journal/${entryId}/ai-response`, {
        questionIndex,
        userResponse
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      setResponses(prev => {
        const newResponses = { ...prev };
        delete newResponses[variables.questionIndex];
        return newResponses;
      });
    }
  });

  const toggleQuestion = (questionIndex: number) => {
    setExpandedQuestions(prev => 
      prev.includes(questionIndex) 
        ? prev.filter(i => i !== questionIndex)
        : [...prev, questionIndex]
    );
  };

  const handleResponseSubmit = (questionIndex: number) => {
    const response = responses[questionIndex]?.trim();
    if (!response) return;
    
    responseMutation.mutate({ questionIndex, userResponse: response });
  };

  const getResponseThread = (questionIndex: number) => {
    return responseThreads.find(thread => thread.questionIndex === questionIndex);
  };

  return (
    <div className={`p-4 bg-primary/10 border border-primary/30 rounded-lg ${className}`}>
      <h4 className="text-primary font-semibold mb-3 flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        AM's Reflection
      </h4>
      
      <div className="space-y-4">
        {/* Insight */}
        <div className="flex gap-3">
          <Lightbulb className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
          <div>
            <h5 className="text-white font-medium mb-1">Insight</h5>
            <p className="text-neutral-300 text-sm leading-relaxed">{aiReflection.insight}</p>
          </div>
        </div>

        {/* Affirmation */}
        <div className="flex gap-3">
          <Heart className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
          <div>
            <h5 className="text-white font-medium mb-1">Affirmation</h5>
            <p className="text-neutral-300 text-sm leading-relaxed italic">{aiReflection.affirmation}</p>
          </div>
        </div>

        {/* Interactive Questions - Only show if questions exist */}
        {aiReflection.questions && aiReflection.questions.length > 0 && (
          <div className="flex gap-3">
            <HelpCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h5 className="text-white font-medium mb-2">Reflection Questions</h5>
              <div className="space-y-3">
                {aiReflection.questions.map((question, questionIndex) => {
                const isExpanded = expandedQuestions.includes(questionIndex);
                const thread = getResponseThread(questionIndex);
                const hasResponse = !!thread;

                return (
                  <div key={questionIndex} className="border border-neutral-600 rounded-lg overflow-hidden">
                    {/* Question Header */}
                    <button
                      onClick={() => toggleQuestion(questionIndex)}
                      className="w-full text-left p-3 bg-neutral-800/50 hover:bg-neutral-700/50 transition-colors flex items-center justify-between"
                    >
                      <span className="text-neutral-300 text-sm leading-relaxed pr-2">
                        {question}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {hasResponse && (
                          <div className="h-2 w-2 bg-primary rounded-full"></div>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-neutral-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-neutral-400" />
                        )}
                      </div>
                    </button>

                    {/* Response Area */}
                    {isExpanded && (
                      <div className="p-3 bg-neutral-900/30 border-t border-neutral-600">
                        {/* Existing Response */}
                        {thread && (
                          <div className="mb-4 space-y-3">
                            <div className="bg-neutral-800/50 rounded-lg p-3">
                              <p className="text-xs text-neutral-400 mb-1">Your Response:</p>
                              <p className="text-neutral-300 text-sm">{thread.userResponse}</p>
                            </div>
                            {thread.aiFollowUp && (
                              <div className="bg-primary/20 rounded-lg p-3">
                                <p className="text-xs text-primary mb-1">AM's Follow-up:</p>
                                <p className="text-neutral-300 text-sm italic">{thread.aiFollowUp}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* New Response Input */}
                        <div className="space-y-3">
                          <Textarea
                            value={responses[questionIndex] || ''}
                            onChange={(e) => setResponses(prev => ({ ...prev, [questionIndex]: e.target.value }))}
                            placeholder={hasResponse ? "Add another reflection..." : "Share your thoughts..."}
                            className="bg-neutral-800/50 border-neutral-600 text-neutral-300 placeholder-neutral-500 resize-none"
                            rows={3}
                          />
                          <div className="flex justify-end">
                            <Button
                              onClick={() => handleResponseSubmit(questionIndex)}
                              disabled={!responses[questionIndex]?.trim() || responseMutation.isPending}
                              size="sm"
                              className="bg-primary hover:bg-primary/80"
                            >
                              {responseMutation.isPending ? (
                                "Sending..."
                              ) : (
                                <>
                                  <Send className="h-3 w-3 mr-1" />
                                  {hasResponse ? "Add Response" : "Respond"}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}