import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, X, RotateCcw, BookOpen, PenTool, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useAuth } from "@/hooks/use-auth";
import { broadcastUpdate } from "@/hooks/use-cross-instance-sync";

import { JournalPrompt } from "@/components/JournalPrompt";
import { EmbeddedScenario } from "@/components/scenarios/EmbeddedScenario";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

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
  quiz: QuizQuestion[];
  courseId: number;
  scenarioId?: number;
  progress?: LessonProgress;
}

export default function LearningLessonDetail() {
  const { lessonId } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showJournaling, setShowJournaling] = useState(false);

  const showXPNotification = (xpEarned: number) => {
    toast({
      title: "Experience Earned!",
      description: `+${xpEarned} XP for completing this lesson`,
      duration: 3000,
    });
  };

  const { data: lesson, isLoading } = useQuery<Lesson>({
    queryKey: [`/api/learning/lessons/${lessonId}`],
    enabled: !!user && !!lessonId
  });

  const progressMutation = useMutation({
    mutationFn: async (data: { lessonId: number; completed: boolean; quizScore?: number }) => {
      console.log('Submitting progress:', data);
      const result = await apiRequest('POST', '/api/learning/lesson-progress', {
        lessonId: data.lessonId,
        completed: data.completed,
        quizScore: data.quizScore,
        completedAt: data.completed ? new Date().toISOString() : null
      });
      const responseData = await result.json();
      console.log('Progress result:', responseData);
      return responseData;
    },
    onSuccess: (data) => {
      console.log('Progress saved successfully:', data);
      
      // Show XP notification
      if (data.xpAwarded && data.xpAwarded > 0) {
        showXPNotification(data.xpAwarded);
      }
      
      // Force immediate data refresh
      queryClient.invalidateQueries({ queryKey: [`/api/learning/lessons/${lessonId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/learning/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/xp'] });
      queryClient.refetchQueries({ queryKey: [`/api/learning/lessons/${lessonId}`] });
      
      // Broadcast lesson completion to all other instances
      broadcastUpdate('lesson_complete', { lessonId: parseInt(lessonId || '0') });
    },
    onError: (error) => {
      console.error('Progress save failed:', error);
    }
  });

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setAnswers({});
    setShowResults(false);
    setQuizScore(null);
  };

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleSubmitQuiz = () => {
    if (!lesson) return;
    
    let correct = 0;
    lesson.quiz.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    
    const score = Math.round((correct / lesson.quiz.length) * 100);
    setQuizScore(score);
    setShowResults(true);
    
    // Update progress - force refresh after completion
    progressMutation.mutate({
      lessonId: lesson.id,
      completed: true,
      quizScore: score
    }, {
      onSuccess: () => {
        console.log('Quiz completed, refreshing data...');
        // Force refresh both lesson and course data
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: [`/api/learning/lessons/${lesson.id}`] });
          queryClient.invalidateQueries({ queryKey: [`/api/learning/courses/${lesson.courseId}`] });
          queryClient.invalidateQueries({ queryKey: ['/api/learning/courses'] });
        }, 500);
      }
    });
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setShowResults(false);
    setQuizScore(null);
  };

  const handleMarkComplete = () => {
    if (!lesson) return;
    
    progressMutation.mutate({
      lessonId: lesson.id,
      completed: true
    });
  };

  const handleBackToCourse = () => {
    if (lesson) {
      setLocation(`/learning/courses/${lesson.courseId}`);
    }
  };

  const handleJournalReflection = () => {
    if (!lesson) return;
    
    // Create a reflection prompt specific to this lesson
    const prompt = `Reflecting on "${lesson.title}":

${lesson.content.substring(0, 200)}...

What stood out to you? How will you apply this in your daily life?

Key insights:
-
-
-

Action steps:
1.
2.
3.`;

    // Navigate to journal with pre-populated content
    const params = new URLSearchParams({
      prompt: prompt,
      lessonId: lesson.id.toString(),
      lessonTitle: lesson.title
    });
    
    setLocation(`/journal?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#F3F4F6] rounded w-1/4"></div>
            <div className="h-12 bg-[#F3F4F6] rounded w-1/2"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-white border border-[#7C4A32] rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white p-6 rounded-lg border border-[#7C4A32] text-center">
            <h2 className="text-2xl font-bold mb-4 text-[#7C4A32] font-['Playfair_Display']">Lesson Not Found</h2>
            <Link href="/learning">
              <Button className="bg-[#7C4A32] hover:bg-[#D4AF37] text-white font-['Montserrat']">Back to Courses</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto w-full px-6 am-header-offset pb-12">


        {/* Navigation */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="text-white hover:text-[#D4AF37] hover:bg-[#7C4A32]/20"
            onClick={handleBackToCourse}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
        </div>

        {/* Lesson Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Badge variant="outline" className="border-[#7C4A32] text-[#7C4A32] bg-white">
              {lesson.stage}
            </Badge>
            {lesson.progress?.completed && (
              <Badge variant="outline" className="border-[#D4AF37] text-[#D4AF37] bg-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
          
          <h1 className="text-5xl font-bold mb-6 font-['Playfair_Display'] text-white">
            {lesson.title}
          </h1>
          
          <div className="flex items-center space-x-4 text-black">
            <span className="text-sm font-['Montserrat']">Lesson {lesson.order}</span>
            <span className="text-sm">•</span>
            <span className="text-sm flex items-center font-['Montserrat']">
              <BookOpen className="w-4 h-4 mr-1 text-[#7C4A32]" />
              {lesson.quiz.length} Quiz Questions
            </span>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="space-y-8">
          <Card className="bg-white border border-[#7C4A32] shadow-lg rounded-xl">
            <CardHeader className="p-8">
              {/* Gold accent line */}
              <div className="h-1 bg-[#D4AF37] rounded-t-xl -mx-8 -mt-8 mb-6"></div>
              <CardTitle className="text-2xl font-bold font-['Playfair_Display'] text-[#7C4A32]">
                Lesson Content
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="prose prose-black max-w-none text-black font-['Montserrat'] leading-relaxed">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-[#7C4A32] font-['Playfair_Display'] mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold text-[#7C4A32] font-['Playfair_Display'] mb-3 mt-6" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-[#7C4A32] font-['Playfair_Display'] mb-2 mt-4" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 text-black font-['Montserrat']" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2 text-black" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2 text-black" {...props} />,
                    table: ({node, ...props}) => <table className="w-full border-collapse border border-[#7C4A32] mb-4 rounded-lg overflow-hidden" {...props} />,
                    thead: ({node, ...props}) => <thead className="bg-[#7C4A32]" {...props} />,
                    th: ({node, ...props}) => <th className="px-4 py-3 text-left font-semibold text-white" {...props} />,
                    td: ({node, ...props}) => <td className="px-4 py-3 text-black border-b border-[#E5E7EB]" {...props} />,
                    tr: ({node, ...props}) => <tr className="even:bg-[#F9FAFB]" {...props} />,
                    code: ({node, ...props}) => <code className="bg-[#F3F4F6] px-1 py-0.5 rounded text-sm font-mono text-[#7C4A32] border border-[#7C4A32]" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#7C4A32] pl-4 italic text-[#7C4A32] mb-4 bg-[#F3F4F6] p-3 rounded" {...props} />
                  }}
                >
                  {lesson.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Embedded Scenario Section */}
          {lesson.scenarioId && (
            <Card className="bg-gradient-to-br from-black to-gray-900 border-2 border-[#7C4A32] shadow-xl rounded-xl">
              <CardHeader className="p-8">
                <div className="h-1 bg-[#E4B768] rounded-t-xl -mx-8 -mt-8 mb-6"></div>
                <CardTitle className="text-2xl font-bold font-['Playfair_Display'] text-[#E4B768]">
                  Step Into This Moment
                </CardTitle>
                <p className="text-gray-300 font-['Montserrat'] mt-2">
                  Before you finish, here's a real-world moment to practice what you've learned.
                </p>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <EmbeddedScenario scenarioId={lesson.scenarioId} />
              </CardContent>
            </Card>
          )}

          {/* Quiz Section */}
          <Card className="bg-white border border-[#7C4A32] shadow-lg rounded-xl">
            <CardHeader className="p-8">
              {/* Gold accent line */}
              <div className="h-1 bg-[#D4AF37] rounded-t-xl -mx-8 -mt-8 mb-6"></div>
              <CardTitle className="text-2xl font-bold font-['Playfair_Display'] text-[#7C4A32]">
                Knowledge Check
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {!showQuiz && !lesson.progress?.completed && (
                <div className="text-center">
                  <p className="text-black mb-4 font-['Montserrat']">
                    Ready to test your understanding? Take the quiz to complete this lesson.
                  </p>
                  <Button 
                    onClick={handleStartQuiz}
                    className="bg-[#7C4A32] hover:bg-[#D4AF37] text-white font-['Montserrat']"
                  >
                    Start Quiz
                  </Button>
                </div>
              )}

              {!showQuiz && lesson.progress?.completed && (
                <div className="text-center space-y-6">
                  {/* XP Reward Animation */}
                  <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#C47F00]/20 border border-[#D4AF37] rounded-lg p-6">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <CheckCircle className="w-8 w-8 text-[#D4AF37]" />
                      <h3 className="text-2xl font-bold text-[#7C4A32] font-['Playfair_Display']">
                        Lesson Mastered!
                      </h3>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <div className="bg-[#7C4A32] text-white px-4 py-2 rounded-full font-bold">
                        +100 XP
                      </div>
                      <div className="text-sm text-[#7C4A32] font-medium">
                        Experience Earned
                      </div>
                    </div>
                    
                    {lesson.progress.quizScore !== undefined && (
                      <div className="bg-white/50 rounded-lg p-3 mb-4">
                        <p className="text-black font-['Montserrat']">
                          Quiz Score: <span className="text-[#D4AF37] font-semibold">{lesson.progress.quizScore}%</span>
                        </p>
                      </div>
                    )}
                    
                    <p className="text-[#7C4A32] text-sm font-['Montserrat'] mb-4">
                      Your dedication to growth is building momentum. Keep pushing forward!
                    </p>
                  </div>

                  {/* Reflection Prompt */}
                  <div className="bg-[#C47F00]/10 border border-[#C47F00] rounded-lg p-4 max-w-md mx-auto">
                    <h4 className="text-lg font-semibold text-[#7C4A32] mb-2 font-['Playfair_Display']">
                      Reflection Prompt
                    </h4>
                    <p className="text-black text-sm font-['Montserrat'] mb-4">
                      Take a moment to reflect on this lesson. What stood out to you? How will you apply this in your daily life?
                    </p>
                    <div className="space-y-2">
                      <Link href={`/journal?${new URLSearchParams({
                        prompt: `Reflecting on "${lesson.title}":\n\n${lesson.content}\n\nWhat stood out to you? How will you apply this in your daily life?\n\nKey insights:\n-\n-\n-\n\nAction steps:\n1.\n2.\n3.`,
                        lessonId: lesson.id.toString(),
                        lessonTitle: lesson.title
                      }).toString()}`}>
                        <Button className="w-full bg-[#7C4A32] hover:bg-[#8B5A3C] text-white">
                          <PenTool className="w-4 h-4 mr-2" />
                          Save to Journal
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        onClick={handleStartQuiz}
                        className="w-full border-[#7C4A32] text-[#7C4A32] hover:bg-[#7C4A32] hover:text-white"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retake Quiz
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {showQuiz && (
                <div className="space-y-6">
                  {lesson.quiz.map((question, qIndex) => (
                    <div key={qIndex} className="space-y-4">
                      <h4 className="text-lg font-semibold text-black font-['Playfair_Display']">
                        Question {qIndex + 1}: {question.question}
                      </h4>
                      
                      <RadioGroup
                        value={answers[qIndex]?.toString()}
                        onValueChange={(value) => handleAnswerChange(qIndex, parseInt(value))}
                        disabled={showResults}
                      >
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value={oIndex.toString()} 
                              id={`q${qIndex}-o${oIndex}`}
                              className="border-[#374151]"
                            />
                            <Label 
                              htmlFor={`q${qIndex}-o${oIndex}`}
                              className={`font-['Montserrat'] cursor-pointer ${
                                showResults 
                                  ? oIndex === question.correctAnswer 
                                    ? 'text-[#D4AF37] font-semibold' 
                                    : answers[qIndex] === oIndex && oIndex !== question.correctAnswer
                                    ? 'text-red-500 font-semibold'
                                    : 'text-black'
                                  : 'text-black hover:text-[#7C4A32]'
                              }`}
                            >
                              {option}
                            </Label>
                            {showResults && oIndex === question.correctAnswer && (
                              <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
                            )}
                            {showResults && answers[qIndex] === oIndex && oIndex !== question.correctAnswer && (
                              <X className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                        ))}
                      </RadioGroup>

                      {showResults && (
                        <div className="bg-white p-4 rounded-lg border border-[#7C4A32]">
                          <p className="text-sm text-black font-['Montserrat']">
                            <strong className="text-[#7C4A32]">Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {!showResults && (
                    <div className="flex justify-center pt-4">
                      <Button 
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(answers).length !== lesson.quiz.length}
                        className="bg-[#7C4A32] hover:bg-[#8B5A3C] text-white"
                      >
                        Submit Quiz
                      </Button>
                    </div>
                  )}

                  {showResults && quizScore !== null && (
                    <div className="text-center space-y-4 pt-4 border-t border-[#7C4A32] bg-white p-6 rounded-lg">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-[#7C4A32] font-['Playfair_Display']">
                          Quiz Results
                        </h3>
                        <div className="text-2xl font-bold text-[#D4AF37]">
                          {quizScore}%
                        </div>
                        <p className="text-black font-['Montserrat']">
                          {quizScore >= 70 ? 'Great work! You\'ve mastered this lesson.' : 'Consider reviewing the content and trying again.'}
                        </p>
                      </div>
                      
                      <div className="flex flex-col space-y-4">
                        {/* Save to Journal Guidance */}
                        <Card className="bg-white border-[#7C4A32] shadow-lg">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <Info className="w-5 h-5 text-[#D4AF37] mt-1 flex-shrink-0" />
                              <div>
                                <h4 className="font-semibold text-[#7C4A32] mb-1">Reflection Prompt</h4>
                                <p className="text-black text-sm mb-3">
                                  Take a moment to reflect on this lesson. What stood out to you? How will you apply this in your daily life?
                                </p>
                                <Button 
                                  onClick={() => handleJournalReflection()}
                                  size="sm"
                                  className="bg-[#7C4A32] hover:bg-[#8A553F] text-white"
                                >
                                  <PenTool className="w-4 h-4 mr-2" />
                                  Save to Journal
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* What's Next */}
                        <Card className="bg-white border-[#7C4A32] shadow-lg">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-[#D4AF37] mt-1 flex-shrink-0" />
                              <div>
                                <h4 className="font-semibold text-[#7C4A32] mb-1">What's Next?</h4>
                                <p className="text-black text-sm mb-3">
                                  Continue building momentum with the next lesson in this course or explore other areas of growth.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="flex justify-center space-x-4">
                          <Button 
                            variant="outline"
                            onClick={handleRetakeQuiz}
                            className="border-[#7C4A32] text-[#7C4A32] hover:bg-[#7C4A32] hover:text-white"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retake Quiz
                          </Button>
                          <Button 
                            onClick={handleBackToCourse}
                            className="bg-[#7C4A32] hover:bg-[#8B5A3C] text-white"
                          >
                            Continue Course
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Alternative completion for content-only lessons */}
              {lesson.quiz.length === 0 && !lesson.progress?.completed && (
                <div className="text-center">
                  <p className="text-[#F3F4F6] mb-4 font-['Montserrat']">
                    Mark this lesson as complete when you've finished reading and practicing.
                  </p>
                  <Button 
                    onClick={handleMarkComplete}
                    className="bg-[#7C4A32] hover:bg-[#8B5A3C] text-white"
                    disabled={progressMutation.isPending}
                  >
                    Mark Complete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}