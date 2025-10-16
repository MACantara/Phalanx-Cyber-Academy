# Phalanx Cyber Academy Dialogue System

The Phalanx Cyber Academy Dialogue System provides both narrative storytelling and interactive guidance capabilities. It replaces the previous separate tutorial system by integrating guidance features directly into dialogues.

## 🎯 Overview

The dialogue system consists of three main components:

1. **BaseDialogue** - Core dialogue functionality with interactive guidance
2. **DialogueManager** - Manages dialogue instances and character systems
3. **DialogueIntegration** - Handles level-specific dialogue flow

## 📁 File Structure

```
dialogues/
├── base-dialogue.js          # Core dialogue class with guidance features
├── dialogue-manager.js       # Dialogue orchestration and character management
├── dialogue-integration.js   # Level dialogue integration and flow control
└── README.md                # This documentation file
```

## 🚀 Key Features

### Narrative Dialogues
- Character-based conversations with typing effects
- Multiple character support with avatars and names
- Skip functionality and navigation controls
- Auto-start and completion tracking

### Interactive Guidance
- Element highlighting with spotlight effects
- Selective interaction blocking/allowing
- Pulse animations and visual effects
- Real-time guidance during dialogues

## 💬 Creating Dialogues

### Basic Dialogue Structure

```javascript
import { BaseDialogue } from './base-dialogue.js';

export class YourDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "Welcome to the system!",
                typing: true
            },
            {
                text: "This is your final message.",
                typing: true
            }
        ];
    }

    onComplete() {
        // Handle dialogue completion
        localStorage.setItem('your_dialogue_completed', 'true');
    }

    static shouldAutoStart() {
        return !localStorage.getItem('your_dialogue_completed');
    }

    static restart() {
        localStorage.removeItem('your_dialogue_completed');
    }
}
```

### Interactive Guidance Messages

Messages can include interactive guidance properties:

```javascript
{
    text: "Click the Email icon to open the application.",
    typing: true,
    guidance: {
        highlight: '.desktop-icon[data-id="email"]',  // Element to highlight
        action: 'pulse',                               // Visual effect: 'highlight' or 'pulse'
        allowInteraction: '.desktop-icon[data-id="email"]' // Elements user can interact with
    }
}
```

### Guidance Properties

| Property | Type | Description |
|----------|------|-------------|
| `highlight` | string | CSS selector for element to highlight |
| `action` | string | Visual effect: `'highlight'` or `'pulse'` |
| `allowInteraction` | string/array | CSS selector(s) for elements that remain interactive |

## 🎭 Character System

### Available Characters

- `instructor` - Dr. Cipher (default teaching character)

### Character Assets

Characters require avatar images in `/static/images/avatars/`:
- `instructor` → `Cipher_Neutral_Talking.gif`

## 🔧 Implementation Examples

### Example: Desktop Guidance Dialogue

Here's a complete example of an interactive guidance dialogue (reference implementation):

```javascript
import { BaseDialogue } from './base-dialogue.js';

export class DesktopGuidanceDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "Welcome to Phalanx Cyber Academy! I'm Dr. Cipher, your instructor. Let me show you around the desktop environment.",
                typing: true
            },
            {
                text: "These are your desktop application icons. Each application serves a specific purpose in our cybersecurity training. Let's start with the Email Client!",
                typing: true,
                guidance: {
                    highlight: '.desktop-icon[data-id="email"]',
                    action: 'pulse'
                }
            },
            {
                text: "Double-click the Email Client icon to open it. This is where you'll practice identifying phishing attempts and suspicious emails.",
                typing: true,
                guidance: {
                    highlight: '.desktop-icon[data-id="email"]',
                    action: 'pulse',
                    allowInteraction: '.desktop-icon[data-id="email"]'
                }
            },
            {
                text: "Great! Notice the taskbar at the bottom - it shows your open applications and system status. The Start button allows you to exit the simulation safely.",
                typing: true,
                guidance: {
                    highlight: '#taskbar',
                    action: 'highlight'
                }
            },
            {
                text: "The Mission Control panel on the right provides hints and tracks your progress during missions. Use it whenever you need guidance!",
                typing: true,
                guidance: {
                    highlight: '#control-panel',
                    action: 'pulse'
                }
            },
            {
                text: "Perfect! You're now familiar with the desktop environment. Ready to begin your cybersecurity training mission?",
                typing: true
            }
        ];
    }

    onComplete() {
        console.log('Desktop guidance completed');
        
        // Mark as completed
        localStorage.setItem('cyberquest_desktop_guidance_completed', 'true');
        
        // Trigger next dialogue or mission briefing
        if (this.desktop.dialogueIntegration) {
            setTimeout(() => {
                this.desktop.dialogueIntegration.triggerDialogue('mission-briefing', 'instructor');
            }, 1000);
        }
    }

    static shouldAutoStart() {
        return !localStorage.getItem('cyberquest_desktop_guidance_completed');
    }

    static restart() {
        localStorage.removeItem('cyberquest_desktop_guidance_completed');
    }
}
```

### Registering Dialogues

1. **Add to DialogueManager** (`dialogue-manager.js`):

```javascript
async startYourDialogue(character = 'instructor') {
    return this.startDialogue('your-dialogue', 'YourDialogue', character);
}

async shouldAutoStartYourDialogue() {
    return this.shouldAutoStart('your-dialogue', 'YourDialogue');
}
```

2. **Add to DialogueIntegration** for auto-start:

```javascript
// In initializeDialogueFlow()
if (await this.dialogueManager.shouldAutoStartYourDialogue()) {
    await this.dialogueManager.startYourDialogue('instructor');
    return;
}
```

## 🎨 CSS Classes and Styling

The dialogue system includes built-in CSS classes:

### Dialogue Container Classes
- `.dialogue-appear` - Fade-in animation
- `.dialogue-typing` - Typing cursor animation

### Interactive Guidance Classes
- `.dialogue-highlight` - Element highlighting outline
- `.dialogue-pulse` - Pulsing animation
- `.dialogue-spotlight` - Background spotlight effect
- `.dialogue-interaction-blocker` - Blocks interactions
- `.dialogue-allowed-interaction` - Allows specific interactions

### Visual Effects

```css
/* Highlight effect with green outline */
.dialogue-highlight {
    outline: 3px solid #10b981 !important;
    outline-offset: 2px;
    position: relative;
    z-index: 52 !important;
    animation: dialogue-pulse 2s infinite;
}

/* Pulse animation */
@keyframes dialogue-pulse {
    0%, 100% { 
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
        transform: scale(1);
    }
    50% { 
        box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
        transform: scale(1.02);
    }
}
```

## 🔄 Migration from Tutorial System

The dialogue system replaces the previous tutorial system by providing:

### Before (Tutorial System):
- Separate tutorial files for each app
- Complex registry and step management
- Separate interaction management
- Disconnected from narrative flow

### After (Dialogue System):
- Unified narrative + guidance experience
- Character-driven instruction
- Integrated interaction management
- Seamless story-to-guidance transitions

### Migration Benefits:
- ✅ Reduced complexity (fewer files and systems)
- ✅ Better user experience (smooth narrative flow)
- ✅ Easier maintenance (one system to manage)
- ✅ Character integration (instructors provide guidance)
- ✅ Flexible guidance (any dialogue can include guidance)

## 🛠️ Development Guidelines

### Best Practices

1. **Keep messages focused** - One concept per message
2. **Use appropriate characters** - Match character to content
3. **Test guidance selectors** - Ensure highlighted elements exist
4. **Provide feedback** - Use visual effects to confirm actions
5. **Chain dialogues logically** - Use onComplete() to trigger next steps

### Common Patterns

```javascript
// Simple narrative message
{
    text: "Welcome to the system!",
    typing: true
}

// Highlight without interaction
{
    text: "Notice this important element.",
    guidance: {
        highlight: '.important-element',
        action: 'pulse'
    }
}

// Interactive guidance
{
    text: "Click this button to continue.",
    guidance: {
        highlight: '.action-button',
        action: 'pulse',
        allowInteraction: '.action-button'
    }
}

// Multiple interactive elements
{
    text: "You can click any of these options.",
    guidance: {
        highlight: '.option-group',
        action: 'highlight',
        allowInteraction: ['.option-1', '.option-2', '.option-3']
    }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Guidance not working**: Check that CSS selectors are valid and elements exist
2. **Interactions blocked**: Ensure `allowInteraction` includes necessary selectors
3. **Styling conflicts**: Check z-index values and CSS specificity
4. **Character not showing**: Verify avatar image paths and character names
5. **Auto-start not working**: Check localStorage keys and shouldAutoStart() logic

### Debug Tools

```javascript
// Check dialogue system status
console.log('Current dialogue:', window.currentDialogue);
console.log('Dialogue manager:', window.dialogueManager);
console.log('Dialogue integration:', window.dialogueIntegration);

// Check guidance state
const dialogue = window.currentDialogue;
console.log('Interactive mode:', dialogue?.isInteractiveMode);
console.log('Highlighted element:', dialogue?.highlightedElement);
console.log('Allowed interactions:', dialogue?.allowedInteractions);
```

## 📚 API Reference

### BaseDialogue Methods

| Method | Description |
|--------|-------------|
| `start()` | Initialize and start the dialogue |
| `cleanup()` | Clean up dialogue and guidance elements |
| `nextMessage()` | Advance to next message |
| `previousMessage()` | Go to previous message |
| `complete()` | Complete the dialogue |
| `highlightElement(selector, action)` | Highlight an element with visual effects |
| `allowInteractionWith(selector)` | Allow interaction with specific elements |
| `enableInteractiveMode()` | Enable interaction blocking |
| `disableInteractiveMode()` | Disable interaction blocking |

### DialogueManager Methods

| Method | Description |
|--------|-------------|
| `startDialogue(name, class, character)` | Start a specific dialogue |
| `startDialogueByName(name, character)` | Start dialogue by registered name |
| `getCharacterAvatar(character)` | Get avatar URL for character |
| `getCharacterName(character)` | Get display name for character |

### DialogueIntegration Methods

| Method | Description |
|--------|-------------|
| `initializeDialogueFlow()` | Start the dialogue flow on desktop load |
| `triggerDialogue(name, character)` | Manually trigger a dialogue |
| `restartDialogues()` | Reset all dialogue completion flags |

---

*For more information about the Phalanx Cyber Academy project, see the main project documentation.*