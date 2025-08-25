import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePWADetection } from "@/hooks/use-pwa-detection";
import { getTopPadding } from "@/utils/responsive-styles";
import { CommunityChannelChat } from "@/components/CommunityChannelChat";
import { 
  Users, 
  MessageSquare, 
  Heart,
  Target,
  Shield,
  Star,
  TrendingUp,
  Coffee,
  Briefcase,
  Home
} from "lucide-react";

const getChannelIcon = (channelId: string) => {
  const iconMap: { [key: string]: any } = {
    global: Users,
    "mental-resilience": Shield,
    leadership: Target,
    fitness: TrendingUp,
    family: Home,
    career: Briefcase,
    relationships: Heart,
    "daily-check-in": Coffee
  };
  return iconMap[channelId] || MessageSquare;
};

interface Channel {
  id: string;
  name: string;
  description: string;
  members: number;
  featured: boolean;
  lastActivity: string;
}

export default function Community() {
  const { user } = useAuth();
  const { isPWA } = usePWADetection();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  // Fetch real channel data from API
  const { data: channelsData, isLoading: channelsLoading } = useQuery({
    queryKey: ['/api/community/channels'],
    enabled: !!user
  });

  if (!user) {
    return <Redirect to="/auth" />;
  }

  const paddingClass = getTopPadding(isPWA, false);

  const channels: Channel[] = channelsData?.channels || [];
  const filteredChannels = selectedCategory === "all" 
    ? channels 
    : channels.filter((channel: Channel) => 
        selectedCategory === "featured" ? channel.featured : true
      );

  // Calculate community stats from real data
  const totalMembers = channels.reduce((sum: number, channel: Channel) => sum + channel.members, 0);
  const communityStats = [
    { label: "Active Members", value: totalMembers.toLocaleString(), icon: Users },
    { label: "Active Channels", value: channels.length.toString(), icon: MessageSquare },
    { label: "Featured Topics", value: channels.filter((c: Channel) => c.featured).length.toString(), icon: Target },
    { label: "Community Growth", value: "Growing", icon: Star }
  ];

  // Show chat interface if channel is selected
  if (selectedChannel) {
    return (
      <div className="min-h-screen bg-black">
        <div className={`container mx-auto px-4 ${paddingClass} pb-8`}>
          <CommunityChannelChat 
            channelId={selectedChannel.id}
            channelName={selectedChannel.name}
            onClose={() => setSelectedChannel(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className={`container mx-auto px-4 ${paddingClass} pb-8 space-y-8`}>
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="challenge-header text-4xl md:text-6xl">Community</h1>
          <p className="challenge-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with like-minded men on their journey to authentic leadership. Join discussions, share insights, and support each other's growth.
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {communityStats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.label} className="bg-white border-gray-200">
                <CardContent className="p-4 text-center">
                  <IconComponent className="h-6 w-6 text-[#C47F00] mx-auto mb-2" />
                  <div className="text-xl font-bold text-black">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Button
            onClick={() => setSelectedCategory("all")}
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            All Channels
          </Button>
          <Button
            onClick={() => setSelectedCategory("featured")}
            variant={selectedCategory === "featured" ? "default" : "outline"}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <Star className="w-4 h-4 mr-2" />
            Featured
          </Button>
        </div>

        {/* Channel Grid */}
        <div className="space-y-6">
          {selectedCategory === "featured" && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Featured Channels</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChannels.filter(channel => channel.featured).map((channel) => {
                  const IconComponent = channel.icon;
                  return (
                    <Card key={channel.id} className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#C47F00] rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-black text-lg">{channel.name}</CardTitle>
                            <CardDescription className="text-gray-600 text-sm">
                              {channel.members.toLocaleString()} members
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-700 text-sm mb-4">{channel.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{channel.lastActivity}</span>
                          <Button size="sm" className="bg-[#C47F00] hover:bg-[#B8710A] text-white">
                            <Link href={`/community/${channel.id}`}>
                              Join Chat
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {selectedCategory === "all" && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">All Channels</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChannels.map((channel) => {
                  const IconComponent = channel.icon;
                  return (
                    <Card key={channel.id} className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#C47F00] rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-black text-lg">
                              {channel.name}
                              {channel.featured && <Badge className="ml-2 bg-[#D4AF37] text-black text-xs">Featured</Badge>}
                            </CardTitle>
                            <CardDescription className="text-gray-600 text-sm">
                              {channel.members.toLocaleString()} members
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-700 text-sm mb-4">{channel.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{channel.lastActivity}</span>
                          <Button size="sm" className="bg-[#C47F00] hover:bg-[#B8710A] text-white">
                            <Link href={`/community/${channel.id}`}>
                              Join Chat
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Community Guidelines */}
        <Card className="bg-gradient-to-r from-[#C47F00] to-[#8B5A00] text-white mt-8">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-4 text-center">Community Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <Shield className="h-8 w-8 mx-auto mb-3 text-yellow-200" />
                <h4 className="font-semibold mb-2">Respect & Honor</h4>
                <p className="text-yellow-100 text-sm">
                  Treat every member with respect. We're all here to grow and support each other.
                </p>
              </div>
              <div>
                <Target className="h-8 w-8 mx-auto mb-3 text-yellow-200" />
                <h4 className="font-semibold mb-2">Stay on Purpose</h4>
                <p className="text-yellow-100 text-sm">
                  Keep conversations focused on growth, leadership, and authentic masculinity.
                </p>
              </div>
              <div>
                <Heart className="h-8 w-8 mx-auto mb-3 text-yellow-200" />
                <h4 className="font-semibold mb-2">Support Others</h4>
                <p className="text-yellow-100 text-sm">
                  Offer encouragement, share wisdom, and celebrate each other's victories.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}