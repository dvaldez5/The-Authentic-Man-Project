import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp } from "lucide-react";

interface UserXP {
  id: number;
  userId: number;
  currentXP: number;
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export function XPChip() {
  const { data: userXP } = useQuery<UserXP>({
    queryKey: ['/api/gamification/xp'],
  });

  const showGamification = true; // Always show XP in production

  if (!showGamification || !userXP) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2" data-tour="xp-chip">
      <Badge variant="outline" className="bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37] px-2 py-1">
        <Star className="w-3 h-3 mr-1" />
        Lv. {userXP.level}
      </Badge>
      
      <Badge variant="outline" className="bg-[#7C4A32]/10 border-[#7C4A32] text-[#7C4A32] px-2 py-1">
        <TrendingUp className="w-3 h-3 mr-1" />
        {userXP.currentXP} XP
      </Badge>

      {userXP.currentStreak > 0 && (
        <Badge variant="outline" className="bg-orange-100 border-orange-300 text-orange-700 px-2 py-1">
          🔥 {userXP.currentStreak}
        </Badge>
      )}
    </div>
  );
}