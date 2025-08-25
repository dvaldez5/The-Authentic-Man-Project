# Gamification System - Where It Appears

## Current Implementation Overview

The gamification system is integrated throughout the application in these locations:

### 1. Header Navigation
- **XP Chip Display**: Shows user's current level, XP points, and streak
- **Location**: Top navigation bar (when authenticated)
- **Components**: `XPChip.tsx`
- **Features**: Level badge, XP count, fire emoji for streaks

### 2. Dashboard (Primary Hub)
- **Badge Display**: Shows earned achievements and locked badges
- **Daily Prompt Card**: AI-generated reflection prompts with XP rewards
- **Location**: Dashboard page, positioned after AM Chat and before Progress Overview
- **Components**: `BadgeDisplay.tsx`, `DailyPromptCard.tsx`
- **Features**: 
  - Achievement showcase with rarity indicators
  - Daily reflection prompts with +50 XP rewards
  - Collapsible journal entry interface

### 3. Backend API Integration
- **XP Reward System**: Automatic XP distribution on activity completion
- **Endpoints**: 
  - `/api/gamification/xp` - User XP and level data
  - `/api/gamification/badges` - All available badges
  - `/api/gamification/user-badges` - User's earned badges
  - `/api/gamification/daily-prompt` - Today's reflection prompt
- **Trigger Points**:
  - +100 XP for lesson completion
  - +125 XP for scenario responses  
  - +200 XP for weekly reflections
  - +50 XP for daily prompt responses

### 4. Feature Flag Control
- **Environment Variables**:
  - `VITE_SHOW_GAMIFICATION=true` - Controls XP chips and badges
  - `VITE_SHOW_DAILY_PROMPT=true` - Controls daily prompt cards
- **Default**: ON in development, OFF in production until QA approval

### 5. Data Persistence
- **Database Tables**: userXP, badges, userBadges, dailyPrompts, eventLog
- **Analytics**: Event logging tracks all XP-earning activities
- **Badge Logic**: Automatic award checking based on user activity milestones

## Badge System Details

**10 Core Badges Available:**
- **Common** (4): First Step, Scholar, Challenger, Reflective Mind
- **Rare** (3): Dedicated, Scenario Master, Consistent Growth  
- **Epic** (2): Level Up, Milestone Crusher
- **Legendary** (1): AM Legend

## Daily Prompts
- **AI-Generated**: Using OpenAI with evidence-based themes
- **Themes**: Leadership, resilience, discipline, purpose, relationships, balance
- **Integration**: Links to journal system for seamless reflection workflow

## Next Integration Points (Not Yet Implemented)
- Learning lesson completion pages
- Challenge completion celebrations
- Weekly reflection submission flows
- Community/pod activity feeds
- Settings page for gamification preferences

The system is fully functional and ready for user engagement while maintaining the existing design aesthetic.