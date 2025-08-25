import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScenarioPlayer } from "./ScenarioPlayer";
import { CheckCircle2, Play, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import type { Scenario } from "@shared/schema";

interface WeeklyScenarioData {
  scenario: Scenario;
  hasResponded: boolean;
  response?: any;
}

export function WeeklyScenarioCard() {
  const [showPlayer, setShowPlayer] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [, setLocation] = useLocation();
  
  const { data: weeklyData, isLoading, refetch } = useQuery<WeeklyScenarioData>({
    queryKey: ['/api/scenarios/weekly'],
  });

  const navigateToJournalEntry = () => {
    if (weeklyData?.hasResponded && weeklyData?.scenario?.id) {
      // Navigate to journal page - user can scroll to find scenario entries
      setLocation('/journal');
    }
  };

  if (isLoading) {
    return (
      <Card className="scenario-card">
        <CardHeader>
          <CardTitle className="scenario-header text-xl flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Real Moment of the Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weeklyData?.scenario) {
    return (
      <Card className="scenario-card">
        <CardHeader>
          <CardTitle className="scenario-header text-xl flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Real Moment of the Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="scenario-body text-center text-muted-foreground py-8">
            No scenarios available right now. Check back soon.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleComplete = () => {
    setShowPlayer(false);
    refetch();
  };

  if (showPlayer) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setShowPlayer(false)}
          className="mb-4"
        >
          ← Back to Dashboard
        </Button>
        <ScenarioPlayer 
          scenario={weeklyData.scenario} 
          onComplete={handleComplete}
          existingResponse={weeklyData.hasResponded && weeklyData.response ? {
            selectedOptionIndex: weeklyData.response.selectedOptionIndex,
            id: weeklyData.response.id,
            userId: weeklyData.response.userId,
            scenarioId: weeklyData.response.scenarioId,
            completedAt: weeklyData.response.completedAt
          } : undefined}
        />
      </div>
    );
  }

  return (
    <Card className="scenario-card">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="scenario-header text-xl flex items-center gap-2">
              {weeklyData.hasResponded ? (
                <CheckCircle2 className="h-5 w-5 text-accent" />
              ) : (
                <Play className="h-5 w-5 text-primary" />
              )}
              Real Moment of the Week
              {weeklyData.hasResponded && (
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                  Completed
                </Badge>
              )}
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
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h3 className="scenario-header text-lg font-semibold">
              {weeklyData.scenario.title}
            </h3>
            
            <p className="scenario-body text-sm text-muted-foreground line-clamp-3">
              {weeklyData.scenario.prompt}
            </p>
            
            {weeklyData.scenario.stage && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {weeklyData.scenario.stage}
              </Badge>
            )}
          </div>

          <CollapsibleContent className="space-y-4">
            <div className="pt-2 border-t border-border/50">
              <p className="scenario-body text-sm text-muted-foreground mb-4">
                Navigate real-world challenges and build authentic decision-making skills.
              </p>
              
              {weeklyData.hasResponded && (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-accent">Your Response Recorded</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You've completed this scenario. Review your choice and reflection in your journal.
                  </p>
                </div>
              )}
            </div>
          </CollapsibleContent>

          <div className="flex gap-2 pt-2">
            {weeklyData.hasResponded ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowPlayer(true)}
                  className="flex-1"
                >
                  Review Response
                </Button>
                <Button
                  variant="outline"
                  onClick={navigateToJournalEntry}
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Journal
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setShowPlayer(true)}
                className="w-full"
              >
                Step Into This Moment
              </Button>
            )}
          </div>
        </CardContent>
      </Collapsible>
    </Card>
  );
}