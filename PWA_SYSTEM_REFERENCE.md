# PWA System Reference - AM Project v2.0.0

## System Overview
The AM Project implements a sophisticated PWA instance management system that separates mobile browsers, PWA apps, and desktop environments into distinct user experiences.

## Critical Components (LOCKED)

### 1. PWA Detection Logic (`client/src/hooks/use-pwa-detection.tsx`)
**Status**: 🔒 LOCKED - DO NOT MODIFY

Primary detection function that determines device type and routing:
- Mobile browser detection (Android/iOS user agents)
- PWA standalone mode detection
- Replit IDE environment handling
- localStorage management for session persistence

**Key Logic**: 
- Mobile browsers WITHOUT `?pwa=true` → Browser layout (header/footer)
- PWA test link `?pwa=true` → PWA app layout (no header/footer)
- Downloaded PWA apps → PWA layout with bottom navigation

### 2. Layout Separation (`client/src/App.tsx` - AppContent function)
**Status**: 🔒 LOCKED - Lines 119-155

Controls which UI components render based on PWA detection:
- `shouldUsePWA = true` → Splash screen, PWA navigation
- `shouldUsePWA = false` → Home page, browser header/footer

### 3. Server-Side Detection (`server/index.ts`)
**Status**: 🔒 LOCKED - Lines 45-70, 100-122

Logs PWA detection for debugging:
- Detects `?pwa=true` parameter
- Logs user agent analysis
- HTML injection middleware for PWA mode
- Does NOT force routing decisions (client-side only)

## PWA Navigation System

### Context-Aware Navigation (`client/src/components/PWANavigation.tsx`)
Auto-hiding bottom navigation for PWA instances:
- Shows on scroll up or near page top
- Hides on scroll down past threshold
- "More" menu with additional options
- Logout functionality

### Navigation Context (`client/src/contexts/PWANavigationContext.tsx`)
State management for navigation visibility:
- Scroll position tracking
- Visibility state management
- "More" menu toggle control

## Testing Protocol

### Debug Tools
1. **PWA Detection Test**: `/debug-pwa.html`
   - Tests exact detection logic
   - Shows user agent analysis
   - Validates localStorage behavior

2. **PWA Test Link**: `?pwa=true`
   - Forces PWA mode for testing
   - Bypasses normal detection
   - Useful for development verification

### Expected Behaviors
- **Mobile Browser (Incognito)**: Home page with header/footer
- **PWA Test Link**: Splash screen without header/footer/bottom nav
- **After PWA Login**: Bottom navigation on member pages only
- **PWA Scroll**: Navigation auto-hides on scroll down, shows on scroll up

## Emergency Procedures

### If PWA Routing Breaks
1. **DO NOT** attempt to fix by modifying locked files
2. Check if localStorage needs clearing in browser
3. Verify PWA test link still works: `?pwa=true`
4. **EMERGENCY REVERT**: Use git commit `3a37363` (last stable config)

### Troubleshooting Steps
1. Clear browser localStorage and cookies
2. Test in incognito/private browser mode
3. Verify PWA detection with debug tools
4. Check console logs for detection output
5. Test both mobile browser and PWA app scenarios

## File Protection Rules

### NEVER MODIFY These Files:
- `client/src/hooks/use-pwa-detection.tsx`
- `client/src/App.tsx` (AppContent function specifically)
- `server/index.ts` (PWA detection sections)

### Safe to Modify:
- `client/src/components/PWANavigation.tsx` (UI styling only)
- `client/src/contexts/PWANavigationContext.tsx` (state logic only)
- Other application components not related to PWA routing

## Version History Integration
This PWA system is documented as part of version 2.0.0 and includes:
- Advanced PWA detection logic
- Instance separation mechanisms
- Routing lockdown protections
- Emergency revert procedures
- Comprehensive testing protocols

## Developer Notes
- Weeks of work went into stabilizing this system
- One incorrect edit can break all instances simultaneously
- Always test in multiple environments before deployment
- Maintain emergency revert capabilities
- Document any approved changes in version control system