import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { Send, MessageSquare, Users } from "lucide-react";
import { broadcastUpdate } from "@/hooks/use-cross-instance-sync";

interface Message {
  id: number;
  text: string;
  timestamp: string;
  user: {
    id: number;
    fullName: string;
    initials: string;
  } | null;
}

interface MessagesResponse {
  messages: Message[];
}

interface Channel {
  id: string;
  name: string;
  description: string;
  members: number;
}

interface CommunityChannelChatProps {
  channelId: string;
  channelName: string;
  onClose: () => void;
}

export function CommunityChannelChat({ channelId, channelName, onClose }: CommunityChannelChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch messages for this channel
  const { data: messagesData, isLoading } = useQuery<MessagesResponse>({
    queryKey: [`/api/community/channels/${channelId}/messages`],
    refetchInterval: 5000, // Poll for new messages every 5 seconds
    enabled: !!channelId
  });

  const messages = messagesData?.messages || [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest('POST', `/api/community/channels/${channelId}/messages`, { text });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/community/channels/${channelId}/messages`] });
      setNewMessage("");
      
      // Broadcast message to all other instances for real-time updates
      broadcastUpdate('community_message', { channelId });
    }
  });

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "just now";
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-black border-[#C47F00]">
        <CardHeader className="border-b border-[#C47F00]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#C47F00]" />
              {channelName}
            </CardTitle>
            <Button variant="ghost" onClick={onClose} className="text-[#C47F00] hover:text-white hover:bg-[#C47F00]/20">
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-[#C47F00]">Loading messages...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col bg-black" style={{ 
      height: '100vh',
      maxHeight: '100vh',
      minHeight: '100vh'
    }}>
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-b border-[#C47F00] p-4 bg-black">
        <div className="flex items-center justify-between">
          <div className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#C47F00]" />
            <span className="font-semibold">{channelName}</span>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-[#C47F00] hover:text-white hover:bg-[#C47F00]/20 text-xl">
            ✕
          </Button>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black min-h-0">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-[#C47F00] mx-auto mb-4" />
            <p className="text-white mb-2">No messages yet in this channel</p>
            <p className="text-gray-400 text-sm">Be the first to start the conversation!</p>
          </div>
        ) : (
          messages.map((message: Message) => (
            <div key={message.id} className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-[#C47F00] text-black text-xs font-semibold">
                  {message.user?.initials || "??"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white text-sm">
                    {message.user?.fullName || "Unknown User"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatMessageTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {message.text}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Message Input */}
      <div 
        className="flex-shrink-0 border-t border-[#C47F00] bg-black" 
        style={{ 
          padding: '1rem',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          position: 'sticky',
          bottom: 0,
          zIndex: 10
        }}
      >
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message #${channelName.toLowerCase()}`}
              className="w-full text-white placeholder-gray-400 resize-none rounded-md p-3"
              style={{
                outline: 'none',
                border: '2px solid #C47F00',
                boxShadow: 'none',
                backgroundColor: '#0A0A0A',
                color: 'white',
                minHeight: '44px',
                maxHeight: '120px'
              }}
              rows={2}
              disabled={sendMessageMutation.isPending}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="bg-[#C47F00] hover:bg-[#B8710A] text-black font-semibold"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            {sendMessageMutation.isPending ? (
              "..."
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}