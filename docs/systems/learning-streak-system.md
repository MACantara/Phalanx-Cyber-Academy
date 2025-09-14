# Learning Streak Tracking System

## Overview

The learning streak tracking system has been implemented to track user engagement and learning consistency based on their activity in the XP history and level completion database tables. This server-side implementation replaces the previously removed adaptive learning system references.

## Implementation Details

### Core Components

1. **`app/utils/streak_tracker.py`** - Main streak calculation engine
2. **`app/utils/streak_helpers.py`** - Helper functions for UI integration
3. **Updated `app/routes/profile.py`** - Dashboard integration
4. **Updated `app/routes/levels.py`** - Level completion API enhancement

### How Streak Tracking Works

A learning streak is considered **active** if a user has either:
- XP history records (any XP change)
- Level completion records

The system tracks activity on a daily basis:
- **Active Streak**: User has activity today and consecutive previous days
- **At Risk**: User had activity yesterday but not today (can still continue streak)
- **Broken**: No activity for 2+ days
- **Starting**: Activity today but no consecutive days yet

### Database Dependencies

The streak calculation is based on:
- **XP History Model** (`app/models/xp_history.py`)
  - Tracks all XP changes with timestamps
  - Provides user activity history
- **Level Completion Model** (`app/models/level_completion.py`)
  - Tracks completed levels with timestamps
  - Provides learning milestones

### API Integration

#### Dashboard Route (`/dashboard`)
- **Added**: `streak_data` object with current streak, longest streak, status, and encouragement message
- **Enhanced**: Learning streak display with comprehensive status information

#### Level Completion API (`/api/complete/<level_id>`)
- **Added**: `streak_info` object in response containing:
  - `current_streak`: Current active streak count
  - `longest_streak`: User's longest streak ever
  - `is_active`: Boolean indicating if streak is currently active
  - `message`: Encouraging message based on streak status

### Available Functions

#### Main Streak Tracker (`streak_tracker.py`)
```python
LearningStreakTracker.get_user_learning_streak(user_id)
# Returns comprehensive streak data

LearningStreakTracker.get_weekly_activity_summary(user_id)
# Returns weekly activity breakdown

get_user_learning_streak(user_id)
# Convenience function for basic streak info
```

#### Helper Functions (`streak_helpers.py`)
```python
has_active_streak(user_id)          # Quick boolean check
get_simple_streak_count(user_id)    # Simple count for display
is_streak_at_risk(user_id)          # Check if streak needs attention
get_streak_status_emoji(user_id)    # Emoji for UI elements
get_streak_message_brief(user_id)   # Short message for compact areas
```

### Streak Status Types

- **`active`**: Current streak with recent activity
- **`at_risk`**: Streak can continue if user is active today
- **`broken`**: Streak is broken, needs fresh start
- **`starting`**: Activity today, building toward a streak
- **`no_activity`**: No recorded activity
- **`unknown`**: Error state (safe fallback)

### Error Handling

The system includes comprehensive error handling:
- Safe fallbacks for database errors
- Graceful degradation when models are unavailable
- Logging for debugging purposes
- Default values to prevent UI breaks

### Calculation Logic

1. **Current Streak**: Counts consecutive days with activity, starting from today or yesterday
2. **Longest Streak**: Historical maximum consecutive days with activity
3. **Activity Detection**: Any XP change or level completion counts as daily activity
4. **Daily Boundaries**: Uses UTC date boundaries for consistent calculation

### Example Usage

```python
# In a route or template context
from app.utils.streak_helpers import get_simple_streak_count, get_streak_status_emoji

user_streak = get_simple_streak_count(current_user.id)
streak_emoji = get_streak_status_emoji(current_user.id)

# Display: "🔥 7 day streak!"
```

### Testing

The system includes a test script (`test_streak_tracking.py`) that verifies:
- All modules import correctly
- Functions return expected data types
- Error handling works properly
- Safe fallbacks are in place

### Future Enhancements

Potential improvements to consider:
1. **Streak Achievements**: Badges for milestone streaks (7, 30, 100 days)
2. **Streak Recovery**: Grace periods for missed days
3. **Social Features**: Streak leaderboards or sharing
4. **Notifications**: Reminders when streaks are at risk
5. **Analytics**: Detailed streak pattern analysis

### Migration from Adaptive Learning

This implementation successfully replaces the adaptive learning system by:
- Providing concrete user engagement metrics
- Offering encouragement and motivation features
- Maintaining backwards compatibility with existing templates
- Using existing database models without schema changes

The learning streak system provides a simpler, more reliable way to track and encourage user engagement compared to the complex adaptive learning algorithms that were previously in place.