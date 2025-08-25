# Tour System Documentation

## Overview
The AM Project features a contextual onboarding tour system that automatically guides new users through key application features. Tours use interactive tooltips with manual progression to ensure proper learning without overwhelming users.

## Production Behavior
- **Auto-initiation**: Only triggers for NEW USERS (determined by incomplete onboarding status)
- **Manual progression**: Users must click "Next" to advance through steps
- **One-time completion**: Tours are marked complete after finishing and won't auto-restart
- **Forced scrolling**: Elements automatically scroll into view with proper positioning

## Available Tours

#### 1. Dashboard Tour (`dashboard-intro`)
- **Trigger**: Visit `/dashboard` (new users only)
- **Delay**: 3 seconds after page load
- **Steps**: 7 total steps covering:
  - Welcome message
  - XP system explanation  
  - Achievement badges
  - Daily prompts
  - Daily challenges
  - Weekly scenarios
  - Navigation overview

#### 2. Learning Tour (`learning-intro`) 
- **Trigger**: Visit `/learning` (new users only)
- **Delay**: 2 seconds after page load
- **Steps**: 3 total steps covering:
  - Learning system overview
  - Course grid navigation
  - Lesson completion tracking

#### 3. Journal Tour (`journal-intro`)
- **Trigger**: Visit `/journal` (new users only)
- **Delay**: 2 seconds after page load
- **Steps**: 4 total steps covering:
  - Journal system overview
  - Entry viewing and management
  - New entry creation
  - Weekly reflection access

#### 4. Weekly Reflections Tour (`weekly-reflections-intro`)
- **Trigger**: Visit `/weekly-reflections` (new users only)
- **Delay**: 2 seconds after page load
- **Steps**: 4 total steps covering:
  - Weekly reflection purpose
  - Reflection form interface
  - Weekly goals setting
  - Submission process

## Tour Requirements
- User must be **logged in**
- User must be **NEW** (incomplete onboarding status)
- Target page elements must be **present in the DOM**
- Tours are **automatically skipped** if already completed (stored in localStorage)

## Technical Implementation

### Key Components
- **TourManager**: Main orchestration component that detects page visits and user status
- **TourTooltip**: Renders interactive tooltips with proper positioning and scrolling
- **OnboardingTourContext**: Manages tour state, progression, and completion tracking
- **Tour Data**: Individual tour configurations with steps, targets, and content

### Data Tour Attributes
Tours require specific `data-tour` attributes on target elements:

**Dashboard**: `dashboard-title`, `xp-display`, `badges-section`, `daily-prompt`, `daily-challenge`, `weekly-scenario`, `main-navigation`

**Learning**: `learning-title`, `course-list`, `lesson-content`

**Journal**: `journal-title`, `journal-entries`, `new-entry-button`, `weekly-reflection-link`

**Weekly Reflections**: `weekly-reflections-title`, `reflection-prompt`, `weekly-goals`, `start-reflection-button`

### Forced Scrolling Behavior
- Dashboard: Standard positioning
- Learning: Standard positioning  
- Journal: Standard positioning
- Weekly Reflections: 200px from top for all elements (special case)

## Development Notes

### Adding New Tours
1. Create tour configuration in `/client/src/data/tours/`
2. Add tour ID to tours index
3. Add data-tour attributes to target page elements
4. Update TourManager switch statement for auto-start logic
5. Test with new user account

### Modifying Existing Tours
- Never remove existing data-tour attributes
- Test scrolling behavior on target pages
- Verify tooltip positioning doesn't break layout
- Ensure manual progression works correctly

## Production Notes

### Current Status
**PRODUCTION READY** - All test components removed, auto-initiation limited to new users only.

### Future Instructions

**To Enable Tours for Testing:**
Temporarily modify `/client/src/components/tour/TourTestButton.tsx`:
```javascript
// Change from:
return null;
// To:
return (<Button onClick={handleStartTour}>Test Tour</Button>);
```

**To Test New User Experience:**
Create account and ensure user record has `onboardingComplete: false` in database.

**Tour Sequence for New Users:**
1. Dashboard (auto-start on visit)
2. Learning (auto-start on visit)  
3. Journal (auto-start on visit)
4. Weekly Reflections (auto-start on visit)

**Completion Logic:**
Tours auto-complete when user clicks "Finish" on final step. Completion status stored in localStorage prevents restart.