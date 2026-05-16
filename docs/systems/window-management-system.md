# Window Management System

## Overview

The Window Management System provides a comprehensive windowing environment for the Phalanx Cyber Academy simulated desktop. It handles window creation, positioning, resizing, snapping, z-index management, and user interaction with windows through mouse, keyboard, and touch interfaces.

## Architecture

### Core Components

#### 1. **WindowManager** (`window-manager.js`)
The central coordinator for all window operations and lifecycle management.

**Key Responsibilities:**
- Window creation and destruction
- Window focus and z-index management
- Application integration via ApplicationLauncher
- Keyboard shortcut handling
- Touch gesture support for mobile
- Window switching and cycling

**Initialization:**
```javascript
constructor(container, taskbar) {
    this.container = container;
    this.taskbar = taskbar;
    this.windows = new Map();           // Track all windows by ID
    this.applications = new Map();       // Track application instances
    this.zIndex = 1000;                 // Starting z-index
    this.snapManager = new WindowSnapManager(container);
    this.resizeManager = new WindowResizeManager(this);
    this.applicationLauncher = initializeApplicationLauncher(this);
}
```

#### 2. **WindowBase** (`window-base.js`)
Abstract base class that all applications extend to create windows.

**Key Features:**
- Standardized window structure
- Icon management for taskbar
- Activity emission for analytics
- State management (save/restore)
- Content updating capabilities

**Required Methods:**
```javascript
class YourApp extends WindowBase {
    createContent() {
        // Must implement: return HTML string for window content
        return '<div>Your app content here</div>';
    }
    
    initialize() {
        // Optional: Called after window creation
    }
    
    cleanup() {
        // Optional: Called when window is closed
    }
}
```

#### 3. **WindowSnapManager** (`window-snap-manager.js`)
Handles window snapping to screen edges and corners with visual previews.

**Snap Zones:**
- **Left/Right**: Snap to left or right half of screen
- **Top/Bottom**: Snap to top or bottom half
- **Corners**: Snap to quadrants (top-left, top-right, bottom-left, bottom-right)
- **Maximize**: Snap to full screen (top edge)

**Snap Detection:**
- Corner threshold: 30px (easier corner access)
- Edge threshold: 20px
- Visual preview with blue overlay
- Taskbar-aware positioning

#### 4. **WindowResizeManager** (`window-resize-manager.js`)
Provides window resizing functionality with 8-directional support.

**Resize Directions:**
- N, S, E, W (cardinal directions)
- NW, NE, SW, SE (corner directions)

**Features:**
- Minimum size constraints (300x200 default)
- Cursor management during resize
- State reset on resize (maximize/snap)
- Global event handling

## Window Lifecycle

### Creation Flow
```
User Request
    ↓
ApplicationLauncher.openApplication()
    ↓
ApplicationRegistry.createAppInstance()
    ↓
WindowManager.createWindow()
    ↓
WindowBase.createWindow()
    ↓
WindowManager.bindWindowEvents()
    ↓
Taskbar.addWindow()
    ↓
WindowManager.switchToWindow()
    ↓
Application.initialize()
```

### Window States
1. **Created**: Window element exists in DOM
2. **Active**: Window is visible and focused
3. **Hidden**: Window exists but display: none
4. **Maximized**: Window fills available space
5. **Snapped**: Window snapped to edge/corner
6. **Closed**: Window removed from DOM

### Focus Management
```javascript
// Bring window to front on interaction
window.addEventListener('mousedown', () => {
    window.style.zIndex = ++this.zIndex;
    this.taskbar.setActiveWindow(id);
});
```

## Window Switching

### Keyboard Shortcuts
- **Alt+Tab**: Cycle through windows forward
- **Alt+Shift+Tab**: Cycle through windows backward
- **Alt+1-9**: Switch to specific window by position

### Touch Gestures
- **Swipe Left**: Next window
- **Swipe Right**: Previous window
- **Tap**: Focus window

### Taskbar Integration
```javascript
// Taskbar clicks trigger window switching
taskbar.onWindowClick(id) {
    windowManager.switchToWindow(id);
}
```

## Window Snapping

### Snap Detection Algorithm
```javascript
getSnapZone(mouseX, mouseY) {
    const relativeX = mouseX - containerRect.left;
    const relativeY = mouseY - containerRect.top;
    
    // Check corners first (priority)
    if (nearLeftCorner && nearTopCorner) return 'topLeft';
    if (nearRightCorner && nearTopCorner) return 'topRight';
    // ... other corners
    
    // Then check edges
    if (nearLeft) return 'left';
    if (nearRight) return 'right';
    if (nearTop) return 'maximize';
    if (nearBottom) return 'bottom';
    
    return null; // No snap zone
}
```

### Snap Preview
- Visual blue overlay shows snap target
- Smooth opacity transitions
- Real-time position updates
- Taskbar-aware calculations

### Snap Application
```javascript
snapWindow(windowElement, snapZone, windowApp) {
    // Store original dimensions
    windowApp.storeOriginalDimensions();
    
    // Apply snap position and size
    windowElement.style.left = zone.x;
    windowElement.style.top = zone.y;
    windowElement.style.width = zone.width;
    windowElement.style.height = zone.height;
    
    // Mark as snapped
    windowElement.dataset.snapped = snapZone;
}
```

## Window Resizing

### Resize Handle Setup
```javascript
// 8 resize handles around window
const handles = [
    'resize-n', 'resize-s', 'resize-e', 'resize-w',
    'resize-nw', 'resize-ne', 'resize-sw', 'resize-se'
];

handles.forEach(direction => {
    const handle = document.createElement('div');
    handle.className = `resize-handle ${direction}`;
    window.appendChild(handle);
});
```

### Resize Logic
```javascript
handleResizeMove(e) {
    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;
    
    switch (this.resizeDirection) {
        case 'resize-n':
            newHeight = Math.max(minHeight, startHeight - deltaY);
            newTop = startTop + (startHeight - newHeight);
            break;
        case 'resize-se':
            newWidth = Math.max(minWidth, startWidth + deltaX);
            newHeight = Math.max(minHeight, startHeight + deltaY);
            break;
        // ... other directions
    }
    
    // Apply new dimensions
    this.currentWindow.style.width = `${newWidth}px`;
    this.currentWindow.style.height = `${newHeight}px`;
}
```

### Minimum Size Constraints
- Default minimum: 300px width, 200px height
- Configurable via `setMinimumSize(width, height)`
- Enforced during resize operations

## Application Integration

### Window Creation via Applications
```javascript
class BrowserApp extends WindowBase {
    constructor() {
        super('browser', 'Web Browser', {
            width: '80%',
            height: '70%'
        });
    }
    
    createContent() {
        return `
            <div class="browser-toolbar">
                <input type="text" class="url-bar" placeholder="Enter URL">
            </div>
            <div class="browser-content">
                <!-- Browser content here -->
            </div>
        `;
    }
}
```

### Application Lifecycle
```javascript
// WindowManager handles application lifecycle
createWindow(id, title, app, options) {
    // Create window element
    const windowElement = app.createWindow();
    
    // Store application instance
    this.applications.set(id, app);
    
    // Add to taskbar
    this.taskbar.addWindow(id, title, app.getIconClass());
    
    // Initialize application
    if (typeof app.initialize === 'function') {
        app.initialize();
    }
    
    return windowElement;
}
```

### Activity Emission
Applications can emit activity events for analytics:
```javascript
class YourApp extends WindowBase {
    constructor() {
        super('your-app', 'Your App');
        this.setupActivityEmission(YourAppActivityEmitter);
    }
    
    someUserAction() {
        this.emitUserAction('button_click', {
            button: 'submit',
            timestamp: Date.now()
        });
    }
}
```

## Z-Index Management

### Focus-Based Z-Index
```javascript
// Increment z-index on each focus
this.zIndex = 1000;

activateWindow(window) {
    window.style.zIndex = ++this.zIndex;
    this.taskbar.setActiveWindow(window.id);
}
```

### Z-Index Strategy
- Base z-index: 1000
- Each focus increments by 1
- No upper limit (handles long sessions)
- Taskbar always above windows (z-index: 2000)

## State Management

### Window State
```javascript
getState() {
    return {
        id: this.id,
        title: this.title,
        width: this.windowElement.style.width,
        height: this.windowElement.style.height,
        left: this.windowElement.style.left,
        top: this.windowElement.style.top,
        zIndex: this.windowElement.style.zIndex
    };
}
```

### State Persistence
- Original dimensions stored before snap/maximize
- Snap state tracked in dataset
- Maximize state tracked in dataset
- Restore capability for unsnapping

## Mobile Support

### Touch Event Handling
```javascript
setupTouchGestures() {
    let startX = 0;
    let startY = 0;
    
    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Detect horizontal swipe
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                this.cycleWindows(); // Next
            } else {
                this.cycleWindowsReverse(); // Previous
            }
        }
    }, { passive: true });
}
```

### Responsive Design
- Full-screen windows on mobile
- Touch-friendly resize handles
- Swipe gestures for window switching
- Optimized touch targets

## Performance Optimizations

### 1. **Window Visibility Toggling**
```javascript
// Instead of creating/destroying windows
switchToWindow(id) {
    this.windows.forEach((window, windowId) => {
        if (windowId !== id) {
            window.style.display = 'none'; // Hide
        }
    });
    
    const activeWindow = this.windows.get(id);
    activeWindow.style.display = 'block'; // Show
}
```

### 2. **Event Delegation**
- Global mousemove/mouseup for resize
- Single event listener for all windows
- Efficient touch gesture handling

### 3. **CSS Hardware Acceleration**
- Transform-based animations
- GPU-accelerated snap previews
- Optimized repaints

## Configuration Options

### Window Defaults
```javascript
const defaultOptions = {
    width: '60%',
    height: '50%',
    minWidth: 300,
    minHeight: 200,
    resizable: true,
    maximizable: true,
    closable: true
};
```

### Snap Configuration
```javascript
const snapConfig = {
    threshold: 20,           // Edge detection threshold
    cornerThreshold: 30,    // Corner detection threshold
    enabled: true,           // Enable/disable snapping
    previewEnabled: true    // Show snap preview
};
```

### Resize Configuration
```javascript
const resizeConfig = {
    minWidth: 300,
    minHeight: 200,
    enabled: true,
    eightDirectional: true   // Enable 8-direction resize
};
```

## Integration Points

### Taskbar Integration
```javascript
// WindowManager creates windows and adds to taskbar
this.taskbar.addWindow(id, title, iconClass);

// Taskbar notifies WindowManager of clicks
this.taskbar.onWindowClick = (id) => {
    this.switchToWindow(id);
};
```

### Application Launcher Integration
```javascript
// WindowManager delegates app launching to ApplicationLauncher
async openBrowser() {
    return await this.applicationLauncher.openApplication('browser', 'Web Browser');
}
```

### Desktop Integration
```javascript
// Desktop initializes WindowManager
this.windowManager = new WindowManager(this.desktopElement, this.taskbar);

// Desktop coordinates window operations
this.windowManager.createWindow(appId, title, app);
```

## Error Handling

### Window Creation Failures
```javascript
createWindow(id, title, contentOrApp, options = {}) {
    if (this.windows.has(id)) {
        // Return existing window instead of error
        const existingWindow = this.windows.get(id);
        existingWindow.style.zIndex = ++this.zIndex;
        return existingWindow;
    }
    
    // Validate application
    if (!contentOrApp || typeof contentOrApp.createWindow !== 'function') {
        throw new Error('Invalid application: must implement createWindow()');
    }
    
    // ... creation logic
}
```

### Resize Safety
```javascript
handleResizeMove(e) {
    if (!this.isResizing || !this.currentWindow) return;
    
    // Enforce minimum sizes
    newWidth = Math.max(this.minWidth, newWidth);
    newHeight = Math.max(this.minHeight, newHeight);
    
    // ... apply dimensions
}
```

### Snap Safety
```javascript
snapWindow(windowElement, snapZone, windowApp) {
    if (!snapZone || !this.snapZones[snapZone] || !windowElement) {
        return false; // Fail gracefully
    }
    
    // ... snap logic
}
```

## Best Practices

### 1. **Always Extend WindowBase**
```javascript
// ✅ Good
class YourApp extends WindowBase {
    createContent() { /* ... */ }
}

// ❌ Bad - Don't create windows directly
const window = document.createElement('div');
```

### 2. **Implement Activity Emission**
```javascript
class YourApp extends WindowBase {
    constructor() {
        super('your-app', 'Your App');
        this.setupActivityEmission(YourAppActivityEmitter);
    }
}
```

### 3. **Handle Cleanup**
```javascript
class YourApp extends WindowBase {
    cleanup() {
        // Clean up event listeners
        // Clear intervals/timeouts
        // Remove temporary DOM elements
        super.cleanup(); // Call parent cleanup
    }
}
```

### 4. **Use Window Manager for Operations**
```javascript
// ✅ Good
await windowManager.openApplication('browser');

// ❌ Bad - Don't bypass window manager
const app = new BrowserApp();
const window = app.createWindow();
```

## Troubleshooting

### Common Issues

**Windows not appearing:**
- Check if window ID already exists
- Verify application implements createWindow()
- Check console for JavaScript errors
- Ensure container element exists

**Resize not working:**
- Verify resize handles are present in DOM
- Check if resize manager is initialized
- Ensure minimum size constraints aren't blocking
- Check for CSS conflicts

**Snap not triggering:**
- Verify snap manager is initialized
- Check snap threshold configuration
- Ensure mouse coordinates are correct
- Verify container bounds calculation

**Z-index issues:**
- Check if z-index is being incremented
- Verify taskbar z-index is higher
- Look for CSS z-index overrides
- Check for nested z-index contexts

**Mobile gestures not working:**
- Verify touch event listeners are attached
- Check passive: true is set for touchstart
- Ensure swipe threshold is appropriate
- Test on actual mobile device

### Debug Mode
Enable detailed logging:
```javascript
console.log('[WindowManager] Creating window:', id);
console.log('[WindowManager] Current windows:', Array.from(this.windows.keys()));
console.log('[WindowManager] Z-index:', this.zIndex);
```

## Future Enhancements

### Planned Improvements
1. **Multi-monitor support** - Extended desktop across displays
2. **Window tabs** - Tabbed interface within windows
3. **Window grouping** - Group related windows together
4. **Virtual desktops** - Multiple desktop workspaces
5. **Window tiling** - Automatic tiling layouts

### Scalability Considerations
- Support for 50+ concurrent windows
- Improved memory management
- Enhanced GPU acceleration
- Better mobile performance

## Related Documentation

- [Simulated PC System](./simulated-pc-system.md)
- [Application Registry System](./application-registry-system.md)
- [Taskbar System](./taskbar-system.md)
- [Desktop Components System](./desktop-components-system.md)

## Files and Locations

**Core Window Management:**
- `app/static/js/simulated-pc/desktop-components/window-manager.js` - Main window manager
- `app/static/js/simulated-pc/desktop-components/window-base.js` - Base window class
- `app/static/js/simulated-pc/desktop-components/window-snap-manager.js` - Snap functionality
- `app/static/js/simulated-pc/desktop-components/window-resize-manager.js` - Resize functionality

**Styling:**
- `app/static/css/simulated-pc/windows.css` - Window styles and scrollbar styling

**Integration:**
- `app/static/js/simulated-pc/desktop-components/taskbar.js` - Taskbar integration
- `app/static/js/simulated-pc/desktop-components/application-launcher.js` - App launching
