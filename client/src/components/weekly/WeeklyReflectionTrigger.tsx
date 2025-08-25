import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import WeeklyReflectionModal from './WeeklyReflectionModal';
import { apiRequest } from '@/lib/queryClient';

export default function WeeklyReflectionTrigger() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Mock data for demonstration purposes
  const mockData = {
    lessons: [
      { id: 1, title: "Building Mental Resilience" },
      { id: 2, title: "Emotional Intelligence Foundations" },
      { id: 3, title: "Leadership Under Pressure" }
    ],
    challenges: [
      { id: 1, title: "Morning Routine Consistency" },
      { id: 2, title: "Deep Work Sessions" },
      { id: 3, title: "Gratitude Practice" },
      { id: 4, title: "Physical Exercise" },
      { id: 5, title: "Quality Sleep Schedule" }
    ],
    milestones: [
      "Learning Momentum - 3+ lessons completed",
      "Challenge Champion - 5+ challenges completed",
      "Balanced Growth - Both learning and challenges"
    ]
  };

  const submitReflectionMutation = useMutation({
    mutationFn: async (reflectionData: { reflection: string; emoji: string; pinned: boolean }) => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return apiRequest('/api/weekly-reflections', 'POST', {
        ...reflectionData,
        weekStartDate: startOfWeek.toISOString().split('T')[0],
        weekEndDate: endOfWeek.toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      toast({
        title: 'Reflection Submitted',
        description: 'Your weekly reflection has been saved successfully.',
      });
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/weekly-reflections'] });
    },
    onError: (error) => {
      console.error('Submit reflection error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit reflection. Please try again.',
        variant: 'destructive',
      });
    },
  });

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-[#D4A574] text-white hover:bg-[#B8956B] border-[#D4A574]"
        >
          Test Weekly Reflection
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black border-[#D4A574]">
        <DialogHeader>
          <DialogTitle className="text-white text-center mb-4">
            Look back. What stood out?
          </DialogTitle>
          <p className="text-[#D4A574] text-center text-sm mb-6">
            What felt clear this week? What needs work? What surprised you?
          </p>
        </DialogHeader>
        
        <WeeklyReflectionModal
          data={mockData}
          onSubmit={(reflectionData) => submitReflectionMutation.mutate(reflectionData)}
          isSubmitting={submitReflectionMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}