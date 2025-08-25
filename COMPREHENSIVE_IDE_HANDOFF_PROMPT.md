# The AM Project - Comprehensive System Handoff Prompt

## PROJECT OVERVIEW
You are inheriting a sophisticated men's personal development platform called "The AM Project" that integrates PWA capabilities, gamification, AI-powered content generation, and subscription management. The platform's core business vision is driving membership conversions through authentic personal growth content.

## CRITICAL USER PREFERENCES
- **Communication Style**: Simple, everyday language (user is non-technical)
- **User Timezone**: Denver/Mountain Time (MDT/MST)
- **Content Guidelines**: NO emojis anywhere. NO false statistics or made-up numbers. Use authentic testimonials only
- **Primary Goal**: Membership conversions, NOT newsletter signups
- **Brand Colors**: Primary Brown (#7C4A32), Dark Gray (#0A0A0A, #0E0E0E), Warm Cream (#F5EDE1), Gold Accent (#E4B768)
- **FORBIDDEN**: Blue and gray-blue colors are strictly forbidden throughout the system

## CURRENT CRITICAL ISSUE
**BUBBLE CHAT IMPLEMENTATION FAILURE**: The global AM Chat bubble consistently crashes the React application with runtime errors. Even minimal components break the app when rendered globally. The dashboard implementation works perfectly, but any bubble-type rendering causes complete application failure.

**Root Cause Investigation Needed**: 
- App loads correctly without bubble
- Inline components in same position also crash
- Issue appears to be with React hook dependencies or context provider structure
- AMChatProvider context is correctly positioned in component tree
- Error suggests "Invalid hook call" in PWAProvider

## SYSTEM ARCHITECTURE

### Backend Technology Stack
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcrypt hashing
- **Email**: Nodemailer SMTP integration via Resend (`support@theamproject.com`)
- **AI Integration**: OpenAI GPT-4o for content generation and chat responses
- **Payment Processing**: Stripe for subscription management and discount codes

### Frontend Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **PWA Features**: Service Workers, Background Sync, Push Notifications

### Key System Features

#### 1. USER MANAGEMENT SYSTEM
- **Authentication Flow**: JWT-based with localStorage persistence
- **User Personas**: Goal-based onboarding (Discipline, Leadership, Mental Fitness, Fatherhood)
- **Profile Management**: Progress tracking, subscription status, role-based access
- **Subscription Tiers**: Free, Core ($20/month), Premium tiers with Stripe integration

#### 2. PWA ARCHITECTURE
- **Detection Logic**: Comprehensive PWA mode detection via `detectPWAMode()` function
- **Navigation**: Conditional header/footer display based on PWA status
- **Mobile Experience**: Bottom navigation, sticky elements, optimized layouts
- **Offline Support**: Service worker caching, background sync capabilities

#### 3. UNIFIED AM CHAT SYSTEM (CURRENTLY BROKEN)
- **Context-Aware AI**: Acts as personal development mentor using user's real name "Daniel"
- **Conversation Persistence**: Shared history across all site instances
- **Real-Time Integration**: Access to user progress, learning modules, journal entries
- **Authentication-Aware**: Different responses for authenticated vs public users
- **Implementation Types**: 
  - `bubble`: Global floating chat (BROKEN - crashes app)
  - `dashboard`: Inline chat component (WORKING)
  - `homepage`: Marketing page integration (WORKING)

#### 4. GAMIFICATION SYSTEM
- **XP System**: Points earned through challenges, lessons, scenarios
- **Badge System**: Multi-tier achievements (Bronze, Silver, Gold, Platinum)
- **Streak Tracking**: Daily engagement monitoring
- **Level Progression**: User advancement through completed activities
- **Database Schema**: `gamification_xp`, `gamification_badges`, `gamification_user_badges`

#### 5. LEARNING MANAGEMENT SYSTEM
- **Course Structure**: Multi-lesson courses with progress tracking
- **Content Types**: Video lessons, text content, interactive exercises
- **Progress Persistence**: Database-tracked completion status
- **Dynamic Difficulty**: Adaptive content based on user engagement
- **Database Schema**: `courses`, `lessons`, `user_course_progress`, `user_lesson_progress`

#### 6. DAILY CHALLENGES & SCENARIOS
- **Daily Challenges**: Persona-specific daily tasks with XP rewards
- **Weekly Scenarios**: Complex moral/ethical decision trees
- **Journal Integration**: Automatic prompt generation based on selections
- **Progress Tracking**: Completion dates, streak calculations
- **Database Schema**: `challenges`, `user_challenges`, `scenarios`, `user_scenarios`

#### 7. JOURNAL SYSTEM
- **AI-Powered Prompts**: Dynamic prompts based on user activity and progress
- **Entry Management**: Create, edit, delete with rich text support
- **Pinned Entries**: Featured content for quick access
- **Integration Points**: Connected to challenges, scenarios, lessons
- **Database Schema**: `journal_entries` with lesson/challenge associations

#### 8. NOTIFICATION SYSTEM
- **Smart Scheduling**: Rate-limited notifications (max 3/day)
- **6 Notification Types**: Daily challenges, streaks, courses, scenarios, general, custom
- **A/B Testing Framework**: Multiple notification strategies with performance tracking
- **User Preferences**: Granular control over notification types and timing
- **Database Schema**: `notification_settings`, `notification_logs`

### MARKETING & SEO SYSTEMS

#### 9. PROGRAMMATIC SEO IMPLEMENTATION
- **Dynamic Landing Pages**: Auto-generated pages targeting specific keywords
- **Content Templates**: Scalable content generation for "mental fitness," "discipline," "leadership," "fatherhood"
- **Search Intent Adaptation**: Content varies based on user search patterns
- **SEO Optimization**: Meta tags, Open Graph, structured data
- **Performance Tracking**: Analytics integration for conversion measurement

#### 10. GOOGLE ANALYTICS & ADS INTEGRATION
- **Unified Tracking**: GA4 + Google Ads conversion tracking
- **Event Tracking**: Page views, user interactions, conversion funnels
- **Bounce Rate Analysis**: Advanced GA4 configuration for engagement metrics
- **Conversion Optimization**: Membership signup tracking and optimization
- **Environment Variables**: `VITE_GA_MEASUREMENT_ID` for client-side tracking

#### 11. SUBDOMAIN ARCHITECTURE
- **Marketing Domain**: `theamproject.com` for landing pages and content
- **App Domain**: `app.theamproject.com` for authenticated user experience
- **Cross-Domain Auth**: Seamless authentication between subdomains
- **Routing Logic**: Conditional header/footer display based on subdomain

### ONBOARDING & TOURS

#### 12. CONTEXTUAL ONBOARDING SYSTEM
- **Multi-Page Tours**: Interactive walkthroughs for key app sections
- **Auto-Initiation**: Tours trigger automatically for new users
- **Progress Tracking**: Tour completion status and user preferences
- **Context-Aware**: Different tours for different user personas
- **Components**: `TourOverlay`, `TourTooltip`, `TourManager`

### DATABASE SCHEMA OVERVIEW

#### Core Tables
- `users`: Authentication and profile data
- `subscriptions`: Stripe subscription management
- `courses`, `lessons`: Learning content structure
- `challenges`, `scenarios`: Daily and weekly activities
- `journal_entries`: User-generated content with AI prompts
- `gamification_*`: XP, badges, and achievement tracking
- `notification_*`: Settings and delivery logs

#### Key Relationships
- Users → Multiple courses with progress tracking
- Journal entries ← Connected to lessons/challenges for context
- Gamification badges ← Earned through various activities
- Scenarios → Generate personalized journal prompts

### CURRENT DEVELOPMENT ENVIRONMENT

#### File Structure
```
├── client/ (React frontend)
│   ├── src/
│   │   ├── components/ (Reusable UI components)
│   │   ├── pages/ (Route-based page components)
│   │   ├── hooks/ (Custom React hooks)
│   │   ├── contexts/ (React context providers)
│   │   └── lib/ (Utilities and configurations)
├── server/ (Express backend)
│   ├── routes.ts (API endpoint definitions)
│   ├── storage.ts (Database operations)
│   └── index.ts (Server initialization)
├── shared/ (Shared TypeScript types)
└── public/ (Static assets)
```

#### Environment Configuration
- **Database**: PostgreSQL via `DATABASE_URL`
- **Analytics**: `VITE_GA_MEASUREMENT_ID`
- **Deployment**: Replit-based with autoscale capabilities

### IMMEDIATE PRIORITIES

1. **CRITICAL**: Fix the AM Chat bubble implementation that's causing React crashes
2. **HIGH**: Complete unified tracking implementation across all pages
3. **MEDIUM**: Enhance programmatic SEO with more content templates
4. **MEDIUM**: Implement advanced gamification features

### DEVELOPMENT GUIDELINES

#### Code Standards
- TypeScript throughout (strict mode enabled)
- Tailwind CSS for styling (use CSS variables: `--primary`, `--card`, `--foreground`)
- Radix UI for accessible components
- Drizzle ORM for database operations (never write raw SQL)

#### Deployment Process
- Development: `npm run dev` (starts Express + Vite)
- Database: `npm run db:push` for schema changes
- Production: Replit deployments with automatic scaling

#### Testing Requirements
- All API endpoints must handle authentication properly
- PWA features must work offline
- Mobile-responsive design is mandatory
- All forms must have proper validation

### SUCCESS METRICS
- **Primary**: Membership conversion rate
- **Secondary**: Daily active users, session duration
- **Engagement**: Challenge completion rates, journal entry frequency
- **Technical**: Page load times, PWA installation rates

### HANDOFF NOTES
The system is currently in version 2.12.8 with comprehensive unified chat architecture implemented but the bubble rendering consistently fails. The dashboard and homepage implementations work perfectly. All other systems are functional and production-ready.

**Critical Context**: User "Daniel" has been working on this system extensively and prefers direct, practical solutions over theoretical discussions. The system handles real user data and authentic progress tracking - never use mock data.

## YOUR IMMEDIATE TASK
Debug and fix the AM Chat bubble implementation that's causing React application crashes while preserving all existing functionality. The error appears to be related to React hook calls in the PWAProvider component, possibly due to component tree structure or context provider ordering.