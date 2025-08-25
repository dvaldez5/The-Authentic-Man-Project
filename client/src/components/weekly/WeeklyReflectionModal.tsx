import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

interface WeeklyReflectionData {
  lessons: Array<{ id: number; title: string }>;
  challenges: Array<{ id: number; title: string }>;
  milestones: string[];
}

interface WeeklyReflectionModalProps {
  data: WeeklyReflectionData;
  onSubmit: (reflection: { 
    reflection: string; 
    emoji: string; 
    pinned: boolean;
    weeklyGoals: {goal: string, category: string}[];
    goalVisualizations: string[];
  }) => void;
  isSubmitting?: boolean;
}

export default function WeeklyReflectionModal({ data, onSubmit, isSubmitting = false }: WeeklyReflectionModalProps) {
  const [reflection, setReflection] = useState('');
  const [emoji, setEmoji] = useState('');
  const [pinned, setPinned] = useState(false);

  const handleSubmit = () => {
    if (reflection.trim()) {
      onSubmit({ 
        reflection, 
        emoji, 
        pinned,
        weeklyGoals: [],
        goalVisualizations: []
      });
    }
  };

  return (
    <Card className="bg-[#1A1A1A] border-none mb-8 max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center gap-2 font-playfair">
          <MessageCircle className="h-5 w-5 text-amber-500" />
          Look back. What stood out?
        </CardTitle>
        <p className="text-sm text-neutral-400">
          Every 7 days, pause to lock in growth. This moment is about honesty, clarity, and actually living the things you've learned.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            id="reflection"
            placeholder="Look back. What stood out?"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="min-h-[120px] bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-neutral-500 focus:border-amber-500 resize-none"
            disabled={isSubmitting}
          />
          <p className="text-xs text-neutral-500 mt-2">
            Example: "I actually called my dad and had a real conversation." • "I stopped myself before reacting at work." • Or just: "I didn't do great, but I showed up anyway."
          </p>
        </div>

        <div className="flex gap-4 items-end">
          <div>
            <Label htmlFor="emoji" className="block text-sm font-medium text-neutral-400 mb-1">
              Week Emoji (Optional)
            </Label>
            <Input
              id="emoji"
              className="w-20 p-2 bg-[#0A0A0A] border-[#2A2A2A] text-white text-center focus:border-amber-500"
              maxLength={2}
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="pin" 
              checked={pinned} 
              onCheckedChange={(checked) => setPinned(checked as boolean)}
              className="border-[#2A2A2A] data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
            />
            <Label htmlFor="pin" className="text-sm text-neutral-400">
              Pin this reflection
            </Label>
          </div>
        </div>

        {/* Week summary */}
        <div className="mt-6 p-4 bg-amber-50/10 border border-amber-500/30 rounded-lg">
          <div className="mb-2 text-amber-400 font-semibold">This Week You Completed:</div>
          <ul className="list-disc ml-6 text-sm text-neutral-300">
            {data.lessons.map((l) => (
              <li key={l.id}>{l.title}</li>
            ))}
            {data.challenges.map((c) => (
              <li key={c.id}>{c.title}</li>
            ))}
          </ul>
          {data.milestones.length > 0 && (
            <div className="mt-4">
              <div className="text-amber-400 font-semibold">Milestones Unlocked:</div>
              <ul className="list-disc ml-6 text-sm text-amber-300">
                {data.milestones.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!reflection.trim() || isSubmitting}
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white border-none"
          >
            {isSubmitting ? 'Reflecting...' : 'Submit Reflection'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}