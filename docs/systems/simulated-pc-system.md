# Simulated PC System Architecture

## Overview

The Simulated PC System is the core desktop environment that powers all cybersecurity training levels in Phalanx Cyber Academy. It provides a realistic, interactive desktop simulation where users engage with various applications to learn cybersecurity concepts through hands-on scenarios.

## Architecture

### Core Components

#### 1. **Desktop Class** (`desktop.js`)
The main orchestrator that initializes and manages the entire simulated desktop environment.

**Key Responsibilities:**
- Desktop container creation and styling
- Component initialization (Taskbar, WindowManager, DialogueSystem)
- Level-specific configuration and application management
- User flow coordination (dialogues → tutorials → missions)
- Global accessibility setup

**Initialization Flow:**
```
Desktop Constructor
├── Create desktop container with gradient background
├── Store level information from simulation
├── Initialize Taskbar
├── Initialize DialogueManager
├── Initialize DialogueIntegration
├── Initialize WindowManager
├── Set level in ApplicationLauncher
├── Apply fade-in effect
└── Initialize user flow after 2 seconds
```

#### 2. **Boot Sequence** (`boot-sequence.js`)
Provides an authentic system startup experience with animated boot messages.

**Features:**
- Realistic boot message display with typing effects
- Status indicators ([OK], [WARN])
- Bundled service loading (security, training modules)
- Auto-scrolling to keep content visible
- Responsive design for mobile and desktop
- SSD-like fast loading simulation

**Boot Phases:**
1. System information display
2. Security services initialization
3. Training environment preparation
4. Welcome message and command prompt

#### 3. **Component Integration**
The desktop coordinates multiple specialized components:

- **WindowManager**: Window creation and management
- **Taskbar**: Application switching and system status
- **DialogueManager**: Narrative and interactive guidance
- **DialogueIntegration**: Flow control and dialogue orchestration
- **ApplicationLauncher**: Application lifecycle management

## Level Integration

### Level-Specific Configuration
Each level can configure the desktop environment with:
- Available applications
- Auto-open applications
- Special UI elements (timers, status displays)
- Level-specific dialogues and tutorials

### Level Configuration Flow
```javascript
// Desktop stores level from simulation
this.level = simulation.level.id || simulation.level;

// ApplicationLauncher filters apps by level
const levelApps = apps.filter(app => 
    app.levelSpecific === this.currentLevel
);

// Auto-opens level-specific applications
this.autoOpenLevelApps();
```

### Level-Special Applications
- **Level 1**: Browser, Email, File Manager
- **Level 2**: Email, Browser, System Logs
- **Level 3**: Process Monitor, Malware Scanner, Mission Timer
- **Level 4**: Terminal, Vulnerability Scanner, Network Monitor
- **Level 5**: Evidence Viewer, Investigation Hub, Forensic Report

## User Flow Management

### Initialization Sequence
```
1. Boot Sequence (2-3 seconds)
   ↓
2. Desktop Creation with fade-in
   ↓
3. Component Initialization
   ↓
4. User Flow Start (2 second delay)
   ↓
5. Dialogue Integration
   ├─ Level-specific dialogue
   ├─ Tutorial introduction
   ├─ Application tutorials
   └─ Mission briefing
   ↓
6. Active training scenario
```

### Dialogue Integration
The desktop coordinates with the dialogue system to provide:
- Narrative introductions
- Interactive guidance with element highlighting
- Tutorial orchestration
- Mission briefings

### Application Event Handling
```javascript
// Desktop methods for application events
async onApplicationOpened(appName) {
    await this.dialogueIntegration.onApplicationOpened(appName);
}

async onGuidanceCompleted(guidanceName) {
    await this.dialogueIntegration.onGuidanceCompleted(guidanceName);
}
```

## Performance Optimizations

### 1. **Lazy Loading**
- Level-specific JavaScript files loaded only when needed
- Reduces initial bundle size by 85%
- Improves initial load time significantly

### 2. **Component Caching**
- Application modules cached after first load
- Window styles loaded once and reused
- Dialogue instances managed efficiently

### 3. **Efficient DOM Management**
- Single desktop container for all windows
- Window visibility toggling instead of creation/destruction
- Optimized event handling with delegation

### 4. **Memory Management**
- Cleanup of unused components
- Efficient state management
- Minimal DOM reflows

## Accessibility Features

### Global Accessibility Setup
```javascript
window.dialogueManager = this.dialogueManager;
window.dialogueIntegration = this.dialogueIntegration;
window.restartDialogues = () => {
    return this.dialogueIntegration.restartDialogues();
};
```

### Keyboard Navigation
- Alt+Tab for window switching
- Alt+Number keys for direct window access
- Touch gestures for mobile window switching

### Visual Feedback
- Fade-in effects for smooth transitions
- Active window highlighting
- Responsive design for all screen sizes

## Level 3 Special Features

### Timer and Damage Tracking
The desktop provides special methods for Level 3's mission timer:

```javascript
// Add reputation damage
addReputationDamage(amount)

// Add financial damage
addFinancialDamage(amount)

// Get timer status
getTimerStatus()

// Get level-specific applications
getLevelApps()
```

### Mission Status Display
- Real-time reputation and financial tracking
- Visual damage indicators
- Timer countdown integration

## Error Handling

### Robust Initialization
```javascript
try {
    await this.initializeUserFlow();
} catch (error) {
    console.error('[Desktop] User flow initialization failed:', error);
    // Fallback to basic desktop functionality
}
```

### Component Availability Checks
```javascript
if (this.windowManager?.applicationLauncher) {
    return this.windowManager.applicationLauncher.addReputationDamage(amount);
}
console.warn('[Desktop] ApplicationLauncher not available');
return false;
```

### Graceful Degradation
- Components continue functioning even if some fail
- Console warnings for missing features
- Fallback behaviors for critical operations

## Configuration Options

### Desktop Styling
- Background gradient customization
- Opacity transitions
- Responsive breakpoints

### Boot Sequence
- Customizable boot messages
- Adjustable timing and delays
- Status indicator configuration

### Component Behavior
- Window management preferences
- Taskbar layout options
- Dialogue system settings

## Integration Points

### Backend Integration
- Level data from Flask backend
- Session management
- User progress tracking

### Frontend Integration
- Template integration via `simulation.html`
- Dynamic JavaScript loading
- CSS style management

### External Systems
- XP tracking integration
- Session management
- Authentication system

## Troubleshooting

### Common Issues

**Desktop not loading:**
- Check simulation level data
- Verify container element exists
- Check JavaScript console for errors

**Applications not opening:**
- Verify application registry configuration
- Check level-specific restrictions
- Ensure module paths are correct

**Dialogues not triggering:**
- Verify dialogue integration initialization
- Check localStorage for completion flags
- Ensure dialogue files are loaded

**Performance issues:**
- Check for memory leaks in applications
- Verify lazy loading is working
- Monitor bundle sizes per level

### Debug Mode
Enable detailed console logging:
```javascript
console.log('[Desktop] Initializing with window.currentSimulation:', window.currentSimulation);
console.log('[Desktop] Found simulation level:', simulation.level);
console.log('[Desktop] Set desktop level to:', this.level);
```

## Best Practices

### 1. **Component Initialization Order**
Always initialize components in the correct order:
1. Taskbar
2. Dialogue system
3. WindowManager
4. ApplicationLauncher

### 2. **Level-Specific Code**
Use level checks before accessing level-specific features:
```javascript
if (this.currentLevel === 3) {
    // Level 3 specific code
}
```

### 3. **Error Handling**
Wrap all async operations in try-catch blocks:
```javascript
try {
    await this.initializeUserFlow();
} catch (error) {
    console.error('Initialization failed:', error);
}
```

### 4. **Global References**
Use global references sparingly and document them:
```javascript
window.desktop = this; // For dialogue access
window.applicationLauncher = this.applicationLauncher; // For global access
```

## Future Enhancements

### Planned Improvements
1. **Multi-monitor support** - Extended desktop across multiple displays
2. **Desktop customization** - User-configurable wallpapers and layouts
3. **Application pinning** - Pin frequently used apps to desktop
4. **Desktop widgets** - Weather, clock, system status widgets
5. **Enhanced animations** - Smoother transitions and effects

### Scalability Considerations
- Support for more concurrent applications
- Improved memory management for long sessions
- Enhanced mobile experience
- Better accessibility support

## Related Documentation

- [Window Management System](./window-management-system.md)
- [Application Registry System](./application-registry-system.md)
- [Dialogue System](./dialogue-triggers.md)
- [Level-Specific Documentation](../level-specific/README.md)

## Files and Locations

**Core System Files:**
- `app/static/js/simulated-pc/desktop.js` - Main desktop class
- `app/static/js/simulated-pc/boot-sequence.js` - Boot sequence handler
- `app/templates/simulated-pc/simulation.html` - Desktop template

**Component Files:**
- `app/static/js/simulated-pc/desktop-components/taskbar.js`
- `app/static/js/simulated-pc/desktop-components/window-manager.js`
- `app/static/js/simulated-pc/desktop-components/application-registry.js`
- `app/static/js/simulated-pc/desktop-components/application-launcher.js`

**Integration Files:**
- `app/static/js/simulated-pc/dialogues/dialogue-manager.js`
- `app/static/js/simulated-pc/dialogues/dialogue-integration.js`
