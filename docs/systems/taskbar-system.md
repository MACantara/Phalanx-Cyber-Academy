# Taskbar System

## Overview

The Taskbar System provides a desktop taskbar interface for the simulated PC environment. It manages window switching, system time display, and simulation exit functionality across all cybersecurity training levels.

## Architecture

### Core Components

#### 1. **Taskbar** (`taskbar.js`)
The main taskbar class that manages the desktop taskbar interface.

**Key Responsibilities:**
- Taskbar UI creation and rendering
- Window taskbar item management
- Active window state tracking
- System clock functionality
- Simulation exit handling
- Mobile touch optimization

**UI Structure:**
```javascript
createTaskbar() {
    return `
        <div class="taskbar">
            <button id="start-btn">
                <i class="bi bi-grid-3x3-gap"></i>
                <span>Start</span>
            </button>
            <div id="taskbar-items">
                <!-- Window taskbar items -->
            </div>
            <div id="system-clock">
                <!-- System time and date -->
            </div>
        </div>
    `;
}
```

## Window Management

### Adding Windows to Taskbar
```javascript
addWindow(id, title, iconClass) {
    const taskbarItems = this.taskbarElement.querySelector('#taskbar-items');
    const taskbarItem = document.createElement('button');
    taskbarItem.className = 'taskbar-item';
    taskbarItem.dataset.windowId = id;
    taskbarItem.innerHTML = `
        <i class="bi ${iconClass}"></i>
        <span>${title}</span>
    `;
    
    taskbarItem.addEventListener('click', () => {
        this.windowManager.toggleWindow(id);
    });
    
    taskbarItems.appendChild(taskbarItem);
    this.setActiveWindow(id);
    
    return taskbarItem;
}
```

### Removing Windows from Taskbar
```javascript
removeWindow(id) {
    const taskbarItem = this.taskbarElement.querySelector(`[data-window-id="${id}"]`);
    if (taskbarItem) {
        taskbarItem.remove();
    }
    
    if (this.activeWindowId === id) {
        this.activeWindowId = null;
    }
}
```

### Active Window Tracking
```javascript
setActiveWindow(id) {
    // Clear previous active state
    if (this.activeWindowId) {
        this.setWindowActive(this.activeWindowId, false);
    }
    
    // Set new active state
    this.activeWindowId = id;
    this.setWindowActive(id, true);
}
```

### Window Active State
```javascript
setWindowActive(id, active) {
    const taskbarItem = this.taskbarElement.querySelector(`[data-window-id="${id}"]`);
    if (taskbarItem) {
        if (active) {
            taskbarItem.classList.add('bg-green-400', 'text-black');
            taskbarItem.classList.remove('bg-gray-700', 'text-white');
        } else {
            taskbarItem.classList.remove('bg-green-400', 'text-black');
            taskbarItem.classList.add('bg-gray-700', 'text-white');
        }
    }
}
```

## System Clock

### Clock Functionality
```javascript
startClock() {
    const updateClock = () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        const dateString = now.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        const clockElement = this.taskbarElement.querySelector('#system-clock');
        if (clockElement) {
            clockElement.innerHTML = `${timeString}<br>${dateString}`;
        }
    };
    
    updateClock();
    setInterval(updateClock, 1000);
}
```

### Time Format
- **Format**: HH:MM AM/PM
- **Date Format**: DD/MM/YYYY
- **Update Frequency**: Every second
- **Locale**: en-GB (UK format)

## Start Button

### Exit Simulation
```javascript
exitSimulation() {
    window.dispatchEvent(new CustomEvent('exitSimulation'));
}
```

### Start Button Behavior
- Triggers simulation exit
- Closes all applications
- Returns to main menu
- Saves current progress

## Mobile Support

### Touch Optimization
```javascript
// Touch event for mobile interaction
taskbarItem.addEventListener('touchstart', (e) => {
    e.preventDefault();
    this.windowManager.toggleWindow(id);
});
```

### Responsive Design
- Icon-only display on small screens
- Icon + text display on larger screens
- Touch-friendly button sizes
- Adaptive spacing and sizing

### Mobile Layout
```javascript
// Show icon only on small screens
taskbarItem.innerHTML = `
    <i class="bi ${iconClass}"></i>
    <span class="ml-1 hidden sm:inline truncate max-w-24">${title}</span>
`;
```

## Integration Points

### WindowManager Integration
```javascript
constructor(container, windowManager) {
    this.container = container;
    this.windowManager = windowManager;
    this.activeWindowId = null;
}

// Window manager calls taskbar methods
this.windowManager.taskbar.addWindow(id, title, iconClass);
this.windowManager.taskbar.setActiveWindow(id);
```

### Desktop Integration
```javascript
// Desktop creates taskbar
this.taskbar = new Taskbar(this.desktopElement, null);

// Desktop sets window manager
this.taskbar.windowManager = this.windowManager;
```

### Event System
```javascript
// Exit simulation event
window.dispatchEvent(new CustomEvent('exitSimulation'));

// Listen for exit event
window.addEventListener('exitSimulation', () => {
    // Handle simulation exit
});
```

## Performance Optimizations

### 1. **Efficient DOM Updates**
```javascript
// Only update clock element
const clockElement = this.taskbarElement.querySelector('#system-clock');
if (clockElement) {
    clockElement.innerHTML = `${timeString}<br>${dateString}`;
}
```

### 2. **Event Delegation**
```javascript
// Single event listener for all taskbar items
taskbarItems.addEventListener('click', (e) => {
    const taskbarItem = e.target.closest('[data-window-id]');
    if (taskbarItem) {
        this.windowManager.toggleWindow(taskbarItem.dataset.windowId);
    }
});
```

### 3. **CSS Transitions**
```javascript
// Use CSS transitions for smooth state changes
taskbarItem.classList.add('transition-colors', 'duration-200');
```

## Error Handling

### Window Management Errors
```javascript
try {
    this.windowManager.toggleWindow(id);
} catch (error) {
    console.error('Failed to toggle window:', error);
    // Keep taskbar functional even if window manager fails
}
```

### Clock Errors
```javascript
try {
    updateClock();
} catch (error) {
    console.error('Clock update failed:', error);
    // Continue with previous time if update fails
}
```

### DOM Errors
```javascript
const taskbarItem = this.taskbarElement.querySelector(`[data-window-id="${id}"]`);
if (taskbarItem) {
    taskbarItem.remove();
} else {
    console.warn(`Taskbar item not found for window ${id}`);
}
```

## Configuration Options

### Taskbar Settings
```javascript
const taskbarConfig = {
    enableClock: true,
    enableStartButton: true,
    enableWindowSwitching: true,
    clockUpdateInterval: 1000,
    maxTaskbarItems: 10
};
```

### Display Settings
```javascript
const displayConfig = {
    showIconsOnly: false,
    maxTitleLength: 24,
    enableResponsiveDesign: true,
    enableTouchOptimization: true
};
```

### Behavior Settings
```javascript
const behaviorConfig = {
    autoActivateNewWindows: true,
    enableExitConfirmation: false,
    enableWindowPreview: false,
    enableTaskbarGrouping: false
};
```

## Best Practices

### 1. **Always Update Active State**
```javascript
// ✅ Good
this.setActiveWindow(id);

// ❌ Bad - Don't skip active state update
this.addWindow(id, title, icon);  // No active state set
```

### 2. **Clean Up Window References**
```javascript
// ✅ Good
this.removeWindow(id);
if (this.activeWindowId === id) {
    this.activeWindowId = null;
}

// ❌ Bad - Don't leave stale references
this.removeWindow(id);  // May leave activeWindowId pointing to removed window
```

### 3. **Handle Mobile Touch Events**
```javascript
// ✅ Good
taskbarItem.addEventListener('touchstart', (e) => {
    e.preventDefault();
    this.windowManager.toggleWindow(id);
});

// ❌ Bad - Don't ignore mobile touch
taskbarItem.addEventListener('click', () => {
    this.windowManager.toggleWindow(id);
});  // No touch handling
```

### 4. **Use CSS Classes for State**
```javascript
// ✅ Good
taskbarItem.classList.add('bg-green-400', 'text-black');

// ❌ Bad - Don't use inline styles
taskbarItem.style.backgroundColor = '#4ade80';
taskbarItem.style.color = 'black';
```

## Troubleshooting

### Common Issues

**Windows not appearing in taskbar:**
- Verify addWindow is being called
- Check window manager integration
- Ensure DOM element is created
- Review console for JavaScript errors

**Active state not updating:**
- Verify setActiveWindow is called
- Check activeWindowId tracking
- Ensure setWindowActive logic works
- Review CSS class application

**Clock not updating:**
- Verify startClock is called
- Check setInterval is running
- Ensure clock element exists
- Review time formatting logic

**Mobile touch not working:**
- Verify touch event listeners are attached
- Check preventDefault is called
- Ensure touch optimization is enabled
- Test on actual mobile device

**Start button not working:**
- Verify exitSimulation event is dispatched
- Check event listener is registered
- Ensure event handler exists
- Review simulation exit logic

### Debug Mode
Enable detailed logging:
```javascript
console.log('[Taskbar] Active window:', this.activeWindowId);
console.log('[Taskbar] Taskbar items:', this.taskbarElement.querySelectorAll('[data-window-id]'));
console.log('[Taskbar] System time:', new Date().toLocaleTimeString());
```

## Future Enhancements

### Planned Improvements
1. **Window preview** - Hover preview of windows
2. **Taskbar grouping** - Group similar applications
3. **System tray** - System icons and notifications
4. **Start menu** - Application launcher menu
5. **Window thumbnails** - Live window thumbnails

### Scalability Considerations
- Support for more concurrent windows
- Improved taskbar item management
- Enhanced mobile experience
- Better performance with many windows

## Related Documentation

- [Simulated PC System](./simulated-pc-system.md)
- [Window Management System](./window-management-system.md)
- [Desktop Components System](./desktop-components-system.md)

## Files and Locations

**Core Taskbar:**
- `app/static/js/simulated-pc/desktop-components/taskbar.js` - Taskbar implementation

**Integration:**
- `app/static/js/simulated-pc/desktop.js` - Desktop integration
- `app/static/js/simulated-pc/desktop-components/window-manager.js` - Window manager integration
