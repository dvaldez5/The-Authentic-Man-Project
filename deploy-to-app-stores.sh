#!/bin/bash

# The AM Project - App Store Deployment Automation Script
# This script prepares your PWA for deployment to Google Play and Apple App Store

echo "🚀 The AM Project - App Store Deployment Preparation"
echo "=================================================="

# Check if required files exist
echo "📋 Checking PWA readiness..."

# Check manifest.json
if [ -f "client/public/manifest.json" ]; then
    echo "✅ manifest.json found"
else
    echo "❌ manifest.json missing"
    exit 1
fi

# Check service worker
if [ -f "client/public/sw.js" ]; then
    echo "✅ Service worker found"
else
    echo "❌ Service worker missing"
    exit 1
fi

# Check required icons
if [ -f "client/public/icon-192x192.png" ] && [ -f "client/public/icon-512x512.png" ]; then
    echo "✅ Required app icons found"
else
    echo "❌ Required app icons missing (192x192 and 512x512)"
    exit 1
fi

echo ""
echo "🔧 PWA Status: READY FOR DEPLOYMENT"
echo ""

# Display next steps
echo "📱 NEXT STEPS:"
echo ""
echo "Google Play Store (Start Here - Easier):"
echo "1. Create Google Play Developer account (\$25): https://play.google.com/console/"
echo "2. Go to PWABuilder.com and enter your production URL"
echo "3. Generate Android package and download .aab file"
echo "4. Upload to Google Play Console and complete store listing"
echo ""
echo "Apple App Store (Requires Mac + Xcode):"
echo "1. Create Apple Developer account (\$99/year): https://developer.apple.com/"
echo "2. Use PWABuilder to generate iOS package"
echo "3. Open in Xcode, build, and submit to App Store Connect"
echo ""
echo "📚 Full instructions available in:"
echo "   - MOBILE_APP_DEPLOYMENT_GUIDE.md"
echo "   - APP_STORE_ASSETS_CHECKLIST.md"
echo ""
echo "🎯 Your production URL for PWABuilder:"
echo "   https://your-am-project-domain.com"
echo ""
echo "💡 Tip: Start with Google Play Store for faster deployment!"