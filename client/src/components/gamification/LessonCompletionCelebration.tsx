import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Trophy, Star, Zap, TrendingUp } from "lucide-react";

interface LessonCompletionCelebrationProps {
  xpEarned: number;
  newLevel?: number;
  badgesEarned?: string[];
  onClose: () => void;
}

export function LessonCompletionCelebration({ 
  xpEarned, 
  newLevel, 
  badgesEarned = [], 
  onClose 
}: LessonCompletionCelebrationProps) {
  const [visible, setVisible] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className={`bg-white border-[#D4AF37] border-2 max-w-md w-full transform transition-all duration-300 ${
        animate ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
      }`}>
        <CardContent className="p-6 text-center space-y-4">
          {/* Main Celebration */}
          <div className="space-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-[#D4AF37] to-[#C47F00] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#7C4A32] font-['Playfair_Display']">
              Lesson Complete!
            </h2>
            <p className="text-gray-600 text-sm">
              Another step forward in your journey of growth
            </p>
          </div>

          {/* XP Reward */}
          <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#C47F00]/20 border border-[#D4AF37] rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-[#C47F00]" />
              <span className="font-bold text-[#7C4A32]">+{xpEarned} XP</span>
            </div>
            <p className="text-xs text-[#7C4A32]">Experience Points Earned</p>
          </div>

          {/* Level Up (if applicable) */}
          {newLevel && (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-purple-600">Level {newLevel}!</span>
              </div>
              <p className="text-xs text-purple-600">You've reached a new level</p>
            </div>
          )}

          {/* Badges Earned (if any) */}
          {badgesEarned.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="font-bold text-yellow-600">New Badge!</span>
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {badgesEarned.map((badge, index) => (
                  <span key={index} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Motivational Message */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Star className="w-4 h-4 text-[#D4AF37]" />
              <Star className="w-4 h-4 text-[#D4AF37]" />
              <Star className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <p className="text-sm text-[#7C4A32] font-medium">
              "Progress, not perfection. You're building something lasting."
            </p>
          </div>

          {/* Close Button */}
          <Button 
            onClick={handleClose}
            className="w-full bg-[#7C4A32] hover:bg-[#8B5A3C] text-white"
          >
            Continue Journey
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}