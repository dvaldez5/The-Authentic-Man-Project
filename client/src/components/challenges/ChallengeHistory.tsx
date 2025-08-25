import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import type { Challenge, UserChallenge } from "@shared/schema";

interface ChallengeHistoryItem extends UserChallenge {
  challenge: Challenge;
}

export function ChallengeHistory() {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { data: history, isLoading } = useQuery<{ history: ChallengeHistoryItem[] }>({
    queryKey: ['/api/challenges/history'],
  });

  if (isLoading) {
    return (
      <Card className="challenge-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-muted pb-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Backend already filters for completed and unique challenges
  const uniqueCompletedChallenges = history?.history || [];
  
  if (!uniqueCompletedChallenges.length) {
    return (
      <Card className="challenge-card">
        <CardHeader>
          <CardTitle className="challenge-header text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Challenge History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="challenge-body text-center text-muted-foreground py-8">
            No challenges completed yet. Start your first challenge today.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show only actual completed challenges - no padding to 3
  const displayedChallenges = showAll 
    ? uniqueCompletedChallenges.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : uniqueCompletedChallenges.slice(0, 3);
  
  // Pagination for expanded view
  const totalPages = Math.ceil(uniqueCompletedChallenges.length / itemsPerPage);

  return (
    <Card className="challenge-card">
      <CardHeader>
        <CardTitle className="challenge-header text-xl flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Challenge History
          <Badge variant="outline" className="ml-auto text-xs">
            {uniqueCompletedChallenges.length} completed
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {displayedChallenges.map((item: ChallengeHistoryItem) => (
          <div
            key={item.id}
            className="border-b border-muted pb-4 last:border-b-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                  <Badge 
                    variant="outline" 
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    {item.challenge.stage}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(item.completedAt || item.dateIssued), 'MMM d, yyyy')}
                  </span>
                </div>
                
                <h4 className="challenge-header text-sm font-semibold">
                  {item.challenge.text}
                </h4>
                
                {item.challenge.description && (
                  <p className="challenge-body text-xs text-muted-foreground">
                    {item.challenge.description}
                  </p>
                )}
                
                {item.reflection && (
                  <div className="bg-muted/20 p-3 rounded text-xs">
                    <p className="font-medium mb-1">Your Reflection:</p>
                    <p className="text-muted-foreground">{item.reflection}</p>
                  </div>
                )}
                
                {item.aiFeedback && (
                  <div className="bg-primary/10 p-3 rounded text-xs">
                    <p className="font-medium mb-1">Reflection Feedback:</p>
                    <p className="text-muted-foreground">{item.aiFeedback}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Show More / Show Less Controls */}
        {uniqueCompletedChallenges.length > 3 && (
          <div className="flex flex-col items-center gap-3 pt-4 border-t border-muted">
            {!showAll ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(true)}
                className="flex items-center gap-2"
              >
                <ChevronDown className="h-4 w-4" />
                Show More ({uniqueCompletedChallenges.length - 3} more)
              </Button>
            ) : (
              <>
                {/* Pagination for expanded view */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-muted-foreground px-3">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAll(false);
                    setCurrentPage(1);
                  }}
                  className="flex items-center gap-2"
                >
                  <ChevronUp className="h-4 w-4" />
                  Show Less
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}