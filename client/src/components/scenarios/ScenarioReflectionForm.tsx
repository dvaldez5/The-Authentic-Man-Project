import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { broadcastUpdate } from "@/hooks/use-cross-instance-sync";
import { Shield, X } from "lucide-react";
import type { Scenario } from "@shared/schema";

interface ScenarioReflectionFormProps {
  scenarioMetadata: {
    scenarioId: string;
    selectedOptionIndex: string;
  };
  onComplete: () => void;
  onCancel: () => void;
}

export function ScenarioReflectionForm({ 
  scenarioMetadata, 
  onComplete, 
  onCancel 
}: ScenarioReflectionFormProps) {
  const [personalReflection, setPersonalReflection] = useState("");
  const [actionSteps, setActionSteps] = useState(["", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch scenario data
  const { data: scenario, isLoading } = useQuery({
    queryKey: ['/api/scenarios', scenarioMetadata.scenarioId],
    queryFn: async () => {
      const response = await fetch(`/api/scenarios/${scenarioMetadata.scenarioId}`);
      if (!response.ok) throw new Error('Failed to fetch scenario');
      const data = await response.json();
      return data;
    },
  });
  
  const selectedOptionIndex = parseInt(scenarioMetadata.selectedOptionIndex);
  const options = Array.isArray(scenario?.options) ? scenario.options : [];
  const selectedOption = options[selectedOptionIndex];

  const updateActionStep = (index: number, value: string) => {
    const newSteps = [...actionSteps];
    newSteps[index] = value;
    setActionSteps(newSteps);
  };

  const submitReflectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/journal', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reflection saved",
        description: "Your scenario reflection has been added to your journal.",
      });
      broadcastUpdate('journal-updated');
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      onComplete();
    },
    onError: (error: any) => {
      console.error('Reflection submission error:', error);
      toast({
        title: "Error saving reflection",
        description: "There was a problem saving your reflection. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (!personalReflection.trim()) {
      toast({
        title: "Reflection required",
        description: "Please share your personal reflection before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Create structured content similar to lesson format
    const structuredContent = `Reflecting on "${scenario?.title}":

**The Situation**
${scenario?.prompt}

**My Choice**
${selectedOption?.text}

**Choice Feedback**
${selectedOption?.feedback}

**Personal Reflection**
${personalReflection}

**Action Steps - How I'll Actually Follow Through**
${actionSteps.filter(step => step.trim()).map((step, index) => `${index + 1}. ${step}`).join('\n')}`;

    const journalData = {
      content: structuredContent,
      scenarioId: parseInt(scenarioMetadata.scenarioId),
      selectedOptionIndex: selectedOptionIndex,
    };

    try {
      await submitReflectionMutation.mutateAsync(journalData);
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6 text-center">
          <p>Loading scenario...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!scenario || !selectedOption) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6 text-center">
          <p>Scenario not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{scenario?.title}</h2>
              <Badge variant="outline" className="mt-1">
                Scenario Reflection
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Scenario Context */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 text-amber-600">The Situation</h3>
          <p className="text-sm text-muted-foreground mb-3">{scenario?.prompt}</p>
          
          <h4 className="font-medium mb-1 text-amber-600">Your Choice</h4>
          <p className="text-sm font-medium">{selectedOption?.text}</p>
          
          <h4 className="font-medium mb-1 mt-3 text-amber-600">Choice Impact</h4>
          <p className="text-sm text-muted-foreground">{selectedOption?.feedback}</p>
        </div>

        {/* Personal Reflection */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-amber-600">Your Reflection</h3>
          <p className="text-sm text-muted-foreground mb-3">
            What stood out to you? How does this choice connect to your life?
          </p>
          <Textarea
            value={personalReflection}
            onChange={(e) => setPersonalReflection(e.target.value)}
            placeholder="Share your thoughts about this moment..."
            className="min-h-[120px] resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {personalReflection.length}/1000 characters
          </p>
        </div>

        {/* Action Steps */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-amber-600">Action Steps</h3>
          <p className="text-sm text-muted-foreground mb-4">
            It's easy to pick the right answer, but how will you actually follow through with this choice in real life?
          </p>
          <div className="space-y-3">
            {actionSteps.map((step, index) => (
              <Textarea
                key={index}
                value={step}
                onChange={(e) => updateActionStep(index, e.target.value)}
                placeholder={`Action step ${index + 1}...`}
                className="resize-none"
                rows={2}
                maxLength={200}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={isSubmitting || !personalReflection.trim()}
          >
            <Shield className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving Reflection..." : "Save Reflection"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}