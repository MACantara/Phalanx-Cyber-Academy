# Boot Sequence System

## Overview

The Boot Sequence System provides an authentic system startup experience for the Phalanx Cyber Academy training environment. It displays realistic boot messages, system initialization progress, and service loading to create an immersive cybersecurity training simulation.

## Architecture

### Core Components

#### 1. **BootSequence** (`boot-sequence.js`)
The main boot sequence class that manages the system startup simulation.

**Key Responsibilities:**
- Boot message display and timing
- System initialization simulation
- Service loading visualization
- Status indicator management
- Boot completion handling
- User interaction prevention

**Boot Flow:**
```
Boot Start → System Info → Security Services → Training Environment → Complete
```

## Boot Messages

### Boot Line Structure
```javascript
{
    text: 'Initializing secure training environment',
    type: 'info',
    delay: 50,
    hasStatus: true,
    status: '[  OK  ]',
    bundle: 'security'
}
```

### Message Types
- **info**: General information messages (green)
- **success**: Successful operations (green)
- **warning**: Warnings and cautions (yellow)
- **error**: Error messages (red)

### Status Indicators
- **[ OK ]**: Successful completion
- **[ WARN ]**: Warning during operation
- **[ FAIL ]**: Operation failed

## Boot Phases

### Phase 1: System Information
```javascript
[
    { text: 'Phalanx Cyber Academy Security Training Environment v2.1.0', type: 'info', delay: 30 },
    { text: 'Copyright (c) 2025 Phalanx Cyber Academy Training Systems', type: 'info', delay: 30 },
    { text: '', type: 'info', delay: 10 }
]
```

### Phase 2: Kernel Loading
```javascript
[
    { text: 'Initializing secure training environment', type: 'info', delay: 50, hasStatus: true, status: '[  OK  ]' },
    { text: 'Loading kernel modules and core services', type: 'info', delay: 60, hasStatus: true, status: '[  OK  ]' },
    { text: '', type: 'info', delay: 10 }
]
```

### Phase 3: Security Services
```javascript
[
    { text: 'Starting security services', type: 'success', delay: 40, hasStatus: true, status: '[  OK  ]', bundle: 'security' },
    { text: 'Loading Network Manager', type: 'success', delay: 20, bundle: 'security' },
    { text: 'Loading Firewall Protection', type: 'success', delay: 20, bundle: 'security' },
    { text: 'Loading Intrusion Detection System', type: 'success', delay: 20, bundle: 'security' },
    { text: 'Loading Security Monitor Service', type: 'success', delay: 20, bundle: 'security' }
]
```

### Phase 4: Training Environment
```javascript
[
    { text: 'Preparing training environment', type: 'info', delay: 40, hasStatus: true, status: [  OK  ], bundle: 'training' },
    { text: 'Loading scenario data', type: 'info', delay: 20, bundle: 'training' },
    { text: 'Preparing virtual environment', type: 'info', delay: 20, bundle: 'training' },
    { text: 'Finalizing training setup', type: 'success', delay: 30, bundle: 'training' }
]
```

### Phase 5: Completion
```javascript
[
    { text: 'Welcome to the Phalanx Cyber Academy Training Lab', type: 'success', delay: 50 },
    { text: 'Type "help" for available commands', type: 'info', delay: 30 },
    { text: '', type: 'info', delay: 100 }
]
```

## Boot Display

### Container Setup
```javascript
setupContainer() {
    this.container.className = 'fixed inset-0 bg-black text-green-400 font-mono text-xs sm:text-sm leading-relaxed p-2 sm:p-4 md:p-6 lg:p-10 overflow-y-auto flex flex-col justify-start items-start';
    this.container.style.overflowY = 'auto';
    this.container.style.height = '100vh';
}
```

### Line Display
```javascript
displayNextLine(onComplete) {
    if (this.currentLine >= this.bootLines.length) {
        // Add blinking cursor
        const cursor = document.createElement('span');
        cursor.className = 'boot-cursor';
        this.container.appendChild(cursor);
        
        setTimeout(() => {
            onComplete();
        }, 200);
        return;
    }
    
    const line = this.bootLines[this.currentLine];
    const lineElement = document.createElement('line');
    lineElement.className = `boot-line ${getTypeClasses(line.type)}`;
    
    this.container.appendChild(lineElement);
    this.scrollToBottom();
    
    // Display line with appropriate timing
    if (line.hasStatus) {
        this.showQuickStatus(lineElement, line, () => {
            this.currentLine++;
            setTimeout(() => {
                this.displayNextLine(onComplete);
            }, line.delay);
        });
    } else {
        lineElement.textContent = line.text;
        this.currentLine++;
        setTimeout(() => {
            this.displayNextLine(onComplete);
        }, line.delay);
    }
}
```

### Status Display
```javascript
showQuickStatus(element, line, onComplete) {
    const dotsElement = document.createElement('span');
    dotsElement.className = 'loading-dots ml-2 text-green-400';
    element.appendChild(dotsElement);
    
    // Show loading dots briefly
    let dotCount = 0;
    const maxDots = 2;
    const dotInterval = 30;
    
    const addDot = () => {
        if (dotCount < maxDots) {
            dotsElement.textContent += '.';
            dotCount++;
            setTimeout(addDot, dotInterval);
        } else {
            // Replace with status
            setTimeout(() => {
                dotsElement.remove();
                
                const statusElement = document.createElement('span');
                statusElement.className = 'ml-4 font-bold';
                
                if (line.status === '[ WARN ]') {
                    statusElement.className += ' text-yellow-400';
                } else {
                    statusElement.className += ' text-green-400';
                }
                
                statusElement.textContent = line.status;
                element.appendChild(statusElement);
                
                onComplete();
            }, 40);
        }
    };
    
    setTimeout(addDot, 20);
}
```

## Boot Timing

### Delay Configuration
```javascript
const bootLines = [
    { text: 'System info', type: 'info', delay: 30 },      // 30ms delay
    { text: 'Kernel loading', type: 'info', delay: 60 },    // 60ms delay
    { text: 'Services start', type: 'success', delay: 40 }   // 40ms delay
];
```

### Timing Strategy
- **System info**: Fast display (30-60ms)
- **Kernel loading**: Moderate delay (50-70ms)
- **Services**: Individual service loading (20-30ms)
- **Completion**: Final welcome message (50-100ms)

### Total Boot Time
- **Minimum**: ~3-4 seconds
- **Maximum**: ~5-6 seconds
- **Average**: ~4-5 seconds

## Visual Effects

### Typing Cursor
```javascript
const cursor = document.createElement('span');
cursor.className = 'inline-block w-2 h-3.5 bg-green-400 boot-cursor';
this.container.appendChild(cursor);
```

### CSS Classes
```css
.boot-line {
    margin-bottom: 0.5;
    white-space: pre-wrap;
}

.boot-cursor {
    animation: blink 1s infinite;
}

@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}
```

### Color Coding
```javascript
const typeClasses = {
    'success': 'text-green-400',
    'warning': 'text-yellow-400',
    'error': 'text-red-400',
    'info': 'text-green-400'
};
```

## Boot Customization

### Custom Boot Messages
```javascript
this.bootLines = [
    { text: 'Custom boot message', type: 'info', delay: 50 },
    { text: 'Another custom message', type: 'success', delay: 30 }
];
```

### Custom Status Indicators
```javascript
{ 
    text: 'Loading service', 
    type: 'info', 
    delay: 50, 
    hasStatus: true, 
    status: '[ CUSTOM ]' 
}
```

### Custom Bundles
```javascript
{ 
    text: 'Loading service', 
    type: 'success', 
    delay: 20, 
    bundle: 'custom-bundle' 
}
```

## Responsive Design

### Mobile Optimization
```javascript
setupContainer() {
    this.container.className = 'fixed inset-0 bg-black text-green-400 font-mono text-xs sm:text-sm leading-relaxed p-2 sm:p-4 md:p-6 lg:p-10 overflow-y-auto flex flex-col justify-start items-start';
}
```

### Font Sizing
- **Mobile**: `text-xs` (12px)
- **Tablet**: `text-sm` (14px)
- **Desktop**: `text-sm` (14px)
- **Large Desktop**: `text-sm` (14px)

### Padding
- **Mobile**: `p-2` (8px)
- **Tablet**: `p-4` (16px)
- **Desktop**: `p-6` (24px)
- **Large Desktop**: `p-10` (40px)

## Auto-Scroll

### Scroll Management
```javascript
scrollToBottom() {
    this.container.scrollTo({
        top: this.container.scrollHeight,
        behavior: 'smooth'
    });
}
```

### Scroll Behavior
- **Smooth scrolling**: Enabled
- **Auto-scroll**: Automatic on each line
- **User interaction**: Scrollable during boot
- **Completion**: Final scroll to show cursor

## Boot Control

### Boot Start
```javascript
async start() {
    return new Promise((resolve) => {
        this.container.innerHTML = '';
        this.displayNextLine(resolve);
    });
}
```

### Boot Reset
```javascript
reset() {
    this.currentLine = 0;
    this.container.innerHTML = '';
    this.bootLines = this.getDefaultBootLines();
}
```

### Boot Skip
```javascript
skip() {
    this.currentLine = this.bootLines.length;
    this.displayNextLine(() => {
        // Boot completion callback
    });
}
```

## Error Handling

### Display Errors
```javascript
try {
    await this.start();
} catch (error) {
    console.error('Boot sequence failed:', error);
    this.showErrorState();
}
```

### Error State Display
```javascript
showErrorState() {
    this.container.innerHTML = `
        <div class="text-red-400">
            Boot sequence failed. Please refresh the page.
        </div>
    `;
}
```

### Fallback Boot
```javascript
try {
    await this.loadCustomBootSequence();
} catch (error) {
    console.warn('Custom boot failed, using default:', error);
    this.bootLines = this.getDefaultBootLines();
}
```

## Performance Optimizations

### 1. **Efficient DOM Updates**
```javascript
// Batch DOM updates where possible
const fragment = document.createDocumentFragment();
lines.forEach(line => fragment.appendChild(line));
this.container.appendChild(fragment);
```

### 2. **Optimized Timing**
```javascript
// Use minimal delays for SSD-like speed
const dotInterval = 30;  // Very fast dots
const statusDelay = 40;   // Minimal status delay
```

### 3. **CSS Animations**
```javascript
// Use CSS animations instead of JS animations
.boot-cursor {
    animation: blink 1s infinite;
}
```

## Configuration Options

### Boot Settings
```javascript
const bootConfig = {
    enableTypingEffect: true,
    enableStatusIndicators: true,
    enableAutoScroll: true,
    showCursor: true,
    enableColorCoding: true
};
```

### Timing Settings
```javascript
const timingConfig = {
    baseDelay: 30,
    statusDelay: 40,
    dotInterval: 30,
    maxDots: 2,
    scrollBehavior: 'smooth'
};
```

### Display Settings
```javascript
const displayConfig = {
    fontColor: '#4ade80',
    backgroundColor: '#000000',
    fontFamily: 'monospace',
    fontSize: '14px',
    lineHeight: '1.6'
};
```

## Best Practices

### 1. **Use Appropriate Delays**
```javascript
// ✅ Good - Realistic SSD-like speed
const delay = 30;  // Fast but visible

// ❌ Bad - Too slow for modern systems
const delay = 1000;  // Feels outdated
```

### 2. **Handle Boot Completion**
```javascript
// ✅ Good - Always call completion callback
this.displayNextLine(() => {
    onComplete();  // Boot complete
});

// ❌ Bad - No completion callback
this.displayNextLine();  // No completion signal
```

### 3. **Scroll to Bottom**
```javascript
// ✅ Good - Keep latest content visible
this.scrollToBottom();

// ❌ Bad - Don't let content go off-screen
// No scrolling - content may be hidden
```

### 4. **Use CSS for Animations**
```javascript
// ✅ Good - CSS animations are performant
.boot-cursor {
    animation: blink 1s infinite;
}

// ❌ Bad - JS animations are less performant
setInterval(() => {
    cursor.style.opacity = cursor.style.opacity === '1' ? '0' : '1';
}, 500);
```

## Troubleshooting

### Common Issues

**Boot sequence not starting:**
- Verify container element exists
- Check boot lines array is populated
- Ensure start() method is called
- Review console for JavaScript errors

**Boot messages not displaying:**
- Verify CSS classes are applied
- Check text color is visible
- Ensure container has proper styling
- Review display logic

**Status indicators not showing:**
- Verify hasStatus flag is set
- Check status element creation
- Ensure timing logic works
- Review status display logic

**Auto-scroll not working:**
- Verify scrollToBottom is called
- Check container overflow settings
- Ensure scroll behavior is supported
- Review scroll implementation

**Cursor not blinking:**
- Verify cursor element is created
- Check CSS animation is applied
- Ensure animation is not disabled
- Review cursor styling

### Debug Mode
Enable detailed logging:
```javascript
console.log('[BootSequence] Current line:', this.currentLine);
console.log('[BootSequence] Boot lines:', this.bootLines);
console.log('[BootSequence] Container:', this.container);
console.log('[BootSequence] Initialized:', this.initialized);
```

## Future Enhancements

### Planned Improvements
1. **Boot customization** - User-configurable boot messages
2. **Boot themes** - Different boot styles (hacker mode, corporate mode)
3. **Boot sounds** - Authentic boot sound effects
4. **Boot variations** - Different boot sequences per level
5. **Boot errors** - Simulated boot failures and recovery

### Scalability Considerations
- Support for longer boot sequences
- Improved performance with many boot lines
- Enhanced customization options
- Better mobile experience

## Related Documentation

- [Simulated PC System](./simulated-pc-system.md)
- [Desktop Components System](./desktop-components-system.md)

## Files and Locations

**Core Boot Sequence:**
- `app/static/js/simulated-pc/boot-sequence.js` - Boot sequence implementation

**Integration:**
- `app/static/js/simulated-pc/desktop.js` - Desktop integration
