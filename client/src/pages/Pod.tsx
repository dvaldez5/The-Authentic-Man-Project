import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { detectSimplePWAMode } from '@/lib/simple-pwa';
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { getTopPadding } from "@/utils/responsive-styles";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { broadcastUpdate } from "@/hooks/use-cross-instance-sync";
import { 
  Target, 
  Users, 
  MessageSquare,
  Trophy,
  Calendar,
  Edit3,
  CheckCircle,
  TrendingUp,
  Send
} from "lucide-react";

interface PodMember {
  id: number;
  fullName: string;
  initials: string;
  completedChallenges: number;
  totalReflections: number;
  lastActive: string;
}

interface Pod {
  id: number;
  goalText: string;
  createdAt: string;
}

interface PodMessage {
  id: number;
  podId: number;
  userId: number;
  text: string;
  timestamp: string;
  user: {
    fullName: string;
    initials: string;
  };
}

interface PodData {
  pod: Pod | null;
  members: PodMember[];
}

interface MessagesResponse {
  messages: PodMessage[];
}


export default function Pod() {
  const { user } = useAuth();
  const isPWA = detectSimplePWAMode();
  const { isMobile } = useMobileDetection();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalEditText, setGoalEditText] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // Fetch pod data
  const { data: podData, isLoading: podLoading } = useQuery<PodData>({
    queryKey: ['/api/pod/my-pod'],
    enabled: !!user
  });

  // Fetch pod messages
  const { data: messagesData, isLoading: messagesLoading } = useQuery<MessagesResponse>({
    queryKey: ['/api/pod/messages'],
    refetchInterval: 5000, // Poll for new messages
    enabled: !!user && !!podData?.pod
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest('POST', '/api/pod/messages', { text });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pod/messages'] });
      setNewMessage("");
    }
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async (goalText: string) => {
      return apiRequest('PUT', '/api/pod/goal', { goalText });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pod/my-pod'] });
      setIsEditingGoal(false);
      toast({
        title: "Goal Updated",
        description: "Your pod goal has been updated successfully.",
      });
    }
  });

  // Pod assignment mutation
  const assignPodMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/pod/assign', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pod/my-pod'] });
      
      // Broadcast pod assignment to all other instances
      broadcastUpdate('pod_update');
      
      toast({
        title: "Welcome to your pod!",
        description: "You've been assigned to an accountability pod. Start connecting with your pod members.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment failed",
        description: error.message || "Unable to assign pod. Please try again.",
        variant: "destructive",
      });
    }
  });

  const paddingClass = getTopPadding(isPWA, isMobile, 'main');
  const messages = messagesData?.messages || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (podLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${paddingClass}`}>
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-40 bg-gray-700 rounded"></div>
                <div className="h-96 bg-gray-700 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-60 bg-gray-700 rounded"></div>
                <div className="h-40 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasPod = !!podData?.pod;
  if (!hasPod) {
    return (
      <div className="min-h-screen bg-black pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-4">Join an Accountability Pod</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Accountability pods are small groups of 4-6 men who support each other's growth journey. 
                You'll be matched with others based on your persona and goals for maximum compatibility.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">Small Groups</h3>
                  <p className="text-sm text-muted-foreground">4-6 committed men per pod</p>
                </div>
                <div className="text-center">
                  <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">Weekly Goals</h3>
                  <p className="text-sm text-muted-foreground">Set and track progress together</p>
                </div>
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">Daily Check-ins</h3>
                  <p className="text-sm text-muted-foreground">Share wins and challenges</p>
                </div>
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3"
                onClick={() => assignPodMutation.mutate()}
                disabled={assignPodMutation.isPending}
              >
                {assignPodMutation.isPending ? "Assigning..." : "Request Pod Assignment"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSaveGoal = () => {
    if (!goalEditText.trim()) return;
    updateGoalMutation.mutate(goalEditText.trim());
  };

  const handleEditGoal = () => {
    setGoalEditText(podData?.pod?.goalText || "");
    setIsEditingGoal(true);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "just now";
    }
  };

  const getProgressColor = (completed: number, total: number) => {
    const percentage = (completed / total) * 100;
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-black">
      <div className={`container mx-auto px-4 ${getTopPadding(isPWA, isMobile, 'main')} pb-8 space-y-8`}>
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="challenge-header text-4xl md:text-6xl">My Accountability Pod</h1>
          <p className="challenge-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Your brotherhood of growth and mutual accountability.
          </p>
        </div>
        
        {/* What is a Pod - Informational Card */}
        <Card className="bg-[#1A1A1A] border-[#C47F00]/20 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Target className="h-5 w-5 mr-2 text-[#C47F00]" />
              What is an Accountability Pod?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white leading-relaxed text-base mb-4">
              A pod is a small group (3-5 men) committed to supporting each other's growth. Members share daily wins, 
              challenges, and hold each other accountable to their goals through honest conversation and mutual support.
            </p>
            <ul className="text-neutral-300 space-y-1">
              <li>• Daily check-ins and progress sharing</li>
              <li>• Honest feedback and constructive challenges</li>
              <li>• Celebrating wins and working through setbacks together</li>
              <li>• Building genuine brotherhood and trust</li>
            </ul>
          </CardContent>
        </Card>

        {/* Pod Goal */}
        <Card className="bg-[#1A1A1A] border-[#C47F00]/20 max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center">
                <Target className="h-5 w-5 mr-2 text-[#C47F00]" />
                Pod Goal
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingGoal(!isEditingGoal)}
                className="border-[#C47F00]/30 text-[#C47F00] hover:bg-[#C47F00]/10"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditingGoal ? (
              <div className="space-y-4">
                <Textarea
                  value={goalEditText}
                  onChange={(e) => setGoalEditText(e.target.value)}
                  className="bg-[#0A0A0A] border-[#C47F00]/30 text-white placeholder-neutral-400"
                  rows={3}
                  placeholder="Enter your pod's shared goal..."
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSaveGoal}
                    className="bg-[#C47F00] hover:bg-[#B8710A] text-white"
                    disabled={updateGoalMutation.isPending}
                  >
                    {updateGoalMutation.isPending ? "Saving..." : "Save Goal"}
                  </Button>
                  <Button
                    onClick={() => setIsEditingGoal(false)}
                    variant="outline"
                    className="border-[#C47F00]/30 text-[#C47F00] hover:bg-[#C47F00]/10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-white leading-relaxed text-base">
                {podData?.pod?.goalText || "No goal set yet. Click Edit to add your pod's shared goal."}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Area */}
          <div className="lg:col-span-2 space-y-6">

            {/* Chat Messages */}
            <Card className="bg-[#1A1A1A] border-[#C47F00]/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-[#C47F00]" />
                  Pod Chat
                </CardTitle>
                <CardDescription className="text-neutral-300">
                  Share your daily progress and support your pod members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div key={message.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#C47F00] text-white text-sm">
                          {message.user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-white font-medium text-sm">{message.user.fullName}</span>
                          <span className="text-neutral-400 text-xs">{formatTime(message.timestamp)}</span>
                        </div>
                        <p className="text-neutral-200 text-sm">{message.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {messagesLoading && messages.length === 0 && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C47F00]"></div>
                  </div>
                )}
                
                {messages.length === 0 && !messagesLoading && (
                  <div className="text-center py-8 text-neutral-400">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-neutral-500" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
                
                <div className="flex space-x-3">
                  <Textarea
                    placeholder="Share your progress or encourage your pod..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-[#0A0A0A] border-[#C47F00]/30 text-white placeholder-neutral-400"
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-[#C47F00] hover:bg-[#B8710A] text-white font-semibold px-6"
                  >
                    {sendMessageMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Pod Members */}
          <div className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-black flex items-center">
                  <Users className="h-5 w-5 mr-2 text-[#C47F00]" />
                  Pod Members
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {podData?.members.filter(member => member.id === user?.id).map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-[#C47F00] text-white">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-black font-medium text-sm">{member.fullName}</p>
                          <Badge className="bg-[#C47F00] text-white text-xs">Pod Leader</Badge>
                        </div>
                        <p className="text-gray-500 text-xs">Active now</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getProgressColor(member.completedChallenges, 30)}`}>
                        {member.completedChallenges}
                      </div>
                      <p className="text-gray-600 text-xs">Challenges</p>
                    </div>
                  </div>
                ))}
                
                {/* Placeholder for future members */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm font-medium mb-1">Pod Members Coming Soon</p>
                  <p className="text-gray-500 text-xs">
                    We're matching you with 2-4 other committed men for your accountability pod. 
                    Check back soon for your pod mates!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pod Stats */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-black flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-[#C47F00]" />
                  Pod Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const totalChallenges = podData?.members.reduce((sum, member) => sum + member.completedChallenges, 0) || 0;
                  const totalReflections = podData?.members.reduce((sum, member) => sum + member.totalReflections, 0) || 0;
                  const memberCount = podData?.members.length || 0;
                  const avgChallenges = memberCount > 0 ? Math.round(totalChallenges / memberCount) : 0;
                  
                  return (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#C47F00]">{avgChallenges}</div>
                        <div className="text-sm text-gray-600">Avg Challenges per Member</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-black">{totalChallenges}</div>
                          <div className="text-xs text-gray-600">Total Challenges</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-black">{totalReflections}</div>
                          <div className="text-xs text-gray-600">Total Reflections</div>
                        </div>
                      </div>
                    </>
                  );
                })()}
                
                <div className="text-center pt-2">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-green-400">Strong Performance!</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start bg-gray-100 hover:bg-gray-200 text-black border border-gray-300"
                  onClick={() => {
                    toast({
                      title: "Feature Coming Soon",
                      description: "Weekly goal setting will be available soon.",
                    });
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2 text-[#C47F00]" />
                  Set Weekly Goals
                </Button>
                
                <Button 
                  className="w-full justify-start bg-gray-100 hover:bg-gray-200 text-black border border-gray-300"
                  onClick={() => {
                    toast({
                      title: "Feature Coming Soon", 
                      description: "Pod challenges will be available soon.",
                    });
                  }}
                >
                  <Trophy className="h-4 w-4 mr-2 text-[#C47F00]" />
                  View Pod Challenges
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}