# Desktop Components System

## Overview

The Desktop Components System provides shared utilities and components for the simulated PC environment. It includes modal dialogs, navigation utilities, and reusable UI components that are used across multiple applications and levels.

## Architecture

### Core Components

#### 1. **Shutdown Modal** (`shutdown-modal.js`)
Provides a simulation exit confirmation dialog.

**Key Responsibilities:**
- Exit confirmation display
- Progress saving confirmation
- User choice handling
- Desktop cleanup coordination

#### 2. **Skip Dialogue Modal** (`skip-dialogue-modal.js`)
Provides a modal for skipping dialogues and tutorials.

**Key Responsibilities:**
- Skip confirmation display
- Dialogue state management
- User progress tracking
- Tutorial resumption options

#### 3. **Navigation Util** (`navigation-util.js`)
Provides navigation and routing utilities for applications.

**Key Responsibilities:**
- Application navigation helpers
- URL generation and parsing
- Route management
- Navigation state tracking

## Modal Dialogs

### Shutdown Modal
```javascript
class ShutdownModal {
    constructor(desktop) {
        this.desktop = desktop;
        this.modalElement = null;
    }
    
    show() {
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'shutdown-modal';
        this.modalElement.innerHTML = `
            <div class="modal-content">
                <h2>Exit Simulation?</h2>
                <p>Your progress will be saved.</p>
                <div class="modal-actions">
                    <button id="cancel-btn">Cancel</button>
                    <button id="exit-btn">Exit</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modalElement);
        this.bindEvents();
    }
}
```

### Skip Dialogue Modal
```javascript
class SkipDialogueModal {
    constructor(dialogue) {
        this.dialogue = dialogue;
        this.modalElement = null;
    }
    
    show() {
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'skip-dialogue-modal';
        this.modalElement.innerHTML = `
            <div class="modal-content">
                <h2>Skip Tutorial?</h2>
                <p>You can return to this tutorial later.</p>
                <div class="modal-actions">
                    <button id="cancel-btn">Continue Tutorial</button>
                    <button id="skip-btn">Skip</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modalElement);
        this.bindEvents();
    }
}
```

## Navigation Utilities

### Navigation Helper Functions
```javascript
class NavigationUtil {
    static navigateTo(url) {
        window.location.href = url;
    }
    
    static navigateToRoute(route) {
        window.location.hash = route;
    }
    
    static getCurrentRoute() {
        return window.location.hash.substring(1);
    }
    
    static buildUrl(base, path) {
        return new URL(path, base).toString();
    }
}
```

### Route Management
```javascript
// Route definitions
const routes = {
    'home': '/',
    'levels': '/levels',
    'profile': '/profile',
    'admin': '/admin'
};

// Navigation helper
function navigateToRoute(routeName) {
    const route = routes[routeName];
    if (route) {
        window.location.href = route;
    }
}
```

## Shared UI Components

### Loading Spinner
```javascript
function createLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = `
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
    `;
    return spinner;
}
```

### Progress Bar
```javascript
function createProgressBar(progress) {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = `
        <div class="progress-fill" style="width: ${progress}%"></div>
    `;
    return progressBar;
}
```

### Alert Box
```javascript
function createAlertBox(message, type = 'info') {
    const alertBox = document.createElement('div');
    alertBox.className = `alert-box alert-${type}`;
    alertBox.innerHTML = `
        <i class="bi bi-${getAlertIcon(type)}"></i>
        <span>${message}</span>
        <button class="alert-close">&times;</button>
    `;
    return alertBox;
}
```

## Component Reuse Patterns

### Component Registration
```javascript
const componentRegistry = {
    'loading-spinner': createLoadingSpinner,
    'progress-bar': createProgressBar,
    'alert-box': createAlertBox
};

function getComponent(componentName) {
    return componentRegistry[componentName];
}
```

### Component Factory
```javascript
class ComponentFactory {
    static create(type, options = {}) {
        const component = this.components[type];
        if (component) {
            return component(options);
        }
        throw new Error(`Unknown component type: ${type}`);
    }
    
    static register(type, creator) {
        this.components[type] = creator;
    }
}
```

## Modal Management

### Modal State Management
```javascript
class ModalManager {
    constructor() {
        this.activeModals = new Map();
        this.modalStack = [];
    }
    
    showModal(modal) {
        this.modalStack.push(modal);
        this.activeModals.set(modal.id, modal);
        modal.show();
    }
    
    hideModal(modalId) {
        const modal = this.activeModals.get(modalId);
        if (modal) {
            modal.hide();
            this.activeModals.delete(modalId);
            this.modalStack = this.modalStack.filter(m => m.id !== modalId);
        }
    }
    
    hideAllModals() {
        this.modalStack.forEach(modal => modal.hide());
        this.activeModals.clear();
        this.modalStack = [];
    }
}
```

### Modal Z-Index Management
```javascript
class ModalManager {
    constructor() {
        this.baseZIndex = 10000;
        this.currentZIndex = this.baseZIndex;
    }
    
    getNextZIndex() {
        return ++this.currentZIndex;
    }
    
    resetZIndex() {
        this.currentZIndex = this.baseZIndex;
    }
}
```

## Event Handling

### Global Event Listeners
```javascript
class EventHandler {
    static listeners = new Map();
    
    static on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(handler);
        window.addEventListener(event, handler);
    }
    
    static off(event, handler) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
                window.removeEventListener(event, handler);
            }
        }
    }
    
    static emit(event, data) {
        const customEvent = new CustomEvent(event, { detail: data });
        window.dispatchEvent(customEvent);
    }
}
```

### Event Delegation
```javascript
class EventDelegator {
    constructor(container) {
        this.container = container;
        this.delegatedEvents = new Map();
    }
    
    delegate(event, selector, handler) {
        const key = `${event}:${selector}`;
        this.delegatedEvents.set(key, handler);
        
        this.container.addEventListener(event, (e) => {
            const target = e.target.closest(selector);
            if (target) {
                handler.call(target, e);
            }
        });
    }
}
```

## Utility Functions

### DOM Utilities
```javascript
class DOMUtil {
    static createElement(tag, classes = {}, attributes = {}) {
        const element = document.createElement(tag);
        
        Object.entries(classes).forEach(([name, value]) => {
            element.classList.add(value);
        });
        
        Object.entries(attributes).forEach(([name, value]) => {
            element.setAttribute(name, value);
        });
        
        return element;
    }
    
    static removeElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
    
    static emptyElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
}
```

### String Utilities
```javascript
class StringUtil {
    static truncate(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - 3) + '...';
    }
    
    static capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
    
    static slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
```

### Validation Utilities
```javascript
class ValidationUtil {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    static isNotEmpty(value) {
        return value !== null && value !== undefined && value !== '';
    }
}
```

## Performance Optimizations

### 1. **Component Caching**
```javascript
// Cache created components
const componentCache = new Map();

function getCachedComponent(type, options) {
    const cacheKey = `${type}:${JSON.stringify(options)}`;
    
    if (componentCache.has(cacheKey)) {
        return componentCache.get(cacheKey);
    }
    
    const component = ComponentFactory.create(type, options);
    componentCache.set(cacheKey, component);
    return component;
}
```

### 2. **Event Delegation**
```javascript
// Use delegation instead of individual listeners
this.container.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (button) {
        this.handleButtonClick(button);
    }
});
```

### 3. **Lazy Component Loading**
```javascript
// Load components only when needed
async loadComponent(componentName) {
    if (!this.loadedComponents.has(componentName)) {
        const component = await import(`./components/${componentName}.js`);
        this.loadedComponents.set(componentName, component);
    }
    return this.loadedComponents.get(componentName);
}
```

## Error Handling

### Component Loading Errors
```javascript
try {
    const component = await this.loadComponent(componentName);
} catch (error) {
    console.error(`Failed to load component ${componentName}:`, error);
    this.showErrorComponent(componentName);
}
```

### Modal Display Errors
```javascript
try {
    this.showModal(modal);
} catch (error) {
    console.error('Failed to show modal:', error);
    this.showFallbackAlert('Failed to show dialog');
}
```

### Event Handler Errors
```javascript
try {
    handler.call(target, event);
} catch (error) {
    console.error('Event handler error:', error);
    // Continue with other handlers
}
```

## Configuration Options

### Component Settings
```javascript
const componentConfig = {
    enableCaching: true,
    enableLazyLoading: true,
    enableValidation: true,
    maxCacheSize: 100
};
```

### Modal Settings
```javascript
const modalConfig = {
    enableBackdrop: true,
    enableCloseOnBackdrop: true,
    enableEscapeKey: true,
    maxModals: 5
};
```

### Event Settings
```javascript
const eventConfig = {
    enableDelegation: true,
    enableBubbling: true,
    enableCapture: false,
    maxListeners: 100
};
```

## Best Practices

### 1. **Use Component Factory Pattern**
```javascript
// ✅ Good
const component = ComponentFactory.create('loading-spinner');

// ❌ Bad - Don't create components directly
const spinner = document.createElement('div');  // Not reusable
```

### 2. **Clean Up Event Listeners**
```javascript
// ✅ Good
EventHandler.off('click', handler);

// ❌ Bad - Don't leave listeners
window.addEventListener('click', handler);  // Never cleaned up
```

### 3. **Use Event Delegation**
```javascript
// ✅ Good
this.container.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (button) {
        this.handleButton(button);
    }
});

// ❌ Bad - Don't add listeners to each element
buttons.forEach(btn => {
    btn.addEventListener('click', handler);  // Many listeners
});
```

### 4. **Cache Components**
```javascript
// ✅ Good
const cachedComponent = getCachedComponent('loading-spinner');

// ❌ Bad - Don't recreate components
const spinner = createLoadingSpinner();  // Created every time
```

## Troubleshooting

### Common Issues

**Modals not showing:**
- Verify modal element is created
- Check z-index stacking context
- Ensure modal is appended to DOM
- Review console for JavaScript errors

**Navigation not working:**
- Verify route definitions exist
- Check URL parsing logic
- Ensure window.location is accessible
- Review navigation event handling

**Components not loading:**
- Verify component factory registration
- Check component path resolution
- Ensure module imports work
- Review component creation logic

**Event handlers not firing:**
- Verify event listeners are attached
- Check event delegation setup
- Ensure target elements exist
- Review event propagation logic

**Memory leaks:**
- Verify event listeners are cleaned up
- Check component cache size
- Ensure modal references are cleared
- Review object lifecycle management

### Debug Mode
Enable detailed logging:
```javascript
console.log('[DesktopComponents] Active modals:', this.activeModals);
console.log('[DesktopComponents] Component cache:', this.componentCache);
console.log('[DesktopComponents] Event listeners:', this.listeners);
console.log('[DesktopComponents] Modal stack:', this.modalStack);
```

## Future Enhancements

### Planned Improvements
1. **Component library** - Extensive reusable component collection
2. **Theme system** - Component theming and styling
3. **Animation library** - Shared animation utilities
4. **Form components** - Reusable form inputs and validation
5. **Data tables** - Sortable, filterable table components

### Scalability Considerations
- Support for larger component libraries
- Improved component loading performance
- Enhanced component customization
- Better memory management

## Related Documentation

- [Simulated PC System](./simulated-pc-system.md)
- [Window Management System](./window-management-system.md)
- [Taskbar System](./taskbar-system.md)

## Files and Locations

**Desktop Components:**
- `app/static/js/simulated-pc/desktop-components/shutdown-modal.js` - Shutdown modal
- `app/static/js/simulated-pc/desktop-components/skip-dialogue-modal.js` - Skip dialogue modal
- `app/static/js/simulated-pc/desktop-components/shared-utils/navigation-util.js` - Navigation utilities

**Integration:**
- `app/static/js/simulated-pc/desktop.js` - Desktop integration
