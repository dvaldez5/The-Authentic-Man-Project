import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import WeeklyReflectionCard from './WeeklyReflectionCard';
import { apiRequest } from '@/lib/queryClient';
import { broadcastUpdate } from '@/hooks/use-cross-instance-sync';

interface WeeklyReflectionPromptData {
  shouldShow: boolean;
  data?: {
    lessons: Array<{ id: number; title: string }>;
    challenges: Array<{ id: number; title: string }>;
    milestones: string[];
    weeklyGoalsCount?: number;
  };
  weekStartDate?: string;
  weekEndDate?: string;
  isCompleted?: boolean;
}

export default function WeeklyReflectionPrompt() {
  // DISABLED: Weekly reflections should only be triggered via notifications, 
  // never as modal popups when users log in
  return null;

  // Component disabled - weekly reflections are notification-only