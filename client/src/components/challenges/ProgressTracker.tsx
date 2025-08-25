import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Flame, Calendar } from "lucide-react";

interface ProgressData {
  totalChallenges: number;
  completedChallenges: number;
  currentStreak: number;
  longestStreak: number;
  milestones: Array<{ day: number; label: string; unlocked: boolean }>;
}

export function ProgressTracker() {
  const { data: progress, isLoading } = useQuery<{ progress: ProgressData }>({
    queryKey: ['/api/challenges/progress'],
  });

  if (isLoading) {
    return (
      <Card className="challenge-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress?.progress) {
    return null;
  }

  const { totalChallenges, completedChallenges, currentStreak, longestStreak, milestones } = progress.progress;
  const completionRate = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0;

  return (
    <Card className="challenge-card">
      <CardHeader>
        <CardTitle className="challenge-header text-xl flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Your Progress
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="challenge-body">Challenges Completed</span>
            <span className="font-semibold">{completedChallenges} / {totalChallenges}</span>
          </div>
          <Progress value={completionRate} className="h-2">
            <div className="progress-bar w-full h-full" style={{ width: `${completionRate}%` }} />
          </Progress>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-accent">
              <Flame className="h-4 w-4" />
              <span className="text-2xl font-bold">{currentStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </div>
          
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-primary">
              <Calendar className="h-4 w-4" />
              <span className="text-2xl font-bold">{longestStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Longest Streak</p>
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          <h4 className="challenge-header text-sm flex items-center gap-2">
            <Trophy className="h-4 w-4 text-accent" />
            Milestones
          </h4>
          
          <div className="space-y-2">
            {milestones.map((milestone) => (
              <div
                key={milestone.day}
                className={`flex items-center justify-between p-2 rounded ${
                  milestone.unlocked 
                    ? 'bg-accent/10 border border-accent/20' 
                    : 'bg-muted/10 border border-muted/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    milestone.unlocked ? 'bg-accent' : 'bg-muted'
                  }`} />
                  <span className={`text-sm font-medium ${
                    milestone.unlocked ? 'milestone' : 'text-muted-foreground'
                  }`}>
                    {milestone.label}
                  </span>
                </div>
                <Badge 
                  variant={milestone.unlocked ? "default" : "outline"}
                  className={milestone.unlocked ? "bg-accent text-primary" : ""}
                >
                  Day {milestone.day}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}