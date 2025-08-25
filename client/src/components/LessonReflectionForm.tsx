import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, BookOpen, PenTool, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface LessonReflectionFormProps {
  lessonContent: string;
  lessonTitle: string;
  lessonId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function LessonReflectionForm({ 
  lessonContent, 
  lessonTitle, 
  lessonId, 
  onComplete, 
  onCancel 
}: LessonReflectionFormProps) {
  const [showLessonContent, setShowLessonContent] = useState(true);
  const [personalReflection, setPersonalReflection] = useState("");
  const [keyInsights, setKeyInsights] = useState(["", "", ""]);
  const [actionSteps, setActionSteps] = useState(["", "", ""]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateInsight = (index: number, value: string) => {
    const newInsights = [...keyInsights];
    newInsights[index] = value;
    setKeyInsights(newInsights);
  };

  const updateActionStep = (index: number, value: string) => {
    const newSteps = [...actionSteps];
    newSteps[index] = value;
    setActionSteps(newSteps);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const content = `Personal Reflection:
${personalReflection}

Key Insights:
${keyInsights.filter(insight => insight.trim()).map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

Action Steps:
${actionSteps.filter(step => step.trim()).map((step, i) => `${i + 1}. ${step}`).join('\n')}`;

      return await apiRequest('POST', '/api/journal', {
        content,
        lessonId: parseInt(lessonId),
        lessonTitle
      });
    },
    onSuccess: () => {
      toast({
        title: "Reflection Saved",
        description: "Your lesson reflection has been saved to your journal",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      
      // Clear URL parameters and navigate to show the saved entry
      window.history.replaceState({}, '', '/journal');
      
      // Scroll to the Add New Entry card after saving
      setTimeout(() => {
        const addEntryCard = document.querySelector('[data-scroll-target="add-entry"]');
        if (addEntryCard) {
          addEntryCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
      
      onComplete();
    },
    onError: (error) => {
      console.error('Save reflection error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your reflection. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const handleSave = () => {
    if (!personalReflection.trim()) {
      toast({
        title: "Reflection Required",
        description: "Please write your personal reflection before saving",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Lesson Reference Card */}
      <Card className="border-[#7C4A32] shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#7C4A32] rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-[#7C4A32] font-['Playfair_Display']">
                  {lessonTitle}
                </CardTitle>
                <Badge variant="outline" className="border-[#C47F00] text-[#C47F00] text-xs">
                  Reference
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLessonContent(!showLessonContent)}
              className="text-[#7C4A32] hover:bg-[#7C4A32]/10"
            >
              {showLessonContent ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        {showLessonContent && (
          <CardContent className="pt-0">
            <div className="prose prose-sm max-w-none text-white font-['Montserrat'] leading-relaxed">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-lg font-bold text-[#C47F00] font-['Playfair_Display'] mb-3" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-base font-bold text-[#C47F00] font-['Playfair_Display'] mb-2 mt-4" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-sm font-semibold text-[#C47F00] font-['Playfair_Display'] mb-2 mt-3" {...props} />,
                  p: ({node, ...props}) => <p className="mb-3 text-white font-['Montserrat'] text-sm" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1 text-white text-sm" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-white text-sm" {...props} />,
                  li: ({node, ...props}) => <li className="text-white" {...props} />,
                  strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
                  em: ({node, ...props}) => <em className="text-white italic" {...props} />,
                  code: ({node, ...props}) => <code className="text-white bg-gray-800 px-1 rounded" {...props} />,
                  a: ({node, ...props}) => <a className="text-[#C47F00] underline" {...props} />,
                }}
              >
                {lessonContent}
              </ReactMarkdown>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Reflection Form */}
      <Card className="border-[#C47F00] shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#C47F00] rounded-full flex items-center justify-center">
              <PenTool className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-[#7C4A32] font-['Playfair_Display']">
              Your Reflection
            </CardTitle>
          </div>
          <p className="text-sm text-white font-['Montserrat']">
            Take time to process what you've learned and how you'll apply it.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Personal Reflection */}
          <div>
            <label className="block text-sm font-medium text-[#C47F00] mb-2 font-['Montserrat']">
              Personal Reflection *
            </label>
            <p className="text-xs text-white mb-2 font-['Montserrat']">
              What stood out to you? How does this lesson connect to your life?
            </p>
            <Textarea
              value={personalReflection}
              onChange={(e) => setPersonalReflection(e.target.value)}
              placeholder="Share your thoughts about this lesson..."
              className="min-h-[120px] border-[#7C4A32] focus:border-[#C47F00] font-['Montserrat']"
            />
          </div>

          {/* Key Insights */}
          <div>
            <label className="block text-sm font-medium text-[#C47F00] mb-2 font-['Montserrat']">
              Key Insights
            </label>
            <p className="text-xs text-white mb-3 font-['Montserrat']">
              What are the main takeaways you want to remember?
            </p>
            <div className="space-y-2">
              {keyInsights.map((insight, index) => (
                <Input
                  key={index}
                  value={insight}
                  onChange={(e) => updateInsight(index, e.target.value)}
                  placeholder={`Insight ${index + 1}...`}
                  className="border-[#7C4A32] focus:border-[#C47F00] font-['Montserrat']"
                />
              ))}
            </div>
          </div>

          {/* Action Steps */}
          <div>
            <label className="block text-sm font-medium text-[#C47F00] mb-2 font-['Montserrat']">
              Action Steps
            </label>
            <p className="text-xs text-white mb-3 font-['Montserrat']">
              How will you apply this lesson in your daily life?
            </p>
            <div className="space-y-2">
              {actionSteps.map((step, index) => (
                <Input
                  key={index}
                  value={step}
                  onChange={(e) => updateActionStep(index, e.target.value)}
                  placeholder={`Action step ${index + 1}...`}
                  className="border-[#7C4A32] focus:border-[#C47F00] font-['Montserrat']"
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={onCancel}
              variant="outline"
              className="border-[#7C4A32] text-[#7C4A32] hover:bg-[#7C4A32] hover:text-white flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-[#7C4A32] hover:bg-[#8B5A3C] text-white flex-1"
            >
              <PenTool className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save Reflection'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}