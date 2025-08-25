import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect, Link, useLocation } from "wouter";
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

interface CommunityData {
  channels: Channel[];
}

export default function Community() {
  const { user } = useAuth();
  const { isPWA } = usePWADetection();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  // Fetch real channel data from API
  const { data: channelsData, isLoading: channelsLoading } = useQuery<CommunityData>({
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

  const communityStats = [
    { label: "Active Members", value: "1", icon: Users },
    { label: "Active Channels", value: channels.length.toString(), icon: MessageSquare },
    { label: "Featured Topics", value: channels.filter((c: Channel) => c.featured).length.toString(), icon: Target },
    { label: "Community Growth", value: "New", icon: Star }
  ];

  // Show chat interface if channel is selected
  if (selectedChannel) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <CommunityChannelChat 
          channelId={selectedChannel.id}
          channelName={selectedChannel.name}
          onClose={() => setSelectedChannel(null)}
        />
      </div>
    );
  }

  if (channelsLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className={`container mx-auto px-4 ${paddingClass} pb-8`}>
          <div className="text-center py-12">
            <div className="text-white text-lg">Loading community...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className={`container mx-auto px-4 ${paddingClass} pb-8 space-y-8`}>
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">The AM Community</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Connect with like-minded men on the journey to becoming the best version of themselves.
          </p>
        </div>

        {/* Pod Access Section */}
        <Card className="bg-gradient-to-r from-[#C47F00] to-[#B8710A] border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Your Accountability Pod</h3>
                  <p className="text-white text-opacity-90">Connect with your pod members for daily accountability</p>
                </div>
              </div>
              <Button 
                className="bg-white text-[#C47F00] hover:bg-gray-100 font-semibold"
                onClick={() => setLocation('/pod')}
              >
                View Pod
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {communityStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="bg-white border-gray-200">
                <CardContent className="p-4 text-center">
                  <IconComponent className="w-8 h-8 text-[#C47F00] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-black">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Channel Filter */}
        <div className="flex justify-center space-x-4">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            className={selectedCategory === "all" ? "bg-[#C47F00] hover:bg-[#B8710A] text-white" : "text-white border-gray-500 hover:bg-gray-800"}
          >
            All Channels
          </Button>
          <Button
            variant={selectedCategory === "featured" ? "default" : "outline"}
            onClick={() => setSelectedCategory("featured")}
            className={selectedCategory === "featured" ? "bg-[#C47F00] hover:bg-[#B8710A] text-white" : "text-white border-gray-500 hover:bg-gray-800"}
          >
            Featured
          </Button>
        </div>

        {/* Featured Channels */}
        {selectedCategory === "featured" && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Featured Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChannels.filter((channel: Channel) => channel.featured).map((channel: Channel) => {
                const IconComponent = getChannelIcon(channel.id);
                return (
                  <Card key={channel.id} className="bg-white border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedChannel(channel)}>
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
                        <Button 
                          size="sm" 
                          className="bg-[#C47F00] hover:bg-[#B8710A] text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedChannel(channel);
                          }}
                        >
                          Join Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All Channels */}
        {selectedCategory === "all" && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">All Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChannels.map((channel: Channel) => {
                const IconComponent = getChannelIcon(channel.id);
                return (
                  <Card key={channel.id} className="bg-white border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedChannel(channel)}>
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
                        <Button 
                          size="sm" 
                          className="bg-[#C47F00] hover:bg-[#B8710A] text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedChannel(channel);
                          }}
                        >
                          Join Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {channels.length === 0 && !channelsLoading && (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No channels available</h3>
            <p className="text-gray-400">Community channels will appear here once they're set up.</p>
          </div>
        )}
      </div>
    </div>
  );
}