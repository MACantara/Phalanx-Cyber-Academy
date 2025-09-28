# Centralized XP and Session Management Utilities

This documentation describes the centralized utility system for XP performance-based tracking and session management across all CyberQuest levels and modes.

## Overview

The centralized utilities provide consistent XP calculation, session lifecycle management, and progress tracking across:
- Level 1-5 (all cybersecurity levels)
- Blue Team vs Red Team Mode
- Future game modes and levels

## Architecture

### Backend Components

#### 1. XP API (`app/routes/xp_api.py`)
Provides dedicated API endpoints based on the `XPCalculator` and `XPManager` utilities:

- `GET /api/xp/config` - Get XP calculation configuration (base XP, multipliers, thresholds)
- `POST /api/xp/calculate` - Calculate XP preview without awarding
- `POST /api/xp/award` - Award XP for level completion
- `POST /api/xp/session/award` - Award XP for session completion
- `GET /api/xp/history` - Get user's XP history
- `GET /api/xp/user-level` - Get user's level information
- `GET /api/xp/leaderboard` - Get XP leaderboard
- `POST /api/xp/recalculate` - Recalculate user's total XP

#### 2. Enhanced XP Calculator (`app/utils/xp.py`)
Existing XP calculation engine with performance-based metrics:

- **Base XP by Difficulty**: Easy (50), Medium (100), Intermediate (150), Hard (200), Expert (300)
- **Score Multipliers**: Perfect (2.0x), Excellent (1.5x), Good (1.2x), Average (1.0x), Below Average (0.8x)
- **Time Bonuses**: Lightning (1.5x), Fast (1.2x), Normal (1.0x), Slow (0.9x)
- **First-Time Bonus**: +25 XP for first completion

### Frontend Components

#### 1. Session Manager (`app/static/js/utils/session-manager.js`)
Handles session lifecycle management:

```javascript
import { sessionManager } from './utils/session-manager.js';

// Start a new session
const session = await sessionManager.startSession('Level 1: Misinformation Maze', 1);

// End current session
const result = await sessionManager.endSession(85, { difficulty: 'medium' });

// Get active session
const activeSession = sessionManager.getActiveSession();
```

**Key Features:**
- Automatic localStorage persistence
- Fallback to local sessions if API fails
- Session state restoration
- Multiple session ID compatibility

#### 2. XP Calculator (`app/static/js/utils/xp-calculator.js`)
Client-side XP calculations and API integration with dynamic backend configuration:

```javascript
import { xpCalculator } from './utils/xp-calculator.js';

// Configuration is automatically loaded from backend on initialization
// Preview XP calculation (client-side with backend config)
const preview = await xpCalculator.calculatePerformanceBasedXPAsync(1, 85, 600, 'medium');

// Sync version (uses loaded config or fallback)
const previewSync = xpCalculator.calculatePerformanceBasedXP(1, 85, 600, 'medium');

// Calculate XP via API (server-side)
const calculation = await xpCalculator.calculateXPFromAPI(1, 85, 600, 'medium');

// Award XP for level completion
const award = await xpCalculator.awardXP(1, 85, 600, 'medium', sessionId);
```

**Key Features:**
- **Dynamic Backend Configuration**: XP calculation settings loaded from `/api/xp/config`
- **Automatic Configuration Loading**: Config preloaded on module initialization
- **Fallback Support**: Graceful fallback to hardcoded values if API fails
- **Sync/Async Calculations**: Both immediate and configuration-assured calculations
- **Perfect Backend Matching**: Client calculations exactly match server logic

#### 3. Game Progress Manager (`app/static/js/utils/game-progress-manager.js`)
Unified interface combining session and XP management:

```javascript
import { gameProgressManager } from './utils/game-progress-manager.js';

// Start a level (creates session + XP tracking)
const levelData = await gameProgressManager.startLevel(1, 'Misinformation Maze', 'medium');

// Complete a level (ends session + awards XP)
const completion = await gameProgressManager.completeLevel(85, { achievements: ['first-time'] });

// Start a non-level session (Blue Team vs Red Team Mode)
const session = await gameProgressManager.startSession('Blue Team vs Red Team Mode');

// Complete non-level session
const sessionCompletion = await gameProgressManager.completeSession('Blue Team vs Red Team Mode', 75);
```

**Key Features:**
- Single interface for level and session management
- Automatic time tracking
- Progress persistence
- Error handling and fallbacks

## Usage Examples

### Level Integration

#### Simple Level Integration
```javascript
// Import the unified manager
import { startLevel, completeLevel, getCurrentSessionId } from './utils/index.js';

// In your level initialization
const levelData = await startLevel(2, 'Shadow Inbox', 'medium');

// During level completion
const score = calculateScore(); // Your scoring logic
const completion = await completeLevel(score);

console.log(`Earned ${completion.xp.xp_awarded} XP!`);
```

#### Advanced Level Integration
```javascript
import { gameProgressManager } from './utils/game-progress-manager.js';

class Level3Manager {
    async initialize() {
        // Start level with progress tracking
        this.levelData = await gameProgressManager.startLevel(3, 'Malware Mayhem', 'hard');
        this.sessionId = this.levelData.session.id;
    }
    
    async complete() {
        const score = this.calculateFinalScore();
        const timeSpent = gameProgressManager.getTimeSpent();
        
        // Preview XP before completion
        const xpPreview = await gameProgressManager.previewXP(3, score, timeSpent, 'hard');
        
        // Show preview to user
        this.showXPPreview(xpPreview);
        
        // Complete level and award XP
        const completion = await gameProgressManager.completeLevel(score, {
            achievements: this.getAchievements(),
            flags_found: this.flagsFound.length
        });
        
        this.showCompletionSummary(completion);
    }
}
```

### Blue Team vs Red Team Mode Integration
```javascript
import { gameProgressManager } from './utils/game-progress-manager.js';

class BlueTeamVsRedTeamMode {
    async startMatch() {
        this.sessionData = await gameProgressManager.startSession('Blue Team vs Red Team Mode');
    }
    
    async endMatch() {
        const finalScore = this.calculateMatchScore();
        const completion = await gameProgressManager.completeSession(
            'Blue Team vs Red Team Mode', 
            finalScore, 
            {
                mode: 'competitive',
                rounds_won: this.roundsWon,
                total_rounds: this.totalRounds
            }
        );
        
        return completion;
    }
}
```

### Migration from Existing Systems

The utilities provide compatibility methods for migrating from existing level-specific session management:

```javascript
// Migrate existing session
const session = await sessionManager.migrateExistingSession('Level 4', 4);

// Use existing session IDs
const sessionId = sessionManager.getActiveSessionId(); // Checks multiple localStorage keys
```

## XP Calculation Examples

### Score-Based XP
```javascript
// Level 4 (Hard difficulty): Base 200 XP
// Score: 95% (Excellent) = 1.5x multiplier
// Time: 10 minutes for expected 15 minutes = Fast = 1.2x multiplier
// First time: +25 XP bonus

const xp = await xpCalculator.calculateXPFromAPI(4, 95, 600, 'hard');
// Result: 200 * 1.5 * 1.2 + 25 = 385 XP
```

### Session-Based XP (Non-Level)
```javascript
// Blue Team vs Red Team Mode: Base 50 XP
// Score: 80% = 1.2x multiplier
// Result: 50 * 1.2 = 60 XP

const award = await xpCalculator.awardSessionXP('Blue Team vs Red Team Mode', 80, 1200, null, sessionId);
```

## Error Handling

The utilities include comprehensive error handling:

1. **API Failures**: Automatic fallback to client-side calculations
2. **Network Issues**: Local session storage with sync on reconnection
3. **Data Corruption**: State validation and reset capabilities
4. **Browser Compatibility**: Multiple localStorage key support

## Best Practices

### 1. Always Use the Centralized System
```javascript
// ✅ Good - Use centralized utilities
import { startLevel, completeLevel } from './utils/index.js';

// ❌ Avoid - Direct API calls or custom session management
fetch('/api/session/start', { ... });
```

### 2. Handle Errors Gracefully
```javascript
try {
    const completion = await completeLevel(score);
    showSuccessMessage(completion.xp.xp_awarded);
} catch (error) {
    console.error('Completion failed:', error);
    // Still show completion, even without XP
    showBasicCompletion(score);
}
```

### 3. Provide XP Previews
```javascript
// Show preview during gameplay
const preview = await previewXP(levelId, currentScore, getTimeSpent(), difficulty);
updateXPDisplay(preview.xp_earned);
```

### 4. Persist Important Data
```javascript
// The utilities automatically persist session state
// But store critical game data separately
localStorage.setItem(`level_${levelId}_progress`, JSON.stringify(gameState));
```

## Performance Considerations

- **Client-Side Calculations**: Used for previews and fallbacks
- **Server-Side Validation**: All XP awards validated on backend
- **Caching**: Session state cached in localStorage
- **Batch Operations**: Multiple XP operations can be batched

## Debugging

Enable debug logging:
```javascript
// Enable verbose logging
localStorage.setItem('cyberquest_debug', 'true');
```

Check session state:
```javascript
console.log('Current session:', gameProgressManager.getCurrentSession());
console.log('Session summary:', sessionManager.getSessionSummary());
```

## Migration Guide

### From Level-Specific Session Management

1. **Replace direct API calls:**
   ```javascript
   // Before
   const response = await fetch('/api/session/start', {...});
   
   // After
   const session = await startLevel(levelId, levelName, difficulty);
   ```

2. **Update completion handling:**
   ```javascript
   // Before
   await fetch('/api/session/end', {score: finalScore});
   await fetch('/api/xp/award', {level_id: levelId, score: finalScore});
   
   // After
   const completion = await completeLevel(finalScore);
   ```

3. **Update session ID usage:**
   ```javascript
   // Before
   const sessionId = localStorage.getItem('some_specific_key');
   
   // After
   const sessionId = getCurrentSessionId(); // Checks all common keys
   ```

## Testing

Test your integration:
```javascript
// Test session lifecycle
await gameProgressManager.startLevel(1, 'Test Level', 'easy');
const completion = await gameProgressManager.completeLevel(100);
console.assert(completion.xp.xp_awarded > 0, 'XP should be awarded');

// Test error handling
try {
    await completeLevel(null); // Should handle gracefully
} catch (error) {
    console.error('Error handling test passed');
}
```

This centralized system ensures consistent XP tracking and session management across all CyberQuest components while maintaining compatibility with existing implementations.