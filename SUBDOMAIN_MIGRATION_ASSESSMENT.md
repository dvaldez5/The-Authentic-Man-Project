# THE AM PROJECT - COMPLETE SUBDOMAIN MIGRATION ASSESSMENT
**Created:** January 18, 2025
**Purpose:** Absolute, comprehensive understanding before subdomain separation

## CRITICAL SUCCESS REQUIREMENTS
1. **DO NOT TOUCH PWA LOADING SCREEN OR SPLASH** - Move code exactly as-is
2. **PWA APP MUST BEHAVE EXACTLY AS NOW** - Zero functional changes
3. **NO LEARNING SYSTEM CHANGES** - Pure lift and shift
4. **NO CHROME NAVIGATION BAR IN PWA** - Keep exact current PWA UI
5. **ALL AUTHENTICATED PAGES TO APP SUBDOMAIN** - Including onboarding
6. **TWO SEAMLESS EXPERIENCES** - Current web PWA + Google Play optimized
7. **DO NOT BREAK THE PWA APP** - Must remain identical in function, look, and form

## CURRENT SYSTEM ARCHITECTURE - EXACT STATE

### 1. PAGE CLASSIFICATION

**PUBLIC/MARKETING PAGES (Stay on theamproject.com):**
- `/` - Home (shows differently based on PWA detection)
- `/about` - About page
- `/standard` - AM Standard page
- `/blog` - Blog listing
- `/blog/:slug` - Individual blog posts
- `/join` - Join/sales page
- `/contact` - Contact form
- `/terms` - Terms of service
- `/privacy` - Privacy policy
- `/reset-discipline` - Marketing landing page
- `/test-form` - Test form (debug)

**AUTHENTICATED/APP PAGES (Move to app.theamproject.com):**
- `/auth` - Login/Register (CRITICAL: Entry point for app)
- `/payment` - Payment page (after auth)
- `/onboarding` - User onboarding (after auth)
- `/dashboard` - Main dashboard (protected)
- `/learning/*` - All learning pages (protected)
- `/challenges` - Daily challenges (protected)
- `/journal` - Journal entries (protected)
- `/journal/pinned` - Pinned journal entries (protected)
- `/community` - Community page (protected)
- `/pod` - Pod page (protected)
- `/weekly-reflections` - Weekly reflections (protected)
- `/settings` - User settings (protected)
- `/subscription` - Subscription management (protected)

**SPECIAL PAGES:**
- `/splash` - PWA splash screen (CRITICAL - DO NOT MODIFY)
- `/pwa-diagnostic` - PWA debug tool

### 2. PWA DETECTION LOGIC (LOCKED - DO NOT MODIFY)

**File:** `client/src/hooks/use-pwa-detection.tsx`
**Current Behavior:**
1. Checks URL for `?pwa=true` parameter → Forces PWA mode
2. Checks for standalone display mode → Real PWA install
3. Checks for iOS standalone → iOS Add to Home Screen
4. Replit IDE detection → Uses stored preference
5. Mobile browser without triggers → Clears PWA mode

**CRITICAL:** This function returns a boolean that determines EVERYTHING:
- `true` → Show Splash screen, no header/footer, PWA navigation
- `false` → Show Home page, browser header/footer

### 3. ROUTING LOGIC

**File:** `client/src/App.tsx`
**Current Flow:**
```
Route "/" → ForceCorrectComponent → 
  if (shouldUsePWA) → Splash
  else → Home
```

**AppContent Function (Lines 140-180):**
- Determines header/footer visibility: `showHeaderFooter = !shouldUsePWA`
- Determines PWA navigation: `showPWANav = shouldUsePWA && user && !splash/auth`
- Applies padding for PWA nav: `pwaMainClass = showPWANav ? "pb-20" : ""`

### 4. AUTHENTICATION SYSTEM

**Current Cookie Configuration (server/index.ts):**
```javascript
cookie: {
  secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}
```
**ISSUE:** No domain setting - cookies won't work across subdomains!

**JWT Token System:**
- Generated on login: `generateToken(userId)`
- Sent as Bearer token in Authorization header
- Verified on each API request

### 5. SERVICE WORKER REGISTRATION

**Current Registration:** Happens on ALL pages
**Location:** `client/public/sw.js`
**Scope:** Entire domain

**REQUIRED CHANGE:** Only register on app subdomain

### 6. CURRENT USER FLOWS

**Marketing Visitor:**
1. Lands on theamproject.com
2. Sees marketing pages with header/footer
3. Clicks "Join" → Goes to /join
4. Clicks "Start Trial" → Goes to /auth
5. After login → Redirected to /dashboard

**PWA User:**
1. Opens PWA app or uses ?pwa=true
2. Sees Splash screen (no header/footer)
3. Logs in → Sees PWA navigation at bottom
4. Navigates with bottom nav (no header/footer)

**Mobile Browser User:**
1. Visits site on mobile
2. Sees regular site with header/footer
3. Can install PWA from browser prompt
4. After install → Opens as PWA with Splash

## IMPLEMENTATION PLAN - ZERO FAILURE APPROACH

### Phase 1: Infrastructure Setup (NO VISIBLE CHANGES)

1. **Add Subdomain Detection:**
```javascript
// server/index.ts - Add middleware
app.use((req, res, next) => {
  const host = req.headers.host || '';
  req.isAppSubdomain = host.startsWith('app.');
  next();
});
```

2. **Fix Cookie Domain for Cross-Subdomain:**
```javascript
cookie: {
  domain: process.env.NODE_ENV === 'production' ? '.theamproject.com' : undefined,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000
}
```

3. **Add Client-Side Subdomain Detection:**
```javascript
// New file: client/src/lib/subdomain.ts
export function isAppSubdomain(): boolean {
  return window.location.hostname.startsWith('app.');
}
```

### Phase 2: Routing Logic (CAREFUL MODIFICATION)

**Modify App.tsx to handle subdomains:**
1. If on app.theamproject.com → Show app routes only
2. If on theamproject.com → Show marketing routes + redirect auth to app

**Key Principle:** Don't change ANY existing PWA logic, just add subdomain awareness

### Phase 3: Service Worker Scope

**Only register on app subdomain:**
```javascript
if (isAppSubdomain() || detectPWAMode()) {
  navigator.serviceWorker.register('/sw.js');
}
```

### Phase 4: Authentication Flow

**Critical Path:**
1. User clicks login on marketing site
2. Redirect to app.theamproject.com/auth
3. After login, stay on app subdomain
4. Cookie works across both domains

## RISK MITIGATION

### What We WON'T Touch:
- PWA detection logic (locked file)
- Splash screen component
- PWA navigation component
- Learning system code
- Any UI/UX elements

### What We WILL Change:
- Cookie domain setting (add cross-subdomain)
- Routing logic (add subdomain awareness)
- Service worker registration (limit to app)
- Auth redirects (point to app subdomain)

### Testing Protocol:
1. Test marketing site - all pages load
2. Test auth flow - login works
3. Test PWA mode - ?pwa=true works
4. Test installed PWA - works exactly as before
5. Test cross-subdomain auth - cookies persist

## SUCCESS METRICS

**100% Success Means:**
- Marketing pages work on theamproject.com ✓
- App pages work on app.theamproject.com ✓
- PWA behaves EXACTLY as before ✓
- No visual changes to PWA ✓
- Auth works across subdomains ✓
- Service worker only on app subdomain ✓
- Google Play Store packaging ready ✓

## IMPLEMENTATION CONFIDENCE: 100%

This is a CLEAN SEPARATION with:
- No changes to core PWA logic
- No changes to UI components
- No changes to learning system
- Only routing and cookie configuration changes
- Clear, methodical migration path

**Ready to proceed with 100% confidence.**