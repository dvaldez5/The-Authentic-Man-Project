import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useAMChat } from '@/contexts/UnifiedAMChatContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UnifiedAMChatProps {
  type: 'bubble' | 'homepage' | 'dashboard';
  defaultExpanded?: boolean;
  showHeader?: boolean;
}

export default function UnifiedAMChat({ 
  type, 
  defaultExpanded = false, 
  showHeader = true 
}: UnifiedAMChatProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [inputMessage, setInputMessage] = useState('');
  
  // Safely access context with try-catch to prevent crashes
  let messages: any[] = [];
  let loading = false;
  let isAuthenticated = false;
  let userName: string | null = null;
  let sendMessage = async (message: string) => {};
  
  try {
    const chatContext = useAMChat();
    messages = chatContext.messages;
    loading = chatContext.loading;
    isAuthenticated = chatContext.isAuthenticated;
    userName = chatContext.userName;
    sendMessage = chatContext.sendMessage;
  } catch (error) {
    console.warn('UnifiedAMChat: Context not available yet');
    // Return null if context is not ready to prevent crash
    if (type === 'bubble') {
      return null;
    }
  }
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;
    
    const message = inputMessage.trim();
    setInputMessage('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Bubble implementation
  if (type === 'bubble') {
    if (!isExpanded) {
      return (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed right-4 bottom-4 z-50 bg-primary hover:bg-primary/90 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all hover:scale-105"
          aria-label="Open AM Chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      );
    }

    return (
      <Card className="fixed right-4 bottom-4 z-50 w-[380px] h-[500px] flex flex-col bg-background shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">AM Chat</h3>
            <p className="text-xs text-muted-foreground">
              {isAuthenticated ? `Hey ${userName}` : 'Your personal development mentor'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                {isAuthenticated 
                  ? `Welcome back, ${userName}. What's on your mind today?`
                  : "Ask me anything about becoming the man you're meant to be."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Homepage implementation
  if (type === 'homepage') {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-card/95 backdrop-blur">
        {showHeader && (
          <div className="p-6 border-b">
            <h3 className="text-2xl font-bold">Talk to AM</h3>
            <p className="text-muted-foreground mt-1">
              {isAuthenticated 
                ? `Welcome back, ${userName}. Share what's on your mind.`
                : "Your 24/7 mentor for authentic masculinity and personal growth."}
            </p>
          </div>
        )}
        
        <ScrollArea ref={scrollAreaRef} className="h-[400px] p-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Start a conversation with AM about your goals, challenges, or questions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-6 border-t">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask AM anything..."
              className="flex-1 px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              size="lg"
              className="px-6"
            >
              Send
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Dashboard implementation
  return (
    <Card className="h-full flex flex-col bg-card">
      {showHeader && (
        <div className="p-4 border-b">
          <h3 className="font-semibold">AM Chat</h3>
          <p className="text-xs text-muted-foreground">
            {isAuthenticated ? `Hey ${userName}, let's talk` : 'Your personal mentor'}
          </p>
        </div>
      )}
      
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              {isAuthenticated 
                ? "What's on your mind today? I'm here to help you grow."
                : "Start your journey with a conversation."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}