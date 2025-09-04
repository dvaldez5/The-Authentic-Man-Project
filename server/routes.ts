import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendWelcomeEmail } from "./email";
import Stripe from "stripe";

import OpenAI from "openai";
import { 
  insertSubscriberSchema, 
  insertContactSchema,
  insertUserSchema,
  insertJournalEntrySchema,
  insertLearningProgressSchema,
  insertLearningCourseSchema,
  insertLearningLessonSchema,
  insertUserChallengeSchema,
  insertWeeklyReflectionSchema,
  insertMessageSchema,
  insertUserNotificationSettingsSchema,
  type UserNotificationSettings,
  // Gamification schemas
  insertUserXPSchema,
  insertBadgeSchema,
  insertUserBadgeSchema,
  insertEventLogSchema,
  insertDailyPromptSchema,
  // Exit intent feedback
  insertExitIntentFeedbackSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { generateGoalVisualization, generateAmReflection } from "./ai-services";
import { handleLandingPage, generateSitemap } from "./programmatic-seo";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  authenticateToken, 
  optionalAuth,
  AuthRequest 
} from "./auth";

// Helper functions for basic persona assignment and content generation
// These will be enhanced with OpenAI integration when API key is provided
function generatePersonaTag(answers: any): string {
  const focusArea = answers.step1 || '';
  const role = answers.step4 || '';

  if (focusArea.toLowerCase().includes('leadership')) {
    return 'The Strategic Leader';
  } else if (focusArea.toLowerCase().includes('emotional')) {
    return 'The Emotional Architect';
  } else if (focusArea.toLowerCase().includes('mental')) {
    return 'The Mental Warrior';
  } else if (role.toLowerCase().includes('father')) {
    return 'The Devoted Father';
  } else {
    return 'The Rising Man';
  }
}

function generateInitialRecommendations(personaTag: string) {
  const recommendations = [
    {
      lessonId: 1,
      title: "Building Mental Resilience",
      description: "Learn the fundamentals of developing unshakeable mental strength."
    },
    {
      lessonId: 2,
      title: "Authentic Leadership Principles",
      description: "Master the art of leading by example in all areas of life."
    },
    {
      lessonId: 3,
      title: "Physical Excellence Foundations",
      description: "Establish sustainable fitness and wellness practices."
    }
  ];
  return recommendations;
}

function generateFollowUpQuestions(text: string): string[] {
  return [
    "What specific action will you take this week to apply this insight?",
    "How does this reflection connect to your larger life goals?"
  ];
}

function generateAffirmation(): string {
  const affirmations = [
    "Your commitment to growth is building the man you're meant to become.",
    "Every reflection strengthens your foundation of authentic leadership.",
    "Your willingness to examine yourself deeply shows true courage.",
    "This honest self-assessment is forging your character."
  ];
  return affirmations[Math.floor(Math.random() * affirmations.length)];
}

async function generateAIReflection(content: string, context: {
  lessonId?: number;
  challengeId?: number;
  scenarioId?: number;
  userId: number;
}): Promise<any> {
  try {
    // Get OpenAI API key from environment
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.warn('OpenAI API key not configured for journal reflections');
      // Return a basic reflection structure
      return {
        questions: !context.scenarioId ? [
          "What emotions came up for you while writing this?",
          "How might you apply what you've learned here?"
        ] : [],
        affirmation: generateAffirmation(),
        insight: "Your willingness to reflect and journal shows a commitment to growth and self-awareness."
      };
    }

    // Build context for the AI prompt
    let contextPrompt = "";
    if (context.lessonId) {
      contextPrompt += `This journal entry follows completion of a learning lesson. `;
    }
    if (context.challengeId) {
      contextPrompt += `This journal entry follows completion of a personal challenge. `;
    }
    if (context.scenarioId) {
      contextPrompt += `This journal entry follows completion of a scenario-based exercise. `;
    }

    // Determine if we need questions based on context
    const includeQuestions = !context.scenarioId; // No questions for scenarios
    
    const systemPrompt = {
      role: 'system',
      content: `You are AM, a wise and supportive personal development mentor. A user has just completed a journal entry about their learning experience. ${contextPrompt}

Your role is to provide thoughtful reflection that helps them process their experience more deeply. Respond with JSON in this exact format:

${includeQuestions ? `{
  "questions": ["question1", "question2"],
  "affirmation": "supportive affirmation",
  "insight": "mentor-like interpretation"
}` : `{
  "affirmation": "supportive affirmation",
  "insight": "mentor-like interpretation"
}`}

Guidelines:
${includeQuestions ? '- Questions should be personalized follow-ups that help them explore their thoughts deeper\n' : ''}- Affirmation should acknowledge their effort and encourage continued growth
- Insight should be a brief, mentor-like interpretation that helps them see patterns or meaning${context.scenarioId ? ', focusing on their decision-making and real-world application' : ''}
- Keep all responses warm, supportive, and focused on growth
- Avoid being overly clinical or generic`
    };

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [systemPrompt, { role: 'user', content: content }],
        temperature: 0.7,
        max_tokens: 400,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const completion = await response.json();
    const aiResponse = JSON.parse(completion.choices[0].message.content);

    return {
      questions: !context.scenarioId ? (aiResponse.questions || [
        "What emotions came up for you while writing this?",
        "How might you apply what you've learned here?"
      ]) : [],
      affirmation: aiResponse.affirmation || generateAffirmation(),
      insight: aiResponse.insight || "Your willingness to reflect shows a commitment to growth."
    };

  } catch (error) {
    console.error('AI reflection generation error:', error);
    // Return fallback reflection on error
    return {
      questions: !context.scenarioId ? [
        "What emotions came up for you while writing this?",
        "How might you apply what you've learned here?"
      ] : [],
      affirmation: generateAffirmation(),
      insight: "Your willingness to reflect and journal shows a commitment to growth and self-awareness."
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Debug endpoint for testing headless/bot access
  app.get('/debug', (req: Request, res: Response) => {
    try {
      const debugInfo = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        userAgent: req.get('User-Agent') || 'NOT_SET',
        headers: req.headers,
        query: req.query,
        ip: req.ip || req.connection.remoteAddress,
        nodeEnv: process.env.NODE_ENV,
        message: 'Debug endpoint working - server is responding correctly'
      };

      console.log('DEBUG ENDPOINT CALLED:', JSON.stringify(debugInfo, null, 2));
      res.status(200).json(debugInfo);
    } catch (error) {
      console.error('DEBUG ENDPOINT ERROR:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace';
      res.status(500).json({ 
        error: errorMessage, 
        stack: errorStack,
        message: 'Debug endpoint failed' 
      });
    }
  });

  // Test email endpoint
  app.post('/api/test-email', async (req: Request, res: Response) => {
    try {
      const { testEmailConnection } = await import('./email');
      await testEmailConnection();
      res.json({ success: true, message: 'Email connection verified' });
    } catch (error) {
      console.error('Email test failed:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Email connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test welcome email endpoint
  app.post('/api/test-welcome-email', async (req: Request, res: Response) => {
    try {
      const { email, firstName } = req.body;
      if (!email || !firstName) {
        return res.status(400).json({ error: 'Email and firstName are required' });
      }

      console.log(`Sending welcome email to ${email} (${firstName})`);
      const result = await sendWelcomeEmail(email, firstName);
      console.log('Email result:', result);
      
      res.json({ 
        success: true, 
        message: 'Welcome email sent successfully',
        messageId: result.messageId
      });
    } catch (error) {
      console.error('Welcome email test failed:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Welcome email send failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Email preview endpoint
  app.get('/email-preview', (req: Request, res: Response) => {
    try {
      const firstName = req.query.firstName as string || 'Daniel';
      const { createWelcomeEmailHTML } = require('./email');
      const emailHTML = createWelcomeEmailHTML(firstName);
      res.send(emailHTML);
    } catch (error) {
      console.error('Email preview error:', error);
      res.status(500).send('Error generating email preview');
    }
  });

  // API routes
  app.post('/api/newsletter', async (req: Request, res: Response) => {
    console.log('Newsletter subscription request received:', req.body);
    try {
      // Validate request body
      const data = insertSubscriberSchema.parse({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
      });

      console.log('Newsletter data validated:', data);

      // Check if subscriber already exists
      const existingSubscriber = await storage.getSubscriberByEmail(data.email);
      if (existingSubscriber) {
        console.log('Subscriber already exists:', existingSubscriber);
        return res.status(409).json({ 
          message: 'This email is already subscribed to our newsletter' 
        });
      }

      // Create subscriber
      console.log('Creating new subscriber...');
      const subscriber = await storage.createSubscriber(data);
      console.log('Subscriber created successfully:', subscriber);

      // PDF download is handled on the frontend

      return res.status(201).json({ 
        message: 'Successfully subscribed to the newsletter',
        subscriberId: subscriber.id
      });
    } catch (error) {
      console.error('Error in newsletter subscription:', error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: 'Failed to subscribe to newsletter' });
    }
  });

  app.post('/api/contact', async (req: Request, res: Response) => {
    console.log('Contact form submission received:', req.body);
    try {
      // Validate request body
      const data = insertContactSchema.parse({
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message,
      });

      console.log('Contact data validated:', data);

      // Create contact form submission
      console.log('Creating new contact submission...');
      const contact = await storage.createContact(data);
      console.log('Contact submission created successfully:', contact);

      return res.status(201).json({ 
        message: 'Contact message sent successfully',
        contactId: contact.id
      });
    } catch (error) {
      console.error('Error in contact form submission:', error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: 'Failed to send contact message' });
    }
  });

  app.get('/api/subscribers', async (req: Request, res: Response) => {
    try {
      const subscribers = await storage.getAllSubscribers();
      return res.status(200).json(subscribers);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve subscribers' });
    }
  });

  app.get('/api/contacts', async (req: Request, res: Response) => {
    try {
      const contacts = await storage.getAllContacts();
      return res.status(200).json(contacts);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve contacts' });
    }
  });

  // AM Chat API Routes
  app.get('/api/ai/chat/history', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { context } = req.query;
      if (!req.userId) {
        // Non-authenticated users get empty history
        return res.json({ messages: [] });
      }
      const messages = await storage.getChatHistory(req.userId, 20);
      res.json({ messages });
    } catch (error: any) {
      console.error('Failed to fetch chat history:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/chat', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { text, context, firstName } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Invalid input' });
      }

      // DEBUG: Log authentication status and name resolution
      console.log('🔍 AM Chat Debug:', {
        hasUserId: !!req.userId,
        userId: req.userId,
        hasAuthHeader: !!req.headers.authorization,
        firstName,
        context,
        userMessage: text.substring(0, 50)
      });

      // CRITICAL: Check if we have userId before proceeding
      if (!req.userId) {
        console.log('❌ AUTHENTICATION FAILURE: No userId found in request');
        console.log('Auth header:', req.headers.authorization?.substring(0, 20) + '...');
      } else {
        console.log('✅ AUTHENTICATION SUCCESS: userId found:', req.userId);
      }

      // Get actual user data to verify name
      let actualUser = null;
      if (req.userId) {
        try {
          actualUser = await storage.getUser(req.userId);
          console.log('🔍 Name Debug - Actual user data:', {
            fullName: actualUser?.fullName,
            firstNameFromClient: firstName,
            actualFirstName: actualUser?.fullName?.split(' ')[0]
          });
        } catch (error) {
          console.error('Error getting user data:', error);
        }
      }

      // Save user message for authenticated users only
      if (req.userId) {
        await storage.createChatMessage({
          userId: req.userId,
          role: 'user',
          text
        });
      }

      // Get OpenAI API key from environment
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        return res.status(500).json({ error: 'OpenAI API key not configured. Please add your OPENAI_API_KEY to enable AI chat functionality.' });
      }

      // Search for relevant content based on user's message
      const relevantResources = await storage.searchContent(text, context);

      // Build resources block for system prompt
      let resourcesBlock = '';
      if (relevantResources.length > 0) {
        resourcesBlock = '\n\nRelevant resources:\n' + 
          relevantResources.map(r => `- [${r.title}](${r.url})`).join('\n');
      }

      // ========================================
      // REAL-TIME CONTEXT AWARENESS ENHANCEMENT
      // ========================================
      let userContextData = {};
      let systemContextData = {};

      try {
        if (req.userId) {
          // LOGGED-IN USER: Gather complete learning context for mentor/best friend mode
          const [
            allCourses,
            userChallenges,
            allChallenges,
            allScenarios,
            userXPData,
            allBlogPosts,
            userBadges
          ] = await Promise.all([
            storage.getAllLearningCourses(),
            storage.getUserChallengeProgress(req.userId),
            storage.getAllChallenges(),
            storage.getAllScenarios(),
            storage.getUserXP(req.userId),
            storage.getPublishedBlogPosts(),
            storage.getUserBadges(req.userId)
          ]);

          // Get user journal and reflection data safely
          const userJournals = await storage.getUserJournalEntries(req.userId).catch(() => []);
          const userReflections = await storage.getUserWeeklyReflections(req.userId).catch(() => []);

          // Calculate course completion stats
          const courseProgress = await Promise.all(
            allCourses.map(async (course: any) => {
              try {
                const lessons = await storage.getLearningLessonsByCourse(course.id);
                const progress = await storage.getCourseProgress(req.userId!, course.id);
                const completedLessons = progress.filter((p: any) => p.completed).length;
                const percentage = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;
                
                return {
                  ...course,
                  totalLessons: lessons.length,
                  completedLessons,
                  percentage,
                  status: percentage === 100 ? 'completed' : percentage > 0 ? 'in-progress' : 'not-started'
                };
              } catch (error) {
                return { ...course, percentage: 0, status: 'not-started' };
              }
            })
          );

          const completedCourses = courseProgress.filter(c => c.status === 'completed').length;
          const inProgressCourses = courseProgress.filter(c => c.status === 'in-progress').length;
          const averageQuizScore = 85; // Placeholder for now

          userContextData = {
            courses: {
              total: allCourses.length,
              completed: completedCourses,
              inProgress: inProgressCourses,
              courseProgress,
              averageQuizScore
            },
            challenges: {
              total: allChallenges.length,
              completed: userChallenges?.completedChallenges || 0,
              recentActivity: userChallenges?.milestones?.slice(-3) || []
            },
            scenarios: {
              total: allScenarios.length
            },
            progress: {
              currentXP: userXPData?.currentXP || 0,
              badges: Array.isArray(userBadges) ? userBadges.length : 0,
              badgeNames: Array.isArray(userBadges) ? userBadges.map((b: any) => b.name).join(', ') : 'None yet'
            },
            journaling: {
              recentEntries: userJournals ? userJournals.length : 0,
              themes: [] // Could extract themes from journal content
            },
            reflections: {
              total: userReflections ? userReflections.length : 0
            },
            blogArticles: {
              total: allBlogPosts.length,
              articles: allBlogPosts.slice(0, 5).map(post => ({
                id: post.id,
                title: post.title,
                excerpt: post.excerpt,
                category: post.category,
                url: `/blog/${post.id}`
              }))
            }
          };

        } else {
          // NON-LOGGED-IN USER: Gather showcase content for intelligent demo mode
          const [
            allCourses,
            allChallenges,
            allScenarios,
            publishedBlogPosts
          ] = await Promise.all([
            storage.getAllLearningCourses(),
            storage.getAllChallenges(),
            storage.getAllScenarios(),
            storage.getPublishedBlogPosts()
          ]);

          systemContextData = {
            courses: {
              total: allCourses.length,
              topics: Array.from(new Set(allCourses.map((c: any) => c.category).filter(Boolean))),
              samples: allCourses.slice(0, 3).map((c: any) => ({ title: c.title, description: c.description }))
            },
            challenges: {
              total: allChallenges.length,
              types: Array.from(new Set(allChallenges.map((c: any) => c.type).filter(Boolean)))
            },
            scenarios: {
              total: allScenarios.length
            },
            freeContent: {
              articles: publishedBlogPosts.length,
              latestArticles: publishedBlogPosts.slice(0, 5).map(post => ({
                id: post.id,
                title: post.title,
                excerpt: post.excerpt,
                category: post.category,
                url: `/blog/${post.id}`
              }))
            }
          };
        }
      } catch (error) {
        console.error('❌ CONTEXT GATHERING FAILED:', error);
        console.error('Error details:', error);
        console.log('🔍 Context Failure Debug - userId still valid?', !!req.userId);
        // If context gathering fails for logged-in users, set minimal context so they get member mode
        if (req.userId) {
          console.log('⚠️ Using fallback context for authenticated user');
          userContextData = {
            courses: { total: 5, completed: 0, inProgress: 0, courseProgress: [] },
            challenges: { total: 70, completed: 0 },
            progress: { currentXP: 450, badges: 0, badgeNames: 'None yet' },
            journaling: { recentEntries: 0 },
            reflections: { total: 0 },
            blogArticles: { total: 0, articles: [] }
          };
        } else {
          console.log('❌ No userId in error handler - will use guest mode');
        }
      }

      // Fetch recent chat history for context (authenticated users only)
      let messagesForPrompt: any[] = [];
      let isFirstInteraction = true;

      // For public users, we can't track history across requests, so assume continuing conversation
      if (!req.userId) {
        // For public users, only greet on their explicit first message indicators
        isFirstInteraction = false;
      } else {
        // For authenticated users, check database history
        const recentMessages = await storage.getChatHistory(req.userId, 10);
        isFirstInteraction = recentMessages.length === 0;
        messagesForPrompt = recentMessages
          .reverse()
          .map(msg => ({
            role: msg.role === 'am' ? 'assistant' : 'user',
            content: msg.text
          }));
      }

      // Enhanced context-aware system prompt with real-time intelligence
      let enhancedSystemPrompt = '';
      
      // Context-aware AM Chat system is now working properly
      
      if (req.userId) {
        // LOGGED-IN USER: Personal mentor and best friend mode with real-time context
        const userData = userContextData as any;
        const inProgressCourse = userData.courses?.courseProgress?.find((c: any) => c.status === 'in-progress');
        const nextSteps = inProgressCourse 
          ? `You're ${inProgressCourse.percentage}% through ${inProgressCourse.title} - ${inProgressCourse.totalLessons - inProgressCourse.completedLessons} lessons left.`
          : `You have ${userData.courses?.total || 0} courses available to start.`;

        enhancedSystemPrompt = `You are "AM," their personal development mentor and best friend. You have real-time access to their complete learning journey:

THEIR CURRENT PROGRESS:
- Courses: ${userData.courses?.completed || 0}/${userData.courses?.total || 0} completed, ${userData.courses?.inProgress || 0} in progress
- ${nextSteps}
- XP: ${userData.progress?.currentXP || 0} points
- Badges: ${userData.progress?.badgeNames || 'None yet'}
- Challenges: ${userData.challenges?.completed || 0}/${userData.challenges?.total || 0} completed
- Journal entries: ${userData.journaling?.recentEntries || 0}
- Weekly reflections: ${userData.reflections?.total || 0}

MENTOR & BEST FRIEND APPROACH - LOGGED-IN MEMBER MODE:
- You are talking to a MEMBER who has access to everything
- Be supportive like a best friend but directive like a mentor
- When they share struggles, empathize first, then provide SPECIFIC ACTIONABLE STEPS from their actual progress
- Reference their real achievements and current progress to build confidence
- Recommend specific courses, lessons, journal prompts, or blog articles based on their actual data
- When recommending blog articles, use their actual titles and refer to them as valuable resources
- For challenges: remind them challenges are automatically served daily when previous ones are completed
- Give concrete next steps based only on their actual available courses and blog content
- Format responses with clear paragraphs (use \\n\\n) and bullet points (use •) for action items
- Bold important action items and recommendations with **text**
- Keep it conversational but structured - like texting a wise friend who knows your whole journey

BLOG ARTICLES AVAILABLE TO RECOMMEND:
${(userContextData as any).blogArticles?.articles?.map((article: any) => `- "${article.title}" (${article.category})`).join('\\n') || 'Loading articles...'}

NEVER mention signup, membership benefits, or redirect to free content - they're already a member with full access.`;

      } else {
        // NON-LOGGED-IN USER: Intelligent showcase mode with real-time content
        const systemData = systemContextData as any;
        const courseCount = systemData.courses?.total || 'many';
        const challengeCount = systemData.challenges?.total || 'multiple';
        const freeArticles = systemData.freeContent?.articles || 'several';

        enhancedSystemPrompt = `You are "AM," a personal development mentor and best friend showcasing The AM Project. You have real-time access to our complete system:

WHAT WE OFFER (UPDATED LIVE):
- ${courseCount} courses covering leadership, discipline, relationships, mental fitness
- ${challengeCount} daily/weekly challenges for transformation
- ${systemData.scenarios?.total || 'Weekly'} real-world scenarios for practice
- ${freeArticles} free articles (no signup required)
- Personal progress tracking and AI-powered guidance

FREE BLOG ARTICLES TO RECOMMEND:
${systemData.freeContent?.latestArticles?.map((article: any) => `- "${article.title}" (${article.category}) - ${article.excerpt}`).join('\\n') || 'Loading articles...'}

SHOWCASE APPROACH:
- Empathize with their struggle first - be a supportive friend
- Provide immediate free help by recommending specific blog articles that match their situation
- Reference actual article titles when relevant to their question
- Then show relevant member benefits that directly solve their problem
- Use bullet points (•) and clear paragraphs (\\n\\n) for easy reading
- Bold key benefits and action items with **text**
- Be warm and genuine, not salesy - like helping a friend see what's available`;
      }

      // Use server-side name verification for authenticated users to prevent data corruption
      let actualFirstName = firstName;
      if (req.userId) {
        try {
          const actualUser = await storage.getUser(req.userId);
          if (actualUser?.fullName) {
            actualFirstName = actualUser.fullName.split(' ')[0];
            console.log('🔧 Name Override - Using server-verified name:', actualFirstName);
          }
        } catch (error) {
          console.error('Name verification error:', error);
        }
      }

      const nameInstruction = actualFirstName ? `The user's first name is ${actualFirstName}. Address them by name when appropriate.` : 'The user\'s name is not known.';
      const greetingInstruction = isFirstInteraction ? 'This is the first interaction - greet with "Hey, what\'s up?" or "Hey [Name], what\'s up?"' : 'This is a continuing conversation - do NOT greet again, just respond naturally to continue the chat.';

      const systemPrompt = {
        role: 'system',
        content: `${enhancedSystemPrompt}

${nameInstruction}
${greetingInstruction}

RESPONSE FORMAT:
- Use proper paragraph breaks (\\n\\n) between thoughts
- Use bullet points (•) for action items and recommendations  
- Bold important items with **text**
- Keep responses to 2-3 well-structured paragraphs maximum
- Always lead with empathy and understanding

SIGNUP CONTEXT: If a non-member shows interest in membership, highlight:
• **Unlimited chat with me (AM)** - personal guidance anytime
• **${(systemContextData as any).courses?.total || 'Complete'} courses** on all areas of growth
• **Personal progress tracking** - I remember your journey and guide next steps
• **Real challenges and scenarios** - practice what you learn
• **Brotherhood community** - connect with other men on the path
[Sign up here](/auth/register)

${req.userId ? '' : 'CRITICAL: You are on a PUBLIC page. For structured courses/curriculum, direct to signup. ONLY recommend free blog articles directly.'}${resourcesBlock}`
      };

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [systemPrompt, ...messagesForPrompt, { role: 'user', content: text }],
          temperature: 0.7,
          max_tokens: 500 // Increased for richer, more structured responses with context
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const completion = await response.json();
      const amReply = completion.choices[0].message.content.trim();

      // Save AM's reply for authenticated users only
      if (req.userId) {
        await storage.createChatMessage({
          userId: req.userId,
          role: 'am',
          text: amReply
        });
      }

      res.json({ reply: amReply });
    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Chat service temporarily unavailable' });
    }
  });

  // Authentication Routes
  // Store registration data temporarily until payment is complete
  const pendingRegistrations = new Map<string, { email: string; passwordHash: string; fullName: string; }>();

  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, fullName } = req.body;
      console.log('Registration attempt:', { email, fullName });

      if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Email, password, and full name are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        console.log('User already exists:', email);
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password and store registration data temporarily
      const passwordHash = await hashPassword(password);
      const registrationKey = Buffer.from(email + Date.now()).toString('base64');
      
      pendingRegistrations.set(registrationKey, {
        email,
        passwordHash,
        fullName
      });

      console.log('Registration prepared:', { email, registrationKey });

      res.status(201).json({
        message: 'Registration prepared - complete payment to activate account',
        registrationKey,
        email: email
      });
    } catch (error) {
      console.error('Registration preparation error:', error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: 'Registration preparation failed' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      console.log(`Login attempt for email: ${email}`);

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log(`User not found for email: ${email}`);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      console.log(`User found: ${user.email}, verifying password...`);

      // Verify password
      const isValidPassword = await comparePassword(password, user.passwordHash);
      if (!isValidPassword) {
        console.log(`Password verification failed for email: ${email}`);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      console.log(`Login successful for email: ${email}`);

      // Generate token
      const token = generateToken(user.id);

      // Return user data without password hash
      const { passwordHash: _, ...userResponse } = user;

      res.status(200).json({
        message: 'Login successful',
        user: userResponse,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Return user data without password hash
      const { passwordHash: _, ...userResponse } = req.user;
      res.status(200).json(userResponse);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user data' });
    }
  });

  // --- Secure Logout (public & idempotent) ---
  app.post('/api/auth/logout', async (req: Request, res: Response) => {
    try {
      // Best-effort session cleanup
      if (req.session) {
        req.session.destroy(() => {});
      }

      // Clear default express-session cookie across subdomains in prod
      res.clearCookie('connect.sid', {
        domain: process.env.NODE_ENV === 'production' ? '.theamproject.com' : undefined,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      // Environment-aware redirect: dev → current origin, prod → marketing domain
      const isProd = process.env.NODE_ENV === 'production';
      const host = req.get('host');
      const proto = req.protocol; // trust proxy is enabled
      const devRedirect = `${proto}://${host}/?loggedOut=1`;
      const prodRedirect = 'https://theamproject.com?loggedOut=1';
      const redirect = isProd ? prodRedirect : devRedirect;

      return res.status(200).json({ ok: true, redirect });
    } catch {
      // Even if something goes wrong, make logout "succeed" with safe redirect
      const isProd = process.env.NODE_ENV === 'production';
      const fallback = isProd ? 'https://theamproject.com?loggedOut=1' : '/?loggedOut=1';
      return res.status(200).json({ ok: true, redirect: fallback });
    }
  });

  // Onboarding Route
  app.post('/api/onboarding', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { answers } = req.body;
      if (!answers) {
        return res.status(400).json({ error: 'Onboarding answers are required' });
      }

      // For now, we'll create a simple persona assignment
      // This will be enhanced with OpenAI when the API key is provided
      const personaTag = generatePersonaTag(answers);

      // Update user with onboarding completion
      await storage.updateUser(req.userId, {
        onboardingAnswers: answers,
        personaTag,
        onboardingComplete: true
      });

      res.status(200).json({
        message: 'Onboarding completed successfully',
        personaTag,
        recommendations: generateInitialRecommendations(personaTag)
      });
    } catch (error) {
      console.error('Onboarding error:', error);
      res.status(500).json({ error: 'Onboarding failed' });
    }
  });

  // Learning Progress Routes
  app.post('/api/lesson/complete', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { lessonId } = req.body;
      if (!lessonId) {
        return res.status(400).json({ error: 'Lesson ID is required' });
      }

      // Check if progress exists
      const existingProgress = await storage.getLearningProgress(req.userId, lessonId);

      if (existingProgress) {
        // Update existing progress
        await storage.updateLearningProgress(req.userId, lessonId, {
          completed: true,
          completedAt: new Date()
        });
      } else {
        // Create new progress record
        await storage.createLearningProgress({
          userId: req.userId,
          lessonId,
          completed: true
        });
      }

      res.status(200).json({ message: 'Lesson completed successfully' });
    } catch (error) {
      console.error('Lesson completion error:', error);
      res.status(500).json({ error: 'Failed to mark lesson as complete' });
    }
  });



  // Journal Routes
  app.post('/api/journal', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { content, lessonId, challengeId, scenarioId, selectedOptionIndex } = req.body;
      if (!content) {
        return res.status(400).json({ error: 'Journal content is required' });
      }

      const entryData = insertJournalEntrySchema.parse({
        userId: req.userId,
        lessonId: lessonId || null,
        challengeId: challengeId || null,
        scenarioId: scenarioId || null,
        selectedOptionIndex: selectedOptionIndex || null,
        text: content, // Map content to text field for existing database
        content: content
      });

      // Create journal entry first
      const entry = await storage.createJournalEntry(entryData);

      // Generate AI reflection using OpenAI
      const aiReflection = await generateAIReflection(content, {
        lessonId,
        challengeId,
        scenarioId,
        userId: req.userId
      });

      // Update the journal entry with AI reflection
      const updatedEntry = await storage.updateJournalEntry(entry.id, {
        aiReflection
      });

      res.status(201).json({
        message: 'Journal entry created successfully',
        entry: updatedEntry
      });
    } catch (error) {
      console.error('Journal creation error:', error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: 'Failed to create journal entry' });
    }
  });

  app.get('/api/journal', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const entries = await storage.getUserJournalEntries(req.userId);
      res.status(200).json(entries);
    } catch (error) {
      console.error('Get journal entries error:', error);
      res.status(500).json({ error: 'Failed to retrieve journal entries' });
    }
  });

  // Pin/Unpin journal entries
  app.post('/api/journal/:id/pin', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const entryId = parseInt(req.params.id);
      const entry = await storage.pinJournalEntry(entryId, req.userId);

      if (!entry) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }

      res.json({ message: 'Journal entry pinned successfully', entry });
    } catch (error) {
      console.error('Pin journal error:', error);
      res.status(500).json({ error: 'Failed to pin journal entry' });
    }
  });

  app.post('/api/journal/:id/unpin', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const entryId = parseInt(req.params.id);
      const entry = await storage.unpinJournalEntry(entryId, req.userId);

      if (!entry) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }

      res.json({ message: 'Journal entry unpinned successfully', entry });
    } catch (error) {
      console.error('Unpin journal error:', error);
      res.status(500).json({ error: 'Failed to unpin journal entry' });
    }
  });

  // Get pinned journal entry for dashboard
  app.get('/api/journal/pinned', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const pinnedEntry = await storage.getPinnedJournalEntry(req.userId);
      res.json({ entry: pinnedEntry });
    } catch (error) {
      console.error('Get pinned journal error:', error);
      res.status(500).json({ error: 'Failed to fetch pinned journal entry' });
    }
  });

  // Add response to AI reflection question
  app.post('/api/journal/:id/ai-response', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const entryId = parseInt(req.params.id);
      const { questionIndex, userResponse } = req.body;

      if (typeof questionIndex !== 'number' || !userResponse?.trim()) {
        return res.status(400).json({ error: 'Question index and response are required' });
      }

      // Get the journal entry
      const entry = await storage.getJournalEntryById(entryId);
      if (!entry || entry.userId !== req.userId) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }

      // Generate AI follow-up response
      let aiFollowUp = '';
      try {
        if (process.env.OPENAI_API_KEY) {
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are AM, a thoughtful mentor. The user just responded to one of your reflection questions. Provide a brief, encouraging follow-up (1-2 sentences) that acknowledges their response and offers gentle insight or encouragement."
              },
              {
                role: "user",
                content: `Original reflection question context: ${(entry.aiReflection as any)?.questions?.[questionIndex] || 'Unknown question'}\n\nUser's response: "${userResponse}"`
              }
            ],
            max_tokens: 150,
            temperature: 0.7,
          });
          aiFollowUp = response.choices[0].message.content?.trim() || '';
        }
      } catch (error) {
        console.error('AI follow-up generation error:', error);
        aiFollowUp = "Thank you for sharing that reflection. Your willingness to dig deeper shows real growth.";
      }

      // Update the journal entry with the new response thread
      const currentThreads = entry.aiResponseThreads || [];
      const newThread = {
        questionIndex,
        userResponse: userResponse.trim(),
        aiFollowUp
      };

      const updatedThreads = [...currentThreads.filter(t => t.questionIndex !== questionIndex), newThread];

      const updatedEntry = await storage.updateJournalEntry(entryId, {
        aiResponseThreads: updatedThreads      });

      res.json({ 
        message: 'Response saved successfully', 
        thread: newThread,
        entry: updatedEntry 
      });
    } catch (error) {
      console.error('AI response save error:', error);
      res.status(500).json({ error: 'Failed to save response' });
    }
  });

  // ===============================
  // CHALLENGE TRACKER API
  // ===============================

  // GET /api/daily-challenge - Get current challenge for user
  app.get('/api/daily-challenge', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if user has a challenge for today or pending from previous days
      let currentChallenge = await storage.getTodaysChallenge(req.userId);

      // getTodaysChallenge returns undefined only when:
      // 1. New day + no pending challenges (yesterday completed or no challenges exist)
      const needsNewChallenge = !currentChallenge;

      if (needsNewChallenge) {
        // Get all challenges ordered by ID (sequential)
        const allChallenges = await storage.getAllChallenges();
        if (allChallenges.length === 0) {
          return res.status(404).json({ error: 'No challenges available' });
        }

        // Always start users at challenge ID 1 for simplicity
        const nextChallengeId = 1;

        // Create new user challenge for today
        currentChallenge = await storage.createUserChallenge({
          userId: req.userId,
          challengeId: nextChallengeId,
          dateIssued: new Date(),
          status: "pending"
        });
      }

      // Get the full challenge details
      if (!currentChallenge) {
        return res.status(500).json({ error: 'Failed to create or retrieve challenge' });
      }

      const challenge = await storage.getChallengeById(currentChallenge.challengeId);
      if (!challenge) {
        return res.status(404).json({ error: 'Challenge content not found' });
      }

      res.json({
        userChallenge: currentChallenge,
        challenge
      });
    } catch (error) {
      console.error('Daily challenge error:', error);
      res.status(500).json({ error: 'Failed to get daily challenge' });
    }
  });

  // POST /api/complete-challenge - Mark challenge as complete with reflection
  app.post('/api/complete-challenge', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { challengeId, reflection } = req.body;

      if (!challengeId || !reflection) {
        return res.status(400).json({ error: 'Challenge ID and reflection are required' });
      }

      const completedChallenge = await storage.completeUserChallenge(req.userId, challengeId, reflection);

      if (!completedChallenge) {
        return res.status(404).json({ error: 'Challenge not found or already completed' });
      }

      // Create a journal entry for the completed challenge
      const journalEntry = await storage.createJournalEntry({
        userId: req.userId,
        content: reflection,
        challengeId: challengeId,
        lessonId: null,
        scenarioId: null
      });

      // Generate AM reflection if OpenAI is available
      let aiReflection = null;
      try {
        console.log('Checking OpenAI API key availability:', !!process.env.OPENAI_API_KEY);
        if (process.env.OPENAI_API_KEY) {
          console.log('Generating AM reflection for challenge completion...');
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

          const completion = await openai.chat.completions.create({
            model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages: [
              {
                role: "system",
                content: `You are AM, a masculine development coach. Generate a brief reflection for a man who just completed a challenge. Be encouraging but direct. Focus on character building and growth.

                Respond with valid JSON only, no additional text:
                {
                  "insight": "Brief insight about their reflection (2-3 sentences)",
                  "affirmation": "Encouraging affirmation (1 sentence)",
                  "questions": ["Thoughtful question 1", "Thoughtful question 2"]
                }`
              },
              {
                role: "user",
                content: `Challenge reflection: "${reflection}"`
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 400
          });

          const aiResponse = completion.choices[0]?.message?.content;
          console.log('OpenAI response received:', !!aiResponse);
          if (aiResponse) {
            try {
              aiReflection = JSON.parse(aiResponse);
              console.log('AI reflection generated successfully');
            } catch (parseError) {
              console.log('AI response parsing error:', parseError);
              console.log('Raw AI response:', aiResponse);
            }
          }
        } else {
          console.log('OpenAI API key not available');
        }
      } catch (aiError) {
        console.log('AI reflection generation error:', aiError);
      }

      // Update journal entry with AI reflection if generated
      if (aiReflection && journalEntry) {
        await storage.updateJournalEntry(journalEntry.id, { aiReflection });
      }

      res.json({
        message: 'Challenge completed successfully',
        userChallenge: completedChallenge,
        journalEntry: journalEntry,
        aiReflection
      });
    } catch (error) {
      console.error('Complete challenge error:', error);
      res.status(500).json({ error: 'Failed to complete challenge' });
    }
  });

  // GET /api/challenges/history - Get user's challenge history (completed only)
  app.get('/api/challenges/history', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const limit = parseInt(req.query.limit as string) || 30;
      const allHistory = await storage.getUserChallengeHistory(req.userId, limit);

      // Filter to only completed challenges - show all completed instances
      const completedHistory = allHistory.filter(item => item.status === "completed");

      res.json({ history: completedHistory });
    } catch (error) {
      console.error('Challenge history error:', error);
      res.status(500).json({ error: 'Failed to get challenge history' });
    }
  });

  // GET /api/challenges/progress - Get user's progress and milestones
  app.get('/api/challenges/progress', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const progress = await storage.getUserChallengeProgress(req.userId);

      res.json({ progress });
    } catch (error) {
      console.error('Challenge progress error:', error);
      res.status(500).json({ error: 'Failed to get challenge progress' });
    }
  });

  // ===============================
  // UNIFIED LEARNING SYSTEM API
  // ===============================

  // GET /api/learning/courses - Get all courses with user progress
  app.get('/api/learning/courses', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const courses = await storage.getAllLearningCourses();

      if (req.userId) {
        const coursesWithProgress = await Promise.all(
          courses.map(async (course) => {
            const lessons = await storage.getLearningLessonsByCourse(course.id);
            const progress = await storage.getCourseProgress(req.userId!, course.id);
            const completedLessons = progress.filter(p => p.completed).length;

            return {
              ...course,
              totalLessons: lessons.length,
              progress: {
                completedLessons,
                totalLessons: lessons.length,
                percentage: lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0
              }
            };
          })
        );

        return res.json(coursesWithProgress);
      }

      const coursesWithCounts = await Promise.all(
        courses.map(async (course) => {
          const lessons = await storage.getLearningLessonsByCourse(course.id);
          return {
            ...course,
            totalLessons: lessons.length
          };
        })
      );

      res.json(coursesWithCounts);
    } catch (error) {
      console.error('Get learning courses error:', error);
      res.status(500).json({ error: 'Failed to retrieve courses' });
    }
  });

  // GET /api/learning/courses/:courseId - Get course detail with lessons
  app.get('/api/learning/courses/:courseId', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ error: 'Invalid course ID' });
      }

      const courseWithLessons = await storage.getLearningCourseWithLessons(courseId);
      if (!courseWithLessons) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (req.userId) {
        const lessonsWithProgress = await Promise.all(
          courseWithLessons.lessons.map(async (lesson) => {
            const progress = await storage.getLearningProgress(req.userId!, lesson.id);
            return {
              ...lesson,
              progress: progress ? {
                completed: progress.completed,
                quizScore: progress.quizScore,
                completedAt: progress.completedAt
              } : null
            };
          })
        );

        return res.json({
          ...courseWithLessons,
          lessons: lessonsWithProgress
        });
      }

      res.json(courseWithLessons);
    } catch (error) {
      console.error('Get learning course detail error:', error);
      res.status(500).json({ error: 'Failed to retrieve course details' });
    }
  });

  // GET /api/learning/lessons/:lessonId - Get lesson detail
  app.get('/api/learning/lessons/:lessonId', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const lessonId = parseInt(req.params.lessonId);
      if (isNaN(lessonId)) {
        return res.status(400).json({ error: 'Invalid lesson ID' });
      }

      const lesson = await storage.getLearningLessonById(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      if (req.userId) {
        const progress = await storage.getLearningProgress(req.userId, lessonId);
        return res.json({
          ...lesson,
          progress: progress ? {
            completed: progress.completed,
            quizScore: progress.quizScore,
            completedAt: progress.completedAt
          } : null
        });
      }

      res.json(lesson);
    } catch (error) {
      console.error('Get learning lesson detail error:', error);
      res.status(500).json({ error: 'Failed to retrieve lesson details' });
    }
  });

  // GET /api/dashboard/stats - Get comprehensive user dashboard statistics
  app.get('/api/dashboard/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // === LESSON PROGRESS ===
      const courses = await storage.getAllLearningCourses();
      let totalLessons = 0;
      let completedLessons = 0;
      let totalQuizScore = 0;
      let quizCount = 0;

      for (const course of courses) {
        const courseWithLessons = await storage.getLearningCourseWithLessons(course.id);
        if (courseWithLessons) {
          totalLessons += courseWithLessons.lessons.length;

          for (const lesson of courseWithLessons.lessons) {
            const progress = await storage.getLearningProgress(req.userId, lesson.id);
            if (progress?.completed) {
              completedLessons++;
              if (progress.quizScore !== null && progress.quizScore !== undefined) {
                totalQuizScore += progress.quizScore;
                quizCount++;
              }
            }
          }
        }
      }

      // === CHALLENGE PROGRESS ===
      const challengeProgress = await storage.getUserChallengeProgress(req.userId);
      const totalChallenges = await storage.getTotalChallengesCount();
      const completedChallenges = challengeProgress.completedChallenges || 0;

      // === REFLECTION PROGRESS ===
      const allReflections = await storage.getUserJournalEntries(req.userId);
      const totalReflections = allReflections.length;
      const reflectionsWithContent = allReflections.filter((r: any) => r.content && r.content.trim().length > 0).length;

      // === STREAK CALCULATION ===
      const recentProgress = await storage.getRecentLearningProgress(req.userId, 30);
      const challengeHistory = await storage.getUserChallengeHistory(req.userId, 30);
      const recentReflections = allReflections.filter((r: any) => {
        const reflectionDate = new Date(r.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return reflectionDate >= thirtyDaysAgo;
      });

      let currentStreak = 0;
      const today = new Date();
      let checkDate = new Date(today);

      // Calculate streak based on any activity (lessons, challenges, or reflections)
      for (let i = 0; i < 30; i++) {
        const dayProgressLessons = recentProgress.filter(p => {
          const progressDate = new Date(p.completedAt || '');
          return progressDate.toDateString() === checkDate.toDateString();
        });

        const dayChallenges = challengeHistory.filter(c => {
          const challengeDate = new Date(c.completedAt || '');
          return challengeDate.toDateString() === checkDate.toDateString();
        });

        const dayReflections = recentReflections.filter((r: any) => {
          const reflectionDate = new Date(r.createdAt);
          return reflectionDate.toDateString() === checkDate.toDateString();
        });

        if (dayProgressLessons.length > 0 || dayChallenges.length > 0 || dayReflections.length > 0) {
          currentStreak++;
        } else if (i > 0) {
          break; // Break streak if no activity found
        }

        checkDate.setDate(checkDate.getDate() - 1);
      }

      // === WEEKLY STATS ===
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const weeklyLessons = recentProgress.filter(p => 
        new Date(p.completedAt || '') >= oneWeekAgo
      ).length;

      const weeklyChallenges = challengeHistory.filter(c => 
        new Date(c.completedAt || '') >= oneWeekAgo
      ).length;

      const weeklyReflections = recentReflections.filter((r: any) => 
        new Date(r.createdAt) >= oneWeekAgo
      ).length;

      // === OVERALL PROGRESS CALCULATION ===
      // Weight different activities for overall progress
      const lessonWeight = 0.4;
      const challengeWeight = 0.3;
      const reflectionWeight = 0.3;

      const lessonProgress = totalLessons > 0 ? (completedLessons / totalLessons) : 0;
      const challengeProgressPercent = totalChallenges > 0 ? (completedChallenges / totalChallenges) : 0;
      const reflectionProgressPercent = totalReflections > 0 ? (reflectionsWithContent / Math.max(totalReflections, 10)) : 0; // Assume target of 10 reflections

      const overallProgress = Math.round(
        (lessonProgress * lessonWeight + 
         challengeProgressPercent * challengeWeight + 
         reflectionProgressPercent * reflectionWeight) * 100
      );

      // === NEXT LESSON ===
      let nextLesson = null;
      for (const course of courses) {
        const courseWithLessons = await storage.getLearningCourseWithLessons(course.id);
        if (courseWithLessons) {
          for (const lesson of courseWithLessons.lessons.sort((a, b) => a.order - b.order)) {
            const progress = await storage.getLearningProgress(req.userId, lesson.id);
            if (!progress?.completed) {
              nextLesson = {
                id: lesson.id,
                title: lesson.title,
                courseTitle: course.title,
                stage: lesson.stage
              };
              break;
            }
          }
          if (nextLesson) break;
        }
      }

      const averageQuizScore = quizCount > 0 ? Math.round(totalQuizScore / quizCount) : 0;

      res.json({
        // Legacy fields for compatibility
        totalLessons,
        completedLessons,
        progressPercentage: overallProgress,
        currentStreak,
        weeklyCompleted: weeklyLessons,
        averageQuizScore,
        nextLesson,

        // New comprehensive progress data
        lessons: {
          total: totalLessons,
          completed: completedLessons,
          percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
          weeklyCompleted: weeklyLessons
        },
        challenges: {
          total: totalChallenges,
          completed: completedChallenges,
          percentage: totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0,
          weeklyCompleted: weeklyChallenges,
          currentStreak: challengeProgress.currentStreak || 0
        },
        reflections: {
          total: totalReflections,
          completed: reflectionsWithContent,
          percentage: totalReflections > 0 ? Math.round((reflectionsWithContent / totalReflections) * 100) : 0,
          weeklyCompleted: weeklyReflections
        },
        streaks: {
          current: currentStreak,
          lessons: challengeProgress.currentStreak || 0,
          challenges: challengeProgress.currentStreak || 0
        },
        weeklyGoals: {
          lessons: { completed: weeklyLessons, target: 5 },
          challenges: { completed: weeklyChallenges, target: 7 },
          reflections: { completed: weeklyReflections, target: 3 }
        }
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
    }
  });

  // POST /api/learning/course - Create new course (Admin only)
  app.post('/api/learning/course', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const courseData = insertLearningCourseSchema.parse(req.body);

      // Validate stages array has exactly 5 stages
      const stagesArray = Array.isArray(courseData.stages) ? courseData.stages : [];
      if (stagesArray.length !== 5) {
        return res.status(400).json({ error: 'Course must have exactly 5 stages' });
      }

      const course = await storage.createLearningCourse(courseData);

      res.status(201).json({
        message: 'Course created successfully',
        course
      });
    } catch (error) {
      console.error('Create course error:', error);
      res.status(500).json({ error: 'Failed to create course' });
    }
  });

  // POST /api/learning/lesson - Create new lesson (Admin only)
  app.post('/api/learning/lesson', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const lessonData = insertLearningLessonSchema.parse(req.body);

      // Verify course exists
      const course = await storage.getLearningCourseById(lessonData.courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Validate stage exists in course (handle jsonb array)
      const courseStages = Array.isArray(course.stages) ? course.stages as string[] : [];
      if (!courseStages.includes(lessonData.stage)) {
        return res.status(400).json({ 
          error: `Stage "${lessonData.stage}" not found in course stages: ${courseStages.join(', ')}` 
        });
      }

      const lesson = await storage.createLearningLesson(lessonData);

      res.status(201).json({
        message: 'Lesson created successfully',
        lesson
      });
    } catch (error) {
      console.error('Create lesson error:', error);
      res.status(500).json({ error: 'Failed to create lesson' });
    }
  });

  // POST /api/learning/lesson-progress - Update lesson progress
  app.post('/api/learning/lesson-progress', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      console.log('Received progress data:', req.body);
      console.log('User ID:', req.userId);

      // Extract and validate the data manually to handle timestamp conversion
      const { lessonId, completed, quizScore, completedAt } = req.body;

      if (!lessonId) {
        return res.status(400).json({ error: 'lessonId is required' });
      }

      const lesson = await storage.getLearningLessonById(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      const fullProgressData = {
        userId: req.userId,
        lessonId: parseInt(lessonId),
        completed: completed || false,
        quizScore: quizScore || null,
        completedAt: completed && completedAt ? new Date(completedAt) : null
      };

      console.log('Full progress data:', fullProgressData);

      const existingProgress = await storage.getLearningProgress(req.userId, lessonId);
      console.log('Existing progress:', existingProgress);

      let progress;
      let isNewCompletion = false;

      if (existingProgress) {
        // Check if this is a new completion (wasn't completed before, now is)
        isNewCompletion = !existingProgress.completed && fullProgressData.completed;
        progress = await storage.updateLearningProgress(
          req.userId, 
          lessonId, 
          fullProgressData
        );
        console.log('Updated progress:', progress);
      } else {
        progress = await storage.createLearningProgress(fullProgressData);
        console.log('Created progress:', progress);
        isNewCompletion = fullProgressData.completed;
      }

      // Award XP for lesson completion (only for new completions)
      if (isNewCompletion && fullProgressData.completed) {
        try {
          console.log('Awarding XP for lesson completion...');
          await storage.addXP(req.userId, 100, 'lesson_complete');
          
          // Log completion event
          await storage.logEvent({
            userId: req.userId,
            eventType: 'lesson_complete',
            eventData: { lessonId: fullProgressData.lessonId },
            xpAwarded: 100
          });

          console.log('XP awarded successfully: 100 XP for lesson completion');
        } catch (xpError) {
          console.error('Failed to award XP:', xpError);
          // Don't fail the entire request if XP fails
        }
      } else {
        console.log('No XP awarded - isNewCompletion:', isNewCompletion, 'completed:', fullProgressData.completed);
      }

      res.status(200).json({
        message: 'Progress updated successfully',
        progress,
        xpAwarded: isNewCompletion && fullProgressData.completed ? 100 : 0
      });
    } catch (error) {
      console.error('Update learning progress error:', error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: 'Failed to update progress' });
    }
  });

  // ===============================
  // COMMUNITY & MESSAGING API
  // ===============================

  // GET /api/community/channels/:channel/messages - Get messages for a channel
  app.get('/api/community/channels/:channel/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { channel } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const messages = await storage.getChannelMessages(channel, limit);

      // Get user details for each message
      const messagesWithUsers = await Promise.all(
        messages.map(async (message) => {
          const user = await storage.getUser(message.userId);
          return {
            ...message,
            user: user ? { 
              id: user.id, 
              fullName: user.fullName,
              initials: user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
            } : null
          };
        })
      );

      res.json({ messages: messagesWithUsers.reverse() }); // Return in chronological order
    } catch (error) {
      console.error('Get channel messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  });

  // POST /api/community/channels/:channel/messages - Send message to a channel
  app.post('/api/community/channels/:channel/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { channel } = req.params;
      const { text } = req.body;

      if (!text?.trim()) {
        return res.status(400).json({ error: 'Message text is required' });
      }

      const messageData = insertMessageSchema.parse({
        userId: req.userId,
        channel,
        text: text.trim()
      });

      const message = await storage.createMessage(messageData);

      // Get user details for response
      const user = await storage.getUser(req.userId);
      const messageWithUser = {
        ...message,
        user: user ? {
          id: user.id,
          fullName: user.fullName,
          initials: user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
        } : null
      };

      res.status(201).json({ 
        message: 'Message sent successfully',
        data: messageWithUser 
      });
    } catch (error) {
      console.error('Send message error:', error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // GET /api/community/channels - Get available channels with stats
  app.get('/api/community/channels', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Return channel information (this could be stored in database later)
      const channels = [
        {
          id: "global",
          name: "Global Chat",
          description: "Connect with the entire AM Project community",
          members: 1,
          featured: true
        },
        {
          id: "daily-check-in",
          name: "Daily Check-ins",
          description: "Share your wins, struggles, and daily progress",
          members: 1,
          featured: true
        },
        {
          id: "mental-resilience",
          name: "Mental Resilience",
          description: "Building unshakeable mental strength together",
          members: 1,
          featured: true
        },
        {
          id: "leadership",
          name: "Leadership & Influence",
          description: "Mastering authentic leadership in all areas of life",
          members: 1,
          featured: true
        },
        {
          id: "fitness",
          name: "Physical Excellence",
          description: "Building strength, endurance, and physical discipline",
          members: 1,
          featured: false
        },
        {
          id: "family",
          name: "Fatherhood & Family",
          description: "Leading your family with wisdom and love",
          members: 1,
          featured: false
        },
        {
          id: "career",
          name: "Career & Business",
          description: "Professional growth and entrepreneurship",
          members: 1,
          featured: false
        },
        {
          id: "relationships",
          name: "Relationships",
          description: "Building meaningful connections and partnerships",
          members: 1,
          featured: false
        }
      ];

      // Get recent activity for each channel
      const channelsWithActivity = await Promise.all(
        channels.map(async (channel) => {
          const recentMessages = await storage.getChannelMessages(channel.id, 1);
          return {
            ...channel,
            lastActivity: recentMessages.length > 0 
              ? recentMessages[0].timestamp 
              : new Date(Date.now() - Math.random() * 86400000 * 7) // Random activity within last week
          };
        })
      );

      res.json({ channels: channelsWithActivity });
    } catch (error) {
      console.error('Get channels error:', error);
      res.status(500).json({ error: 'Failed to get channels' });
    }
  });

  // Get messages for a specific channel
  app.get('/api/community/channels/:channelId/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { channelId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const rawMessages = await storage.getChannelMessages(channelId, limit);

      // Format messages with user information
      const messages = await Promise.all(
        rawMessages.map(async (message) => {
          const user = message.userId ? await storage.getUser(message.userId) : null;
          return {
            id: message.id,
            text: message.text,
            timestamp: message.timestamp.toISOString(),
            user: user ? {
              id: user.id,
              fullName: user.fullName,
              initials: user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
            } : null
          };
        })
      );

      res.json({ messages });
    } catch (error) {
      console.error('Get channel messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  });

  // Send message to a channel
  app.post('/api/community/channels/:channelId/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { channelId } = req.params;
      const { text } = req.body;

      if (!text?.trim()) {
        return res.status(400).json({ error: 'Message text is required' });
      }

      const messageData = {
        text: text.trim(),
        channel: channelId,
        userId: req.userId,
        timestamp: new Date()
      };

      const message = await storage.createMessage(messageData);
      res.json({ message });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // ===============================
  // POD MANAGEMENT API
  // ===============================

  // POST /api/pod/assign - Auto-assign user to a pod
  app.post('/api/pod/assign', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if user is already in a pod
      const user = await storage.getUser(req.userId);
      if (user?.podId) {
        return res.status(400).json({ error: 'User is already assigned to a pod' });
      }

      // Auto-assign user to pod
      const podId = await storage.assignUserToPod(req.userId);

      res.json({ 
        message: 'Successfully assigned to pod',
        podId 
      });
    } catch (error) {
      console.error('Pod assignment error:', error);
      res.status(500).json({ error: 'Failed to assign pod' });
    }
  });

  // GET /api/pod/my-pod - Get user's pod information
  app.get('/api/pod/my-pod', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const user = await storage.getUser(req.userId);
      if (!user?.podId) {
        return res.json({ pod: null, members: [] });
      }

      const pod = await storage.getPodById(user.podId);
      if (!pod) {
        return res.json({ pod: null, members: [] });
      }

      // Get all pod members
      const members = await storage.getPodMembers(user.podId);
      const membersWithStats = await Promise.all(
        members.map(async (member) => {
          const challengeProgress = await storage.getUserChallengeProgress(member.id);
          const journalEntries = await storage.getUserJournalEntries(member.id);

          return {
            id: member.id,
            fullName: member.fullName,
            initials: member.fullName.split(' ').map(n => n[0]).join('').toUpperCase(),
            completedChallenges: challengeProgress.completedChallenges || 0,
            totalReflections: journalEntries.length,
            lastActive: new Date() // This could be tracked more precisely
          };
        })
      );

      res.json({ 
        pod,
        members: membersWithStats
      });
    } catch (error) {
      console.error('Get pod error:', error);
      res.status(500).json({ error: 'Failed to get pod information' });
    }
  });

  // PUT /api/pod/goal - Update pod goal
  app.put('/api/pod/goal', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { goalText } = req.body;
      if (!goalText?.trim()) {
        return res.status(400).json({ error: 'Goal text is required' });
      }

      const user = await storage.getUser(req.userId);
      if (!user?.podId) {
        return res.status(404).json({ error: 'User is not in a pod' });
      }

      const updatedPod = await storage.updatePod(user.podId, {
        goalText: goalText.trim()
      });

      if (!updatedPod) {
        return res.status(404).json({ error: 'Pod not found' });
      }

      res.json({ 
        message: 'Pod goal updated successfully',
        pod: updatedPod
      });
    } catch (error) {
      console.error('Update pod goal error:', error);
      res.status(500).json({ error: 'Failed to update pod goal' });
    }
  });

  // GET /api/pod/messages - Get pod messages
  app.get('/api/pod/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const user = await storage.getUser(req.userId);
      if (!user?.podId) {
        return res.json({ messages: [] });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getPodMessages(user.podId, limit);

      res.json({ messages: messages.reverse() }); // Return in chronological order
    } catch (error) {
      console.error('Get pod messages error:', error);
      res.status(500).json({ error: 'Failed to get pod messages' });
    }
  });

  // POST /api/pod/messages - Send message to pod
  app.post('/api/pod/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { text } = req.body;
      if (!text?.trim()) {
        return res.status(400).json({ error: 'Message text is required' });
      }

      const user = await storage.getUser(req.userId);
      if (!user?.podId) {
        return res.status(404).json({ error: 'User is not in a pod' });
      }

      const messageData = {
        podId: user.podId,
        userId: req.userId,
        text: text.trim()
      };

      const message = await storage.createPodMessage(messageData);

      // Get user details for response
      const messageWithUser = {
        ...message,
        user: {
          fullName: user.fullName,
          initials: user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
        }
      };

      res.status(201).json({ 
        message: 'Message sent successfully',
        data: messageWithUser 
      });
    } catch (error) {
      console.error('Send pod message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // ===============================
  // SCENARIO-BASED LEARNING API
  // ===============================

  // GET /api/scenarios - Get all scenarios
  app.get('/api/scenarios', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const scenarios = await storage.getAllScenarios();
      res.json({ scenarios });
    } catch (error) {
      console.error('Scenarios error:', error);
      res.status(500).json({ error: 'Failed to get scenarios' });
    }
  });

  // GET /api/scenarios/weekly - Get weekly scenario for user
  app.get('/api/scenarios/weekly', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      console.log('Getting weekly scenario for user:', req.userId);
      try {
        const weeklyData = await storage.getThisWeeksScenario(req.userId);
        console.log('Weekly scenario data:', weeklyData);
        
        if (!weeklyData) {
          console.log('getThisWeeksScenario returned undefined');
          return res.status(404).json({ error: 'No scenarios available' });
        }
        
        if (!weeklyData.scenario) {
          console.log('weeklyData.scenario is undefined');
          return res.status(404).json({ error: 'No scenarios available' });
        }
        
        console.log('Returning scenario:', weeklyData.scenario.id, weeklyData.scenario.title);
        return res.json({ 
          scenario: weeklyData.scenario,
          hasResponded: !!weeklyData.userResponse,
          response: weeklyData.userResponse 
        });
      } catch (innerError) {
        console.error('Inner error in weekly scenario:', innerError);
        throw innerError;
      }


    } catch (error) {
      console.error('Weekly scenario error:', error);
      res.status(500).json({ error: 'Failed to get weekly scenario' });
    }
  });

  // GET /api/scenarios/:id - Get specific scenario
  app.get('/api/scenarios/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const scenarioId = parseInt(req.params.id);
      if (isNaN(scenarioId)) {
        return res.status(400).json({ error: 'Invalid scenario ID' });
      }
      
      const scenario = await storage.getScenarioById(scenarioId);
      if (!scenario) {
        return res.status(404).json({ error: 'Scenario not found' });
      }
      
      res.json(scenario);
    } catch (error) {
      console.error('Scenario fetch error:', error);
      res.status(500).json({ error: 'Failed to get scenario' });
    }
  });

  // POST /api/scenarios/:scenarioId/respond - Respond to a scenario
  app.post('/api/scenarios/:scenarioId/respond', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const scenarioId = parseInt(req.params.scenarioId);
      const { selectedOptionIndex } = req.body;

      console.log('Scenario submission attempt:', { scenarioId, selectedOptionIndex, userId: req.userId });

      if (typeof selectedOptionIndex !== 'number' || selectedOptionIndex < 0) {
        return res.status(400).json({ error: 'Valid selected option index is required' });
      }

      // Check if user has already responded
      const existingResponse = await storage.getUserScenarioResponse(req.userId, scenarioId);
      if (existingResponse) {
        console.log('User already responded to scenario:', scenarioId);
        return res.status(400).json({ error: 'You have already responded to this scenario' });
      }

      // Verify scenario exists
      const scenario = await storage.getScenarioById(scenarioId);
      if (!scenario) {
        return res.status(404).json({ error: 'Scenario not found' });
      }

      // Create response
      console.log('Creating scenario response:', { userId: req.userId, scenarioId, selectedOptionIndex });
      const response = await storage.createUserScenarioResponse({
        userId: req.userId,
        scenarioId,
        selectedOptionIndex
      });
      console.log('Scenario response created successfully:', response.id);

      // Get scenario with options for feedback
      const options = Array.isArray(scenario.options) ? scenario.options : [];
      const scenarioWithFeedback = {
        ...scenario,
        selectedOption: options[selectedOptionIndex] || null
      };

      res.json({ 
        response,
        scenario: scenarioWithFeedback
      });
    } catch (error) {
      console.error('Scenario response error:', error);
      res.status(500).json({ error: 'Failed to record scenario response' });
    }
  });

  // GET /api/scenarios/history - Get user's scenario history
  app.get('/api/scenarios/history', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const history = await storage.getUserScenarioHistory(req.userId, limit);

      res.json({ history });
    } catch (error) {
      console.error('Scenario history error:', error);
      res.status(500).json({ error: 'Failed to get scenario history' });
    }
  });

  // GET /api/scenarios/stats - Get user's scenario statistics
  app.get('/api/scenarios/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const stats = await storage.getUserScenarioStats(req.userId);

      res.json({ stats });
    } catch (error) {
      console.error('Scenario stats error:', error);
      res.status(500).json({ error: 'Failed to get scenario statistics' });
    }
  });

  // ===============================
  // WEEKLY REFLECTION ROUTES
  // ===============================

  // GET /api/weekly-reflections - Get user's weekly reflections
  app.get('/api/weekly-reflections', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const reflections = await storage.getUserWeeklyReflections(req.userId);
      res.json(reflections);
    } catch (error) {
      console.error('Get weekly reflections error:', error);
      res.status(500).json({ error: 'Failed to retrieve weekly reflections' });
    }
  });

  // GET /api/weekly-reflections/prompt-check - Check if user should see weekly reflection prompt
  app.get('/api/weekly-reflections/prompt-check', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check current day and time for Sunday reflection system
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const currentHour = now.getHours();
      
      let shouldShow = false;
      let windowType: 'optimal' | 'grace' | 'closed' = 'closed';
      let reflectionWindow = '';
      let message = '';

      console.log(`Weekly reflection check: Day ${dayOfWeek} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}), Hour ${currentHour}`);

      // Weekly reflections should NEVER show as a modal popup
      // They should only be triggered via notifications on weekends
      shouldShow = false;
      windowType = 'closed';
      reflectionWindow = 'Notifications only - no modal popups';
      message = 'Weekly reflections are delivered via notifications, not popups.';
      console.log('❌ Weekly reflection modal disabled - notifications only');

      // All weekly reflection modal logic removed - notifications only

      res.json({ 
        shouldShow, 
        windowType,
        reflectionWindow,
        currentDay: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
        message 
      });
    } catch (error) {
      console.error('Weekly reflection prompt check error:', error);
      res.status(500).json({ error: 'Failed to check weekly reflection prompt' });
    }
  });

  // POST /api/weekly-reflections - Create new weekly reflection
  app.post('/api/weekly-reflections', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      console.log('Weekly reflection submission attempt by user:', req.userId);
      console.log('Request body:', req.body);

      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { reflection, emoji, pinned, weekStartDate, weekEndDate, weeklyGoals, goalVisualizations } = req.body;

      if (!reflection || !reflection.trim()) {
        return res.status(400).json({ error: 'Reflection text is required' });
      }

      if (!weekStartDate || !weekEndDate) {
        return res.status(400).json({ error: 'Week start and end dates are required' });
      }

      // Get user's activity data for this week
      console.log('Getting weekly reflection data for user:', req.userId);
      const weekData = await storage.getUserWeeklyReflectionData(req.userId, weekStartDate, weekEndDate);
      console.log('Week data retrieved:', weekData);

      // Check if reflection already exists for this week
      console.log('Checking for existing reflection for week:', weekStartDate);
      const existingReflection = await storage.getWeeklyReflectionByWeek(req.userId, weekStartDate);
      if (existingReflection) {
        // Update existing reflection instead of creating new one
        console.log('Updating existing weekly reflection for week:', weekStartDate);
        
        const updateData = {
          reflection: reflection.trim(),
          emoji: emoji || '',
          pinned: pinned || false,
          weeklyGoals: weeklyGoals || [],
          goalVisualizations: goalVisualizations || [],
          goalCompletions: weeklyGoals ? weeklyGoals.map(() => false) : []
        };

        const updatedReflection = await storage.updateWeeklyReflection(existingReflection.id, updateData);

        // Generate new AM reflection summary with goals
        try {
          const amSummary = await generateAmReflection({
            reflectionText: reflection,
            lessonsCompleted: weekData.lessons.map(l => l.title),
            challengesCompleted: weekData.challenges.map(c => c.title),
            milestonesUnlocked: weekData.milestones,
            weeklyGoals: weeklyGoals
          });

          await storage.updateWeeklyReflection(existingReflection.id, { amSummary });
          console.log('AM reflection summary updated');
        } catch (error) {
          console.error('Failed to generate AM reflection:', error);
        }

        return res.status(200).json({
          message: 'Weekly reflection updated successfully',
          reflection: updatedReflection
        });
      }

      const reflectionData = {
        userId: req.userId,
        weekStartDate,
        weekEndDate,
        reflection: reflection.trim(),
        emoji: emoji || '',
        pinned: pinned || false,
        lessonsCompleted: weekData.lessons.map(l => l.id),
        challengesCompleted: weekData.challenges.map(c => c.id),
        milestonesUnlocked: weekData.milestones,
        weeklyGoals: weeklyGoals || [],
        goalVisualizations: goalVisualizations || [],
        goalCompletions: weeklyGoals ? weeklyGoals.map(() => false) : []
      };

      console.log('Reflection data to insert:', reflectionData);

      const validatedData = insertWeeklyReflectionSchema.parse(reflectionData);
      console.log('Validated reflection data:', validatedData);

      const newReflection = await storage.createWeeklyReflection(validatedData);
      console.log('Weekly reflection created successfully:', newReflection.id);

      // Generate AM reflection summary asynchronously
      try {
        const amSummary = await generateAmReflection({
          reflectionText: reflection,
          lessonsCompleted: weekData.lessons.map(l => l.title),
          challengesCompleted: weekData.challenges.map(c => c.title),
          milestonesUnlocked: weekData.milestones,
          weeklyGoals: weeklyGoals
        });

        // Update reflection with AM summary
        await storage.updateWeeklyReflection(newReflection.id, { amSummary });
        console.log('AM reflection summary generated and saved');
      } catch (error) {
        console.error('Failed to generate AM reflection:', error);
        // Continue without AM summary - don't fail the entire request
      }

      res.status(201).json({
        message: 'Weekly reflection created successfully',
        reflection: newReflection
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error('Validation error:', validationError.message);
        return res.status(400).json({ error: validationError.message });
      }
      console.error('Create weekly reflection error:', error);
      res.status(500).json({ error: 'Failed to create weekly reflection' });
    }
  });

  // POST /api/generate-goal-visualization - Generate AI visualization for goals
  app.post('/api/generate-goal-visualization', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { goal, category } = req.body;

      if (!goal || !category) {
        return res.status(400).json({ error: 'Goal and category are required' });
      }

      const visualization = await generateGoalVisualization(goal, category);
      
      res.json({ visualization });
    } catch (error) {
      console.error('Generate goal visualization error:', error);
      res.status(500).json({ error: 'Failed to generate visualization' });
    }
  });

  // ===============================
  // SITEMAP GENERATION API
  // ===============================

  // GET /sitemap-test.xml - Test sitemap generation
  app.get('/sitemap-test.xml', async (req: Request, res: Response) => {
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://theamproject.com/</loc>
    <lastmod>2025-06-14</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
  });

  // GET /sitemap.xml - Dynamic sitemap generation
  app.get('/sitemap.xml', async (req: Request, res: Response) => {
    res.set('Content-Type', 'application/xml; charset=utf-8');

    try {
      const baseUrl = 'https://theamproject.com';
      const currentDate = new Date().toISOString().split('T')[0];

      // Blog posts from static data
      const blogPosts = [
        { slug: 'mens-mental-health-breaking-silence', date: '2025-06-14' },
        { slug: '5-30-club-early-risers', date: '2025-05-01' },
        { slug: 'beyond-gym-complete-physical-practice', date: '2025-04-24' },
        { slug: 'silent-authority-leading-without-words', date: '2025-04-17' },
        { slug: 'mental-toughness-training-mind-elite-athlete', date: '2025-04-10' },
        { slug: 'financial-freedom-building-wealth-matters', date: '2025-04-03' },
        { slug: 'finding-north-star-clarifying-purpose', date: '2025-03-27' },
        { slug: 'art-fatherhood-family-leadership', date: '2025-03-20' },
        { slug: 'building-true-partnership-beyond-romance', date: '2025-03-13' },
        { slug: 'brotherhood-code-male-friendships', date: '2025-03-06' }
      ];

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/standard</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

      // Add blog posts
      blogPosts.forEach(post => {
        sitemap += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });

      sitemap += `
  <url>
    <loc>${baseUrl}/join</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/learning</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/learning/courses</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/auth</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;

      res.send(sitemap);
    } catch (error) {
      console.error('Sitemap generation error:', error);
      res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>Error generating sitemap</message>
</error>`);
    }
  });

  // ===============================
  // PWA DIAGNOSTIC API
  // ===============================

  // POST /api/pwa-diagnostic - Store PWA diagnostic data
  app.post('/api/pwa-diagnostic', async (req: Request, res: Response) => {
    try {
      const diagnosticData = req.body;

      // Store the diagnostic data temporarily (in-memory for now)
      if (!(global as any).pwaDiagnosticData) {
        (global as any).pwaDiagnosticData = [];
      }

      (global as any).pwaDiagnosticData.push({
        ...diagnosticData,
        serverTimestamp: new Date().toISOString(),
        clientIP: req.ip || req.connection.remoteAddress
      });

      // Keep only last 10 entries
      if ((global as any).pwaDiagnosticData.length > 10) {
        (global as any).pwaDiagnosticData = (global as any).pwaDiagnosticData.slice(-10);
      }

      console.log('PWA Diagnostic received:', {
        detected: diagnosticData.detected,
        storedPWAMode: diagnosticData.storedPWAMode,
        userAgent: diagnosticData.userAgent,
        timestamp: diagnosticData.timestamp
      });

      res.status(200).json({ message: 'Diagnostic data stored' });
    } catch (error) {
      console.error('PWA diagnostic error:', error);
      res.status(500).json({ error: 'Failed to store diagnostic data' });
    }
  });

  // GET /api/pwa-diagnostic - Retrieve PWA diagnostic data
  app.get('/api/pwa-diagnostic', async (req: Request, res: Response) => {
    try {
      const diagnosticData = (global as any).pwaDiagnosticData || [];
      res.status(200).json(diagnosticData);
    } catch (error) {
      console.error('Get PWA diagnostic error:', error);
      res.status(500).json({ error: 'Failed to retrieve diagnostic data' });
    }
  });

  // ===============================
  // NOTIFICATION SETTINGS API
  // ===============================

  // GET /api/notification-settings - Get user notification settings
  app.get('/api/notification-settings', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      let settings = await storage.getUserNotificationSettings(req.userId);

      // Create default settings if none exist
      if (!settings) {
        settings = await storage.createUserNotificationSettings({
          userId: req.userId,
          enableBrowserNotifications: true,
          enableWeeklyReflectionReminders: true,
          enableDailyChallengeNotifications: true,
          enableJournalReminders: true,
          enableCommunityNotifications: false,
          notificationTime: "09:00",
          timezone: "America/New_York"
        });
      }

      res.json(settings);
    } catch (error) {
      console.error('Get notification settings error:', error);
      res.status(500).json({ error: 'Failed to get notification settings' });
    }
  });

  // PATCH /api/notification-settings - Update user notification settings
  app.patch('/api/notification-settings', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      console.log('Notification settings update request:', {
        userId: req.userId,
        updates: req.body
      });

      // Validate the updates - only allow specific fields
      const allowedFields = [
        'enableBrowserNotifications',
        'enableWeeklyReflectionReminders', 
        'enableDailyChallengeNotifications',
        'enableJournalReminders',
        'enableCommunityNotifications',
        'notificationTime',
        'timezone'
      ];

      const updates: any = {};
      for (const [key, value] of Object.entries(req.body)) {
        if (allowedFields.includes(key)) {
          updates[key] = value;
        }
      }

      console.log('Filtered updates:', updates);

      // Ensure user has notification settings record
      let settings = await storage.getUserNotificationSettings(req.userId);
      if (!settings) {
        console.log('Creating new notification settings for user:', req.userId);
        const createData = {
          userId: req.userId,
          enableBrowserNotifications: true,
          enableWeeklyReflectionReminders: true,
          enableDailyChallengeNotifications: true,
          enableJournalReminders: true,
          enableCommunityNotifications: false,
          notificationTime: "09:00",
          timezone: "America/New_York",
          ...updates
        };
        // Remove any undefined properties
        Object.keys(createData).forEach(key => {
          if (createData[key] === undefined) {
            delete createData[key];
          }
        });
        settings = await storage.createUserNotificationSettings(createData);
      } else {
        console.log('Updating existing notification settings for user:', req.userId);
        settings = await storage.updateUserNotificationSettings(req.userId, updates);
      }

      if (!settings) {
        console.error('Failed to create/update notification settings');
        return res.status(500).json({ error: 'Failed to update notification settings' });
      }

      console.log('Notification settings updated successfully:', settings);
      res.json(settings);
    } catch (error) {
      console.error('Update notification settings error:', error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: 'Failed to update notification settings' });
    }
  });

  // GET /api/user-activity - Enhanced user activity data for smart notifications
  app.get('/api/user-activity', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Enhanced challenge tracking
      const recentChallenges = await storage.getUserChallengeHistory(req.userId, 10);
      const todaysChallenge = recentChallenges.find(c => 
        c.completedAt && new Date(c.completedAt) >= today
      );
      const lastChallengeDate = recentChallenges.length > 0 ? recentChallenges[0].completedAt : null;
      
      // Calculate current streak and streak risk
      const streakData = await storage.getUserStreak(req.userId);
      const currentStreak = streakData?.currentStreak || 0;
      const streakAtRisk = currentStreak > 0 && !todaysChallenge;
      
      // Days since last challenge
      const daysSinceLastChallenge = lastChallengeDate ? 
        Math.floor((now.getTime() - new Date(lastChallengeDate).getTime()) / (24 * 60 * 60 * 1000)) : null;

      // Scenario engagement tracking
      const recentScenarios = await storage.getUserScenarioHistory(req.userId, 5);
      const lastScenarioDate = recentScenarios.length > 0 ? recentScenarios[0].completedAt : null;
      const daysSinceLastScenario = lastScenarioDate ?
        Math.floor((now.getTime() - new Date(lastScenarioDate).getTime()) / (24 * 60 * 60 * 1000)) : null;

      // Learning progress analysis
      const recentLearning = await storage.getRecentLearningProgress(req.userId, 30);
      const lastLearningActivity = recentLearning.length > 0 ? recentLearning[0].completedAt : null;
      const daysSinceLastLearning = lastLearningActivity ?
        Math.floor((now.getTime() - new Date(lastLearningActivity).getTime()) / (24 * 60 * 60 * 1000)) : null;

      // Advanced stalled course detection with actual course data
      const stalledCourses: Array<{
        title: string;
        progressPercentage: number;
        daysSinceLastProgress: number;
        completedLessons: number;
        totalLessons: number;
      }> = [];
      
      const activeCourses: Array<{
        title: string;
        progressPercentage: number;
        daysSinceLastProgress: number;
        completedLessons: number;
        totalLessons: number;
      }> = [];

      try {
        // Get all available courses
        const allCourses = await storage.getAllLearningCourses();
        
        for (const course of allCourses) {
          try {
            // Get user's progress for this course
            const courseProgress = await storage.getCourseProgress(req.userId, course.id);
            const courseLessons = await storage.getLearningLessonsByCourse(course.id);
            
            if (courseProgress.length === 0) continue; // Never started
            
            const completedLessons = courseProgress.filter(p => p.completed).length;
            const totalLessons = courseLessons.length;
            const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
            
            // Find most recent activity
            const mostRecentActivity = courseProgress
              .filter(p => p.completedAt)
              .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
            
            const daysSinceLastProgress = mostRecentActivity?.completedAt ?
              Math.floor((now.getTime() - new Date(mostRecentActivity.completedAt).getTime()) / (24 * 60 * 60 * 1000)) : 999;
            
            const isCompleted = completedLessons === totalLessons;
            const isStalled = !isCompleted && daysSinceLastProgress >= 3;
            const isActive = !isCompleted && daysSinceLastProgress < 3;
            
            const courseData = {
              title: course.title,
              progressPercentage,
              daysSinceLastProgress,
              completedLessons,
              totalLessons
            };
            
            if (isStalled) {
              stalledCourses.push(courseData);
            } else if (isActive) {
              activeCourses.push(courseData);
            }
          } catch (courseError) {
            console.error(`Error processing course ${course.id}:`, courseError);
            // Continue with other courses
          }
        }
        
        // Sort by progress percentage (prioritize courses with more progress)
        stalledCourses.sort((a, b) => b.progressPercentage - a.progressPercentage);
        activeCourses.sort((a, b) => b.progressPercentage - a.progressPercentage);
        
      } catch (courseError) {
        console.error('Error fetching course data for notifications:', courseError);
        // Continue without course data - don't fail the entire request
      }

      // Engagement patterns
      const isNewUser = !lastChallengeDate && !lastScenarioDate && !lastLearningActivity;
      const isChurningUser = daysSinceLastChallenge !== null && daysSinceLastChallenge >= 7;
      const isActiveUser = (daysSinceLastChallenge !== null && daysSinceLastChallenge <= 1) ||
                          (daysSinceLastScenario !== null && daysSinceLastScenario <= 1) ||
                          (daysSinceLastLearning !== null && daysSinceLastLearning <= 1);

      const userActivity = {
        // Basic tracking
        lastChallengeDate,
        lastScenarioDate,
        lastLearningActivity,
        
        // Challenge-specific data
        hasCompletedTodaysChallenge: !!todaysChallenge,
        currentStreak,
        streakAtRisk,
        daysSinceLastChallenge,
        
        // Scenario data
        daysSinceLastScenario,
        
        // Learning data
        daysSinceLastLearning,
        
        // Course data
        stalledCourses: stalledCourses.slice(0, 3),
        activeCourses: activeCourses.slice(0, 2),
        
        // User patterns
        isNewUser,
        isChurningUser,
        isActiveUser,
        
        // Legacy compatibility
        hasActiveStreak: currentStreak > 0
      };

      console.log('Enhanced user activity data:', {
        userId: req.userId,
        patterns: { isNewUser, isChurningUser, isActiveUser },
        streak: { current: currentStreak, atRisk: streakAtRisk },
        stalledCourses: stalledCourses.length,
        activeCourses: activeCourses.length
      });

      res.json(userActivity);
    } catch (error) {
      console.error('Get user activity error:', error);
      res.status(500).json({ error: 'Failed to get user activity data' });
    }
  });

  // ===============================
  // STRIPE PAYMENT ROUTES
  // ===============================

  // Create setup intent for new registrations (before account creation)
  app.post('/api/create-setup-intent', async (req: Request, res: Response) => {
    try {
      const { registrationKey } = req.body;
      console.log('Creating setup intent for registration key:', registrationKey);
      
      if (!registrationKey) {
        return res.status(400).json({ error: 'Registration key required' });
      }

      const pendingData = pendingRegistrations.get(registrationKey);
      if (!pendingData) {
        console.log('Registration session expired for key:', registrationKey);
        return res.status(400).json({ error: 'Registration session expired' });
      }

      console.log('Found pending registration:', pendingData.email);

      // Create setup intent without customer (will be created after payment)
      const setupIntent = await stripe.setupIntents.create({
        usage: 'off_session',
        payment_method_types: ['card'],
        metadata: {
          registrationKey,
          email: pendingData.email
        }
      });

      console.log('Setup intent created:', setupIntent.id);

      res.json({
        clientSecret: setupIntent.client_secret,
        isTrialPeriod: true,
      });
    } catch (error: any) {
      console.error('Create setup intent error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Create subscription for existing users
  app.post('/api/create-subscription', authenticateToken, async (req: AuthRequest, res) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const { discountCode } = req.body;
      let user = await storage.getUser(req.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user already has an active subscription
      if (user.stripeSubscriptionId && user.subscriptionStatus === 'active') {
        return res.json({ 
          message: 'User already has active subscription',
          subscriptionStatus: 'active'
        });
      }

      // Validate discount code if provided
      let isValidDiscount = false;
      if (discountCode) {
        const discount = await storage.getDiscountCodeByCode(discountCode);
        if (discount && discount.isActive) {
          const now = new Date();
          const isNotExpired = !discount.expiresAt || new Date(discount.expiresAt) > now;
          const hasUsageLeft = !discount.usageLimit || discount.usageCount < discount.usageLimit;
          
          if (isNotExpired && hasUsageLeft) {
            isValidDiscount = true;
            // Increment usage count
            await storage.incrementDiscountCodeUsage(discount.id);
          }
        }
      }

      // For valid discount codes, mark user as having active subscription without payment
      if (isValidDiscount) {
        await storage.updateUserSubscriptionStatus(user.id, 'active');
        
        // Invalidate any cached subscription data
        console.log('Discount code applied for user:', user.id, 'Current onboarding status:', user.onboardingComplete);
        
        return res.json({ 
          message: 'Discount code applied successfully',
          subscriptionStatus: 'active',
          discountApplied: true,
          shouldRedirectToOnboarding: !user.onboardingComplete
        });
      }

      // Create Stripe customer if doesn't exist
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName,
        });
        customerId = customer.id;
        await storage.updateUser(user.id, { stripeCustomerId: customerId });
      }

      // Calculate trial end date (7 days from now)
      const trialEndDate = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);

      // For trial subscriptions, we only create a setup intent initially
      // This allows us to save payment method without charging immediately
      // The subscription will be created only after successful payment method setup
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        usage: 'off_session',
        payment_method_types: ['card'],
        metadata: {
          userId: user.id.toString(),
          trialEndDate: trialEndDate.toString()
        }
      });

      // Store customer ID but don't mark as subscribed yet
      await storage.updateUser(user.id, { 
        stripeCustomerId: customerId
      });

      // Return setup intent client secret for trial periods
      res.json({
        clientSecret: setupIntent.client_secret,
        isTrialPeriod: true,
      });
    } catch (error: any) {
      console.error('Create subscription error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Validate discount code
  app.post('/api/validate-discount', async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: 'Discount code required' });
      }

      const discount = await storage.getDiscountCodeByCode(code);
      if (!discount || !discount.isActive) {
        return res.json({ valid: false, message: 'Invalid discount code' });
      }

      const now = new Date();
      const isNotExpired = !discount.expiresAt || new Date(discount.expiresAt) > now;
      const hasUsageLeft = !discount.usageLimit || discount.usageCount < discount.usageLimit;

      if (!isNotExpired) {
        return res.json({ valid: false, message: 'Discount code has expired' });
      }

      if (!hasUsageLeft) {
        return res.json({ valid: false, message: 'Discount code usage limit reached' });
      }

      res.json({ 
        valid: true, 
        description: discount.description,
        message: 'Valid discount code'
      });
    } catch (error: any) {
      console.error('Validate discount error:', error);
      res.status(500).json({ error: 'Failed to validate discount code' });
    }
  });

  // Check subscription status
  app.get('/api/subscription-status', authenticateToken, async (req: AuthRequest, res) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const user = await storage.getUser(req.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if dev account
      if (user.isDevAccount) {
        return res.json({ 
          hasActiveSubscription: true,
          subscriptionStatus: 'active',
          isDevAccount: true
        });
      }

      // Check subscription status - include trialing and cancelled (until period end) as active access
      let hasActiveSubscription = false;
      
      if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') {
        hasActiveSubscription = true;
      } else if (user.subscriptionStatus === 'canceled' && user.stripeSubscriptionId) {
        // For cancelled subscriptions, check if still within access period
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          const now = Math.floor(Date.now() / 1000);
          // Use trial_end for trial subscriptions, current_period_end for regular subscriptions
          let periodEnd;
          if (subscription.status === 'trialing' && subscription.trial_end) {
            periodEnd = subscription.trial_end;
          } else if ((subscription as any).current_period_end) {
            periodEnd = (subscription as any).current_period_end;
          }
          hasActiveSubscription = periodEnd ? now < periodEnd : false;
        } catch (error) {
          console.error('Error checking cancelled subscription:', error);
          hasActiveSubscription = false;
        }
      }
      
      res.json({ 
        hasActiveSubscription,
        subscriptionStatus: user.subscriptionStatus || null,
        isDevAccount: false
      });
    } catch (error: any) {
      console.error('Check subscription status error:', error);
      res.status(500).json({ error: 'Failed to check subscription status' });
    }
  });

  // Cancel subscription
  app.post('/api/cancel-subscription', authenticateToken, async (req: AuthRequest, res) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const user = await storage.getUser(req.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ error: 'No active subscription found' });
      }

      // Get current subscription to check status
      const currentSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      
      if (currentSubscription.cancel_at_period_end || currentSubscription.status === 'canceled') {
        return res.status(400).json({ error: 'Subscription is already cancelled' });
      }

      // Cancel the subscription at period end (allows them to keep access until end of billing period)
      const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      // Update user subscription status
      await storage.updateUserSubscriptionStatus(user.id, 'canceled');

      res.json({
        message: 'Subscription canceled successfully',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: (subscription as any).current_period_end
        }
      });
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  });

  // Reactivate subscription (if canceled but not yet ended)
  app.post('/api/reactivate-subscription', authenticateToken, async (req: AuthRequest, res) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const user = await storage.getUser(req.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ error: 'No subscription found' });
      }

      // Reactivate the subscription by removing the cancel_at_period_end flag
      const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: false
      });

      // Update user subscription status back to active or trialing
      const status = subscription.status === 'trialing' ? 'trialing' : 'active';
      await storage.updateUserSubscriptionStatus(user.id, status);

      res.json({
        message: 'Subscription reactivated successfully',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end
        }
      });
    } catch (error: any) {
      console.error('Reactivate subscription error:', error);
      res.status(500).json({ error: 'Failed to reactivate subscription' });
    }
  });

  // Get subscription details
  app.get('/api/subscription-details', authenticateToken, async (req: AuthRequest, res) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const user = await storage.getUser(req.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.stripeSubscriptionId) {
        return res.json({ subscription: null });
      }

      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

      res.json({
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_start: (subscription as any).current_period_start,
          current_period_end: (subscription as any).current_period_end,
          trial_end: subscription.trial_end,
          plan: {
            amount: subscription.items.data[0]?.price.unit_amount,
            currency: subscription.items.data[0]?.price.currency,
            interval: subscription.items.data[0]?.price.recurring?.interval
          }
        }
      });
    } catch (error: any) {
      console.error('Get subscription details error:', error);
      res.status(500).json({ error: 'Failed to get subscription details' });
    }
  });

  // Handle successful setup intent completion and create subscription
  app.post('/api/setup-complete', async (req: Request, res: Response) => {
    try {
      const { setupIntentId, registrationKey } = req.body;
      console.log('Setup completion request:', { setupIntentId, registrationKey });
      
      if (!setupIntentId) {
        return res.status(400).json({ error: 'Setup intent ID required' });
      }

      // Retrieve the setup intent to get payment method and metadata
      const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
      console.log('Setup intent retrieved:', { status: setupIntent.status, metadata: setupIntent.metadata });
      
      if (setupIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Setup intent not successful' });
      }

      let user;
      let token;

      // Handle new registration (payment completes account creation)
      if (registrationKey) {
        const pendingData = pendingRegistrations.get(registrationKey);
        if (!pendingData) {
          console.log('Registration session expired for key:', registrationKey);
          return res.status(400).json({ error: 'Registration session expired' });
        }

        console.log('Creating user account for:', pendingData.email);

        // Create the actual user account now that payment is successful
        const userData = insertUserSchema.parse({
          email: pendingData.email,
          passwordHash: pendingData.passwordHash,
          fullName: pendingData.fullName
        });

        user = await storage.createUser(userData);
        token = generateToken(user.id);
        
        console.log('User account created:', { id: user.id, email: user.email });
        
        // Send welcome email with PDF attachment
        try {
          const firstName = user.fullName.split(' ')[0];
          await sendWelcomeEmail(user.email, firstName);
          console.log('Welcome email sent to:', user.email);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail the registration if email fails
        }
        
        // Clean up pending registration
        pendingRegistrations.delete(registrationKey);
      } else if (setupIntent.metadata?.userId) {
        // Handle existing user upgrading
        const userId = parseInt(setupIntent.metadata.userId);
        user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
      } else {
        return res.status(400).json({ error: 'Missing user identification' });
      }

      // Create Stripe customer if doesn't exist
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName,
        });
        customerId = customer.id;
        await storage.updateUser(user.id, { stripeCustomerId: customerId });
      }

      // Get payment method and attach to customer
      const paymentMethodId = setupIntent.payment_method as string;
      if (!paymentMethodId) {
        return res.status(400).json({ error: 'No payment method found in setup intent' });
      }

      // Try to attach payment method, ignore if already attached
      try {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId,
        });
      } catch (error: any) {
        if (error.code !== 'resource_already_exists') {
          console.error('Payment method attach error:', error);
          throw error;
        }
        console.log('Payment method already attached to customer');
      }

      // Create subscription with 7-day trial
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: 'price_1RbOaQRqoriqFmD8K4A4LPzx',
        }],
        trial_period_days: 7,
        default_payment_method: paymentMethodId,
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
      });

      // Update user with subscription info - now mark as trialing
      await storage.updateUser(user.id, { 
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: 'trialing'
      });

      // Return user data without password hash
      const { passwordHash: _, ...userResponse } = user;

      res.json({
        message: 'Trial started successfully and account created',
        subscriptionId: subscription.id,
        subscriptionStatus: 'trialing',
        user: userResponse,
        token
      });
    } catch (error: any) {
      console.error('Setup complete error:', error);
      res.status(500).json({ error: 'Failed to complete setup' });
    }
  });

  // Get actual Stripe Price ID for your product
  app.get('/api/stripe-prices', async (req, res) => {
    try {
      const prices = await stripe.prices.list({
        limit: 10,
        active: true,
      });
      
      res.json({
        prices: prices.data.map(price => ({
          id: price.id,
          amount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring?.interval,
          product: price.product
        })),
        amSubscriptionPriceId: 'price_1RalLwRqoriqFmD81k82XBAm'
      });
    } catch (error: any) {
      console.error('Error fetching Stripe prices:', error);
      res.status(500).json({ error: 'Failed to fetch prices' });
    }
  });

  // Complete registration with discount code
  app.post('/api/complete-registration', async (req, res) => {
    try {
      const { registrationKey, discountCode } = req.body;
      
      console.log('=== COMPLETE REGISTRATION REQUEST ===');
      console.log('Registration key:', registrationKey);
      console.log('Discount code:', discountCode);

      if (!registrationKey) {
        return res.status(400).json({ error: 'Registration key required' });
      }

      const pendingData = pendingRegistrations.get(registrationKey);
      console.log('Pending data found:', !!pendingData);
      console.log('Pending registrations keys:', Array.from(pendingRegistrations.keys()));
      
      if (!pendingData) {
        return res.status(400).json({ error: 'Registration session expired' });
      }

      // Validate discount code if provided
      let isValidDiscount = false;
      if (discountCode) {
        console.log('Validating discount code:', discountCode.trim());
        const discount = await storage.getDiscountCodeByCode(discountCode.trim());
        console.log('Found discount:', discount);
        
        if (discount && discount.isActive) {
          const now = new Date();
          const isNotExpired = !discount.expiresAt || new Date(discount.expiresAt) > now;
          const hasUsageLeft = discount.usageLimit === null || discount.usageLimit === undefined || discount.usageCount < discount.usageLimit;
          
          console.log('Discount validation:', { 
            isNotExpired, 
            hasUsageLeft, 
            expiresAt: discount.expiresAt,
            usageLimit: discount.usageLimit,
            usageCount: discount.usageCount,
            usageLimitType: typeof discount.usageLimit,
            usageLimitIsNull: discount.usageLimit === null
          });
          
          if (isNotExpired && hasUsageLeft) {
            isValidDiscount = true;
            await storage.incrementDiscountCodeUsage(discount.id);
            console.log('Discount code validation SUCCESS for:', discountCode.trim());
          } else {
            console.log('Discount code validation FAILED - expired or usage limit reached', {
              isNotExpired,
              hasUsageLeft,
              usageLimit: discount.usageLimit,
              usageCount: discount.usageCount
            });
          }
        } else {
          console.log('Discount code not found or inactive:', discountCode.trim());
        }
      }

      console.log('Creating user with discount validation result:', {
        isValidDiscount,
        subscriptionStatus: isValidDiscount ? 'active' : null
      });

      // Create the user account
      const userData = insertUserSchema.parse({
        email: pendingData.email,
        passwordHash: pendingData.passwordHash,
        fullName: pendingData.fullName,
        subscriptionStatus: isValidDiscount ? 'active' : null,
        onboardingComplete: false
      });

      const user = await storage.createUser(userData);
      const token = generateToken(user.id);

      // Clean up pending registration
      pendingRegistrations.delete(registrationKey);

      console.log('User created successfully:', {
        id: user.id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        discountApplied: isValidDiscount
      });

      // Send welcome email with PDF attachment
      try {
        const firstName = user.fullName.split(' ')[0];
        await sendWelcomeEmail(user.email, firstName);
        console.log('Welcome email sent to:', user.email);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the registration if email fails
      }

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          onboardingComplete: false
        },
        discountApplied: isValidDiscount
      });
    } catch (error: any) {
      console.error('Complete registration error:', error);
      res.status(500).json({ error: 'Failed to complete registration' });
    }
  });

  // ===============================
  // GAMIFICATION API ROUTES
  // ===============================

  // GET /api/gamification/xp - Get user XP and level
  app.get('/api/gamification/xp', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userXP = await storage.getUserXP(req.userId);
      if (!userXP) {
        // Create initial XP record
        const newXP = await storage.createUserXP({ userId: req.userId, currentXP: 0, totalXP: 0, level: 1 });
        return res.json(newXP);
      }

      res.json(userXP);
    } catch (error) {
      console.error('Get XP error:', error);
      res.status(500).json({ error: 'Failed to get user XP' });
    }
  });

  // GET /api/gamification/badges - Get all badges
  app.get('/api/gamification/badges', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      console.error('Get badges error:', error);
      res.status(500).json({ error: 'Failed to get badges' });
    }
  });

  // GET /api/gamification/user-badges - Get user's earned badges
  app.get('/api/gamification/user-badges', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userBadges = await storage.getUserBadges(req.userId);
      res.json(userBadges);
    } catch (error) {
      console.error('Get user badges error:', error);
      res.status(500).json({ error: 'Failed to get user badges' });
    }
  });

  // GET /api/gamification/daily-prompt - Get today's daily prompt
  app.get('/api/gamification/daily-prompt', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const prompt = await storage.getDailyPrompt(today);
      
      if (!prompt) {
        return res.status(404).json({ error: 'No prompt available for today' });
      }

      res.json(prompt);
    } catch (error) {
      console.error('Get daily prompt error:', error);
      res.status(500).json({ error: 'Failed to get daily prompt' });
    }
  });

  // Enhanced scenario route with XP and weekly persistence
  app.get('/api/scenarios/weekly-persistent', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const weeklyData = await storage.getWeeklyScenarioForUser(req.userId);
      if (!weeklyData?.scenario) {
        return res.status(404).json({ error: 'No scenarios available' });
      }

      res.json({
        scenario: weeklyData.scenario,
        isPersistent: !!weeklyData.userScenario,
        weekAssigned: weeklyData.userScenario?.weekStartDate
      });
    } catch (error) {
      console.error('Weekly persistent scenario error:', error);
      res.status(500).json({ error: 'Failed to get weekly scenario' });
    }
  });

  // Exit-intent feedback collection for marketing optimization
  app.post('/api/exit-intent-feedback', async (req: Request, res: Response) => {
    try {
      const feedbackData = insertExitIntentFeedbackSchema.parse(req.body);
      
      console.log('Exit-intent feedback received:', {
        page: feedbackData.page,
        reasons: feedbackData.selectedReasons,
        timeOnPage: feedbackData.timeOnPage,
        scrollDepth: feedbackData.scrollDepth
      });

      // Store feedback in database
      const feedback = await storage.createExitIntentFeedback(feedbackData);

      res.status(201).json({
        message: 'Feedback received successfully',
        id: feedback.id
      });
    } catch (error) {
      console.error('Exit-intent feedback error:', error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: 'Failed to save feedback' });
    }
  });

  // ===============================
  // PROGRAMMATIC SEO ROUTES
  // ===============================
  
  // Dynamic landing pages for programmatic SEO
  app.get('/landing/:slug', (req, res) => {
    handleLandingPage(req, res);
  });
  
  // Generate sitemap for all landing pages
  app.get('/sitemap-landing-pages.xml', (req, res) => {
    res.set('Content-Type', 'application/xml');
    res.send(generateSitemap());
  });

  const httpServer = createServer(app);

  return httpServer;
}