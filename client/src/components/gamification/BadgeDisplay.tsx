import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Target, Shield, Crown, Zap, Users, TrendingUp, Star, Dumbbell, Brain, GraduationCap, BookOpen } from "lucide-react";
import { format } from "date-fns";

interface BadgeData {
  id: number;
  name: string;
  description: string;
  icon: string;
  criteria: any;
  xpReward: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  createdAt: string;
}

interface UserBadge {
  id: number;
  userId: number;
  badgeId: number;
  earnedAt: string;
  badge: BadgeData;
}

const rarityColors = {
  common: "bg-[#7C4A32] border-[#7C4A32] text-white",
  rare: "bg-[#C47F00]/10 border-[#C47F00] text-[#C47F00]", 
  epic: "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]",
  legendary: "bg-gradient-to-r from-[#D4AF37] to-[#C47F00] border-[#D4AF37] text-white"
};

const getBadgeIcon = (iconName: string) => {
  const iconMap = {
    'first-step': Target,
    'scholar': GraduationCap,
    'challenger': Shield,
    'reflective-mind': Brain,
    'level-up': Crown,
    'dedicated': Zap,
    'scenario-master': Users,
    'consistent-growth': TrendingUp,
    'milestone-crusher': Star,
    'unstoppable': Dumbbell,
    'master-of-growth': Crown
  };
  
  const IconComponent = iconMap[iconName as keyof typeof iconMap] || Target;
  return <IconComponent className="w-12 h-12" />;
};

interface BadgeDisplayProps {
  userId?: number;
  limit?: number;
  showUnearned?: boolean;
}

export function BadgeDisplay({ userId, limit = 6, showUnearned = false }: BadgeDisplayProps) {
  const { data: userBadges = [] } = useQuery<UserBadge[]>({
    queryKey: ['/api/gamification/user-badges'],
    enabled: !!userId
  });

  const { data: allBadges = [] } = useQuery<BadgeData[]>({
    queryKey: ['/api/gamification/badges'],
    enabled: showUnearned
  });

  const showGamification = true; // Always show achievements in production

  if (!showGamification) {
    return null;
  }

  const earnedBadgeIds = userBadges.map(ub => ub.badgeId);
  const unearnedBadges = showUnearned ? 
    allBadges.filter(badge => !earnedBadgeIds.includes(badge.id)) : [];

  const displayBadges = userBadges.slice(0, limit);
  const displayUnearned = unearnedBadges.slice(0, Math.max(0, limit - displayBadges.length));

  if (displayBadges.length === 0 && displayUnearned.length === 0) {
    return (
      <Card className="border-gray-700 bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-[#D4AF37]" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Take action and build momentum to unlock your first achievement. Every step forward counts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-700 bg-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-[#D4AF37]" />
          Achievements ({userBadges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Earned badges */}
          {displayBadges.map((userBadge) => (
            <div key={userBadge.id} className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto flex items-center justify-center text-[#C47F00]">
                {getBadgeIcon(userBadge.badge.icon)}
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground">
                  {userBadge.badge.name}
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${rarityColors[userBadge.badge.rarity]}`}
                >
                  {userBadge.badge.rarity === 'common' ? 'Foundation' : userBadge.badge.rarity}
                </Badge>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(userBadge.earnedAt), 'MMM d')}
                </div>
              </div>
            </div>
          ))}

          {/* Unearned badges (grayed out) */}
          {displayUnearned.map((badge) => (
            <div key={badge.id} className="text-center space-y-2 opacity-40">
              <div className="w-16 h-16 mx-auto flex items-center justify-center text-gray-600">
                {getBadgeIcon(badge.icon)}
              </div>
              <div>
                <div className="font-semibold text-sm text-muted-foreground">
                  {badge.name}
                </div>
                <Badge variant="outline" className="text-xs border-gray-400 text-gray-500">
                  Locked
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {userBadges.length > limit && (
          <div className="text-center mt-4">
            <Badge variant="outline" className="text-xs">
              +{userBadges.length - limit} more
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}