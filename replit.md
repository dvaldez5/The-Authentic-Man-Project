# The AM Project

## Overview
The AM Project is a comprehensive men's personal development platform focused on fostering strength, integrity, and purpose. It integrates PWA capabilities, gamification, AI-powered content generation, and subscription management to deliver actionable content and facilitate community engagement. The platform's core business vision is to drive membership conversions and offers significant market potential in personal growth.

## User Preferences
Preferred communication style: Simple, everyday language.
User timezone: Denver/Mountain Time (MDT/MST)
Content guidelines: No emojis anywhere on site/app. No false statistics or made-up numbers. Use authentic testimonials only. Primary goal is membership conversions, not newsletter signups.

## System Architecture
### UI/UX Decisions
The platform adheres to a strict brand color palette: Primary Brown (#7C4A32), Dark Gray (#0A0A0A, #0E0E0E), Warm Cream (#F5EDE1), and Gold Accent (#E4B768). All blue and gray-blue colors are strictly forbidden. Buttons and components maintain consistency using CSS variables (`--primary`, `--card`, `--foreground`) instead of hardcoded hex values. Layouts are responsive, with specific mobile UX enhancements like sticky elements.

### Technical Implementations
- **Backend**: Express.js with TypeScript, PostgreSQL (Drizzle ORM), JWT authentication (bcrypt), Nodemailer SMTP.
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS (Radix UI), TanStack Query, Wouter for routing, PWA with Service Workers.
- **Key Features**:
    - **User Management**: Authentication, persona-based onboarding, profile management, subscription tracking, role-based access.
    - **Content Delivery**: Learning modules, daily challenges, weekly scenarios, AI-powered journal, weekly reflections.
    - **Gamification**: XP system, multi-tier badge system, streak tracking, level progression.
    - **Notification System**: Smart scheduling, 6 types of notifications, A/B testing framework, rate limiting (max 3/day).
    - **Contextual Onboarding Tours**: Multi-page tours on key sections, auto-initiated for new users.
    - **Dynamic Content System**: Programmatic SEO with dynamic landing pages, adapting content based on search intent (e.g., "mental fitness," "discipline," "leadership," "fatherhood").
    - **AI Chat System**: Context-aware AM Chat that acts as a mentor/best friend, integrating real-time user progress data for personalized recommendations.
- **System Design Choices**:
    - **Data Flow**: Optimized for user journey, content generation (AI-powered personalization), and notification delivery.
    - **Deployment**: Replit deployments with autoscale, Vite production build, Neon PostgreSQL, HTTPS.
    - **Monitoring & Analytics**: Error tracking, performance metrics, comprehensive user analytics.
    - **Subdomain Separation**: Marketing (theamproject.com) vs. App (app.theamproject.com) with cross-subdomain authentication.
    - **PWA Enhancements**: Background Sync, Push Notifications, enhanced offline support.

## External Dependencies
- **Payment Infrastructure**: Stripe for subscription management, payment processing, and discount codes.
- **AI Services**: OpenAI GPT-4o for content generation, reflection prompts, and goal visualization.
- **Communication Services**: Resend for email delivery (`support@theamproject.com`).
- **External Libraries**: Radix UI (accessible components), TanStack Query (server state), Date-fns (date utilities), Zod (schema validation).