// Weekly Goal Visualization System
export const GOAL_CATEGORIES = {
  work: 'Work/Career',
  health: 'Health/Fitness', 
  relationships: 'Relationships',
  personal: 'Personal Growth',
  organization: 'Organization/Admin'
} as const;

export type GoalCategory = keyof typeof GOAL_CATEGORIES;

export const detectGoalCategory = (goal: string): GoalCategory => {
  const goalLower = goal.toLowerCase();
  
  // Work/Career keywords
  if (goalLower.includes('work') || goalLower.includes('project') || goalLower.includes('meeting') || 
      goalLower.includes('presentation') || goalLower.includes('client') || goalLower.includes('boss') ||
      goalLower.includes('job') || goalLower.includes('career') || goalLower.includes('deadline') ||
      goalLower.includes('email') || goalLower.includes('report') || goalLower.includes('proposal')) {
    return 'work';
  }
  
  // Health/Fitness keywords
  if (goalLower.includes('workout') || goalLower.includes('exercise') || goalLower.includes('gym') ||
      goalLower.includes('run') || goalLower.includes('weight') || goalLower.includes('fitness') ||
      goalLower.includes('health') || goalLower.includes('sleep') || goalLower.includes('nutrition') ||
      goalLower.includes('diet') || goalLower.includes('cardio') || goalLower.includes('strength')) {
    return 'health';
  }
  
  // Relationships keywords
  if (goalLower.includes('relationship') || goalLower.includes('partner') || goalLower.includes('family') ||
      goalLower.includes('friend') || goalLower.includes('date') || goalLower.includes('conversation') ||
      goalLower.includes('connect') || goalLower.includes('social') || goalLower.includes('call') ||
      goalLower.includes('visit') || goalLower.includes('dinner') || goalLower.includes('time with')) {
    return 'relationships';
  }
  
  // Organization/Admin keywords
  if (goalLower.includes('organize') || goalLower.includes('clean') || goalLower.includes('paperwork') ||
      goalLower.includes('bills') || goalLower.includes('taxes') || goalLower.includes('appointment') ||
      goalLower.includes('schedule') || goalLower.includes('plan') || goalLower.includes('admin') ||
      goalLower.includes('file') || goalLower.includes('declutter') || goalLower.includes('system')) {
    return 'organization';
  }
  
  // Default to personal growth
  return 'personal';
};

export const generateVisualizationPrompt = (goal: string, category: GoalCategory): string => {
  const visualizations = {
    work: [
      `Picture yourself walking into work Monday morning with complete clarity about this goal. See yourself executing each step with confidence and precision. Visualize colleagues and clients responding positively to your focused energy and results.`,
      `Imagine completing this work goal ahead of schedule. Feel the satisfaction of quality execution and the respect you've earned through consistent follow-through. See how this achievement opens new opportunities.`,
      `Visualize the conversation or presentation going exactly as planned. See yourself speaking with authority and conviction, others listening intently, and the positive outcome that creates momentum for your career.`
    ],
    health: [
      `See yourself completing this physical challenge with strength and determination. Feel your body getting stronger, your energy increasing, and the confidence that comes from honoring commitments to yourself.`,
      `Picture yourself waking up each day this week feeling energized and ready. Visualize your body thanking you for the consistent care, and how this physical strength supports every other area of your life.`,
      `Imagine looking in the mirror at the end of the week and seeing the changes - not just physical, but the mental resilience that comes from doing what you said you would do.`
    ],
    relationships: [
      `Visualize this interaction or connection happening naturally and authentically. See both people fully engaged, the conversation flowing with mutual respect, and the relationship deepening through genuine presence.`,
      `Picture yourself approaching this relationship goal with complete confidence and openness. See the other person responding positively to your authentic energy and the meaningful connection that results.`,
      `Imagine the feeling of investing quality time and attention in this relationship. Visualize the gratitude and strengthened bond that comes from showing up consistently for people who matter.`
    ],
    personal: [
      `See yourself embodying this new behavior or habit effortlessly throughout the week. Visualize how this growth creates positive ripple effects in other areas of your life and how others respond to this evolved version of you.`,
      `Picture yourself one week from now, having successfully integrated this personal goal. Feel the increased self-respect and confidence that comes from consistent self-development and following through on growth commitments.`,
      `Imagine the compound effect of this personal investment over time. Visualize how this week's commitment contributes to the man you're becoming and the life you're creating.`
    ],
    organization: [
      `Picture your environment clean, organized, and supporting your success. See yourself moving through your space with ease and efficiency, everything in its place and your mind clear and focused.`,
      `Visualize completing this organizational task and feeling the mental weight lift. See how external order creates internal clarity and how this foundation supports everything else you want to accomplish.`,
      `Imagine the sense of control and capability that comes from handling life's logistics effectively. Picture yourself as someone who manages responsibilities proactively rather than reactively.`
    ]
  };
  
  const prompts = visualizations[category];
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
};

export const createGoalVisualization = async (goal: string): Promise<{ category: GoalCategory; prompt: string }> => {
  const category = detectGoalCategory(goal);
  
  try {
    // Get auth token for API request
    const token = localStorage.getItem('auth_token');
    
    // Request AI-generated visualization from server
    const response = await fetch('/api/generate-goal-visualization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ goal, category }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return { category, prompt: data.visualization };
    }
  } catch (error) {
    console.error('Failed to generate AI visualization:', error);
  }
  
  // Fallback to template-based approach
  const prompt = generateVisualizationPrompt(goal, category);
  return { category, prompt };
};