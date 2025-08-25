# The AM Project - Complete System Implementation Guide

## PROJECT OVERVIEW
You are inheriting a sophisticated men's personal development platform called "The AM Project" that combines PWA capabilities, gamification, AI-powered content generation, and subscription management. The platform's core business vision is driving membership conversions through authentic personal growth content.

## CRITICAL CURRENT ISSUE
**REACT HOOK ERROR IN PWA PROVIDER**: The application crashes with "Invalid hook call. Hooks can only be called inside of the body of a function component" in PWAProvider component. Even minimal bubble components break the app. The issue appears to be with React context provider structure or component tree ordering. Dashboard implementation works perfectly; global bubble implementation consistently crashes.

**User Daniel** has been working on this extensively and needs the AM Chat bubble functionality fixed immediately.

## USER PREFERENCES & BRAND STANDARDS
- **Communication**: Simple, everyday language (user is non-technical)
- **Timezone**: Denver/Mountain Time (MDT/MST) 
- **Content**: NO emojis anywhere. NO false statistics. Use authentic testimonials only
- **Primary Goal**: Membership conversions, NOT newsletter signups
- **Brand Colors**: Primary Brown (#7C4A32), Dark Gray (#0A0A0A, #0E0E0E), Warm Cream (#F5EDE1), Gold Accent (#E4B768)
- **FORBIDDEN**: Blue and gray-blue colors are strictly forbidden

## COMPLETE SYSTEM ARCHITECTURE & FUNCTIONAL SPECIFICATIONS

### 1. NOTIFICATION SYSTEM - COMPLETE FUNCTIONAL SPECIFICATION

**Purpose**: Drive user engagement through intelligent, personalized notifications

**Core Configuration**:
```typescript
// Timing & Rate Limiting
quietHours: { start: 22, end: 9 } // 10 PM to 9 AM - NO notifications
dailyLimit: 3 // Maximum 3 notifications per day
retryDelays: [5, 15, 45] // Exponential backoff in minutes
```

**6 Notification Types - Exact Implementation**:

1. **Daily Challenge (`daily-challenge`)**
   - **Trigger**: New day detected, user hasn't completed today's challenge
   - **Timing**: 9 AM - 8 PM only
   - **Content**: 4 A/B tested variations with motivational messaging
   - **Personalization**: Adapts to streak status, time of day, user type
   - **Action**: Click opens challenge page

2. **Streak Protection (`streak-protection`)**
   - **Trigger**: 11:59 PM, user has active streak but no activity today
   - **Priority**: HIGH - can override some quiet hour restrictions
   - **Content**: Shows current streak count + urgency messaging
   - **Frequency**: Only when streak is at risk
   - **Action**: Direct to challenge or journal

3. **Habit Nudge (`habit-nudge`)**
   - **Trigger**: Based on user's historical activity patterns
   - **Timing**: Personalized optimal times (typically 2 PM)
   - **Content**: 4 variations focusing on habit formation
   - **Frequency**: Maximum once per day
   - **Logic**: Only triggers if no other activity in 24 hours

4. **Course Reminder (`course-reminder`)**
   - **Trigger**: 24-48 hours after last course activity
   - **Content**: Shows progress percentage and course name
   - **Personalization**: Different messaging for different completion levels
   - **Frequency**: Every 2-3 days until re-engagement
   - **Action**: Opens specific course/lesson page

5. **Scenario Reminder (`scenario-reminder`)**
   - **Trigger**: Weekly scenarios available but not completed
   - **Timing**: Varied to prevent predictability (7-8 PM typically)
   - **Content**: 4 rotating variations emphasizing real-world application
   - **Frequency**: 2-3 times per week maximum
   - **Action**: Opens scenario page

6. **Re-engagement (`re-engagement`)**
   - **Trigger**: 3-7 days of complete inactivity
   - **Content**: Varies by days away (3-day vs 7-day messaging)
   - **Tone**: Non-pushy, value-focused
   - **Frequency**: Every 3 days during inactive period
   - **Action**: Returns to dashboard

**A/B Testing System**:
- Each notification type has 4 content variations with weighted selection
- Performance tracking: click-through rates, engagement metrics
- Automatic optimization based on winning variations

**User Controls**:
- Master notification toggle
- Individual type toggles (daily challenges, scenarios, etc.)
- Timezone override capability
- Quiet hours customization

### 2. DAILY CHALLENGES SYSTEM - COMPLETE FUNCTIONAL SPECIFICATION

**Purpose**: Drive daily engagement through personalized challenges

**Challenge Assignment Logic**:
```typescript
// Sequential assignment starting from challenge ID 1
// Each user gets the next challenge in sequence
// Challenges reset if user completes all available ones
```

**Challenge Structure**:
- **Text**: Main challenge description (motivational + actionable)
- **Stage**: Persona-based categorization (Discipline, Leadership, Mental Fitness, Fatherhood)
- **XP Reward**: 25-100 XP based on difficulty
- **Rarity**: Common, Rare, Epic, Legendary
- **Tags**: Categorization for filtering and analytics

**Completion Requirements**:
1. User must submit a reflection (minimum 50 characters)
2. System automatically creates journal entry
3. XP is awarded immediately upon completion
4. Streak counter updates
5. Badge progress is evaluated

**Streak Calculation**:
- Current streak: Consecutive days with completed challenges
- Longest streak: Historical maximum
- Streak protection: Notification system prevents loss
- Reset condition: Missing a day breaks the streak

**Integration Points**:
- Journal: Automatic entry creation with challenge context
- Gamification: XP rewards, badge progress
- Notifications: Triggers daily challenge reminders
- Analytics: Completion rates, engagement tracking

### 3. JOURNAL SYSTEM - COMPLETE FUNCTIONAL SPECIFICATION

**Purpose**: Facilitate self-reflection through AI-powered prompts and insights

**Entry Types & Creation**:
1. **Lesson Reflections**: Auto-created when completing lessons
2. **Challenge Entries**: Created during challenge completion
3. **Scenario Responses**: Generated from weekly scenario choices
4. **Personal Entries**: User-initiated standalone reflections

**AI Integration - GPT-4o Powered**:
```typescript
// AI Reflection Generation
{
  insight: string; // Key takeaway from user's reflection
  affirmation: string; // Personalized encouragement
  questions: string[]; // 2-3 follow-up questions for deeper reflection
}
```

**Interactive AI Features**:
- Users can respond to AI-generated questions
- AI provides follow-up responses to user answers
- Conversation threading maintains context
- Response history stored for pattern analysis

**Entry Management**:
- **Create**: Rich text editor with formatting support
- **Edit**: In-place editing for existing entries
- **Pin/Unpin**: Featured entries for quick access
- **Delete**: Soft delete with recovery option
- **Search**: Full-text search across all entries

**Formatting & Display**:
- Markdown support for structured content
- Special formatting for scenario reflections
- Code syntax highlighting for action steps
- Responsive design for mobile/desktop

**Database Integration**:
```typescript
journalEntries: {
  text: string; // User's original reflection
  aiReflection: AIReflection; // Generated insights
  aiResponseThreads: ResponseThread[]; // Q&A conversations
  lessonId?: number; // Optional lesson association
  challengeId?: number; // Optional challenge association
  scenarioId?: number; // Optional scenario association
  pinned: boolean; // Featured status
}
```

### 4. AI CHAT SYSTEM - COMPLETE FUNCTIONAL SPECIFICATION

**Purpose**: Provide context-aware mentorship as "AM" (Authentic Masculinity)

**AM Persona Characteristics**:
- **Tone**: Warm but direct, like a wise mentor/best friend
- **Knowledge**: Complete access to user's progress, history, goals
- **Personalization**: Uses real name "Daniel" throughout conversations
- **Approach**: Practical guidance, not theoretical discussions

**Context Awareness - Real-Time Data Integration**:
```typescript
// User Context Available to AI
{
  firstName: "Daniel", // Always use real name
  currentStreak: number,
  xpLevel: number,
  completedLessons: string[],
  recentChallenges: Challenge[],
  journalEntries: Entry[],
  weeklyGoals: Goal[],
  strugglingAreas: string[]
}
```

**Response Intelligence**:
- Adapts messaging based on user's current progress
- References specific lessons/challenges user has completed
- Provides actionable next steps based on user's journey
- Maintains conversation continuity across sessions

**Implementation Types**:
1. **Bubble Type (CURRENTLY BROKEN)**: Global floating chat
2. **Dashboard Type (WORKING)**: Inline component on dashboard
3. **Homepage Type (WORKING)**: Marketing page integration

**Authentication-Aware Responses**:
- **Authenticated**: Personalized with user data, progress-specific guidance
- **Public**: General motivational content, encourages sign-up

**Conversation Persistence**:
- Chat history stored per user
- Context maintained across page refreshes
- Previous conversations inform current responses

### 5. WEEKLY SCENARIOS SYSTEM - COMPLETE FUNCTIONAL SPECIFICATION

**Purpose**: Present moral/ethical decision-making challenges for character development

**Scenario Structure**:
```typescript
{
  title: string; // Engaging scenario title
  prompt: string; // Situation description (150-300 words)
  options: Option[]; // 3-4 choices with different approaches
  stage: string; // Persona alignment (Fatherhood, Leadership, etc.)
  tags: string[]; // Theme categorization
  journalPrompt: string; // Generated reflection question
}
```

**Assignment Logic**:
- One scenario assigned per user per week (Monday reset)
- Scenarios chosen based on user's persona and progress
- No scenario repeats until all are completed
- Emergency scenarios for specific situations

**User Choice Processing**:
1. User selects from available options
2. Choice feedback provided immediately
3. Journal entry automatically created with:
   - Scenario context
   - User's chosen option and reasoning
   - Generated reflection prompt
4. XP awarded (50-150 XP based on complexity)

**Option Design Philosophy**:
- No "wrong" answers - all options explore different approaches
- Options represent: impulsive, thoughtful, avoidant, confrontational styles
- Feedback helps user understand consequences and growth opportunities

**Integration Points**:
- Journal: Automatic entry creation with structured format
- Gamification: XP rewards, scenario completion badges
- AI Chat: References scenario choices in future conversations
- Analytics: Choice patterns reveal personality insights

### 6. WEEKLY REFLECTIONS SYSTEM - COMPLETE FUNCTIONAL SPECIFICATION

**Purpose**: Facilitate comprehensive progress review and goal setting

**Trigger Logic**:
- Automatic prompt every Sunday at 6 PM
- Fallback notifications Monday/Tuesday if missed
- Manual access available anytime via dashboard

**Progress Aggregation**:
```typescript
weeklyData = {
  lessonsCompleted: string[],
  challengesCompleted: number,
  journalEntriesCreated: number,
  xpEarned: number,
  badgesUnlocked: Badge[],
  scenariosCompleted: Scenario[],
  streakMaintained: boolean
}
```

**AI-Powered Insights**:
- Combines user reflection with objective progress data
- Identifies patterns in behavior and choices
- Suggests areas for focus in upcoming week
- Celebrates achievements and acknowledges struggles

**Goal Setting Integration**:
- Users set 2-3 specific goals for upcoming week
- Goals tracked automatically through system activity
- Progress updates provided in notifications
- Goal completion factored into XP and badge systems

### 7. GAMIFICATION SYSTEM - COMPLETE FUNCTIONAL SPECIFICATION

**Purpose**: Motivate engagement through progress tracking and achievement recognition

**XP System**:
```typescript
// XP Rewards by Activity
{
  lessonComplete: 50,
  challengeComplete: 25-100, // Based on difficulty
  scenarioComplete: 75,
  journalEntry: 15,
  weeklyReflection: 100,
  streakMilestone: 200 // 7, 14, 30 day bonuses
}
```

**Level Progression**:
- Level 1-5: 100 XP per level (beginner)
- Level 6-10: 200 XP per level (intermediate)  
- Level 11-20: 500 XP per level (advanced)
- Level 21+: 1000 XP per level (master)

**Badge System - 4 Rarity Tiers**:
1. **Common Badges**: Basic milestones (first lesson, first challenge)
2. **Rare Badges**: Consistency achievements (7-day streak, 5 scenarios)
3. **Epic Badges**: Significant milestones (level 5, 1000 XP)
4. **Legendary Badges**: Major accomplishments (level 10 + 30-day streak)

**Badge Unlock Criteria Examples**:
- First Step: Complete 1 lesson (50 XP, Common)
- Dedicated: 7-day streak (200 XP, Rare)
- Level Up: Reach level 5 (500 XP, Epic)
- AM Legend: Level 10 + 30-day streak (1000 XP, Legendary)

**Progress Tracking**:
- Real-time XP updates across all pages
- Badge progress indicators
- Streak counters with loss protection
- Level progression bars

### 8. LEARNING MANAGEMENT SYSTEM - COMPLETE FUNCTIONAL SPECIFICATION

**Purpose**: Deliver structured educational content with progress tracking

**Course Structure**:
```typescript
{
  title: string,
  description: string,
  stage: string, // Persona alignment
  difficulty: string, // Beginner, Intermediate, Advanced
  lessons: Lesson[], // Ordered lesson sequence
  totalXP: number // Sum of all lesson XP rewards
}
```

**Lesson Implementation**:
- Video content with playback tracking
- Text-based lessons with reading time estimation
- Interactive exercises with completion requirements
- Quiz components with passing thresholds

**Progress Persistence**:
- Lesson completion status stored per user
- Resume capability for partially completed lessons
- Course completion certificates
- Progress percentages calculated dynamically

**XP & Badge Integration**:
- Each lesson awards 50 XP upon completion
- Course completion bonuses (100-500 XP)
- Learning-specific badges (Scholar, Dedicated Learner)
- Streak bonuses for consecutive lesson days

### 9. PROGRAMMATIC SEO SYSTEM - COMPLETE FUNCTIONAL SPECIFICATION

**Purpose**: Generate dynamic landing pages targeting specific keywords and search intents

**Content Templates**:
1. **Mental Fitness**: Targets "mental toughness," "emotional resilience"
2. **Discipline**: Targets "self-discipline," "willpower," "habit formation"  
3. **Leadership**: Targets "authentic leadership," "leading by example"
4. **Fatherhood**: Targets "conscious parenting," "father development"

**Dynamic Content Generation**:
- Keyword-specific headlines and subheadlines
- Tailored problem/solution messaging
- Relevant testimonials and social proof
- Stage-appropriate call-to-action buttons

**SEO Optimization**:
- Unique meta titles and descriptions per template
- Structured data markup for rich snippets
- Open Graph tags for social media sharing
- Canonical URLs to prevent duplicate content

**Conversion Tracking**:
- GA4 event tracking for page interactions
- Form submission tracking
- Scroll depth and time-on-page metrics
- A/B testing for different messaging approaches

### 10. ANALYTICS & TRACKING SYSTEM - COMPLETE FUNCTIONAL SPECIFICATION

**Google Analytics 4 Integration**:
```typescript
// Environment Configuration
VITE_GA_MEASUREMENT_ID: "G-YYP7EQ64H4" // Daniel's actual GA4 property
```

**Event Tracking Implementation**:
- Page views with custom dimensions
- User interactions (button clicks, form submissions)
- Conversion funnel tracking
- Bounce rate analysis with engagement thresholds

**Google Ads Integration**:
- Conversion tracking for membership signups
- Remarketing pixel implementation
- Enhanced conversion tracking
- Performance monitoring and optimization

**Custom Analytics**:
- User journey mapping through system components
- Feature usage analytics (which challenges, lessons popular)
- Engagement patterns and drop-off points
- Cohort analysis for retention insights

### 11. PWA ARCHITECTURE - COMPLETE FUNCTIONAL SPECIFICATION

**PWA Detection Logic**:
```typescript
function detectPWAMode(): boolean {
  // Multiple detection methods for reliability
  // Checks standalone mode, user agent, URL parameters
  // Returns true if app should use PWA UI/UX
}
```

**Conditional UI Rendering**:
- **PWA Mode**: Bottom navigation, no header/footer, full-screen experience
- **Browser Mode**: Traditional header/footer navigation
- **Marketing Pages**: Always show header/footer regardless of PWA status

**Service Worker Capabilities**:
- Offline content caching
- Background sync for failed requests
- Push notification delivery
- App update management

**Installation Prompts**:
- Smart timing for install prompts
- Platform-specific installation flows
- Post-install onboarding tours
- Usage tracking for PWA vs browser modes

### 12. AUTHENTICATION & USER MANAGEMENT - COMPLETE FUNCTIONAL SPECIFICATION

**Authentication Flow**:
- JWT-based authentication with localStorage persistence
- bcrypt password hashing
- Session management with token refresh
- Cross-subdomain authentication support

**User Onboarding**:
1. **Step 1**: Focus area selection (4 personas)
2. **Step 2**: Current situation assessment
3. **Step 3**: Goal setting and motivation
4. **Step 4**: Role identification (father, leader, etc.)
5. **Persona Generation**: AI-powered persona tag assignment

**Profile Management**:
- Personal information updates
- Progress tracking and statistics
- Subscription status and billing
- Notification preferences

### 13. SUBSCRIPTION & PAYMENT SYSTEM - COMPLETE FUNCTIONAL SPECIFICATION

**Stripe Integration**:
- Core subscription: $20/month
- Multiple payment methods supported
- Subscription management (pause, cancel, reactivate)
- Discount codes and promotional pricing

**Access Control**:
- Free tier: Limited lessons, basic challenges
- Core tier: Full access to all content and features
- Premium features: Advanced analytics, priority support

**Billing Management**:
- Automatic recurring billing
- Failed payment recovery flows
- Subscription upgrade/downgrade handling
- Refund processing (user contacts support)

### 14. SUBDOMAIN ARCHITECTURE - COMPLETE FUNCTIONAL SPECIFICATION

**Domain Separation**:
- **Marketing**: `theamproject.com` - Landing pages, content, SEO
- **App**: `app.theamproject.com` - Authenticated user experience

**Cross-Domain Authentication**:
- Seamless login between subdomains
- Token sharing through secure cookies
- User context preservation during transitions

**Routing Logic**:
```typescript
// Marketing pages always show header/footer
const showHeaderFooter = isMarketingPage || !shouldUsePWA;

// App pages conditionally hide UI in PWA mode
const showPWANav = shouldUsePWA && user && authenticated;
```

## DATABASE SCHEMA SUMMARY

### Core Tables & Relationships
```sql
-- Users & Authentication
users (id, email, fullName, personaTag, subscriptionTier)

-- Learning System  
courses (id, title, stage, difficulty)
lessons (id, courseId, title, content, xpReward)
userCourseProgress (userId, courseId, progressPercentage)
userLessonProgress (userId, lessonId, completedAt)

-- Challenges & Activities
challenges (id, text, stage, xpReward, rarity)
userChallenges (userId, challengeId, dateIssued, status, reflection)
scenarios (id, title, prompt, options, stage, journalPrompt)
userScenarios (userId, scenarioId, selectedOptionIndex, completedAt)

-- Journal & Reflection
journalEntries (id, userId, lessonId, challengeId, scenarioId, text, aiReflection, pinned)

-- Gamification
userXP (userId, currentXP, totalXP, level, currentStreak)
badges (id, name, description, criteria, xpReward, rarity)
userBadges (userId, badgeId, earnedAt)

-- Notifications & Settings
notificationSettings (userId, enableBrowserNotifications, enableDailyChallenges)
notificationLogs (userId, type, status, sentAt)
```

## FILE STRUCTURE & KEY COMPONENTS

### Backend (`server/`)
- `routes.ts`: All API endpoints with authentication
- `storage.ts`: Database operations using Drizzle ORM
- `auth.ts`: JWT authentication and user management
- `ai-services.ts`: OpenAI GPT-4o integration
- `email.ts`: Nodemailer/Resend email service

### Frontend (`client/src/`)
- `pages/`: Route-based components (Dashboard, Journal, Challenges)
- `components/`: Reusable UI components with Radix UI
- `hooks/`: Custom React hooks (useAuth, usePWADetection)
- `contexts/`: React context providers (AMChatProvider, PWAProvider)
- `lib/`: Utilities and configurations

### Critical Files for AM Chat Issue
- `client/src/App.tsx`: Main app component with provider structure
- `client/src/contexts/UnifiedAMChatContext.tsx`: Chat context provider
- `client/src/components/UnifiedAMChat.tsx`: Chat component implementation
- `client/src/hooks/use-pwa.tsx`: PWA provider (WHERE ERROR OCCURS)

## IMMEDIATE TASK: FIX REACT HOOK ERROR

**Error Details**:
```
Warning: Invalid hook call. Hooks can only be called inside of the body of a function component.
Error in PWAProvider component at use-pwa.tsx:20:31
```

**Current Provider Structure**:
```jsx
<ErrorBoundary>
  <QueryClientProvider>
    <PWAProvider> {/* ERROR HERE */}
      <AuthProvider>
        <AMChatProvider>
          <PWANavigationProvider>
            <OnboardingTourProvider>
              <Router>
                <AppContent /> {/* UnifiedAMChat renders here */}
              </Router>
            </OnboardingTourProvider>
          </PWANavigationProvider>
        </AMChatProvider>
      </AuthProvider>
    </PWAProvider>
  </QueryClientProvider>
</ErrorBoundary>
```

**Debug Steps Required**:
1. Examine PWAProvider implementation for hook rule violations
2. Check for multiple React imports or version conflicts
3. Verify component tree structure and provider ordering
4. Test minimal PWA provider to isolate the issue
5. Fix hook call location or context provider structure

**Success Criteria**:
- AM Chat bubble renders without crashing app
- Dashboard and homepage implementations continue working
- All existing functionality preserved
- User "Daniel" can access context-aware AI chat globally

This system represents 2+ years of development with authentic user data and sophisticated integrations. Every component specification here reflects actual implementation requirements, not theoretical designs.

Your immediate priority: Debug and fix the React hook error preventing the AM Chat bubble from working while preserving all existing functionality.