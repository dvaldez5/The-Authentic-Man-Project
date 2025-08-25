import { 
  users, type User, type InsertUser,
  subscribers, type Subscriber, type InsertSubscriber, 
  contacts, type Contact, type InsertContact, 
  blogPosts, type BlogPost, type InsertBlogPost,
  journalEntries, type JournalEntry, type InsertJournalEntry,
  messages, type Message, type InsertMessage,
  pods, type Pod, type InsertPod,
  podMessages, type PodMessage, type InsertPodMessage,
  chatMessages, type ChatMessage, type InsertChatMessage,
  // Challenge Tracker System
  challenges, type Challenge, type InsertChallenge,
  userChallenges, type UserChallenge, type InsertUserChallenge,
  // Modular Learning System
  learningCourse, type LearningCourse, type InsertLearningCourse,
  learningLesson, type LearningLesson, type InsertLearningLesson,
  learningLessonProgress, type LearningProgress, type InsertLearningProgress,
  // Scenario-Based Learning System
  scenarios, type Scenario, type InsertScenario,
  userScenarioResponses, type UserScenarioResponse, type InsertUserScenarioResponse,
  // Weekly Reflection System
  weeklyReflections, type WeeklyReflection, type InsertWeeklyReflection,
  // Notification Settings
  userNotificationSettings, type UserNotificationSettings, type InsertUserNotificationSettings,
  // Discount Codes
  discountCodes, type DiscountCode, type InsertDiscountCode,
  // Gamification System
  userXP, type UserXP, type InsertUserXP,
  badges, type Badge, type InsertBadge,
  userBadges, type UserBadge, type InsertUserBadge,
  userScenarios, type UserScenario, type InsertUserScenario,
  eventLog, type EventLog, type InsertEventLog,
  dailyPrompts, type DailyPrompt, type InsertDailyPrompt,
  // Exit Intent Feedback
  exitIntentFeedback, type ExitIntentFeedback, type InsertExitIntentFeedback
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lt, sql } from "drizzle-orm";

export interface IStorage {

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateUserStripeInfo(id: number, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User | undefined>;
  updateUserSubscriptionStatus(id: number, status: string): Promise<User | undefined>;
  getTotalUsersCount(): Promise<number>;

  // Discount code methods
  getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined>;
  createDiscountCode(discountCode: InsertDiscountCode): Promise<DiscountCode>;
  incrementDiscountCodeUsage(id: number): Promise<DiscountCode | undefined>;
  getAllDiscountCodes(): Promise<DiscountCode[]>;

  // Journal methods
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getUserJournalEntries(userId: number): Promise<JournalEntry[]>;
  getJournalEntries(userId: number): Promise<JournalEntry[]>;
  updateJournalEntry(id: number, updates: Partial<JournalEntry>): Promise<JournalEntry | undefined>;
  getJournalEntryById(id: number): Promise<JournalEntry | undefined>;
  pinJournalEntry(id: number, userId: number): Promise<JournalEntry | undefined>;
  unpinJournalEntry(id: number, userId: number): Promise<JournalEntry | undefined>;
  getPinnedJournalEntry(userId: number): Promise<JournalEntry | undefined>;

  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getChannelMessages(channel: string, limit?: number): Promise<Message[]>;

  // Pod methods
  createPod(pod: any): Promise<Pod>;
  getPodById(id: number): Promise<Pod | undefined>;
  updatePod(id: number, updates: Partial<Pod>): Promise<Pod | undefined>;
  getPodMembers(podId: number): Promise<User[]>;
  createPodMessage(message: InsertPodMessage): Promise<PodMessage>;
  getPodMessages(podId: number, limit?: number): Promise<(PodMessage & { user: { fullName: string; initials: string } })[]>;
  assignUserToPod(userId: number): Promise<number>;

  // Newsletter subscriber methods
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  getAllSubscribers(): Promise<Subscriber[]>;

  // Contact form methods
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;

  // Blog post methods
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;

  // Chat message methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatHistory(userId: number, limit?: number): Promise<ChatMessage[]>;

  // Search methods for AM chat contextual linking
  searchContent(query: string, context: 'public' | 'dashboard'): Promise<{
    type: string;
    title: string;
    url: string;
    relevance: number;
  }[]>;

  // ===============================
  // CHALLENGE TRACKER METHODS
  // ===============================

  // Challenge methods
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getAllChallenges(): Promise<Challenge[]>;
  getChallengeById(id: number): Promise<Challenge | undefined>;
  getChallengesByStage(stage: string): Promise<Challenge[]>;
  getChallengesByTags(tags: string[]): Promise<Challenge[]>;
  getTotalChallengesCount(): Promise<number>;

  // User Challenge methods
  createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge>;
  getUserChallenge(userId: number, challengeId: number): Promise<UserChallenge | undefined>;
  getTodaysChallenge(userId: number): Promise<UserChallenge | undefined>;
  getLastCompletedChallenge(userId: number): Promise<UserChallenge | undefined>;
  getUserChallengeHistory(userId: number, limit?: number): Promise<(UserChallenge & { challenge: Challenge })[]>;
  completeUserChallenge(userId: number, challengeId: number, reflection: string): Promise<UserChallenge | undefined>;
  updateUserChallenge(id: number, updates: Partial<UserChallenge>): Promise<UserChallenge | undefined>;
  getUserChallengeProgress(userId: number): Promise<{
    totalChallenges: number;
    completedChallenges: number;
    currentStreak: number;
    longestStreak: number;
    milestones: Array<{ day: number; label: string; unlocked: boolean }>;
  }>;

  // ===============================
  // MODULAR LEARNING SYSTEM METHODS
  // ===============================

  // Learning Course methods
  createLearningCourse(course: InsertLearningCourse): Promise<LearningCourse>;
  getAllLearningCourses(): Promise<LearningCourse[]>;
  getLearningCourseById(id: number): Promise<LearningCourse | undefined>;
  getLearningCourseWithLessons(id: number): Promise<(LearningCourse & { lessons: LearningLesson[] }) | undefined>;

  // Learning Lesson methods
  createLearningLesson(lesson: InsertLearningLesson): Promise<LearningLesson>;
  getLearningLessonsByCourse(courseId: number): Promise<LearningLesson[]>;
  getLearningLessonById(id: number): Promise<LearningLesson | undefined>;

  // Learning Progress methods
  createLearningProgress(progress: InsertLearningProgress): Promise<LearningProgress>;
  getLearningProgress(userId: number, lessonId: number): Promise<LearningProgress | undefined>;
  updateLearningProgress(userId: number, lessonId: number, updates: Partial<LearningProgress>): Promise<LearningProgress | undefined>;
  getUserLearningProgress(userId: number): Promise<LearningProgress[]>;
  getCourseProgress(userId: number, courseId: number): Promise<LearningProgress[]>;
  getRecentLearningProgress(userId: number, days: number): Promise<LearningProgress[]>;

  // ===============================
  // SCENARIO-BASED LEARNING METHODS
  // ===============================

  // Scenario methods
  createScenario(scenario: InsertScenario): Promise<Scenario>;
  getAllScenarios(): Promise<Scenario[]>;
  getScenarioById(id: number): Promise<Scenario | undefined>;
  getScenariosByStage(stage: string): Promise<Scenario[]>;
  getScenariosByTags(tags: string[]): Promise<Scenario[]>;
  getWeeklyScenario(userId: number): Promise<Scenario | undefined>;

  // User Scenario Response methods
  createUserScenarioResponse(response: InsertUserScenarioResponse): Promise<UserScenarioResponse>;
  getUserScenarioResponse(userId: number, scenarioId: number): Promise<UserScenarioResponse | undefined>;
  getUserScenarioHistory(userId: number, limit?: number): Promise<(UserScenarioResponse & { scenario: Scenario })[]>;
  getUserScenarioStats(userId: number): Promise<{
    totalScenarios: number;
    completedScenarios: number;
    completedThisWeek: number;
    lastCompletedDate: Date | null;
  }>;

  // ===============================
  // WEEKLY REFLECTION METHODS
  // ===============================

  // Weekly Reflection methods
  createWeeklyReflection(reflection: InsertWeeklyReflection): Promise<WeeklyReflection>;
  getUserWeeklyReflections(userId: number): Promise<WeeklyReflection[]>;
  getWeeklyReflectionByWeek(userId: number, weekStartDate: string): Promise<WeeklyReflection | undefined>;
  updateWeeklyReflection(id: number, updates: Partial<WeeklyReflection>): Promise<WeeklyReflection | undefined>;
  getUserWeeklyReflectionData(userId: number, weekStartDate: string, weekEndDate: string): Promise<{
    lessons: Array<{ id: number; title: string }>;
    challenges: Array<{ id: number; title: string }>;
    milestones: string[];
  }>;
  shouldShowWeeklyReflectionPrompt(userId: number): Promise<boolean>;

  // ===============================
  // NOTIFICATION SETTINGS METHODS
  // ===============================

  // Notification Settings methods
  getUserNotificationSettings(userId: number): Promise<UserNotificationSettings | undefined>;
  createUserNotificationSettings(settings: InsertUserNotificationSettings): Promise<UserNotificationSettings>;
  updateUserNotificationSettings(userId: number, updates: Partial<UserNotificationSettings>): Promise<UserNotificationSettings | undefined>;

  // Gamification methods
  getUserXP(userId: number): Promise<UserXP | undefined>;
  createUserXP(userXP: InsertUserXP): Promise<UserXP>;
  updateUserXP(userId: number, updates: Partial<UserXP>): Promise<UserXP | undefined>;
  addXP(userId: number, amount: number, source: string): Promise<UserXP>;
  
  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userId: number, badgeId: number): Promise<UserBadge | undefined>;
  checkBadgeEligibility(userId: number): Promise<Badge[]>;
  
  getWeeklyScenarioForUser(userId: number): Promise<{ scenario: Scenario; userScenario?: UserScenario } | undefined>;
  assignWeeklyScenario(userId: number, scenarioId: number): Promise<UserScenario>;
  
  logEvent(event: InsertEventLog): Promise<EventLog>;
  getUserActivityEvents(userId: number, days?: number): Promise<EventLog[]>;
  
  getDailyPrompt(date: string): Promise<DailyPrompt | undefined>;
  createDailyPrompt(prompt: InsertDailyPrompt): Promise<DailyPrompt>;
  
  // Exit Intent Feedback methods
  createExitIntentFeedback(feedback: InsertExitIntentFeedback): Promise<ExitIntentFeedback>;
}

export class DatabaseStorage implements IStorage {

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserStripeInfo(id: number, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionStatus: 'active'
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserSubscriptionStatus(id: number, status: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ subscriptionStatus: status as any })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }



  async getTotalUsersCount(): Promise<number> {
    const result = await db.select().from(users);
    return result.length;
  }

  // Discount code methods
  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
    const [discountCode] = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.code, code));
    return discountCode || undefined;
  }

  async createDiscountCode(insertDiscountCode: InsertDiscountCode): Promise<DiscountCode> {
    const [discountCode] = await db
      .insert(discountCodes)
      .values(insertDiscountCode)
      .returning();
    return discountCode;
  }

  async incrementDiscountCodeUsage(id: number): Promise<DiscountCode | undefined> {
    const [discountCode] = await db
      .update(discountCodes)
      .set({ usageCount: sql`${discountCodes.usageCount} + 1` })
      .where(eq(discountCodes.id, id))
      .returning();
    return discountCode || undefined;
  }

  async getAllDiscountCodes(): Promise<DiscountCode[]> {
    return await db.select().from(discountCodes);
  }



  // Journal methods
  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    // Ensure compatibility with existing database structure
    const entryData = {
      ...insertEntry,
      text: insertEntry.content || insertEntry.text || '', // Use content if provided, fallback to text
    };

    const [entry] = await db
      .insert(journalEntries)
      .values(entryData)
      .returning();
    return entry;
  }

  async getUserJournalEntries(userId: number): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));
  }

  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));
  }

  async updateJournalEntry(id: number, updates: Partial<JournalEntry>): Promise<JournalEntry | undefined> {
    const [entry] = await db
      .update(journalEntries)
      .set(updates)
      .where(eq(journalEntries.id, id))
      .returning();
    return entry || undefined;
  }

  async getJournalEntryById(id: number): Promise<JournalEntry | undefined> {
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.id, id));
    return entry || undefined;
  }

  async pinJournalEntry(id: number, userId: number): Promise<JournalEntry | undefined> {
    // First unpin any currently pinned entry
    await db
      .update(journalEntries)
      .set({ pinned: false })
      .where(and(eq(journalEntries.userId, userId), eq(journalEntries.pinned, true)));

    // Then pin the requested entry
    const [entry] = await db
      .update(journalEntries)
      .set({ pinned: true })
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
      .returning();
    return entry || undefined;
  }

  async unpinJournalEntry(id: number, userId: number): Promise<JournalEntry | undefined> {
    const [entry] = await db
      .update(journalEntries)
      .set({ pinned: false })
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
      .returning();
    return entry || undefined;
  }

  async getPinnedJournalEntry(userId: number): Promise<JournalEntry | undefined> {
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, userId), eq(journalEntries.pinned, true)));
    return entry || undefined;
  }

  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getChannelMessages(channel: string, limit: number = 50): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.channel, channel))
      .orderBy(desc(messages.timestamp))
      .limit(limit);
  }

  // Pod methods
  async createPod(insertPod: InsertPod): Promise<Pod> {
    const [pod] = await db
      .insert(pods)
      .values(insertPod)
      .returning();
    return pod;
  }

  async getPodById(id: number): Promise<Pod | undefined> {
    const [pod] = await db.select().from(pods).where(eq(pods.id, id));
    return pod || undefined;
  }

  async updatePod(id: number, updates: Partial<Pod>): Promise<Pod | undefined> {
    const [pod] = await db
      .update(pods)
      .set(updates)
      .where(eq(pods.id, id))
      .returning();
    return pod || undefined;
  }

  async getPodMembers(podId: number): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.podId, podId));
  }

  async createPodMessage(message: InsertPodMessage): Promise<PodMessage> {
    const [podMessage] = await db
      .insert(podMessages)
      .values(message)
      .returning();
    return podMessage;
  }

  async getPodMessages(podId: number, limit: number = 50): Promise<(PodMessage & { user: { fullName: string; initials: string } })[]> {
    const results = await db
      .select({
        id: podMessages.id,
        podId: podMessages.podId,
        userId: podMessages.userId,
        text: podMessages.text,
        timestamp: podMessages.timestamp,
        fullName: users.fullName,
      })
      .from(podMessages)
      .leftJoin(users, eq(podMessages.userId, users.id))
      .where(eq(podMessages.podId, podId))
      .orderBy(desc(podMessages.timestamp))
      .limit(limit);

    return results.map(row => ({
      id: row.id,
      podId: row.podId,
      userId: row.userId,
      text: row.text,
      timestamp: row.timestamp,
      user: {
        fullName: row.fullName || "Unknown User",
        initials: (row.fullName || "??").split(' ').map(n => n[0]).join('').toUpperCase()
      }
    }));
  }

  // Auto-assign user to pod (4-6 members per pod)
  async assignUserToPod(userId: number): Promise<number> {
    const MAX_POD_SIZE = 6;

    // Find a pod that isn't full using a subquery approach
    const availablePods = await db
      .select()
      .from(pods)
      .where(sql`(SELECT COUNT(*) FROM ${users} WHERE ${users.podId} = ${pods.id}) < ${MAX_POD_SIZE}`)
      .limit(1);

    let podId: number;

    if (availablePods.length > 0) {
      // Assign to existing pod with space
      podId = availablePods[0].id;
    } else {
      // Create new pod
      const newPod = await this.createPod({
        goalText: "Building consistency in daily habits and accountability"
      });
      podId = newPod.id;
    }

    // Assign user to pod
    await this.updateUser(userId, { podId });

    return podId;
  }

  // Newsletter subscriber methods
  async createSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    const [subscriber] = await db
      .insert(subscribers)
      .values({
        ...insertSubscriber,
        createdAt: Math.floor(Date.now() / 1000)
      })
      .returning();
    return subscriber;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.email, email));
    return subscriber || undefined;
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return await db.select().from(subscribers);
  }

  // Contact form methods
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values({
        ...insertContact,
        createdAt: Math.floor(Date.now() / 1000)
      })
      .returning();
    return contact;
  }

  async getAllContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  // Blog post methods
  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db
      .insert(blogPosts)
      .values(insertBlogPost)
      .returning();
    return post;
  }

  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post || undefined;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts);
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).where(eq(blogPosts.published, true));
  }

  // Chat message methods
  async createChatMessage(insertChatMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertChatMessage)
      .returning();
    return message;
  }

  async getChatHistory(userId: number, limit: number = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.timestamp))
      .limit(limit);
  }

  // Search methods for AM chat contextual linking
  async searchContent(query: string, context: 'public' | 'dashboard'): Promise<{
    type: string;
    title: string;
    url: string;
    relevance: number;
  }[]> {
    const results: { type: string; title: string; url: string; relevance: number; }[] = [];
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);

    // Search blog posts
    const blogPosts = await this.getPublishedBlogPosts();
    for (const post of blogPosts) {
      let relevance = 0;
      const titleLower = post.title.toLowerCase();
      const excerptLower = post.excerpt.toLowerCase();

      // Direct term matching
      for (const term of searchTerms) {
        if (titleLower.includes(term)) relevance += 3;
        if (excerptLower.includes(term)) relevance += 1;
      }

      if (relevance > 0) {
        results.push({
          type: 'blog',
          title: post.title,
          url: `/blog/${post.id}`,
          relevance
        });
      }
    }

    // For dashboard context, also search learning content
    if (context === 'dashboard') {
      try {
        // Search learning courses
        const courses = await this.getAllLearningCourses();
        for (const course of courses) {
          const match = searchTerms.some(term => 
            course.title.toLowerCase().includes(term) ||
            course.description?.toLowerCase().includes(term)
          );
          if (match) {
            results.push({
              type: 'course',
              title: course.title,
              url: `/learning/courses/${course.id}`,
              relevance: 2
            });
          }
        }

        // Add other dashboard resources
        const dashboardResources = [
          { type: 'journal', title: 'Journaling', url: '/dashboard/journal', keywords: ['journal', 'write', 'reflect', 'thoughts', 'daily', 'mindset'] },
          { type: 'community', title: 'AM Community', url: '/dashboard/community', keywords: ['community', 'pod', 'group', 'connect', 'brotherhood', 'support'] },
          { type: 'progress', title: 'Your Progress', url: '/dashboard/progress', keywords: ['progress', 'track', 'growth', 'development', 'stats'] }
        ];

        for (const resource of dashboardResources) {
          const match = searchTerms.some(term => 
            resource.keywords.includes(term) || resource.title.toLowerCase().includes(term)
          );
          if (match) {
            results.push({
              type: resource.type,
              title: resource.title,
              url: resource.url,
              relevance: 1
            });
          }
        }
      } catch (error) {
        console.error('Error searching dashboard content:', error);
      }
    }

    // Filter results based on context - public users only get blog content
    const filteredResults = context === 'public' 
      ? results.filter(r => r.type === 'blog')
      : results;

    // Sort by relevance and return top 3 results
    return filteredResults
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3);
  }

  // ===============================
  // CHALLENGE TRACKER IMPLEMENTATIONS
  // ===============================

  // Challenge methods
  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const [challenge] = await db
      .insert(challenges)
      .values(insertChallenge)
      .returning();
    return challenge;
  }

  async getAllChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges);
  }

  async getChallengeById(id: number): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge;
  }

  async getChallengesByStage(stage: string): Promise<Challenge[]> {
    return await db.select().from(challenges).where(eq(challenges.stage, stage));
  }

  async getChallengesByTags(tags: string[]): Promise<Challenge[]> {
    // This would need a more complex query for PostgreSQL JSONB array overlap
    return await db.select().from(challenges);
  }

  async getTotalChallengesCount(): Promise<number> {
    const result = await db.select().from(challenges);
    return result.length;
  }

  // User Challenge methods
  async createUserChallenge(insertUserChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const challengeData = {
      userId: insertUserChallenge.userId,
      challengeId: insertUserChallenge.challengeId,
      dateIssued: insertUserChallenge.dateIssued,
      status: (insertUserChallenge.status as "pending" | "completed") || "pending",
      reflection: insertUserChallenge.reflection || "",
      completedAt: insertUserChallenge.completedAt || null,
      aiFeedback: insertUserChallenge.aiFeedback || ""
    };

    const [userChallenge] = await db
      .insert(userChallenges)
      .values([challengeData])
      .returning();
    return userChallenge;
  }

  async getUserChallenge(userId: number, challengeId: number): Promise<UserChallenge | undefined> {
    const [userChallenge] = await db
      .select()
      .from(userChallenges)
      .where(and(
        eq(userChallenges.userId, userId),
        eq(userChallenges.challengeId, challengeId)
      ));
    return userChallenge;
  }

  async getTodaysChallenge(userId: number): Promise<UserChallenge | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // First, check if user has ANY challenge issued today (pending OR completed)
    const [todayChallenge] = await db
      .select()
      .from(userChallenges)
      .where(and(
        eq(userChallenges.userId, userId),
        gte(userChallenges.dateIssued, today),
        lt(userChallenges.dateIssued, tomorrow)
      ))
      .orderBy(desc(userChallenges.dateIssued))
      .limit(1);

    if (todayChallenge) {
      // Return today's challenge regardless of status (pending or completed)
      return todayChallenge;
    }

    // No challenge for today, check for pending challenges from previous days
    const [pendingChallenge] = await db
      .select()
      .from(userChallenges)
      .where(and(
        eq(userChallenges.userId, userId),
        eq(userChallenges.status, "pending"),
        lt(userChallenges.dateIssued, today)
      ))
      .orderBy(desc(userChallenges.dateIssued))
      .limit(1);

    if (pendingChallenge) {
      // NEW DAY + PENDING CHALLENGE FROM PREVIOUS DAY = Keep the pending challenge (no new challenge)
      return pendingChallenge;
    }

    // NEW DAY + NO PENDING CHALLENGES = Issue new challenge
    // This includes cases where:
    // 1. Yesterday's challenge was completed
    // 2. No challenges exist yet
    return undefined;
  }

  async getLastCompletedChallenge(userId: number): Promise<UserChallenge | undefined> {
    const [lastCompleted] = await db
      .select()
      .from(userChallenges)
      .where(and(
        eq(userChallenges.userId, userId),
        eq(userChallenges.status, "completed")
      ))
      .orderBy(desc(userChallenges.challengeId))
      .limit(1);

    return lastCompleted;
  }

  async getUserChallengeHistory(userId: number, limit: number = 30): Promise<(UserChallenge & { challenge: Challenge })[]> {
    const results = await db
      .select({
        id: userChallenges.id,
        userId: userChallenges.userId,
        challengeId: userChallenges.challengeId,
        dateIssued: userChallenges.dateIssued,
        status: userChallenges.status,
        reflection: userChallenges.reflection,
        completedAt: userChallenges.completedAt,
        aiFeedback: userChallenges.aiFeedback,
        createdAt: userChallenges.createdAt,
        challenge: challenges
      })
      .from(userChallenges)
      .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
      .where(eq(userChallenges.userId, userId))
      .orderBy(desc(userChallenges.dateIssued))
      .limit(limit);

    return results as (UserChallenge & { challenge: Challenge })[];
  }

  async completeUserChallenge(userId: number, challengeId: number, reflection: string): Promise<UserChallenge | undefined> {
    // Find the most recent pending challenge for this user and challenge ID
    const [pendingChallenge] = await db
      .select()
      .from(userChallenges)
      .where(and(
        eq(userChallenges.userId, userId),
        eq(userChallenges.challengeId, challengeId),
        eq(userChallenges.status, "pending")
      ))
      .orderBy(desc(userChallenges.dateIssued))
      .limit(1);

    if (!pendingChallenge) {
      return undefined;
    }

    // Update only this specific challenge instance
    const [updated] = await db
      .update(userChallenges)
      .set({
        status: "completed" as const,
        reflection,
        completedAt: new Date()
      })
      .where(eq(userChallenges.id, pendingChallenge.id))
      .returning();
    return updated;
  }

  async updateUserChallenge(id: number, updates: Partial<UserChallenge>): Promise<UserChallenge | undefined> {
    const [updated] = await db
      .update(userChallenges)
      .set(updates)
      .where(eq(userChallenges.id, id))
      .returning();
    return updated;
  }

  async getUserChallengeProgress(userId: number): Promise<{
    totalChallenges: number;
    completedChallenges: number;
    currentStreak: number;
    longestStreak: number;
    milestones: Array<{ day: number; label: string; unlocked: boolean }>;
  }> {
    const userChallengeHistory = await db
      .select()
      .from(userChallenges)
      .where(eq(userChallenges.userId, userId))
      .orderBy(desc(userChallenges.dateIssued));

    const completedChallenges = userChallengeHistory.filter(uc => uc.status === "completed").length;
    const totalChallenges = completedChallenges; // Total should be completed challenges for progress tracking

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Sort by date for streak calculation
    const sortedHistory = userChallengeHistory.sort((a, b) => 
      new Date(a.dateIssued).getTime() - new Date(b.dateIssued).getTime()
    );

    for (let i = sortedHistory.length - 1; i >= 0; i--) {
      if (sortedHistory[i].status === "completed") {
        tempStreak++;
        if (i === sortedHistory.length - 1) {
          currentStreak = tempStreak;
        }
      } else {
        if (i === sortedHistory.length - 1) {
          currentStreak = 0;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Define milestones
    const milestones = [
      { day: 1, label: "The First Step", unlocked: completedChallenges >= 1 },
      { day: 7, label: "Armor Off", unlocked: completedChallenges >= 7 },
      { day: 21, label: "Momentum", unlocked: completedChallenges >= 21 },
      { day: 30, label: "The Man in the Mirror", unlocked: completedChallenges >= 30 }
    ];

    return {
      totalChallenges,
      completedChallenges,
      currentStreak,
      longestStreak,
      milestones
    };
  }

  // ===============================
  // MODULAR LEARNING SYSTEM IMPLEMENTATIONS
  // ===============================

  // Learning Course methods
  async createLearningCourse(insertLearningCourse: InsertLearningCourse): Promise<LearningCourse> {
    const [course] = await db
      .insert(learningCourse)
      .values(insertLearningCourse)
      .returning();
    return course;
  }

  async getAllLearningCourses(): Promise<LearningCourse[]> {
    return db.select().from(learningCourse).where(eq(learningCourse.published, true));
  }

  async getLearningCourseById(id: number): Promise<LearningCourse | undefined> {
    const [course] = await db.select().from(learningCourse).where(eq(learningCourse.id, id));
    return course || undefined;
  }

  async getLearningCourseWithLessons(id: number): Promise<(LearningCourse & { lessons: LearningLesson[] }) | undefined> {
    const course = await this.getLearningCourseById(id);
    if (!course) return undefined;

    const lessons = await this.getLearningLessonsByCourse(id);
    return { ...course, lessons };
  }

  // Learning Lesson methods
  async createLearningLesson(insertLearningLesson: InsertLearningLesson): Promise<LearningLesson> {
    const [lesson] = await db
      .insert(learningLesson)
      .values(insertLearningLesson)
      .returning();
    return lesson;
  }

  async getLearningLessonsByCourse(courseId: number): Promise<LearningLesson[]> {
    return db.select()
      .from(learningLesson)
      .where(and(eq(learningLesson.courseId, courseId), eq(learningLesson.published, true)))
      .orderBy(learningLesson.order);
  }

  async getLearningLessonById(id: number): Promise<LearningLesson | undefined> {
    const [lesson] = await db.select().from(learningLesson).where(eq(learningLesson.id, id));
    return lesson || undefined;
  }

  // Learning Progress methods
  async createLearningProgress(insertLearningProgress: InsertLearningProgress): Promise<LearningProgress> {
    // First try to find existing progress
    const existing = await this.getLearningProgress(insertLearningProgress.userId, insertLearningProgress.lessonId);
    if (existing) {
      // Update existing progress
      const updated = await this.updateLearningProgress(insertLearningProgress.userId, insertLearningProgress.lessonId, insertLearningProgress);
      return updated!;
    }

    // Create new progress entry
    const [progress] = await db
      .insert(learningLessonProgress)
      .values(insertLearningProgress)
      .returning();
    return progress;
  }

  async getLearningProgress(userId: number, lessonId: number): Promise<LearningProgress | undefined> {
    const [progress] = await db.select()
      .from(learningLessonProgress)
      .where(and(eq(learningLessonProgress.userId, userId), eq(learningLessonProgress.lessonId, lessonId)));
    return progress || undefined;
  }

  async updateLearningProgress(userId: number, lessonId: number, updates: Partial<LearningProgress>): Promise<LearningProgress | undefined> {
    const [progress] = await db
      .update(learningLessonProgress)
      .set(updates)
      .where(and(eq(learningLessonProgress.userId, userId), eq(learningLessonProgress.lessonId, lessonId)))
      .returning();
    return progress || undefined;
  }

  async getUserLearningProgress(userId: number): Promise<LearningProgress[]> {
    return db.select()
      .from(learningLessonProgress)
      .where(eq(learningLessonProgress.userId, userId))
      .orderBy(desc(learningLessonProgress.createdAt));
  }

  async getCourseProgress(userId: number, courseId: number): Promise<LearningProgress[]> {
    // Join with learningLesson to filter by courseId
    return db.select()
      .from(learningLessonProgress)
      .innerJoin(learningLesson, eq(learningLessonProgress.lessonId, learningLesson.id))
      .where(and(eq(learningLessonProgress.userId, userId), eq(learningLesson.courseId, courseId)))
      .then(rows => rows.map(row => row.learning_lesson_progress));
  }

  async getRecentLearningProgress(userId: number, days: number = 30): Promise<LearningProgress[]> {
   

    return db.select()
      .from(learningLessonProgress)
      .where(and(
        eq(learningLessonProgress.userId, userId),
        eq(learningLessonProgress.completed, true)
      ))
      .orderBy(desc(learningLessonProgress.completedAt));
  }

  async getUserStreak(userId: number): Promise<{ currentStreak: number } | null> {
    // TODO: Implement streak calculation based on daily challenges
    // For now, return null to indicate no active streak
    return null;
  }

  // ===============================
  // SCENARIO-BASED LEARNING METHODS
  // ===============================

  // Scenario methods
  async createScenario(scenario: InsertScenario): Promise<Scenario> {
    const [created] = await db.insert(scenarios).values(scenario).returning();
    return created;
  }

  async getAllScenarios(): Promise<Scenario[]> {
    return db.select().from(scenarios).orderBy(scenarios.createdAt);
  }

  async getScenarioById(id: number): Promise<Scenario | undefined> {
    const [scenario] = await db.select().from(scenarios).where(eq(scenarios.id, id));
    return scenario || undefined;
  }

  async getScenariosByStage(stage: string): Promise<Scenario[]> {
    return db.select().from(scenarios).where(eq(scenarios.stage, stage));
  }

  async getScenariosByTags(tags: string[]): Promise<Scenario[]> {
    // For PostgreSQL array containment, we'll use a simple approach
    const allScenarios = await db.select().from(scenarios);
    return allScenarios.filter(scenario => 
      scenario.tags && scenario.tags.some(tag => tags.includes(tag))
    );
  }

  async getWeeklyScenario(userId: number): Promise<Scenario | undefined> {
    // Get user's scenario history to avoid repeats
    const userHistory = await this.getUserScenarioHistory(userId, 10);
    const usedScenarioIds = userHistory.map(response => response.scenarioId);

    // Get all scenarios and filter out used ones
    const allScenarios = await this.getAllScenarios();
    
    if (allScenarios.length === 0) {
      console.log('No scenarios available in database');
      return undefined;
    }
    
    const availableScenarios = allScenarios.filter(scenario => !usedScenarioIds.includes(scenario.id));

    if (availableScenarios.length === 0) {
      // If all scenarios have been used, reset and pick from all
      console.log('All scenarios used, picking from all available');
      return allScenarios[Math.floor(Math.random() * allScenarios.length)];
    }

    // Pick random scenario from available ones
    console.log(`Picking from ${availableScenarios.length} available scenarios`);
    return availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
  }

  // User Scenario Response methods
  async createUserScenarioResponse(response: InsertUserScenarioResponse): Promise<UserScenarioResponse> {
    const [created] = await db.insert(userScenarioResponses).values(response).returning();
    return created;
  }

  async getUserScenarioResponse(userId: number, scenarioId: number): Promise<UserScenarioResponse | undefined> {
    const [response] = await db.select()
      .from(userScenarioResponses)
      .where(and(
        eq(userScenarioResponses.userId, userId),
        eq(userScenarioResponses.scenarioId, scenarioId)
      ));
    return response || undefined;
  }

  async getThisWeeksScenario(userId: number): Promise<{ scenario: Scenario; userResponse?: UserScenarioResponse } | undefined> {
    // Get start of current week (Monday 00:00:00 UTC)
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday to 6, others subtract 1

    const weekStart = new Date(now);
    weekStart.setUTCDate(weekStart.getUTCDate() - daysFromMonday);
    weekStart.setUTCHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

    // Check if user has a response from this week
    const [thisWeeksResponse] = await db.select()
      .from(userScenarioResponses)
      .where(and(
        eq(userScenarioResponses.userId, userId),
        sql`${userScenarioResponses.completedAt} >= ${weekStart}`,
        sql`${userScenarioResponses.completedAt} < ${weekEnd}`
      ))
      .orderBy(desc(userScenarioResponses.completedAt))
      .limit(1);

    if (thisWeeksResponse) {
      // User has already engaged with a scenario this week
      const scenario = await this.getScenarioById(thisWeeksResponse.scenarioId);
      return scenario ? { scenario, userResponse: thisWeeksResponse } : undefined;
    }

    // No response this week, get a new scenario
    console.log('Getting new weekly scenario for user:', userId);
    const scenario = await this.getWeeklyScenario(userId);
    console.log('Retrieved scenario:', scenario?.id, scenario?.title);
    return scenario ? { scenario } : undefined;
  }

  async getUserScenarioHistory(userId: number, limit: number = 30): Promise<(UserScenarioResponse & { scenario: Scenario })[]> {
    return db.select({
      id: userScenarioResponses.id,
      userId: userScenarioResponses.userId,
      scenarioId: userScenarioResponses.scenarioId,
      selectedOptionIndex: userScenarioResponses.selectedOptionIndex,
      completedAt: userScenarioResponses.completedAt,
      scenario: scenarios
    })
    .from(userScenarioResponses)
    .innerJoin(scenarios, eq(userScenarioResponses.scenarioId, scenarios.id))
    .where(eq(userScenarioResponses.userId, userId))
    .orderBy(desc(userScenarioResponses.completedAt))
    .limit(limit);
  }

  async getUserScenarioStats(userId: number): Promise<{
    totalScenarios: number;
    completedScenarios: number;
    completedThisWeek: number;
    lastCompletedDate: Date | null;
  }> {
    const totalScenarios = await db.select().from(scenarios);
    const userResponses = await db.select()
      .from(userScenarioResponses)
      .where(eq(userScenarioResponses.userId, userId));

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const completedThisWeek = userResponses.filter(response => 
      response.completedAt && response.completedAt > oneWeekAgo
    ).length;

    const lastCompletedResponse = userResponses
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())[0];

    return {
      totalScenarios: totalScenarios.length,
      completedScenarios: userResponses.length,
      completedThisWeek,
      lastCompletedDate: lastCompletedResponse?.completedAt || null
    };
  }

  // ===============================
  // WEEKLY REFLECTION METHODS
  // ===============================

  async createWeeklyReflection(reflection: InsertWeeklyReflection): Promise<WeeklyReflection> {
    const [created] = await db.insert(weeklyReflections).values(reflection).returning();
    return created;
  }

  async getUserWeeklyReflections(userId: number): Promise<WeeklyReflection[]> {
    return db.select()
      .from(weeklyReflections)
      .where(eq(weeklyReflections.userId, userId))
      .orderBy(desc(weeklyReflections.createdAt));
  }

  async getWeeklyReflectionByWeek(userId: number, weekStartDate: string): Promise<WeeklyReflection | undefined> {
    const [reflection] = await db.select()
      .from(weeklyReflections)
      .where(and(
        eq(weeklyReflections.userId, userId),
        eq(weeklyReflections.weekStartDate, weekStartDate)
      ));
    return reflection || undefined;
  }

  async updateWeeklyReflection(id: number, updates: Partial<WeeklyReflection>): Promise<WeeklyReflection | undefined> {
    const [updated] = await db
      .update(weeklyReflections)
      .set(updates)
      .where(eq(weeklyReflections.id, id))
      .returning();
    return updated || undefined;
  }

  async getUserWeeklyReflectionData(userId: number, weekStartDate: string, weekEndDate: string): Promise<{
    lessons: Array<{ id: number; title: string }>;
    challenges: Array<{ id: number; title: string }>;
    milestones: string[];
  }> {
    const startDate = new Date(weekStartDate);
    const endDate = new Date(weekEndDate);

    // Get completed lessons from this week
    const completedLessons = await db.select({
      id: learningLesson.id,
      title: learningLesson.title
    })
    .from(learningLessonProgress)
    .innerJoin(learningLesson, eq(learningLessonProgress.lessonId, learningLesson.id))
    .where(and(
      eq(learningLessonProgress.userId, userId),
      eq(learningLessonProgress.completed, true)
    ));

    // Get completed challenges from this week
    const completedChallenges = await db.select({
      id: challenges.id,
      title: challenges.text
    })
    .from(userChallenges)
    .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
    .where(and(
      eq(userChallenges.userId, userId),
      eq(userChallenges.status, 'completed')
    ));

    // Generate milestones based on progress
    const milestones: string[] = [];
    if (completedLessons.length >= 3) {
      milestones.push('Learning Momentum - 3+ lessons completed');
    }
    if (completedChallenges.length >= 5) {
      milestones.push('Challenge Champion - 5+ challenges completed');
    }
    if (completedLessons.length >= 1 && completedChallenges.length >= 1) {
      milestones.push('Balanced Growth - Both learning and challenges');
    }

    return {
      lessons: completedLessons,
      challenges: completedChallenges.map(c => ({ id: c.id, title: c.title })),
      milestones
    };
  }

  async shouldShowWeeklyReflectionPrompt(userId: number): Promise<boolean> {
    // Check if user has been active for at least 7 days
    const userCreated = await this.getUser(userId);
    if (!userCreated) return false;

    const daysSinceCreation = Math.floor((Date.now() - userCreated.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreation < 7) return false;

    // Check if user has already submitted a reflection this week - Monday to Sunday
    const now = new Date();
    // Adjust for typical business timezone
    const localTime = new Date(now.getTime() - (5 * 60 * 60 * 1000)); // EST adjustment
    const startOfWeek = new Date(localTime);
    startOfWeek.setDate(localTime.getDate() - localTime.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    const weekStartString = startOfWeek.toISOString().split('T')[0];

    const existingReflection = await this.getWeeklyReflectionByWeek(userId, weekStartString);
    return !existingReflection;
  }

  // ===============================
  // NOTIFICATION SETTINGS METHODS
  // ===============================

  async getUserNotificationSettings(userId: number): Promise<UserNotificationSettings | undefined> {
    const [settings] = await db.select().from(userNotificationSettings).where(eq(userNotificationSettings.userId, userId));
    return settings || undefined;
  }

  async createUserNotificationSettings(settings: InsertUserNotificationSettings): Promise<UserNotificationSettings> {
    const [created] = await db.insert(userNotificationSettings).values({
      ...settings,
      updatedAt: new Date()
    }).returning();
    return created;
  }

  async updateUserNotificationSettings(userId: number, updates: Partial<UserNotificationSettings>): Promise<UserNotificationSettings | undefined> {
    try {
      console.log('Storage: Updating notification settings for user:', userId, 'with updates:', updates);

      const [updated] = await db
        .update(userNotificationSettings)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(userNotificationSettings.userId, userId))
        .returning();

      console.log('Storage: Update result:', updated);
      return updated || undefined;
    } catch (error) {
      console.error('Storage: Failed to update notification settings:', error);
      throw error;
    }
  }

  // ===============================
  // GAMIFICATION SYSTEM METHODS
  // ===============================

  async getUserXP(userId: number): Promise<UserXP | undefined> {
    const [xp] = await db.select().from(userXP).where(eq(userXP.userId, userId));
    return xp || undefined;
  }

  async createUserXP(insertUserXP: InsertUserXP): Promise<UserXP> {
    const [xp] = await db.insert(userXP).values(insertUserXP).returning();
    return xp;
  }

  async updateUserXP(userId: number, updates: Partial<UserXP>): Promise<UserXP | undefined> {
    const [xp] = await db
      .update(userXP)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userXP.userId, userId))
      .returning();
    return xp || undefined;
  }

  async addXP(userId: number, amount: number, source: string): Promise<UserXP> {
    // Get current XP or create if doesn't exist
    let currentXP = await this.getUserXP(userId);
    if (!currentXP) {
      currentXP = await this.createUserXP({ userId, currentXP: 0, totalXP: 0, level: 1 });
    }

    const newCurrentXP = currentXP.currentXP + amount;
    const newTotalXP = currentXP.totalXP + amount;
    
    // Calculate new level (every 1000 XP = 1 level)
    const newLevel = Math.floor(newTotalXP / 1000) + 1;
    
    // Update streak if it's a new day
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = currentXP.lastActivityDate;
    
    let newStreak = currentXP.currentStreak;
    if (lastActivity !== today) {
      if (lastActivity === new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]) {
        // Consecutive day
        newStreak++;
      } else {
        // Streak broken or first day
        newStreak = 1;
      }
    }

    const updatedXP = await this.updateUserXP(userId, {
      currentXP: newCurrentXP,
      totalXP: newTotalXP,
      level: newLevel,
      currentStreak: newStreak,
      longestStreak: Math.max(currentXP.longestStreak, newStreak),
      lastActivityDate: today
    });

    // Log the XP gain event
    await this.logEvent({
      userId,
      eventType: 'xp_earned',
      eventData: { source, amount, newLevel: newLevel !== currentXP.level },
      xpAwarded: amount
    });

    // Check for new badges
    const newBadges = await this.checkBadgeEligibility(userId);
    for (const badge of newBadges) {
      await this.awardBadge(userId, badge.id);
    }

    return updatedXP!;
  }

  async getAllBadges(): Promise<Badge[]> {
    return db.select().from(badges).orderBy(badges.rarity, badges.name);
  }

  async getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]> {
    return db.select({
      id: userBadges.id,
      userId: userBadges.userId,
      badgeId: userBadges.badgeId,
      earnedAt: userBadges.earnedAt,
      badge: badges
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId))
    .orderBy(desc(userBadges.earnedAt));
  }

  async awardBadge(userId: number, badgeId: number): Promise<UserBadge | undefined> {
    // Check if user already has this badge
    const [existing] = await db.select()
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));
    
    if (existing) return undefined;

    const [userBadge] = await db.insert(userBadges)
      .values({ userId, badgeId })
      .returning();

    // Get badge info for XP reward
    const badge = await db.select().from(badges).where(eq(badges.id, badgeId));
    if (badge[0]?.xpReward > 0) {
      await this.addXP(userId, badge[0].xpReward, `badge_${badge[0].name}`);
    }

    // Log badge earned event
    await this.logEvent({
      userId,
      eventType: 'badge_earned',
      eventData: { badgeId, badgeName: badge[0]?.name },
      xpAwarded: badge[0]?.xpReward || 0
    });

    return userBadge;
  }

  async checkBadgeEligibility(userId: number): Promise<Badge[]> {
    const userStats = {
      xp: await this.getUserXP(userId),
      completedLessons: await this.getRecentLearningProgress(userId, 365),
      userBadges: await this.getUserBadges(userId),
      challengeHistory: await this.getUserChallengeHistory(userId),
      scenarioHistory: await this.getUserScenarioHistory(userId),
      journalEntries: await this.getUserJournalEntries(userId),
      weeklyReflections: await this.getUserWeeklyReflections(userId)
    };

    const allBadges = await this.getAllBadges();
    const earnedBadgeIds = userStats.userBadges.map(ub => ub.badgeId);
    const eligibleBadges: Badge[] = [];

    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      const criteria = badge.criteria as any;
      let eligible = false;

      switch (criteria.type) {
        case 'lesson_complete':
          eligible = userStats.completedLessons.length >= criteria.count;
          break;
        case 'streak':
          eligible = (userStats.xp?.currentStreak || 0) >= criteria.count;
          break;
        case 'challenge_complete':
          eligible = userStats.challengeHistory.filter(ch => ch.status === 'completed').length >= criteria.count;
          break;
        case 'scenario_complete':
          eligible = userStats.scenarioHistory.length >= criteria.count;
          break;
        case 'journal_entry':
          eligible = userStats.journalEntries.length >= criteria.count;
          break;
        case 'weekly_reflection':
          eligible = userStats.weeklyReflections.length >= criteria.count;
          break;
        case 'level':
          eligible = (userStats.xp?.level || 1) >= criteria.count;
          break;
        case 'total_xp':
          eligible = (userStats.xp?.totalXP || 0) >= criteria.count;
          break;
        case 'compound':
          eligible = (userStats.xp?.level || 1) >= criteria.level && 
                    (userStats.xp?.currentStreak || 0) >= criteria.streak;
          break;
      }

      if (eligible) {
        eligibleBadges.push(badge);
      }
    }

    return eligibleBadges;
  }

  async getWeeklyScenarioForUser(userId: number): Promise<{ scenario: Scenario; userScenario?: UserScenario } | undefined> {
    // Get start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setUTCDate(weekStart.getUTCDate() - daysFromMonday);
    weekStart.setUTCHours(0, 0, 0, 0);
    
    const weekStartDate = weekStart.toISOString().split('T')[0];

    // Check if user has assigned scenario for this week
    const [userScenario] = await db.select()
      .from(userScenarios)
      .where(and(
        eq(userScenarios.userId, userId),
        eq(userScenarios.weekStartDate, weekStartDate)
      ));

    if (userScenario) {
      const scenario = await this.getScenarioById(userScenario.scenarioId);
      return scenario ? { scenario, userScenario } : undefined;
    }

    // No scenario assigned, assign a new one
    const availableScenario = await this.getWeeklyScenario(userId);
    if (!availableScenario) return undefined;

    const newUserScenario = await this.assignWeeklyScenario(userId, availableScenario.id);
    return { scenario: availableScenario, userScenario: newUserScenario };
  }

  async assignWeeklyScenario(userId: number, scenarioId: number): Promise<UserScenario> {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setUTCDate(weekStart.getUTCDate() - daysFromMonday);
    weekStart.setUTCHours(0, 0, 0, 0);
    
    const weekStartDate = weekStart.toISOString().split('T')[0];

    const [userScenario] = await db.insert(userScenarios)
      .values({ userId, scenarioId, weekStartDate })
      .returning();

    return userScenario;
  }

  async logEvent(event: InsertEventLog): Promise<EventLog> {
    const [logEntry] = await db.insert(eventLog).values(event).returning();
    return logEntry;
  }

  async getUserActivityEvents(userId: number, days: number = 30): Promise<EventLog[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return db.select()
      .from(eventLog)
      .where(and(
        eq(eventLog.userId, userId),
        gte(eventLog.createdAt, cutoffDate)
      ))
      .orderBy(desc(eventLog.createdAt));
  }

  async getDailyPrompt(date: string): Promise<DailyPrompt | undefined> {
    const [prompt] = await db.select().from(dailyPrompts).where(eq(dailyPrompts.date, date));
    return prompt || undefined;
  }

  async createDailyPrompt(prompt: InsertDailyPrompt): Promise<DailyPrompt> {
    const [created] = await db.insert(dailyPrompts).values(prompt).returning();
    return created;
  }

  // Exit Intent Feedback methods
  async createExitIntentFeedback(feedback: InsertExitIntentFeedback): Promise<ExitIntentFeedback> {
    const [created] = await db.insert(exitIntentFeedback).values(feedback).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();