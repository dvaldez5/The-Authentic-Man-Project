# Tour System Production Documentation

## Overview
The AM Project contextual onboarding tour system provides guided walkthroughs for new users across four key application areas: Dashboard, Learning, Journal, and Weekly Reflections.

## Production Specifications

### Auto-Initiation Logic
```javascript
// Tours ONLY auto-start for NEW USERS (onboarding not complete)
if (user.onboardingComplete) {
  // Skip tour - only for new users
  return;
}
```

### Tour Sequence & Timing
1. **Dashboard Tour** - 3 second delay, 7 steps
2. **Learning Tour** - 2 second delay, 3 steps  
3. **Journal Tour** - 2 second delay, 4 steps
4. **Weekly Reflections Tour** - 2 second delay, 4 steps

### User Experience Flow
- Manual progression only (no auto-advance)
- "Next" button required for each step
- "Finish" button appears only on final step
- Completion prevents future auto-starts
- Forced scrolling positions elements correctly

## Technical Architecture

### Core Components

**TourManager.tsx**
- Detects page navigation and user status
- Implements new user filtering logic (onboardingComplete: false)
- Orchestrates auto-start timing and conditions

**TourTooltip.tsx**
- Renders interactive tooltips with manual controls
- Handles forced scrolling and positioning
- Manages step transitions and completion

**OnboardingTourContext.tsx**
- Provides tour state management
- Tracks completion status in localStorage
- Handles tour progression and termination

### Required DOM Elements

Tours depend on specific `data-tour` attributes:

```html
<!-- Dashboard -->
<h1 data-tour="dashboard-title">Dashboard</h1>
<div data-tour="xp-display">XP: 450</div>
<section data-tour="badges-section">Badges</section>
<div data-tour="daily-prompt">Daily Prompt</div>
<div data-tour="daily-challenge">Daily Challenge</div>
<div data-tour="weekly-scenario">Weekly Scenario</div>
<nav data-tour="main-navigation">Navigation</nav>

<!-- Learning -->
<h1 data-tour="learning-title">Learning</h1>
<div data-tour="course-list">Course Grid</div>
<div data-tour="lesson-content">Lesson Area</div>

<!-- Journal -->
<h1 data-tour="journal-title">Journal</h1>
<div data-tour="journal-entries">Entry List</div>
<button data-tour="new-entry-button">New Entry</button>
<a data-tour="weekly-reflection-link">Weekly Reflections</a>

<!-- Weekly Reflections -->
<h1 data-tour="weekly-reflections-title">Weekly Reflections</h1>
<div data-tour="reflection-prompt">Reflection Form</div>
<div data-tour="weekly-goals">Goals Section</div>
<button data-tour="start-reflection-button">Submit</button>
```

### Special Positioning Rules

**Weekly Reflections Page**: All elements scroll to 200px from viewport top

**All Other Pages**: Standard tooltip positioning relative to target element

## Deployment Checklist

### Production Readiness
- [x] Test buttons removed (TourTestButton, TourForceStart)
- [x] Auto-initiation limited to new users only
- [x] All data-tour attributes present on target elements
- [x] Forced scrolling implemented for weekly reflections
- [x] Manual progression enforced (no auto-advance)
- [x] Completion tracking prevents restart loops

### Testing Requirements
- Verify tours only start for users with `onboardingComplete: false`
- Confirm all 4 page tours trigger correctly
- Test manual progression through all steps
- Validate scrolling behavior on weekly reflections
- Ensure completion status persists across sessions

## Future Maintenance

### Adding New Tours
1. Create tour config in `/client/src/data/tours/new-tour.ts`
2. Add to tours index file
3. Update TourManager switch statement  
4. Add required data-tour attributes to target page
5. Test with new user account

### Modifying Tours
- Never remove existing data-tour attributes
- Test all affected pages after changes
- Verify scrolling behavior remains intact
- Update this documentation for significant changes

### Troubleshooting
- Check browser console for missing element warnings
- Verify user onboarding status if tours don't start
- Confirm data-tour attributes match tour configurations
- Clear localStorage to reset completion status for testing