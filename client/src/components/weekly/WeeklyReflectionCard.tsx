import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Target, Plus, X } from 'lucide-react';
import { createGoalVisualization, detectGoalCategory, GOAL_CATEGORIES, type GoalCategory } from '@/lib/visualization-prompts';

interface WeeklyReflectionData {
  lessons: Array<{ id: number; title: string }>;
  challenges: Array<{ id: number; title: string }>;
  milestones: string[];
  weeklyGoalsCount?: number;
}

interface WeeklyReflectionCardProps {
  data: WeeklyReflectionData;
  onSubmit: (reflection: { 
    reflection: string; 
    emoji: string; 
    pinned: boolean;
    weeklyGoals: {goal: string, category: string}[];
    goalVisualizations: string[];
  }) => void;
  isSubmitting?: boolean;
  isCompleted?: boolean;
}

export default function WeeklyReflectionCard({ data, onSubmit, isSubmitting = false, isCompleted = false }: WeeklyReflectionCardProps) {
  const [reflection, setReflection] = useState('');
  const [emoji, setEmoji] = useState('');
  const [pinned, setPinned] = useState(false);
  const [weeklyGoals, setWeeklyGoals] = useState<{goal: string, category: GoalCategory}[]>([]);
  const [goalVisualizations, setGoalVisualizations] = useState<string[]>([]);
  const [currentGoal, setCurrentGoal] = useState('');

  const addGoal = async () => {
    if (currentGoal.trim() && weeklyGoals.length < 3) {
      try {
        const { category, prompt } = await createGoalVisualization(currentGoal.trim());
        setWeeklyGoals(prev => [...prev, { goal: currentGoal.trim(), category }]);
        setGoalVisualizations(prev => [...prev, prompt]);
        setCurrentGoal('');
      } catch (error) {
        console.error('Failed to create goal visualization:', error);
        // Fallback to basic goal without visualization
        const category = detectGoalCategory(currentGoal.trim());
        setWeeklyGoals(prev => [...prev, { goal: currentGoal.trim(), category }]);
        setGoalVisualizations(prev => [...prev, 'Visualizing achieving this goal with confidence and determination.']);
        setCurrentGoal('');
      }
    }
  };

  const removeGoal = (index: number) => {
    setWeeklyGoals(prev => prev.filter((_, i) => i !== index));
    setGoalVisualizations(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (reflection.trim()) {
      onSubmit({ 
        reflection, 
        emoji, 
        pinned,
        weeklyGoals: weeklyGoals.map(g => ({ goal: g.goal, category: g.category })),
        goalVisualizations 
      });
      
      // Reset form after submission
      setReflection('');
      setEmoji('');
      setPinned(false);
      setWeeklyGoals([]);
      setGoalVisualizations([]);
      setCurrentGoal('');
    }
  };

  // Show completion state if submitted
  if (isCompleted) {
    return (
      <div className="bg-[#1A1A1A] border-[#C47F00]/20 rounded-lg p-6 shadow-lg max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Completion Status - exactly matching challenge style */}
          <div className="flex items-center justify-center gap-2 text-[#C47F00] font-medium">
            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#C47F00]/20 border border-[#C47F00]/40">
              <svg className="w-3 h-3 text-[#C47F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Weekly Reflection Complete</span>
          </div>
          
          {/* Content Box - matching challenge card style */}
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-[#C47F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-white font-semibold">Your Reflection</h3>
            </div>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Your reflection has been saved. Check back next week for your next reflection prompt.
            </p>
            <div className="text-[#C47F00] font-medium text-sm mt-3">
              Goals set this week: {data.weeklyGoalsCount || 0}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] border-[#C47F00]/20 rounded-lg p-6 shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-serif font-bold text-white mb-2">
        Your Weekly Checkpoint
      </h2>
      
      {/* Short onboarding direction: what/why */}
      <p className="text-sm text-neutral-300 font-sans mb-4">
        Take one minute to capture what actually changed for you this week.
      </p>
      
      {/* Why it matters, benefit */}
      <p className="text-sm text-neutral-400 mb-4 font-sans">
        No filters. No hype. Just your honest reflection.
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="reflection" className="block text-sm font-medium text-[#C47F00] mb-2">
            Reflection
          </Label>
          <Textarea
            id="reflection"
            className="min-h-[120px] bg-[#0A0A0A] border-[#C47F00]/30 text-white placeholder:text-neutral-400 focus:border-[#C47F00] resize-none"
            placeholder="What's one thing you did differently this week because of this work?"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
          />
          <p className="text-xs text-neutral-400 mt-2 mb-4">
            Example:<br />
            "I called my dad and had a real conversation."<br />
            "I stopped myself before reacting at work."<br />
            "I didn't do great, but I showed up anyway."
          </p>
        </div>

        <div>
          <Label htmlFor="emoji" className="block text-sm font-medium text-[#C47F00] mt-2 mb-1">
            Week Emoji (Optional)
          </Label>
          <Input
            id="emoji"
            className="w-20 p-2 bg-[#0A0A0A] border-[#C47F00]/30 text-white text-center focus:border-[#C47F00]"
            maxLength={2}
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
          />
        </div>

        {/* Week summary */}
        <div className="mt-6 mb-6">
          <div className="mb-2 text-[#C47F00] font-semibold">This Week You Completed:</div>
          <ul className="list-disc ml-6 text-sm text-neutral-300">
            {data.lessons.map((l) => (
              <li key={l.id}>{l.title}</li>
            ))}
            {data.challenges.map((c) => (
              <li key={c.id}>{c.title}</li>
            ))}
            {data.milestones.map((m, idx) => (
              <li key={idx} className="text-[#C47F00]">{m}</li>
            ))}
          </ul>
        </div>

        {/* Weekly Goals Section */}
        <div data-tour="weekly-goals" className="space-y-4 pt-6 border-t border-[#C47F00]/20">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-[#C47F00]" />
            <h3 className="text-lg font-semibold text-white">This Week's Focus</h3>
          </div>
          
          <p className="text-sm text-neutral-300 mb-4">
            What are 3 specific things you want to accomplish this week? We'll create visualization exercises to help you achieve them.
          </p>

          {/* Add Goal Input */}
          {weeklyGoals.length < 3 && (
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Complete project presentation, Go to gym 4 times, Call my parents"
                value={currentGoal}
                onChange={(e) => setCurrentGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                className="flex-1 bg-[#0A0A0A] border-[#C47F00]/30 text-white placeholder:text-neutral-400 focus:border-[#C47F00]"
              />
              <Button
                onClick={addGoal}
                disabled={!currentGoal.trim()}
                size="sm"
                className="bg-[#C47F00] hover:bg-[#B8730A] text-black"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Display Goals with Visualizations */}
          <div className="space-y-4">
            {weeklyGoals.map((goalData, index) => (
              <Card key={index} className="bg-[#0A0A0A] border-[#C47F00]/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-sm font-medium">
                        {goalData.goal}
                      </CardTitle>
                      <Badge variant="outline" className="mt-2 text-xs bg-[#C47F00]/5 border-[#C47F00]/30 text-[#C47F00]">
                        {GOAL_CATEGORIES[goalData.category]}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => removeGoal(index)}
                      variant="ghost"
                      size="sm"
                      className="text-neutral-400 hover:text-red-400 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-gradient-to-r from-[#C47F00]/10 to-[#D4A574]/10 border border-[#C47F00]/20 p-3 rounded-lg">
                    <h4 className="text-[#C47F00] font-semibold mb-2 flex items-center gap-2 text-sm">
                      <Lightbulb className="h-4 w-4" />
                      Visualization Exercise
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {goalVisualizations[index]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-4">
          <Checkbox
            id="pinned"
            checked={pinned}
            onCheckedChange={(checked) => setPinned(checked === true)}
            className="border-[#C47F00]/30 data-[state=checked]:bg-[#C47F00] data-[state=checked]:border-[#C47F00]"
          />
          <Label htmlFor="pinned" className="text-sm text-neutral-300">
            Pin this reflection to dashboard
          </Label>
        </div>

        <Button
          data-tour="start-reflection-button"
          onClick={handleSubmit}
          disabled={!reflection.trim() || isSubmitting}
          className="w-full bg-[#C47F00] hover:bg-[#B8730A] text-black font-semibold py-3 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Weekly Reflection'}
        </Button>
      </div>
    </div>
  );
}