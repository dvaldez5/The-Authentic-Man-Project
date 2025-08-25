# Google Analytics 4 (GA4) Setup Guide
**Date**: August 19, 2025
**Status**: Creating New GA4 Property

## Why We Need a New GA4 Property
Since the previous GA4 property couldn't be updated, we'll create a fresh GA4 property specifically for The AM Project.

## Step 1: Create New GA4 Property

### Go to Google Analytics
1. Visit: https://analytics.google.com
2. Sign in with your Google account
3. Click "Admin" (gear icon in bottom left)

### Create New Property
1. In the "Property" column, click "Create Property"
2. Choose "GA4" (Google Analytics 4)
3. Fill out the property details:

**Property Details:**
- **Property Name**: The AM Project
- **Reporting Time Zone**: America/Denver (Mountain Time)
- **Currency**: United States Dollar (USD)

**Business Information:**
- **Industry Category**: Health & Fitness or Education
- **Business Size**: Small (1-10 employees)
- **How you intend to use Analytics**: 
  ✅ Measure customer engagement
  ✅ Optimize marketing ROI
  ✅ Examine user behavior

### Create Data Stream
1. After creating the property, you'll be prompted to create a data stream
2. Choose "Web"
3. Enter your website details:
   - **Website URL**: https://theamproject.com
   - **Stream Name**: The AM Project Website

### Get Your Measurement ID
After creating the web stream, you'll see your new Measurement ID (starts with G-).
**This is what we need for VITE_GA_MEASUREMENT_ID**

## Step 2: Update Replit Secret

Once you have your new Measurement ID:
1. Go to your Replit project
2. Click the 🔒 **Secrets** tab (project-specific)
3. Find `VITE_GA_MEASUREMENT_ID`
4. Update it to your new GA4 Measurement ID
5. Save the change

## Step 3: Verify Setup

After updating the secret, check your browser console for:
```
🎯 Unified Tracking Initialized: {
  ga4: "G-YOUR_NEW_ID",
  googleAds: "AW-835937139",
  note: "GA4 ID CORRECT ✅"
}
```

## Step 4: Test Data Collection

1. Navigate around your website for 2-3 minutes
2. Go back to Google Analytics
3. Click "Realtime" in the left menu
4. You should see active users immediately

## Advanced GA4 Features Already Configured

Your tracking system includes:
- **Enhanced Measurement**: Automatically tracks scrolls, clicks, downloads, site search
- **Custom Events**: Marketing interactions, user engagement, conversion funnels
- **E-commerce Tracking**: Ready for subscription and payment tracking
- **Audience Building**: User segments for remarketing
- **Conversion Goals**: Pre-configured for key business actions

## Google Ads Integration

Your Google Ads account (AW-835937139) is already configured to work with any GA4 property. Once the new GA4 is active:
1. Link GA4 to Google Ads in the GA4 Admin panel
2. Enable "Google Ads Conversions" in GA4
3. Import GA4 audiences into Google Ads for better targeting

## Next Steps After Setup

1. **Create new GA4 property** (get new Measurement ID)
2. **Update VITE_GA_MEASUREMENT_ID** secret in Replit
3. **Test tracking** (should work immediately)
4. **Link to Google Ads** for enhanced conversion tracking
5. **Set up conversion goals** in GA4 interface

The unified tracking system is ready and waiting for your new Measurement ID.