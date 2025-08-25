import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, CheckCircle, Clock, Play, Lock } from "lucide-react";
import { LearningPageContainer } from "@/components/learning/LearningPageContainer";
import { useAuth } from "@/hooks/use-auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface LessonProgress {
  completed: boolean;
  quizScore?: number;
  completedAt?: string;
}

interface Lesson {
  id: number;
  order: number;
  stage: string;
  title: string;
  content: string;
  quiz: any[];
  progress?: LessonProgress;
}

interface CourseWithLessons {
  id: number;
  title: string;
  description: string;
  stages: string[];
  lessons: Lesson[];
}

export default function LearningCourseDetail() {
  const { courseId } = useParams();
  const { user } = useAuth();
  
  const { data: course, isLoading } = useQuery<CourseWithLessons>({
    queryKey: [`/api/learning/courses/${courseId}`],
    enabled: !!user && !!courseId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#F3F4F6] rounded w-1/4"></div>
            <div className="h-12 bg-[#F3F4F6] rounded w-1/2"></div>
            <div className="h-4 bg-[#F3F4F6] rounded w-3/4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-white border border-[#7C4A32] rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white p-6 rounded-lg border border-[#7C4A32] text-center">
            <h2 className="text-2xl font-bold mb-4 text-[#7C4A32] font-['Playfair_Display']">Course Not Found</h2>
            <p className="text-black mb-6 font-['Montserrat']">The course you're looking for doesn't exist or has been moved.</p>
            <Link href="/learning">
              <Button className="bg-[#7C4A32] hover:bg-[#D4AF37] text-white">
                Back to Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where course exists but no lessons
  if (!course?.lessons || course.lessons.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
          <div className="mb-6">
            <Link href="/learning">
              <Button variant="ghost" className="text-black hover:text-[#7C4A32]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
          </div>
          
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4 font-['Playfair_Display'] text-[#7C4A32]">
              {course.title}
            </h2>
            <p className="text-xl text-black mb-6 font-['Montserrat']">
              {course.description}
            </p>
            <div className="bg-white p-6 rounded-lg border border-[#7C4A32] max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-[#7C4A32] mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2 text-[#7C4A32] font-['Playfair_Display']">No Lessons Available</h3>
              <p className="text-black mb-4 font-['Montserrat']">
                This course is currently being prepared. Lessons will be available soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completedLessons = course?.lessons?.filter(l => l.progress?.completed).length || 0;
  const progressPercentage = course?.lessons?.length > 0 ? Math.round((completedLessons / course.lessons.length) * 100) : 0;

  // Group lessons by stage - null safe
  const lessonsByStage = (course?.lessons || []).reduce((acc, lesson) => {
    if (!acc[lesson.stage]) {
      acc[lesson.stage] = [];
    }
    acc[lesson.stage].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  return (
    <LearningPageContainer>
      {/* Navigation */}
      <div className="mb-6">
        <Link href="/learning">
          <Button variant="ghost" className="text-black hover:text-[#7C4A32]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Link>
      </div>

      {/* Course Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-6 font-['Playfair_Display'] text-white">
          {course.title}
        </h1>
        <p className="text-xl text-[#D4AF37] mb-8 font-['Montserrat'] leading-relaxed">
          {course.description}
        </p>
        
        {/* Progress Overview */}
        <div className="bg-white p-8 rounded-xl border border-[#7C4A32] shadow-lg">
          {/* Gold accent line */}
          <div className="h-1 bg-[#D4AF37] rounded-t-xl -mx-8 -mt-8 mb-6"></div>
          
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#7C4A32] font-['Playfair_Display']">Your Progress</h3>
            <div className="text-[#D4AF37] font-bold font-['Montserrat']">
              {completedLessons}/{course?.lessons?.length || 0} Lessons Complete
            </div>
          </div>
          <div className="w-full bg-[#F3F4F6] rounded-full h-3 mb-3">
            <div 
              className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-right text-sm text-[#7C4A32] font-['Montserrat'] font-medium">{progressPercentage}%</div>
        </div>
      </div>

      {/* Course Structure */}
      <div className="space-y-6">
        {(course?.stages || []).map((stage, stageIndex) => {
            const stageLessons = lessonsByStage[stage] || [];
            const stageCompleted = stageLessons.length > 0 && stageLessons.every(l => l.progress?.completed);
            const stageProgress = stageLessons.length > 0 
              ? stageLessons.filter(l => l.progress?.completed).length / stageLessons.length * 100 
              : 0;

            return (
              <div key={stage} className="space-y-4">
                {/* Stage Header */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      stageCompleted 
                        ? 'bg-[#D4AF37] text-black' 
                        : stageProgress > 0 
                        ? 'bg-[#7C4A32] text-white' 
                        : 'bg-[#F3F4F6] text-[#7C4A32] border border-[#7C4A32]'
                    }`}>
                      {stageIndex + 1}
                    </div>
                    <h2 className="text-2xl font-bold font-['Playfair_Display'] text-[#7C4A32]">
                      {stage}
                    </h2>
                  </div>
                  {stageCompleted && (
                    <CheckCircle className="w-6 h-6 text-[#D4AF37]" />
                  )}
                </div>

                {/* Stage Lessons */}
                <div className="ml-10 space-y-3">
                  {stageLessons.map((lesson, lessonIndex) => {
                    const isCompleted = lesson.progress?.completed;
                    const isPrevCompleted = lessonIndex === 0 || stageLessons[lessonIndex - 1]?.progress?.completed;
                    const isAccessible = lessonIndex === 0 || isPrevCompleted;

                    return (
                      <Card 
                        key={lesson.id} 
                        className={`border transition-colors rounded-xl shadow-md ${
                          isCompleted 
                            ? 'bg-white border-[#D4AF37]' 
                            : isAccessible 
                            ? 'bg-white border-[#7C4A32] hover:border-[#D4AF37]' 
                            : 'bg-[#F3F4F6] border-[#7C4A32] opacity-60'
                        }`}
                      >
                        {/* Gold accent line for completed lessons */}
                        {isCompleted && <div className="h-1 bg-[#D4AF37] rounded-t-xl"></div>}
                        
                        <CardHeader className="pb-3 p-8">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                isCompleted 
                                  ? 'bg-[#D4AF37] text-black' 
                                  : isAccessible 
                                  ? 'bg-[#7C4A32] text-white' 
                                  : 'bg-[#F3F4F6] text-[#7C4A32] border-2 border-[#7C4A32]'
                              }`}>
                                {lesson.order}
                              </div>
                              <div>
                                <CardTitle className={`text-xl font-bold font-['Playfair_Display'] ${
                                  isAccessible ? 'text-[#7C4A32]' : 'text-[#7C4A32]'
                                }`}>
                                  {lesson.title}
                                </CardTitle>
                                <div className={`flex items-center space-x-4 text-sm mt-2 ${
                                  isAccessible ? 'text-black' : 'text-[#7C4A32]'
                                }`}>
                                  <span className="flex items-center font-['Montserrat'] font-medium">
                                    <Clock className="w-4 h-4 mr-1" />
                                    ~3-5 min
                                  </span>
                                  <span className="flex items-center font-['Montserrat'] font-medium">
                                    <BookOpen className="w-4 h-4 mr-1" />
                                    {lesson.quiz.length} quiz questions
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end space-y-1">
                              {isCompleted && (
                                <div className="text-right">
                                  <Badge variant="outline" className="border-[#D4AF37] text-[#D4AF37] bg-white font-semibold">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Complete
                                  </Badge>
                                  {lesson.progress?.quizScore !== undefined && (
                                    <div className="bg-[#7C4A32] text-white px-2 py-1 rounded text-xs font-medium mt-1">
                                      {lesson.progress.quizScore}% Score
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0 p-8">
                          <div className="flex justify-between items-center">
                            <p className={`text-sm font-['Montserrat'] flex-1 mr-6 leading-relaxed ${
                              isAccessible ? 'text-black' : 'text-[#7C4A32]'
                            }`}>
                              {lesson.content.replace(/^#+\s*/gm, '').slice(0, 120)}...
                            </p>
                            
                            {isAccessible ? (
                              <Link href={`/learning/lessons/${lesson.id}`}>
                                <Button 
                                  className={`${
                                    isCompleted 
                                      ? 'bg-[#D4AF37] hover:bg-[#7C4A32]' 
                                      : 'bg-[#7C4A32] hover:bg-[#D4AF37]'
                                  } text-white font-['Montserrat'] font-semibold px-6 py-2`}
                                >
                                  {isCompleted ? 'Review' : 'Start'}
                                  <Play className="w-4 h-4 ml-2" />
                                </Button>
                              </Link>
                            ) : (
                              <Button disabled className="bg-[#374151] text-gray-400">
                                <Lock className="w-4 h-4 mr-2" />
                                Locked
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      {/* Course Completion Message */}
      {progressPercentage === 100 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-[#7C4A32] to-[#D4AF37] rounded-lg">
          <h3 className="text-xl font-bold text-white mb-2 font-['Playfair_Display']">
            Journey Complete
          </h3>
          <p className="text-white font-['Montserrat']">
            Congratulations on completing {course.title}. The practices you've learned are now tools 
            for lifelong character development.
          </p>
        </div>
      )}
    </LearningPageContainer>
  );
}