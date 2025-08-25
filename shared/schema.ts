import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - extended for authentication and personalization
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  personaTag: text("persona_tag"),
  onboardingComplete: boolean("onboarding_complete").default(false).notNull(),
  onboardingAnswers: jsonb("onboarding_answers"),
  podId: integer("pod_id"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").$type<"active" | "canceled" | "past_due" | "trialing" | "incomplete" | null>(),
  isDevAccount: boolean("is_dev_account").default(false).notNull(),
  ignoredTags: jsonb("ignored_tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resetToken: text("reset_token"),
  resetTokenExpires: timestamp("reset_token_expires"),
});

// User notification settings
export const userNotificationSettings = pgTable("user_notification_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  enableBrowserNotifications: boolean("enable_browser_notifications").default(true).notNull(),
  enableWeeklyReflectionReminders: boolean("enable_weekly_reflection_reminders").default(true).notNull(),
  enableDailyChallengeNotifications: boolean("enable_daily_challenge_notifications").default(true).notNull(),
  enableJournalReminders: boolean("enable_journal_reminders").default(true).notNull(),
  enableCommunityNotifications: boolean("enable_community_notifications").default(false).notNull(),
  notificationTime: text("notification_time").default("09:00").notNull(), // HH:MM format
  timezone: text("timezone").default("America/New_York").notNull(),
  pushSubscription: jsonb("push_subscription"), // Store push subscription for web push
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});



// Journal Entries
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  lessonId: integer("lesson_id").references(() => learningLesson.id), // Links to learning lessons
  challengeId: integer("challenge_id"), // Links to challenges (future implementation)
  scenarioId: integer("scenario_id").references(() => scenarios.id), // Links to scenarios
  selectedOptionIndex: integer("selected_option_index"), // Captures user's scenario choice
  text: text("text").notNull(), // Existing column name
  content: text("content"), // New column name for compatibility
  aiFollowUps: text("ai_follow_ups").array(), // Existing column name
  aiAffirmation: text("ai_affirmation"), // Existing column name
  aiReflection: jsonb("ai_reflection"), // Complete AI reflection with questions, affirmation, insight
  aiResponseThreads: jsonb("ai_response_threads").$type<{questionIndex: number, userResponse: string, aiFollowUp?: string}[]>().default([]),
  pinned: boolean("pinned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Messages for community chat
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  channel: text("channel").notNull(), // global, fatherhood, etc.
  text: text("text").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Pods for accountability groups
export const pods = pgTable("pods", {
  id: serial("id").primaryKey(),
  goalText: text("goal_text").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Pod messages for accountability group chat
export const podMessages = pgTable("pod_messages", {
  id: serial("id").primaryKey(),
  podId: integer("pod_id").references(() => pods.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  text: text("text").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Newsletter subscribers table (existing)
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at").notNull(),
  createdTime: timestamp("created_time").defaultNow(),
});

// Contact form submissions table (existing)
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: integer("created_at").notNull(),
  createdTime: timestamp("created_time").defaultNow(),
});

// Blog posts table (existing)
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  date: text("date").notNull(),
  published: boolean("published").notNull().default(false),
});

// Discount codes table for testing and promotions
export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: text("code").unique().notNull(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  usageLimit: integer("usage_limit"), // null = unlimited
  usageCount: integer("usage_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// Chat messages table for AM conversational AI
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' or 'am'
  text: text("text").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Scenarios for immersive decision-point learning
export const scenarios = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  options: jsonb("options").notNull(), // Array of { text, feedback }
  stage: text("stage"), // Optional course alignment
  tags: text("tags").array(), // ["conflict", "temptation", "work"]
  journalPrompt: text("journal_prompt"), // Optional custom journal prompt
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User responses to scenarios
export const userScenarioResponses = pgTable("user_scenario_responses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  scenarioId: integer("scenario_id").references(() => scenarios.id).notNull(),
  selectedOptionIndex: integer("selected_option_index").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Exit-intent feedback for marketing optimization
export const exitIntentFeedback = pgTable("exit_intent_feedback", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(), // Anonymous session tracking
  page: text("page").notNull(), // Which page they were leaving from
  selectedReasons: jsonb("selected_reasons").$type<string[]>().default([]), // Array of checkbox selections
  customFeedback: text("custom_feedback"), // Free text feedback
  userAgent: text("user_agent"), // Browser/device info
  referrer: text("referrer"), // Where they came from
  timeOnPage: integer("time_on_page"), // Seconds spent on page
  scrollDepth: integer("scroll_depth"), // Percentage scrolled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  pod: one(pods, {
    fields: [users.podId],
    references: [pods.id],
  }),
  notificationSettings: one(userNotificationSettings, {
    fields: [users.id],
    references: [userNotificationSettings.userId],
  }),
  journalEntries: many(journalEntries),
  messages: many(messages),
  chatMessages: many(chatMessages),
  userChallenges: many(userChallenges),
  userScenarioResponses: many(userScenarioResponses),
  weeklyReflections: many(weeklyReflections),
}));

export const scenariosRelations = relations(scenarios, ({ many }) => ({
  userResponses: many(userScenarioResponses),
}));

export const userScenarioResponsesRelations = relations(userScenarioResponses, ({ one }) => ({
  user: one(users, {
    fields: [userScenarioResponses.userId],
    references: [users.id],
  }),
  scenario: one(scenarios, {
    fields: [userScenarioResponses.scenarioId],
    references: [scenarios.id],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
  lesson: one(learningLesson, {
    fields: [journalEntries.lessonId],
    references: [learningLesson.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

export const podsRelations = relations(pods, ({ many }) => ({
  members: many(users),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  passwordHash: true,
  fullName: true,
  subscriptionStatus: true,
  onboardingComplete: true,
  personaTag: true,
  onboardingAnswers: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
  aiReflection: true,
  aiFollowUps: true,
  aiAffirmation: true,
  pinned: true,
}).extend({
  text: z.string().optional(), // Make text optional since we'll populate it from content
  content: z.string().optional(), // Support both text and content fields
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  userId: true,
  channel: true,
  text: true,
});



export const insertSubscriberSchema = createInsertSchema(subscribers).pick({
  firstName: true,
  lastName: true,
  email: true,
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  excerpt: true,
  content: true,
  imageUrl: true,
  category: true,
  date: true,
  published: true,
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({
  id: true,
  createdAt: true,
  usageCount: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  role: true,
  text: true,
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({
  id: true,
  createdAt: true,
});

export const insertUserScenarioResponseSchema = createInsertSchema(userScenarioResponses).omit({
  id: true,
  completedAt: true,
});

export const insertExitIntentFeedbackSchema = createInsertSchema(exitIntentFeedback).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;



export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenario = z.infer<typeof insertScenarioSchema>;

export type UserScenarioResponse = typeof userScenarioResponses.$inferSelect;
export type InsertUserScenarioResponse = z.infer<typeof insertUserScenarioResponseSchema>;

export type ExitIntentFeedback = typeof exitIntentFeedback.$inferSelect;
export type InsertExitIntentFeedback = z.infer<typeof insertExitIntentFeedbackSchema>;

// ===============================
// HABIT & CHALLENGE TRACKER
// ===============================

// Challenges - Daily challenges for users
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  description: text("description").default(""),
  stage: text("stage").default(""),
  tags: jsonb("tags").$type<string[]>().default([]),
  visualizationPrompt: text("visualization_prompt"), // Optional visualization exercise
  visualizationGoals: jsonb("visualization_goals").$type<string[]>().default([]), // Forward-looking goal categories
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Challenges - Track user progress on challenges
export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeId: integer("challenge_id").notNull().references(() => challenges.id, { onDelete: "cascade" }),
  dateIssued: timestamp("date_issued").notNull(),
  status: text("status").$type<"pending" | "completed">().default("pending").notNull(),
  reflection: text("reflection").default(""),
  completedAt: timestamp("completed_at"),
  aiFeedback: text("ai_feedback").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ===============================
// MODULAR LEARNING SYSTEM
// ===============================

// Learning Courses - Completely separate from existing courses
export const learningCourse = pgTable("learning_course", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  stages: jsonb("stages"), // Array of stage names
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Learning Lessons - Completely separate from existing lessons  
export const learningLesson = pgTable("learning_lesson", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => learningCourse.id, { onDelete: "cascade" }).notNull(),
  order: integer("order").notNull(),
  stage: text("stage").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  evidenceByte: text("evidence_byte"), // Study citation blurb
  quiz: jsonb("quiz"), // Array of quiz questions
  scenarioId: integer("scenario_id").references(() => scenarios.id), // Optional linked scenario
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Learning Progress - Completely separate progress tracking
export const learningLessonProgress = pgTable("learning_lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  lessonId: integer("lesson_id").references(() => learningLesson.id, { onDelete: "cascade" }).notNull(),
  completed: boolean("completed").default(false).notNull(),
  quizScore: integer("quiz_score"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Learning Relations
export const learningCourseRelations = relations(learningCourse, ({ many }) => ({
  lessons: many(learningLesson),
  progress: many(learningLessonProgress),
}));

export const learningLessonRelations = relations(learningLesson, ({ one, many }) => ({
  course: one(learningCourse, {
    fields: [learningLesson.courseId],
    references: [learningCourse.id],
  }),
  scenario: one(scenarios, {
    fields: [learningLesson.scenarioId],
    references: [scenarios.id],
  }),
  progress: many(learningLessonProgress),
}));

export const learningLessonProgressRelations = relations(learningLessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [learningLessonProgress.userId],
    references: [users.id],
  }),
  lesson: one(learningLesson, {
    fields: [learningLessonProgress.lessonId],
    references: [learningLesson.id],
  }),
}));

// Learning Insert Schemas
export const insertLearningCourseSchema = createInsertSchema(learningCourse).omit({
  id: true,
  createdAt: true,
});

export const insertLearningLessonSchema = createInsertSchema(learningLesson).omit({
  id: true,
  createdAt: true,
});

export const insertLearningProgressSchema = createInsertSchema(learningLessonProgress).omit({
  id: true,
  createdAt: true,
});

// Learning Types
export type LearningCourse = typeof learningCourse.$inferSelect;
export type InsertLearningCourse = z.infer<typeof insertLearningCourseSchema>;

export type LearningLesson = typeof learningLesson.$inferSelect;
export type InsertLearningLesson = z.infer<typeof insertLearningLessonSchema>;

export type LearningProgress = typeof learningLessonProgress.$inferSelect;
export type InsertLearningProgress = z.infer<typeof insertLearningProgressSchema>;

// ===============================
// CHALLENGE TRACKER RELATIONS
// ===============================

export const challengesRelations = relations(challenges, ({ many }) => ({
  userChallenges: many(userChallenges),
}));

export const userChallengesRelations = relations(userChallenges, ({ one }) => ({
  user: one(users, {
    fields: [userChallenges.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [userChallenges.challengeId],
    references: [challenges.id],
  }),
}));

// Challenge Insert Schemas
export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
});

export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  createdAt: true,
});

// Challenge Types
export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;

// ===============================
// WEEKLY REFLECTION SYSTEM
// ===============================

// Weekly Reflections - User weekly progress reflections
export const weeklyReflections = pgTable("weekly_reflections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  weekStartDate: date("week_start_date").notNull(),
  weekEndDate: date("week_end_date").notNull(),
  reflection: text("reflection").notNull(),
  emoji: text("emoji").default(""),
  pinned: boolean("pinned").default(false).notNull(),
  lessonsCompleted: jsonb("lessons_completed").$type<number[]>().default([]),
  challengesCompleted: jsonb("challenges_completed").$type<number[]>().default([]),
  milestonesUnlocked: jsonb("milestones_unlocked").$type<string[]>().default([]),
  weeklyGoals: jsonb("weekly_goals").$type<{goal: string, category: string}[]>().default([]),
  goalVisualizations: jsonb("goal_visualizations").$type<string[]>().default([]),
  goalCompletions: jsonb("goal_completions").$type<boolean[]>().default([]),
  amSummary: text("am_summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Weekly Reflection Relations
export const weeklyReflectionsRelations = relations(weeklyReflections, ({ one }) => ({
  user: one(users, {
    fields: [weeklyReflections.userId],
    references: [users.id],
  }),
}));

// Weekly Reflection Insert Schema
export const insertWeeklyReflectionSchema = createInsertSchema(weeklyReflections).omit({
  id: true,
  createdAt: true,
});

// Weekly Reflection Types
export type WeeklyReflection = typeof weeklyReflections.$inferSelect;
export type InsertWeeklyReflection = z.infer<typeof insertWeeklyReflectionSchema>;

// User Notification Settings Relations
export const userNotificationSettingsRelations = relations(userNotificationSettings, ({ one }) => ({
  user: one(users, {
    fields: [userNotificationSettings.userId],
    references: [users.id],
  }),
}));

// User Notification Settings Insert Schema
export const insertUserNotificationSettingsSchema = createInsertSchema(userNotificationSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// User Notification Settings Types
export type UserNotificationSettings = typeof userNotificationSettings.$inferSelect;
export type InsertUserNotificationSettings = z.infer<typeof insertUserNotificationSettingsSchema>;

// ===============================
// GAMIFICATION SYSTEM
// ===============================

// User XP tracking
export const userXP = pgTable("user_xp", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  currentXP: integer("current_xp").default(0).notNull(),
  totalXP: integer("total_xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastActivityDate: date("last_activity_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Badges system
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  criteria: jsonb("criteria").notNull(), // Badge unlock criteria
  xpReward: integer("xp_reward").default(0).notNull(),
  rarity: text("rarity").$type<"common" | "rare" | "epic" | "legendary">().default("common").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User badges (many-to-many)
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  badgeId: integer("badge_id").references(() => badges.id, { onDelete: "cascade" }).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// Weekly scenario persistence
export const userScenarios = pgTable("user_scenarios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  scenarioId: integer("scenario_id").references(() => scenarios.id, { onDelete: "cascade" }).notNull(),
  weekStartDate: date("week_start_date").notNull(), // Monday of the week
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

// Event logging for analytics
export const eventLog = pgTable("event_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  eventType: text("event_type").notNull(), // lesson_complete, xp_earned, badge_earned, etc.
  eventData: jsonb("event_data"), // Additional event details
  xpAwarded: integer("xp_awarded").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Daily prompts
export const dailyPrompts = pgTable("daily_prompts", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  prompt: text("prompt").notNull(),
  theme: text("theme").notNull(),
  citation: text("citation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Gamification Relations
export const userXPRelations = relations(userXP, ({ one }) => ({
  user: one(users, {
    fields: [userXP.userId],
    references: [users.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const userScenariosRelations = relations(userScenarios, ({ one }) => ({
  user: one(users, {
    fields: [userScenarios.userId],
    references: [users.id],
  }),
  scenario: one(scenarios, {
    fields: [userScenarios.scenarioId],
    references: [scenarios.id],
  }),
}));

export const eventLogRelations = relations(eventLog, ({ one }) => ({
  user: one(users, {
    fields: [eventLog.userId],
    references: [users.id],
  }),
}));

// Gamification Insert Schemas
export const insertUserXPSchema = createInsertSchema(userXP).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

export const insertUserScenarioSchema = createInsertSchema(userScenarios).omit({
  id: true,
  assignedAt: true,
});

export const insertEventLogSchema = createInsertSchema(eventLog).omit({
  id: true,
  createdAt: true,
});

export const insertDailyPromptSchema = createInsertSchema(dailyPrompts).omit({
  id: true,
  createdAt: true,
});

// Gamification Types
export type UserXP = typeof userXP.$inferSelect;
export type InsertUserXP = z.infer<typeof insertUserXPSchema>;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;

export type UserScenario = typeof userScenarios.$inferSelect;
export type InsertUserScenario = z.infer<typeof insertUserScenarioSchema>;

export type EventLog = typeof eventLog.$inferSelect;
export type InsertEventLog = z.infer<typeof insertEventLogSchema>;

export type DailyPrompt = typeof dailyPrompts.$inferSelect;
export type InsertDailyPrompt = z.infer<typeof insertDailyPromptSchema>;

// Pod Relations
export const podRelations = relations(pods, ({ many }) => ({
  members: many(users),
  messages: many(podMessages),
}));

export const podMessageRelations = relations(podMessages, ({ one }) => ({
  pod: one(pods, {
    fields: [podMessages.podId],
    references: [pods.id],
  }),
  user: one(users, {
    fields: [podMessages.userId],
    references: [users.id],
  }),
}));

// Pod Insert Schemas
export const insertPodSchema = createInsertSchema(pods).omit({
  id: true,
  createdAt: true,
});

export const insertPodMessageSchema = createInsertSchema(podMessages).omit({
  id: true,
  timestamp: true,
});

// Pod Types
export type Pod = typeof pods.$inferSelect;
export type PodMessage = typeof podMessages.$inferSelect;
export type InsertPod = z.infer<typeof insertPodSchema>;
export type InsertPodMessage = z.infer<typeof insertPodMessageSchema>;


