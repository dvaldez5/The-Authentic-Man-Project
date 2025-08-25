import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Trophy, ArrowRight } from "lucide-react";
import { LearningPageContainer } from "@/components/learning/LearningPageContainer";
import { useAuth } from "@/hooks/use-auth";


interface Course {
  id: number;
  title: string;
  description: string;
  stages: string[];
  totalLessons: number;
  progress?: {
    completedLessons: number;
    totalLessons: number;
    percentage: number;
  };
}

export default function LearningCourses() {
  const { user } = useAuth();
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ['/api/learning/courses'],
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-[#374151] rounded w-1/3"></div>
            <div className="h-4 bg-[#374151] rounded w-2/3"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-[#374151] rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LearningPageContainer maxWidth="4xl">


      {/* Header */}
      <div className="text-center space-y-4 mb-8" data-tour="learning-title">
        <h1 className="challenge-header text-4xl md:text-6xl">Learning</h1>
        <p className="challenge-body text-lg text-muted-foreground max-w-2xl mx-auto">
          Three foundational courses designed to forge authentic masculine character through structured micro-practices and progressive challenges.
        </p>
      </div>

      {/* How the Learning System Works */}
      <div className="mb-12 bg-white p-8 rounded-xl border border-[#7C4A32] shadow-lg" data-tour="lesson-content">
        <div className="h-1 bg-[#D4AF37] rounded-t-xl -mx-8 -mt-8 mb-6"></div>
        
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="h-6 w-6 text-[#7C4A32]" />
          <h2 className="text-2xl font-bold text-[#7C4A32] font-['Playfair_Display']">How the Learning System Works</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex flex-col items-center mb-4">
              <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-bold text-lg">
                1
              </div>
            </div>
            <h3 className="text-xl font-semibold text-[#7C4A32] mb-2 font-['Playfair_Display']">Progressive Learning</h3>
            <p className="text-black font-['Montserrat'] leading-relaxed">
              Complete lessons in order to unlock the next stage. Each lesson builds on previous knowledge and character development.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex flex-col items-center mb-4">
              <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-bold text-lg">
                2
              </div>
            </div>
            <h3 className="text-xl font-semibold text-[#7C4A32] mb-2 font-['Playfair_Display']">Practical Application</h3>
            <p className="text-black font-['Montserrat'] leading-relaxed">
              Every lesson includes actionable insights and quiz questions to reinforce learning and ensure understanding.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex flex-col items-center mb-4">
              <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-bold text-lg">
                3
              </div>
            </div>
            <h3 className="text-xl font-semibold text-[#7C4A32] mb-2 font-['Playfair_Display']">Character Integration</h3>
            <p className="text-black font-['Montserrat'] leading-relaxed">
              Lessons connect to your journal and daily challenges, creating a complete character development system.
            </p>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" data-tour="course-list">
        {courses?.map((course) => (
          <Card key={course.id} className="bg-white border-[#7C4A32] hover:border-[#D4AF37] transition-colors rounded-xl shadow-lg">
            {/* Gold accent line */}
            <div className="h-1 bg-[#D4AF37] rounded-t-xl"></div>
            
            <CardHeader className="p-8">
              <div className="flex items-center justify-between mb-6">
                <Badge variant="outline" className="border-[#D4AF37] text-[#D4AF37] bg-white font-semibold">
                  {course.stages.length} Stages
                </Badge>
                <div className="flex items-center text-sm text-black font-medium">
                  <BookOpen className="w-4 h-4 mr-1 text-[#7C4A32]" />
                  {course.totalLessons} Lessons
                </div>
              </div>
              
              <CardTitle className="text-2xl font-bold font-['Playfair_Display'] text-[#7C4A32] mb-3">
                {course.title}
              </CardTitle>
              
              <CardDescription className="text-black font-['Montserrat'] leading-relaxed">
                {course.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-0">
              {/* Progress Section */}
              {course.progress && (
                <div className="mb-8 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-black font-['Montserrat'] font-medium">Progress</span>
                    <span className="text-[#D4AF37] font-bold">
                      {course.progress.completedLessons}/{course.progress.totalLessons} completed
                    </span>
                  </div>
                  <div className="w-full bg-[#F3F4F6] rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${course.progress.percentage}%` }}
                    />
                  </div>
                  <div className="text-right text-sm text-[#7C4A32] font-['Montserrat'] font-medium">
                    {course.progress.percentage}%
                  </div>
                </div>
              )}

              {/* Stages Preview */}
              <div className="mb-8">
                <h4 className="text-sm font-bold text-[#7C4A32] mb-4 font-['Montserrat']">Journey Stages</h4>
                <div className="flex flex-wrap gap-2">
                  {course.stages.map((stage, index) => (
                    <span 
                      key={index}
                      className="text-xs px-3 py-2 bg-[#F3F4F6] text-black rounded-lg border border-[#7C4A32] font-['Montserrat'] font-medium"
                    >
                      {stage}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Link href={`/learning/courses/${course.id}`}>
                <Button 
                  className="w-full bg-[#7C4A32] hover:bg-[#D4AF37] text-white font-['Montserrat'] font-semibold py-3 text-base"
                >
                  {course.progress ? 'Continue Journey' : 'Begin Journey'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievement Section */}
      {courses?.some(c => c.progress?.percentage === 100) && (
        <div className="mt-12 p-6 bg-gradient-to-r from-[#7C4A32] to-[#D4AF37] rounded-lg">
          <div className="flex items-center mb-2">
            <Trophy className="w-6 h-6 mr-2 text-white" />
            <h3 className="text-xl font-bold text-white font-['Playfair_Display']">
              Achievement Unlocked
            </h3>
          </div>
          <p className="text-white font-['Montserrat']">
            You've completed foundational courses. Your journey toward authentic masculine character continues.
          </p>
        </div>
      )}

      {/* Philosophy Note */}
      <div className="mt-12 p-6 bg-white border border-[#7C4A32] rounded-lg">
        <h3 className="text-lg font-bold mb-2 text-[#7C4A32] font-['Playfair_Display']">
          The AM Philosophy
        </h3>
        <p className="text-black font-['Montserrat'] leading-relaxed">
          Each course follows the micro-practice methodology: small, consistent actions that compound 
          into lasting character transformation. No overwhelming commitments—just daily progress 
          toward the man you're called to become.
        </p>
      </div>
    </LearningPageContainer>
  );
}