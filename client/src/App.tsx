import React from "react";
import { Route, Switch, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "next-themes";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { AMChatProvider } from "@/contexts/UnifiedAMChatContext";
import { Toaster } from "@/components/ui/toaster";

// Pages
import Dashboard from "@/pages/Dashboard";
import AuthPage from "@/pages/AuthPage";
import Onboarding from "@/pages/Onboarding";
import LearningCourses from "@/pages/learning/LearningCourses";
import LearningCourseDetail from "@/pages/learning/LearningCourseDetail";
import LearningLessonDetail from "@/pages/learning/LearningLessonDetail";
import Challenges from "@/pages/Challenges";
import WeeklyReflections from "@/pages/weekly/WeeklyReflections";
import Journal from "@/pages/Journal";
import JournalPinned from "@/pages/JournalPinned";
import Settings from "@/pages/Settings";
import SubscriptionPage from "@/pages/SubscriptionPage";
import PWADiagnostic from "@/pages/PWADiagnostic";
import ResetDiscipline from "@/pages/ResetDiscipline";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AMChatProvider>
              <Router>
                <Switch>
                  <Route path="/" component={Dashboard} />
                  <Route path="/login" component={AuthPage} />
                  <Route path="/register" component={AuthPage} />
                  <Route path="/onboarding" component={Onboarding} />
                  <Route path="/learning" component={LearningCourses} />
                  <Route path="/learning/course/:courseId" component={LearningCourseDetail} />
                  <Route path="/learning/lesson/:lessonId" component={LearningLessonDetail} />
                  <Route path="/challenges" component={Challenges} />
                  <Route path="/reflections" component={WeeklyReflections} />
                  <Route path="/journal" component={Journal} />
                  <Route path="/journal/pinned" component={JournalPinned} />
                  <Route path="/settings" component={Settings} />
                  <Route path="/subscription" component={SubscriptionPage} />
                  <Route path="/pwa" component={PWADiagnostic} />
                  <Route path="/reset-discipline" component={ResetDiscipline} />
                </Switch>
              </Router>
            </AMChatProvider>
          </AuthProvider>
        </QueryClientProvider>
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  );
}