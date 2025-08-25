import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMarketingAnalytics } from "@/hooks/use-marketing-analytics";

const TOTAL_STEPS = 5;

export default function Onboarding() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  // Initialize marketing analytics for conversion funnel tracking
  const { trackInteraction } = useMarketingAnalytics();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState({
    step1: "", // Focus area
    step2: "", // Current challenge
    step3: "", // Learning preference
    step4: "", // Life role
    step5: "", // Goals
  });

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (user.onboardingComplete) {
    return <Redirect to="/dashboard" />;
  }

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      // Track onboarding step progression
      trackInteraction(`onboarding_step_${currentStep}_next`, 'onboarding_section');
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      // Track onboarding step regression
      trackInteraction(`onboarding_step_${currentStep}_back`, 'onboarding_section');
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Track onboarding completion attempt
    trackInteraction('onboarding_complete_submit', 'onboarding_section');
    
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/onboarding", { answers });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      const data = await response.json();
      
      // Track successful onboarding completion
      trackInteraction('onboarding_complete_success', 'onboarding_section');
      
      // Track conversion for Google Ads
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          'send_to': 'AW-835937139',
          'value': 1.0,
          'currency': 'USD'
        });
      }

      // Update user data in auth cache with onboarding completed
      const updatedUser = { ...user, onboardingComplete: true, personaTag: data.personaTag };
      queryClient.setQueryData(['/api/auth/me'], updatedUser);
      
      // Clear tour completion state to ensure tours can start
      localStorage.removeItem('am-project-completed-tours');
      
      // Invalidate subscription cache to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-status'] });

      toast({
        title: "Onboarding Complete!",
        description: `Welcome, ${data.personaTag}. Your personalized learning journey awaits.`,
      });

      // Redirect to dashboard and force tour initiation
      setTimeout(() => {
        localStorage.setItem('force-tour-start', 'true');
        window.location.href = "/dashboard";
      }, 500);
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAnswer = (step: string, value: string) => {
    setAnswers(prev => ({ ...prev, [step]: value }));
  };

  const isStepComplete = (step: number) => {
    return answers[`step${step}` as keyof typeof answers] !== "";
  };

  const canProceed = isStepComplete(currentStep);

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-white border-gray-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-black mb-2">
              Welcome to Your Journey
            </CardTitle>
            <CardDescription className="text-gray-600 mb-4">
              Help us personalize your learning experience
            </CardDescription>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Step {currentStep} of {TOTAL_STEPS}</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-black">
                  Which area do you want to focus on first?
                </h3>
                <RadioGroup
                  value={answers.step1}
                  onValueChange={(value) => updateAnswer("step1", value)}
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300 hover:border-[#C47F00]">
                    <RadioGroupItem value="emotional" id="emotional" />
                    <Label htmlFor="emotional" className="text-black cursor-pointer flex-1">
                      Emotional Intelligence
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300 hover:border-[#C47F00]">
                    <RadioGroupItem value="leadership" id="leadership" />
                    <Label htmlFor="leadership" className="text-black cursor-pointer flex-1">
                      Leadership
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300 hover:border-[#C47F00]">
                    <RadioGroupItem value="mental" id="mental" />
                    <Label htmlFor="mental" className="text-black cursor-pointer flex-1">
                      Mental Resilience
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300 hover:border-[#C47F00]">
                    <RadioGroupItem value="relationships" id="relationships" />
                    <Label htmlFor="relationships" className="text-black cursor-pointer flex-1">
                      Relationships
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-black">
                  What's your biggest challenge right now?
                </h3>
                <Textarea
                  placeholder="Describe the main challenge you're facing in your personal development..."
                  value={answers.step2}
                  onChange={(e) => updateAnswer("step2", e.target.value)}
                  className="bg-white border-gray-300 text-black placeholder-gray-500 min-h-[120px]"
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-black">
                  How do you prefer to learn?
                </h3>
                <RadioGroup
                  value={answers.step3}
                  onValueChange={(value) => updateAnswer("step3", value)}
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300 hover:border-[#C47F00]">
                    <RadioGroupItem value="videos" id="videos" />
                    <Label htmlFor="videos" className="text-black cursor-pointer flex-1">
                      Videos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300 hover:border-[#C47F00]">
                    <RadioGroupItem value="audio" id="audio" />
                    <Label htmlFor="audio" className="text-black cursor-pointer flex-1">
                      Audio/Podcasts
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300 hover:border-[#C47F00]">
                    <RadioGroupItem value="text" id="text" />
                    <Label htmlFor="text" className="text-black cursor-pointer flex-1">
                      Reading/Text
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300 hover:border-[#C47F00]">
                    <RadioGroupItem value="interactive" id="interactive" />
                    <Label htmlFor="interactive" className="text-black cursor-pointer flex-1">
                      Interactive Exercises
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-black">
                  What's your primary life role?
                </h3>
                <RadioGroup
                  value={answers.step4}
                  onValueChange={(value) => updateAnswer("step4", value)}
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300 hover:border-[#C47F00]">
                    <RadioGroupItem value="father" id="father" />
                    <Label htmlFor="father" className="text-black cursor-pointer flex-1">
                      Father
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300 hover:border-[#C47F00]">
                    <RadioGroupItem value="professional" id="professional" />
                    <Label htmlFor="professional" className="text-black cursor-pointer flex-1">
                      Professional/Career-focused
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300 hover:border-[#C47F00]">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student" className="text-black cursor-pointer flex-1">
                      Student
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300 hover:border-[#C47F00]">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="text-black cursor-pointer flex-1">
                      Other
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-black">
                  What do you hope to achieve?
                </h3>
                <Textarea
                  placeholder="Describe in 1-2 sentences what you hope to achieve through this platform..."
                  value={answers.step5}
                  onChange={(e) => updateAnswer("step5", e.target.value)}
                  className="bg-white border-gray-300 text-black placeholder-gray-500 min-h-[120px]"
                />
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep === TOTAL_STEPS ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed || isSubmitting}
                  className="bg-[#C47F00] hover:bg-[#B8710A] text-white font-semibold"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Complete Setup
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="bg-[#C47F00] hover:bg-[#B8710A] text-white font-semibold"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}