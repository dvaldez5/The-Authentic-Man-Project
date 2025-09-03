import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import UnifiedAMChat from "@/components/UnifiedAMChat";
import PinnedJournalCard from "@/components/PinnedJournalCard";
import { DailyChallengeCard } from "@/components/challenges/DailyChallengeCard";
import { WeeklyScenarioCard } from "@/components/scenarios/WeeklyScenarioCard";
import { BadgeDisplay } from "@/components/gamification/BadgeDisplay";
import { DailyPromptCard } from "@/components/gamification/DailyPromptCard";
import { detectSimplePWAMode } from '@/lib/simple-pwa';
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { getTopPadding } from "@/utils/responsive-styles";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import OfflineIndicator from "@/components/pwa/OfflineIndicator";

import { 
  BookOpen, 
  Users, 
  MessageSquare, 
  PenTool, 
  Play, 
  Award,
  TrendingUp,
  Target,
  Calendar,
  LogOut
} from "lucide-react";
import { XPChip } from "@/components/gamification/XPChip";

interface DashboardStats {
  // Legacy fields for compatibility
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  currentStreak: number;
  weeklyCompleted: number;
  averageQuizScore: number;
  nextLesson?: {
    id: number;
    title: string;
    courseTitle: string;
    stage: string;
  };
  // New comprehensive progress data
  lessons: {
    total: number;
    completed: number;
    percentage: number;
    weeklyCompleted: number;
  };
  challenges: {
    total: number;
    completed: number;
    percentage: number;
    weeklyCompleted: number;
    currentStreak: number;
  };
  reflections: {
    total: number;
    completed: number;
    percentage: number;
    weeklyCompleted: number;
  };
  streaks: {
    current: number;
    lessons: number;
    challenges: number;
  };
  weeklyGoals: {
    lessons: { completed: number; target: number };
    challenges: { completed: number; target: number };
    reflections: { completed: number; target: number };
  };
}

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const isPWA = detectSimplePWAMode();
  const { isMobile } = useMobileDetection();

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (!user.onboardingComplete) {
    return <Redirect to="/onboarding" />;
  }

  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats']
  });

  const { data: dailyChallenge, isLoading: challengeLoading } = useQuery<{
    userChallenge: any;
    challenge: any;
  }>({
    queryKey: ['/api/daily-challenge']
  });

  const paddingClass = getTopPadding(isPWA, isMobile, 'main');

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-black">

      <div className={`container mx-auto px-4 ${paddingClass} pb-8 space-y-8`}>
        {/* Header */}
        <div className="text-center space-y-4 mb-8" data-tour="dashboard-title">
          <h1 className="challenge-header text-4xl md:text-6xl">Dashboard</h1>
          <p className="challenge-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Your command center for tracking progress, staying accountable, and building authentic masculine character through daily action.
          </p>
        </div>

        {/* Welcome Section */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <p className="text-muted-foreground">Welcome, {user.fullName} •</p>
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
              {user.personaTag || "The Rising Man"}
            </Badge>
          </div>
          
          {/* XP Display */}
          <div className="flex justify-center">
            <div data-tour="xp-display" className="tour-target">
              <XPChip />
            </div>
          </div>
        </div>

        {/* AM Chat Section - COMPLETELY DISABLED */}
        <div className="am-first-element mb-6">
          <UnifiedAMChat type="dashboard" defaultExpanded={true} showHeader={false} />
        </div>

        {/* Badge Display - Achievements */}
        <div data-tour="badges-section">
          <BadgeDisplay userId={user?.id} limit={6} showUnearned={true} />
        </div>

        {/* PWA Integration Components */}
        <div className="mb-6 space-y-4">
          <OfflineIndicator />
          <InstallPrompt />
        </div>



        {/* Progress Overview */}
        <Card className="bg-white border-gray-200 mb-8">
          <CardHeader>
            <CardTitle className="text-black flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-[#C47F00]" />
              Your Progress
            </CardTitle>
            <CardDescription className="text-gray-600">
              Track your journey across all areas of growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            ) : dashboardStats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Learning Progress */}
                <div className="text-center">
                  <div className="mb-3">
                    <BookOpen className="h-8 w-8 text-[#C47F00] mx-auto mb-2" />
                    <h3 className="font-semibold text-black">Learning</h3>
                  </div>
                  <div className="text-3xl font-bold text-black mb-1">
                    {Math.round(dashboardStats.lessons?.percentage || 0)}%
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {dashboardStats.lessons?.completed || 0} of {dashboardStats.lessons?.total || 0} lessons
                  </div>
                  <Progress 
                    value={dashboardStats.lessons?.percentage || 0} 
                    className="h-2"
                  />
                </div>

                {/* Challenge Progress */}
                <div className="text-center">
                  <div className="mb-3">
                    <Target className="h-8 w-8 text-[#C47F00] mx-auto mb-2" />
                    <h3 className="font-semibold text-black">Challenges</h3>
                  </div>
                  <div className="text-3xl font-bold text-black mb-1">
                    {dashboardStats.challenges?.currentStreak || 0}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    day streak
                  </div>
                  <Progress 
                    value={Math.min((dashboardStats.challenges?.currentStreak || 0) * 10, 100)} 
                    className="h-2"
                  />
                </div>

                {/* Reflection Progress */}
                <div className="text-center">
                  <div className="mb-3">
                    <PenTool className="h-8 w-8 text-[#C47F00] mx-auto mb-2" />
                    <h3 className="font-semibold text-black">Reflections</h3>
                  </div>
                  <div className="text-3xl font-bold text-black mb-1">
                    {Math.round(dashboardStats.reflections?.percentage || 0)}%
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {dashboardStats.reflections?.completed || 0} completed
                  </div>
                  <Progress 
                    value={dashboardStats.reflections?.percentage || 0} 
                    className="h-2"
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-center">Unable to load progress data</p>
            )}
          </CardContent>
        </Card>

        {/* Daily Prompt - Gamification Feature */}
        <div data-tour="daily-prompt">
          <DailyPromptCard />
        </div>
        
        {/* Daily Challenge and Weekly Scenario */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div data-tour="daily-challenge">
            {dailyChallenge && !challengeLoading ? (
              <DailyChallengeCard 
                userChallenge={dailyChallenge.userChallenge} 
                challenge={dailyChallenge.challenge} 
              />
            ) : (
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <div data-tour="weekly-scenario">
            <WeeklyScenarioCard />
          </div>
        </div>

        {/* Pinned Journal Entry */}
        <PinnedJournalCard />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="main-navigation">
          <Card className="bg-white border-gray-200 tour-target">
            <CardContent className="p-4 text-center">
              <Button 
                variant="ghost" 
                className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50"
                asChild
              >
                <Link href="/learning">
                  <BookOpen className="h-6 w-6 text-[#C47F00]" />
                  <span className="text-black font-medium">Continue Learning</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 tour-target">
            <CardContent className="p-4 text-center">
              <Button 
                variant="ghost" 
                className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50"
                asChild
              >
                <Link href="/journal">
                  <PenTool className="h-6 w-6 text-[#C47F00]" />
                  <span className="text-black font-medium">Journal</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <Button 
                variant="ghost" 
                className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50"
                asChild
              >
                <Link href="/community">
                  <Users className="h-6 w-6 text-[#C47F00]" />
                  <span className="text-black font-medium">Community</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <Button 
                variant="ghost" 
                className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50"
                asChild
              >
                <Link href="/pod">
                  <MessageSquare className="h-6 w-6 text-[#C47F00]" />
                  <span className="text-black font-medium">My Pod</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}