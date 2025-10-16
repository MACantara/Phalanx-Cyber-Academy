# Phalanx Cyber Academy Tutorial System Documentation

## Overview

The Phalanx Cyber Academy tutorial system is a comprehensive, interactive framework designed to guide users through cybersecurity applications and concepts. The system uses a modular architecture with automatic application integration, visual highlighting, step-by-step guidance, and progress tracking.

## System Architecture

### Core Components

1. **BaseTutorial** (`base-tutorial.js`) - Abstract base class for all tutorials
2. **TutorialManager** (`tutorial-manager.js`) - Central coordinator for tutorial lifecycle
3. **TutorialRegistry** (`tutorial-registry.js`) - Configuration registry for all tutorials
4. **TutorialStepManager** (`tutorial-step-manager.js`) - Handles step navigation and interactions
5. **TutorialInteractionManager** (`tutorial-interaction-manager.js`) - Controls user interactions during tutorials

### Integration Components

6. **ApplicationRegistry** (`../desktop-components/application-registry.js`) - Application-tutorial mapping
7. **ApplicationLauncher** (`../desktop-components/application-launcher.js`) - Handles tutorial auto-start

## How the Tutorial System Works

### 1. Tutorial Registration

All tutorials are registered in `TutorialRegistry` with configuration including:
```javascript
{
    className: 'TerminalTutorial',           // Tutorial class name
    globalVarName: 'terminalTutorial',       // Global variable for access
    title: 'Command Line',                   // Display title
    description: 'Learn essential command line tools',
    category: 'Command Line',                // Grouping category
    estimatedTime: '12 minutes',             // Expected duration
    storageKey: 'Phalanx Cyber Academy_terminal_tutorial_completed',  // Completion tracking
    tutorialMethod: 'shouldAutoStartTerminal',            // Auto-start check method
    startMethod: 'startTerminalTutorial',                 // Manual start method
    restartMethod: 'restartTerminalTutorial'              // Restart method
}
```

### 2. Application Integration

Applications are linked to tutorials through `ApplicationRegistry`:
```javascript
'terminal': {
    class: TerminalApp,
    storageKey: 'Phalanx Cyber Academy_terminal_opened',
    tutorialMethod: 'shouldAutoStartTerminal',    // Links to tutorial auto-start
    startMethod: 'startTerminalTutorial',         // Links to tutorial start
    iconClass: 'bi-terminal',
    title: 'Terminal'
}
```

### 3. Auto-Start Flow

When an application is opened for the first time:

1. **ApplicationLauncher.openApplication()** detects first-time usage
2. Checks if `tutorialMethod` and `startMethod` exist
3. Calls `handleTutorialAutoStart()` which:
   - Verifies tutorial manager has required methods
   - Calls the tutorial's `shouldAutoStart()` method
   - If true, starts tutorial after 1.5 second delay

### 4. Tutorial Execution Flow

```
Tutorial Start → Create Overlay → Show Steps → Handle Interactions → Complete/Cleanup
```

#### Step Structure
Each tutorial step contains:
```javascript
{
    target: '#element-selector',          // Element to highlight
    title: 'Step Title',                 // Step title
    content: 'Step description...',      // Step content
    action: 'highlight',                 // Visual effect: 'highlight', 'pulse'
    position: 'bottom',                  // Tooltip position: 'top', 'bottom', 'left', 'right'
    interactive: true,                   // Whether step requires interaction
    interaction: {                       // Interaction configuration
        type: 'input',                   // 'click', 'input', 'dblclick', 'hover', 'scroll', 'select'
        expectedValue: 'help',           // Expected input (for input type)
        triggerOnEnter: true,            // Trigger on Enter key (for input type)
        instructions: 'Type "help"',     // User instruction
        successMessage: 'Great!',        // Success feedback
        autoAdvance: true,               // Auto-advance to next step
        advanceDelay: 2000              // Delay before auto-advance (ms)
    },
    final: true                         // Mark as final step
}
```

### 5. Interaction Management

**TutorialInteractionManager** provides:
- **Tutorial Mode**: Disables all page interactions except tutorial elements
- **Selective Interaction**: Allows specific elements to be interactive
- **Event Prevention**: Blocks context menus, keyboard shortcuts, drag/drop
- **Visual Feedback**: Adds CSS classes for tutorial styling

### 6. Step Management

**TutorialStepManager** handles:
- **Navigation**: Next/previous step movement
- **Validation**: Step configuration validation
- **Interactions**: Setup and cleanup of step-specific interactions
- **Progress**: Step counting and completion tracking

## Creating New Tutorials

### Step 1: Create Tutorial Class

Create a new file `your-tutorial-name-tutorial.js`:

```javascript
import { BaseTutorial } from './base-tutorial.js';
import { tutorialInteractionManager } from './tutorial-interaction-manager.js';

export class YourTutorialNameTutorial extends BaseTutorial {
    constructor(desktop) {
        super(desktop);
        this.steps = [
            {
                target: '#your-app-container',
                title: 'Welcome to Your App',
                content: 'This tutorial will guide you through using this application.',
                action: 'highlight',
                position: 'bottom'
            },
            {
                target: '#interactive-element',
                title: 'Interactive Step',
                content: 'Click this button to continue.',
                action: 'pulse',
                position: 'top',
                interactive: true,
                interaction: {
                    type: 'click',
                    instructions: 'Click the highlighted button',
                    successMessage: 'Perfect! You clicked the button.',
                    autoAdvance: true,
                    advanceDelay: 1500
                }
            },
            {
                target: '#your-app-container',
                title: 'Tutorial Complete!',
                content: 'You have successfully completed this tutorial.',
                action: 'highlight',
                position: 'center',
                final: true
            }
        ];
    }

    async start() {
        // Ensure your application is open
        if (!this.desktop.windowManager.windows.has('your-app-id')) {
            await this.desktop.windowManager.openApplication('your-app-id', 'Your App Title');
        }

        // Initialize CSS and start tutorial
        this.initializeCSS();
        tutorialInteractionManager.enableTutorialMode();
        this.isActive = true;
        this.stepManager.reset();
        this.createOverlay();
        this.ensureAppInFront(); // Custom method to bring app to front
        
        // Set global references
        window.yourAppTutorial = this;
        window.currentTutorial = this;
        
        this.showStep();
    }

    ensureAppInFront() {
        const appWindow = this.desktop.windowManager.windows.get('your-app-id');
        if (appWindow && appWindow.windowElement) {
            appWindow.bringToFront();
        }
    }

    // Override base class methods for proper tutorial flow
    getSkipTutorialHandler() {
        return 'window.yourAppTutorial.showSkipModal';
    }

    getPreviousStepHandler() {
        return 'window.yourAppTutorial.previousStep';
    }

    getNextStepHandler() {
        return 'window.yourAppTutorial.nextStep';
    }

    getFinalStepHandler() {
        return 'window.yourAppTutorial.complete';
    }

    getFinalButtonText() {
        return 'Complete Tutorial';
    }

    // Static methods for auto-start functionality
    static shouldAutoStart() {
        const tutorialCompleted = localStorage.getItem('Phalanx Cyber Academy_yourapp_tutorial_completed');
        const appOpened = localStorage.getItem('Phalanx Cyber Academy_yourapp_opened');
        return !tutorialCompleted && appOpened;
    }

    static startTutorial(desktop) {
        const tutorial = new YourTutorialNameTutorial(desktop);
        tutorial.start();
        return tutorial;
    }

    static restart() {
        localStorage.removeItem('Phalanx Cyber Academy_yourapp_tutorial_completed');
        if (window.yourAppTutorial) {
            window.yourAppTutorial.cleanup();
        }
    }
}
```

### Step 2: Register Tutorial

Add to `TutorialRegistry.initializeTutorials()`:

```javascript
this.registerTutorial('your-tutorial-name', {
    className: 'YourTutorialNameTutorial',
    globalVarName: 'yourAppTutorial',
    title: 'Your App Tutorial',
    description: 'Learn how to use Your App effectively',
    category: 'Your Category',
    estimatedTime: '10 minutes',
    storageKey: 'Phalanx Cyber Academy_yourapp_tutorial_completed',
    tutorialMethod: 'shouldAutoStartYourApp',
    startMethod: 'startYourAppTutorial',
    restartMethod: 'restartYourAppTutorial'
});
```

### Step 3: Register Application (if new)

Add to `ApplicationRegistry` constructor:

```javascript
'your-app-id': {
    class: YourAppClass,
    storageKey: 'Phalanx Cyber Academy_yourapp_opened',
    tutorialMethod: 'shouldAutoStartYourApp',
    startMethod: 'startYourAppTutorial',
    iconClass: 'bi-your-icon',
    title: 'Your App'
}
```

### Step 4: Add Launcher Method (optional)

Add to `ApplicationLauncher`:

```javascript
async launchYourApp() {
    return await this.launchApplication('your-app-id');
}
```

## Triggering Tutorials

### Auto-Start (Recommended)

Tutorials automatically start when:
1. Application is opened for the first time
2. Tutorial's `shouldAutoStart()` returns true
3. Tutorial is not already completed

### Manual Start

```javascript
// Through tutorial manager
window.tutorialManager.startYourAppTutorial();

// Direct class method
YourTutorialNameTutorial.startTutorial(desktop);

// Through registry
window.tutorialManager.startTutorialByName('your-tutorial-name');
```

### Restart Tutorial

```javascript
// Through tutorial manager
window.tutorialManager.restartYourAppTutorial();

// Direct class method
YourTutorialNameTutorial.restart();

// Through registry
window.tutorialManager.restartTutorial('your-tutorial-name');
```

## Interaction Types

### Click Interactions
```javascript
interaction: {
    type: 'click',
    instructions: 'Click the highlighted element',
    successMessage: 'Great! You clicked it.',
    autoAdvance: true,
    advanceDelay: 1500
}
```

### Input Interactions
```javascript
interaction: {
    type: 'input',
    expectedValue: 'help',                    // Exact text to match
    triggerOnEnter: true,                     // Trigger on Enter key
    instructions: 'Type "help" and press Enter',
    successMessage: 'Perfect! Command executed.',
    autoAdvance: true,
    advanceDelay: 2000
}
```

### Selection Interactions
```javascript
interaction: {
    type: 'select',
    expectedValue: 'option-value',            // Select option value
    instructions: 'Choose the correct option',
    successMessage: 'Correct selection!',
    autoAdvance: true,
    advanceDelay: 1000
}
```

### Double-Click Interactions
```javascript
interaction: {
    type: 'dblclick',
    instructions: 'Double-click to open',
    successMessage: 'File opened successfully!',
    autoAdvance: true,
    advanceDelay: 1500
}
```

### Hover Interactions
```javascript
interaction: {
    type: 'hover',
    instructions: 'Hover over the element',
    successMessage: 'Information displayed!',
    autoAdvance: true,
    advanceDelay: 2000
}
```

## Tutorial Styling

### CSS Classes

The tutorial system automatically applies these classes:

- `.tutorial-highlight` - Applied to highlighted elements
- `.tutorial-interactive` - Applied to interactive elements during tutorial mode
- `.tutorial-success` - Applied to elements after successful interaction
- `.tutorial-pulse` - Applied for pulsing animation effect
- `.tutorial-overlay` - Applied to the tutorial overlay
- `.tutorial-tooltip` - Applied to tutorial tooltips

### Custom Styling

Add custom CSS in your tutorial's `initializeCSS()` method:

```javascript
initializeCSS() {
    super.initializeCSS(); // Call parent method first
    
    // Add custom styles
    const customStyles = document.createElement('style');
    customStyles.innerHTML = `
        .your-custom-tutorial-class {
            /* Your custom styles */
        }
    `;
    document.head.appendChild(customStyles);
}
```

## Best Practices

### Tutorial Design

1. **Start Simple**: Begin with overview, progress to specific actions
2. **Progressive Disclosure**: Introduce one concept at a time
3. **Interactive Learning**: Include hands-on interactions
4. **Clear Instructions**: Use specific, actionable language
5. **Visual Feedback**: Provide immediate success feedback

### Technical Implementation

1. **Element Targeting**: Use stable selectors (IDs preferred over classes)
2. **Error Handling**: Include fallbacks for missing elements
3. **Timing**: Allow sufficient time for UI rendering
4. **Cleanup**: Always cleanup resources in the cleanup method
5. **Testing**: Test with different screen sizes and browsers

### User Experience

1. **Skip Option**: Always provide a way to skip the tutorial
2. **Progress Indication**: Show current step and total steps
3. **Contextual Help**: Provide relevant help at each step
4. **Completion Tracking**: Track and persist completion status
5. **Restart Capability**: Allow users to restart tutorials

## Debugging Tutorials

### Common Issues

1. **Elements Not Found**: Check selectors and timing
2. **Interactions Not Working**: Verify interaction configuration
3. **Tutorial Not Starting**: Check registration and auto-start logic
4. **Steps Skipping**: Validate step configuration and interactions

### Debug Tools

```javascript
// Check tutorial registration
console.log(window.tutorialManager.getTutorial('tutorial-name'));

// Check tutorial completion
console.log(window.tutorialManager.isTutorialCompleted('tutorial-name'));

// Check current step
console.log(window.currentTutorial?.stepManager.getCurrentStepIndex());

// Check interaction manager state
console.log(window.tutorialInteractionManager.isTutorialModeActive());
```

### Console Commands

```javascript
// Start tutorial manually
window.tutorialManager.startYourAppTutorial();

// Skip to specific step
window.currentTutorial.stepManager.goToStep(3);

// Reset tutorial completion
window.tutorialManager.resetTutorial('tutorial-name');

// Get tutorial statistics
console.log(window.tutorialManager.getCompletionStats());
```

## Example: Existing Tutorials

The Phalanx Cyber Academy tutorial system includes several comprehensive tutorials that demonstrate advanced features:

### Terminal Tutorial (`terminal-tutorial.js`)
- **Application Integration**: Automatically opens terminal if not open
- **Interactive Commands**: Requires users to type specific commands
- **Input Validation**: Validates user input before proceeding
- **Progressive Learning**: Builds from basic to advanced commands
- **Real Feedback**: Uses actual terminal responses

### Vulnerability Scanner Tutorial (`vulnerability-scanner-tutorial.js`)
- **Complex UI Navigation**: Guides through multi-panel interface
- **Target Selection**: Interactive dropdown selection with validation
- **Scan Process**: Demonstrates real vulnerability scanning workflow
- **Results Analysis**: Shows how to interpret security findings
- **Report Generation**: Professional vulnerability report creation
- **Ethical Considerations**: Emphasizes responsible security testing

Study these tutorials for complete implementation examples of different application types and interaction patterns.

## Future Enhancements

### Planned Features

1. **Branching Tutorials**: Conditional paths based on user choices
2. **Tutorial Sequences**: Chained tutorials for complex workflows
3. **Analytics**: Track user interaction patterns
4. **Localization**: Multi-language support
5. **Custom Themes**: Tutorial appearance customization

### Extension Points

1. **Custom Interaction Types**: Add new interaction patterns
2. **Tutorial Templates**: Predefined tutorial structures
3. **Integration APIs**: External system integration
4. **Progress Sharing**: Cross-session progress sync
5. **Adaptive Tutorials**: AI-driven personalization

This tutorial system provides a solid foundation for creating engaging, interactive cybersecurity education experiences in Phalanx Cyber Academy.
