# 🔒 PWA ROUTING LOCKDOWN - DO NOT TOUCH

## CRITICAL WARNING
The PWA routing system is EXTREMELY VOLATILE. Making ANY changes to these files can break weeks of work across all instances (desktop, mobile browser, PWA app).

## LOCKED FILES - NEVER MODIFY
These files are now in LOCKDOWN mode. Do NOT touch them unless there's a critical security issue:

### 1. `/client/src/hooks/use-pwa-detection.tsx`
- Contains the core PWA detection logic
- Handles localStorage clearing for mobile browsers
- Any changes can break instance separation

### 2. `/client/src/App.tsx` - AppContent function specifically
- Lines 119-155: The AppContent function that separates PWA vs browser layouts
- This function conditionally renders PWA vs browser UI
- DO NOT modify the shouldUsePWA logic or layout separation

### 3. `/server/index.ts` - PWA detection sections
- Lines 45-70: Server-side PWA logging and parameter detection
- Lines 100-122: HTML injection middleware for PWA mode
- Only logs PWA detection - does NOT force routing decisions

## STABLE CONFIGURATION
Current stable state (December 16, 2025):
- Mobile browsers WITHOUT `?pwa=true` serve browser pages (header/footer)
- PWA test link `?pwa=true` serves PWA app (no header/footer, splash screen)
- localStorage clearing prevents PWA mode persistence in mobile browsers
- Replit IDE detection works correctly

## IF SOMETHING BREAKS
1. DO NOT attempt to fix PWA routing logic
2. Check if localStorage needs clearing in browser
3. Verify the PWA test link still works: `?pwa=true`
4. Revert ANY changes to the locked files above

## TESTING PROTOCOL
- Mobile browser (incognito): Should show Home page with header/footer
- PWA link `?pwa=true`: Should show Splash screen without header/footer/bottom nav
- After login in PWA: Should show bottom navigation on member pages only

## EMERGENCY REVERT
If PWA routing breaks, immediately revert to git commit: `3a37363`
This is the last known stable PWA configuration.

---
**REMEMBER: Weeks of work went into stabilizing this. One wrong edit can destroy everything.**