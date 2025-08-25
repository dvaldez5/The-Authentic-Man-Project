# 🔒 STABLE STATE BACKUP - v2.9.5
**Created:** January 18, 2025
**Purpose:** Safe recovery point before subdomain separation implementation

## CRITICAL RECOVERY INFORMATION

This represents the last known stable, fully-functional state of The AM Project before implementing the marketing/app subdomain separation. If anything breaks during the migration, **REVERT TO THIS STATE IMMEDIATELY**.

### Current System Status: FULLY OPERATIONAL ✅

**Version:** v2.9.5 - Google Analytics & Bounce Rate Analysis System
- All core functionality working perfectly
- PWA system stable with locked routing logic
- Notification system operational on mobile and desktop
- Payment processing via Stripe functioning
- Authentication and subscription management working
- All marketing pages rendering correctly
- Member app pages fully functional with tours and gamification

### Key System Architecture (STABLE)

#### PWA Detection System - LOCKED ⚠️
**Files:** 
- `client/src/hooks/use-pwa-detection.tsx` - Core PWA detection logic
- `client/src/App.tsx` (AppContent function) - Layout separation
- `server/index.ts` - Server-side detection

**Current Behavior:**
- Mobile browsers WITHOUT `?pwa=true` → Browser layout (header/footer)
- PWA test link `?pwa=true` → PWA app layout (no header/footer)
- Downloaded PWA apps → PWA layout with bottom navigation
- Cross-platform functionality verified working

#### Authentication & Routing (STABLE)
**Current Domain:** `theamproject.com`
- Marketing pages: `/`, `/about`, `/join`, `/blog`, etc.
- Protected member pages: `/dashboard`, `/journal`, `/learning`, `/challenges`
- Authentication flow: `/auth` → `/onboarding` → `/dashboard`
- Cross-subdomain auth: NOT YET IMPLEMENTED

#### Critical Dependencies
- **Database:** PostgreSQL via Neon with Drizzle ORM
- **Payment:** Stripe with $9.99/month subscriptions + 7-day trials
- **Email:** Resend service with support@theamproject.com
- **AI:** OpenAI GPT-4o for content generation
- **Analytics:** Google Analytics 4 + Google Ads tracking

### Current Deployment Configuration

**Replit Environment:**
- Server IP: `34.23.200.227`
- Current URL: `bb1b08ff-fa1f-49e8-b1ce-157412ee683e-00-3d18d9scwpokx.worf.replit.dev`
- Production domain: `theamproject.com`

**Environment Variables (Required):**
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Authentication tokens
- `STRIPE_SECRET_KEY` - Payment processing
- `OPENAI_API_KEY` - AI content generation
- `RESEND_API_KEY` - Email delivery
- `VITE_GA_MEASUREMENT_ID` - Google Analytics

### What We're About to Change

**Planned Migration:** Subdomain separation for Google Play Store readiness
- Marketing pages stay at `theamproject.com`
- Member app moves to `app.theamproject.com`
- Gradual migration: Dashboard → Journal → Learning → Challenges → Auth

**GoDaddy DNS Setup (Ready):**
- Type: A Record
- Name: app
- Value: 34.23.200.227
- TTL: 600

### EMERGENCY RECOVERY PROCEDURE

If the subdomain migration breaks the application:

1. **STOP ALL CHANGES IMMEDIATELY**
2. **Verify this backup state is working:**
   ```bash
   # Test marketing pages
   curl -I https://theamproject.com
   curl -I https://theamproject.com/join
   
   # Test member pages (with auth)
   curl -I https://theamproject.com/dashboard
   ```

3. **If needed, revert code changes:**
   - PWA detection logic: Revert `client/src/hooks/use-pwa-detection.tsx`
   - Routing: Revert `client/src/App.tsx`
   - Server config: Revert `server/index.ts`

4. **Test critical functionality:**
   - User registration/login
   - Subscription payments
   - PWA installation on mobile
   - Daily challenges and journal
   - Notification delivery

### Key Files to Monitor During Migration

**Critical Files (DO NOT BREAK):**
- `PWA_ROUTING_LOCKDOWN.md` - Contains locked file list
- `client/src/hooks/use-pwa-detection.tsx` - PWA detection logic
- `client/src/App.tsx` (lines 119-155) - Layout separation
- `client/src/lib/protected-route.tsx` - Authentication gates
- `server/index.ts` - Server routing and middleware

**Configuration Files:**
- `replit.md` - System architecture documentation
- `package.json` - Dependencies and scripts
- `drizzle.config.ts` - Database configuration
- `vite.config.ts` - Build configuration

### Success Metrics (What Must Continue Working)

**Marketing Site:**
- Homepage loads correctly with header/footer
- Join page interactive elements function
- Blog pages render properly
- Contact form submissions work
- Google Analytics tracking active

**Member App:**
- User authentication and registration
- Subscription payment processing
- Daily challenges and journal entries
- Learning modules and progress tracking
- Weekly reflections and AI prompts
- PWA installation and offline functionality
- Push notifications on mobile

**Cross-Platform Compatibility:**
- Desktop browser experience
- Mobile browser experience
- PWA standalone mode
- iOS and Android compatibility

---

## CONFIDENCE LEVEL: MAXIMUM ✅

This backup represents a fully stable, production-ready state with:
- Zero critical issues
- Complete feature functionality
- Verified cross-platform compatibility
- Comprehensive documentation
- Ready for Google Play Store deployment

**Use this document as your recovery reference point throughout the subdomain migration process.**