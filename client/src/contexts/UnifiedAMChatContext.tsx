import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface Message {
  role: 'user' | 'am';
  text: string;
  timestamp: string;
}

interface UnifiedAMChatContextType {
  messages: Message[];
  loading: boolean;
  isAuthenticated: boolean;
  userName: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
}

const UnifiedAMChatContext = createContext<UnifiedAMChatContextType | null>(null);

export function AMChatProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Get user's first name from the actual user data
  const userName = user?.fullName ? user.fullName.split(' ')[0] : null;
  const isAuthenticated = !!user;

  const sendMessage = useCallback(async (messageText: string) => {
    const userMessage: Message = {
      role: 'user',
      text: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Use token from auth context with localStorage fallback
      const authToken = token || localStorage.getItem('auth_token');
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }



      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          text: messageText,
          context: isAuthenticated ? 'dashboard' : 'public',
          firstName: userName
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const amMessage: Message = {
        role: 'am',
        text: data.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, amMessage]);
    } catch (error) {
      
      const errorMessage: Message = {
        role: 'am',
        text: isAuthenticated 
          ? "I'm having trouble connecting right now, but I'm here for you. Try again in a moment."
          : "I'm having trouble connecting right now. Please try again in a moment, or sign up to unlock the full AM experience.",
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userName, token]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <UnifiedAMChatContext.Provider value={{
      messages,
      loading,
      isAuthenticated,
      userName,
      sendMessage,
      clearMessages
    }}>
      {children}
    </UnifiedAMChatContext.Provider>
  );
}

export function useAMChat() {
  const context = useContext(UnifiedAMChatContext);
  if (!context) {
    throw new Error('useAMChat must be used within an AMChatProvider');
  }
  return context;
}