# AM Project Deployment Guide v2.0.0

## Quick Reference
- **Current Version**: 2.0.0
- **Release Name**: Notification System & PWA Enhancement
- **Build Date**: 2025-06-16

## Pre-Deployment Checklist

### 1. Version Verification
- [ ] Confirm version number in `client/src/lib/version.ts`
- [ ] Update `VERSION.md` with release notes
- [ ] Verify version displays correctly in Settings page

### 2. Database Migration
```bash
npm run db:push
```

### 3. Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- Production deployment URL

### 4. PWA Assets Verification
- [ ] App icons present in `client/public/` (192x192, 512x512)
- [ ] Manifest.json configured
- [ ] Service worker updated with latest cache version
- [ ] Notification icons cached properly

### 5. PWA Instance Management System
- [ ] PWA detection logic functioning (test with `?pwa=true`)
- [ ] Mobile browser stays in browser mode (no PWA layout)
- [ ] PWA app shows proper navigation (bottom nav, no header)
- [ ] Debug tools accessible at `/debug-pwa.html`
- [ ] CRITICAL: Do not modify locked PWA routing files

## Deployment Steps

### 1. Build Application
```bash
npm run build
```

### 2. Deploy to Production
- Replit Deployments handles automatic building
- Ensure environment variables are set
- Verify PWA installation works correctly

### 3. Post-Deployment Verification
- [ ] PWA installs without errors
- [ ] Notifications work in production environment
- [ ] Service worker caches assets correctly
- [ ] Version information displays properly
- [ ] Timezone detection functions
- [ ] Database connections stable

## Notification System Deployment Notes

### PWA Compatibility
- Uses ServiceWorker API for PWA environments
- Graceful fallback to direct Notification API
- Custom branded notification icons
- Automatic timezone detection

### Testing Checklist
- [ ] Install PWA on mobile device
- [ ] Test notification permissions
- [ ] Verify "Test Notification" button works
- [ ] Check notification icon displays correctly
- [ ] Validate timezone auto-detection

### PWA Instance Testing Protocol
- [ ] Mobile browser (incognito): Shows Home page with header/footer
- [ ] PWA test link `?pwa=true`: Shows Splash screen without header/footer
- [ ] After PWA login: Bottom navigation appears on member pages only
- [ ] PWA navigation auto-hides on scroll down, shows on scroll up
- [ ] localStorage clears PWA mode for mobile browsers on refresh

## Rollback Procedure
If issues arise, rollback to previous version:
1. Revert to previous deployment
2. Check `VERSION.md` for previous stable version
3. Verify database compatibility

## Known Issues (v2.0.0)
- Notification permission may require user interaction
- Android caching might show old notification icons temporarily
- Development environment blocks notifications on some domains

## Support
For version-specific issues, reference:
- `VERSION.md` for detailed changelog
- Settings page for current version information
- Console logs for debugging notification issues