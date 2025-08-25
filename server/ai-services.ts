import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateGoalVisualization(goal: string, category: string): Promise<string> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a performance coach specializing in visualization techniques for men's personal development. Create personalized, detailed visualization exercises that help users mentally rehearse achieving their specific goals.

Guidelines:
- Keep visualizations between 40-80 words
- Focus on specific, sensory details (what they see, feel, hear)
- Include the emotions of success and confidence
- Make it present tense as if already accomplished
- Be motivational but realistic
- Tailor the language to masculine personal development themes
- Include practical elements they can actually visualize

Goal category: ${category}`
        },
        {
          role: "user",
          content: `Create a visualization exercise for this specific goal: "${goal}"`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0].message.content?.trim() || 
           "Visualize yourself successfully achieving this goal with confidence and determination.";
  } catch (error) {
    console.error('Error generating goal visualization:', error);
    // Fallback to basic visualization
    return `Picture yourself accomplishing "${goal}" with complete confidence. See the satisfaction on your face and feel the pride in your achievement. Visualize the positive impact this success creates in your life.`;
  }
}

export async function generateAmReflection(data: {
  reflectionText: string;
  lessonsCompleted: string[];
  challengesCompleted: string[];
  milestonesUnlocked: string[];
  weeklyGoals?: { goal: string; category: string }[];
}): Promise<string> {
  try {
    const { reflectionText, lessonsCompleted, challengesCompleted, milestonesUnlocked, weeklyGoals } = data;
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are AM (Authentic Masculinity), a wise mentor focused on helping men develop authentic strength, emotional intelligence, and purposeful living. Provide thoughtful, encouraging reflection on the user's weekly progress.

Style:
- Warm but direct tone
- Acknowledge specific efforts and growth
- Connect lessons to real-world application
- Offer gentle guidance for continued development
- Keep response to 3-4 sentences, around 60-80 words
- Focus on momentum and authentic progress, not just completion

Respond as AM would - with wisdom, encouragement, and practical insight.`
        },
        {
          role: "user",
          content: `Weekly Reflection: "${reflectionText}"

This week they completed:
- Lessons: ${lessonsCompleted.join(', ') || 'None'}
- Challenges: ${challengesCompleted.length} challenges
- Milestones: ${milestonesUnlocked.join(', ') || 'None'}
${weeklyGoals ? `- Weekly Goals Set: ${weeklyGoals.map(g => g.goal).join(', ')}` : ''}

Provide an AM reflection on their progress.`
        }
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    return response.choices[0].message.content?.trim() || 
           "Your commitment to growth shows in every step you take. Keep building this momentum.";
  } catch (error) {
    console.error('Error generating AM reflection:', error);
    return "Your weekly reflection shows real commitment to growth. Each step forward, no matter how small, builds the foundation for the man you're becoming. Keep this momentum going.";
  }
}