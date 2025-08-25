import { useQuery } from "@tanstack/react-query";
import { DailyChallengeCard } from "@/components/challenges/DailyChallengeCard";
import { ProgressTracker } from "@/components/challenges/ProgressTracker";
import { ChallengeHistory } from "@/components/challenges/ChallengeHistory";
import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";
import { usePWADetection } from "@/hooks/use-pwa-detection";
import { getTopPadding } from "@/utils/responsive-styles";
import type { Challenge, UserChallenge } from "@shared/schema";

interface DailyChallengeData {
  userChallenge: UserChallenge;
  challenge: Challenge;
}

export default function Challenges() {
  const { isPWA } = usePWADetection();
  const { data: dailyChallenge, isLoading, error } = useQuery<DailyChallengeData>({
    queryKey: ['/api/daily-challenge']
  });

  const paddingClass = getTopPadding(isPWA, false, 'main');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className={`container mx-auto px-4 ${paddingClass} pb-8 space-y-8`}>
          <div className="text-center space-y-4">
            <h1 className="challenge-header text-4xl md:text-6xl">Daily Challenge</h1>
            <p className="challenge-body text-lg text-muted-foreground">
              Loading your challenge...
            </p>
          </div>
          
          <Card className="challenge-card w-full max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                <div className="h-12 bg-muted rounded w-1/3 mx-auto mt-6"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <div className={`container mx-auto px-4 ${paddingClass} pb-8 space-y-8`}>
          <div className="text-center space-y-4">
            <h1 className="challenge-header text-4xl md:text-6xl">Daily Challenge</h1>
            <Card className="challenge-card w-full max-w-2xl mx-auto">
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="challenge-header text-xl mb-2">Challenge Not Available</h3>
                <p className="challenge-body text-muted-foreground">
                  Unable to load your daily challenge. Please try again later.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className={`container mx-auto px-4 ${paddingClass} pb-8 space-y-8`}>
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="challenge-header text-4xl md:text-6xl">Daily Challenge</h1>
          <p className="challenge-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-life change through focused, daily action. Each challenge builds character and consistency.
          </p>
        </div>

        {/* What Are Daily Challenges */}
        <Card className="challenge-card w-full max-w-4xl mx-auto border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-6 w-6 text-primary" />
              <h2 className="challenge-header text-2xl">What Are Daily Challenges?</h2>
            </div>
            
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex flex-col items-center mb-4">
                  <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                    1
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Micro-Practice Method</h3>
                <p className="challenge-body leading-relaxed">
                  Small, actionable tasks designed to build masculine character through consistent daily practice.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex flex-col items-center mb-4">
                  <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Character Building</h3>
                <p className="challenge-body leading-relaxed">
                  Each challenge targets specific virtues: integrity, courage, responsibility, and emotional strength.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex flex-col items-center mb-4">
                  <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Momentum Building</h3>
                <p className="challenge-body leading-relaxed">
                  Daily completion creates forward momentum, establishing patterns that lead to lasting transformation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why Daily Challenges Matter */}
        <Card className="border-gray-700 bg-transparent w-full max-w-4xl mx-auto">
          <CardContent className="p-6">
            <h2 className="challenge-header text-2xl mb-6">Why Daily Challenges Matter</h2>
            
            <div className="grid gap-4">
              <Card className="bg-card border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Builds Discipline</h3>
                      <p className="challenge-body text-sm">Small daily actions create lasting habits and mental toughness</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Develops Character</h3>
                      <p className="challenge-body text-sm">Each challenge targets specific masculine virtues and strengths</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Creates Momentum</h3>
                      <p className="challenge-body text-sm">Daily completion builds forward progress and confidence</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Integrates Learning</h3>
                      <p className="challenge-body text-sm">Connects with your courses and journal for complete development</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Today's Challenge */}
        {dailyChallenge && (
          <DailyChallengeCard
            userChallenge={dailyChallenge.userChallenge}
            challenge={dailyChallenge.challenge}
          />
        )}

        {/* Progress and History Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <ProgressTracker />
          <ChallengeHistory />
        </div>
      </div>
    </div>
  );
}