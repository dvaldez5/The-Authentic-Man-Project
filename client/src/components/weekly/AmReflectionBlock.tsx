import { Lightbulb, Heart, HelpCircle, Target, TrendingUp, Users, Dumbbell, Brain, Flame, Sparkles, MessageCircle, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AmReflectionBlockProps {
  summary: string;
}

function getContextualIcon(text: string) {
  const lowerText = text.toLowerCase();
  
  // Physical/Exercise related
  if (lowerText.includes('workout') || lowerText.includes('exercise') || lowerText.includes('physical') || lowerText.includes('fitness')) {
    return Dumbbell;
  }
  // Personal development/awareness
  if (lowerText.includes('present') || lowerText.includes('awareness') || lowerText.includes('mindful') || lowerText.includes('spark')) {
    return Sparkles;
  }
  // Communication/relationships
  if (lowerText.includes('conversation') || lowerText.includes('reaching out') || lowerText.includes('significant figures') || lowerText.includes('relationship')) {
    return MessageCircle;
  }
  // Courage/confronting
  if (lowerText.includes('courage') || lowerText.includes('confronting') || lowerText.includes('facing') || lowerText.includes('flame')) {
    return Flame;
  }
  // Growth/progress
  if (lowerText.includes('growth') || lowerText.includes('progress') || lowerText.includes('strides') || lowerText.includes('development')) {
    return TrendingUp;
  }
  // Commitment/dedication
  if (lowerText.includes('commitment') || lowerText.includes('dedication') || lowerText.includes('determination') || lowerText.includes('demonstrated')) {
    return Heart;
  }
  // Learning/balance
  if (lowerText.includes('learning') || lowerText.includes('balanced') || lowerText.includes('approach') || lowerText.includes('meaningful')) {
    return Brain;
  }
  // Challenges/goals
  if (lowerText.includes('challenge') || lowerText.includes('difficult') || lowerText.includes('target') || lowerText.includes('goal')) {
    return Target;
  }
  // Community/connection
  if (lowerText.includes('community') || lowerText.includes('connection') || lowerText.includes('together')) {
    return Users;
  }
  // Achievement/success
  if (lowerText.includes('success') || lowerText.includes('achievement') || lowerText.includes('accomplishment') || lowerText.includes('commendable')) {
    return Star;
  }
  
  return Lightbulb; // Default icon
}

function formatAmReflection(text: string) {
  // Split by sentences and clean up
  let sentences = text.split('.').filter(s => s.trim().length > 0);
  
  // If very short, return as single item
  if (sentences.length <= 1) {
    return [text];
  }
  
  // Look for natural breaking points and group related content
  const points = [];
  let currentPoint = '';
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    
    // Start a new point if the sentence introduces a new concept/topic
    if (currentPoint && (
      sentence.toLowerCase().includes('this week') ||
      sentence.toLowerCase().includes('successfully') ||
      sentence.toLowerCase().includes('completing') ||
      sentence.toLowerCase().includes('your') ||
      sentence.toLowerCase().includes('demonstrated') ||
      (sentence.length > 50 && currentPoint.length > 100) // Natural break for long content
    )) {
      points.push(currentPoint + '.');
      currentPoint = sentence;
    } else {
      currentPoint = currentPoint ? currentPoint + '. ' + sentence : sentence;
    }
  }
  
  // Add the last point
  if (currentPoint) {
    points.push(currentPoint + (currentPoint.endsWith('.') ? '' : '.'));
  }
  
  // Ensure each point is substantial, merge very short ones
  const finalPoints = [];
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (point.length < 30 && finalPoints.length > 0) {
      // Merge short point with previous one
      finalPoints[finalPoints.length - 1] += ' ' + point;
    } else {
      finalPoints.push(point);
    }
  }
  
  return finalPoints.length > 0 ? finalPoints : [text];
}

export default function AmReflectionBlock({ summary }: AmReflectionBlockProps) {
  const paragraphs = formatAmReflection(summary);
  const HeaderIcon = getContextualIcon(summary); // Use first paragraph's context for header
  
  return (
    <Card className="mt-4 bg-[#1A1A1A] border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary text-sm font-medium">
          <HeaderIcon className="h-4 w-4" />
          AM's Reflection
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Dynamic Insights with contextual icons */}
        <div className="space-y-3">
          {paragraphs.map((paragraph, index) => {
            const ParagraphIcon = getContextualIcon(paragraph);
            return (
              <div key={index} className="flex gap-2">
                <ParagraphIcon className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <p className="challenge-body text-sm leading-relaxed">
                  {paragraph}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}