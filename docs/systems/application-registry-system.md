# Application Registry System

## Overview

The Application Registry System provides a centralized mechanism for registering, discovering, and launching applications within the Phalanx Cyber Academy simulated desktop environment. It manages application metadata, handles dynamic module loading, and coordinates with the window management system to provide a seamless application experience.

## Architecture

### Core Components

#### 1. **ApplicationRegistry** (`application-registry.js`)
The central registry that maintains application configurations and handles module loading.

**Key Responsibilities:**
- Application registration and metadata management
- Dynamic module loading and caching
- Application discovery and querying
- Configuration validation
- Icon and title management

**Registry Structure:**
```javascript
{
    'browser': {
        module: './desktop-applications/browser-app.js',
        className: 'BrowserApp',
        storageKey: 'cyberquest_browser_opened',
        iconClass: 'bi-globe',
        title: 'Web Browser',
        levelSpecific: 1,
        autoOpen: false
    },
    'terminal': {
        module: '../levels/level-four/apps/terminal-app.js',
        className: 'TerminalApp',
        storageKey: 'cyberquest_terminal_opened',
        iconClass: 'bi-terminal',
        title: 'Terminal',
        levelSpecific: 4,
        autoOpen: false
    }
    // ... more applications
}
```

#### 2. **ApplicationLauncher** (`application-launcher.js`)
Handles application launching, level restrictions, and lifecycle management.

**Key Responsibilities:**
- Application launching with level restrictions
- First-time usage tracking
- Special handling for level-specific apps
- Window creation and configuration
- Tutorial integration

**Integration with WindowManager:**
```javascript
class ApplicationLauncher {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.appRegistry = appRegistry;
        this.currentLevel = null;
    }
    
    async openApplication(appId, windowTitle) {
        const appConfig = this.appRegistry.getApp(appId);
        const app = await this.appRegistry.createAppInstance(appId);
        const windowElement = this.windowManager.createWindow(appId, windowTitle, app);
        return app;
    }
}
```

## Application Registration

### Registration Format
```javascript
{
    module: 'path/to/app.js',           // ES6 module path
    className: 'AppClassName',          // Class name to import
    storageKey: 'app_opened',           // localStorage key for first-time tracking
    iconClass: 'bi-icon-name',          // Bootstrap icon class
    title: 'Display Title',            // Display title
    levelSpecific: 1,                   // Level restriction (optional)
    autoOpen: false,                    // Auto-open on level start (optional)
    persistent: false,                  // Cannot be closed (optional)
    category: 'category-name'           // Category for grouping (optional)
}
```

### Built-in Applications

#### Core Applications
- **browser**: Web Browser (Level 1+)
- **email**: Email Client (Level 2+)
- **terminal**: Terminal (Level 4+)
- **files**: File Manager (Level 1+)

#### Level 3 Applications
- **process-monitor**: Process Monitor (Level 3)
- **malware-scanner**: Malware Scanner (Level 3)
- **level3-timer**: Mission Status (Level 3, auto-open, persistent)

#### Level 5 Applications
- **evidence-viewer**: Evidence Viewer (Level 5)
- **investigation-hub**: Investigation Hub (Level 5)
- **forensic-report**: Forensic Report (Level 5)

### Registering New Applications

#### Method 1: Direct Registration
```javascript
const appRegistry = new ApplicationRegistry();

appRegistry.registerApp('your-app', {
    class: YourAppClass,
    storageKey: 'cyberquest_yourapp_opened',
    iconClass: 'bi-window',
    title: 'Your App',
    levelSpecific: 3,
    category: 'tools'
});
```

#### Method 2: Module-Based Registration
```javascript
// In application-registry.js constructor
this.registry = {
    'your-app': {
        module: './desktop-applications/your-app.js',
        className: 'YourApp',
        storageKey: 'cyberquest_yourapp_opened',
        iconClass: 'bi-window',
        title: 'Your App',
        levelSpecific: 3
    }
};
```

## Dynamic Module Loading

### Module Loading Process
```javascript
async loadAppClass(appId) {
    const appConfig = this.registry[appId];
    
    // Check cache first
    if (this.loadedModules.has(appId)) {
        return this.loadedModules.get(appId);
    }
    
    // Dynamic import
    const module = await import(appConfig.module);
    const AppClass = module[appConfig.className];
    
    // Cache for future use
    this.loadedModules.set(appId, AppClass);
    
    // Update registry for backwards compatibility
    appConfig.class = AppClass;
    
    return AppClass;
}
```

### Module Caching
- Modules cached after first load
- Subsequent instantiations use cached class
- Improves performance for repeated app launches
- Memory-efficient singleton pattern

### Error Handling
```javascript
try {
    const module = await import(appConfig.module);
    const AppClass = module[appConfig.className];
    return AppClass;
} catch (error) {
    console.error(`Failed to load application ${appId}:`, error);
    throw error;
}
```

## Application Discovery

### Query Methods
```javascript
// Get specific application
const app = appRegistry.getApp('browser');

// Check if application exists
const hasApp = appRegistry.hasApp('terminal');

// Get all application IDs
const allIds = appRegistry.getAllAppIds();

// Get all applications
const allApps = appRegistry.getAllApps();

// Get applications by category
const categoryApps = appRegistry.getAppsByCategory('tools');
```

### Level-Specific Filtering
```javascript
// Get applications for specific level
const levelApps = Object.entries(appRegistry.getAllApps())
    .filter(([id, config]) => 
        config.levelSpecific === currentLevel ||
        config.levelSpecific === currentLevel.toString()
    );
```

### Auto-Open Detection
```javascript
// Get applications that should auto-open
const autoOpenApps = Object.entries(appRegistry.getAllApps())
    .filter(([id, config]) => 
        config.levelSpecific === currentLevel &&
        config.autoOpen === true
    );
```

## Application Launching

### Launch Flow
```
User Request
    ↓
ApplicationLauncher.openApplication()
    ↓
Check level restrictions
    ↓
ApplicationRegistry.loadAppClass()
    ↓
ApplicationRegistry.createAppInstance()
    ↓
WindowManager.createWindow()
    ↓
Application.initialize()
    ↓
Track first-time usage
    ↓
Return application instance
```

### Level Restrictions
```javascript
async openApplication(appId, windowTitle) {
    const appConfig = this.appRegistry.getApp(appId);
    
    // Check level restrictions
    if (appConfig.levelSpecific && 
        this.currentLevel !== appConfig.levelSpecific) {
        console.warn(`App ${appId} is level-specific`);
        return null;
    }
    
    // ... proceed with launch
}
```

### First-Time Usage Tracking
```javascript
const isFirstTime = appConfig.storageKey ? 
    !localStorage.getItem(appConfig.storageKey) : false;

if (appConfig.storageKey) {
    this.appRegistry.markAsOpened(appId);
}
```

### Special Application Handling

#### Level 3 Timer (Static Element)
```javascript
if (appId === 'level3-timer') {
    // Timer is static, not a window
    const desktopContainer = this.windowManager.container;
    app.appendTo(desktopContainer);
    app.initialize();
    
    this.level3TimerInstance = app;
    return app;
}
```

#### Level 5 Investigation Tracker
```javascript
if (appId === 'investigation-tracker') {
    const desktopContainer = this.windowManager.container;
    app.appendTo(desktopContainer);
    app.initialize();
    
    this.level5InvestigationTrackerInstance = app;
    window.level5InvestigationTracker = app;
    return app;
}
```

#### Persistent Applications
```javascript
if (windowElement && appConfig.persistent) {
    // Hide close and minimize buttons
    const closeBtn = windowElement.querySelector('.close');
    const minimizeBtn = windowElement.querySelector('.minimize');
    if (closeBtn) closeBtn.style.display = 'none';
    if (minimizeBtn) minimizeBtn.style.display = 'none';
}
```

## Tutorial Integration

### Tutorial Auto-Start
Applications can trigger tutorials on first open:

```javascript
// In application configuration
'terminal': {
    module: '../levels/level-four/apps/terminal-app.js',
    className: 'TerminalApp',
    storageKey: 'cyberquest_terminal_opened',
    tutorialMethod: 'shouldAutoStartTerminal',
    startMethod: 'startTerminalTutorial'
}
```

### Tutorial Triggering
```javascript
// In ApplicationLauncher
const isFirstTime = !localStorage.getItem(appConfig.storageKey);

if (isFirstTime && appConfig.tutorialMethod) {
    // Trigger tutorial after app opens
    setTimeout(() => {
        if (window.tutorialManager && window.tutorialManager[appConfig.startMethod]) {
            window.tutorialManager[appConfig.startMethod]();
        }
    }, 1000);
}
```

## Configuration Management

### Application Configuration
```javascript
// Get application configuration
const config = appRegistry.getApp('browser');

// Update application configuration
appRegistry.updateApp('browser', {
    title: 'Updated Title',
    iconClass: 'bi-new-icon'
});

// Validate configuration
const isValid = appRegistry.validateAppConfig(config);
```

### Configuration Validation
```javascript
validateAppConfig(config) {
    const required = ['class'];
    const optional = ['storageKey', 'iconClass', 'title', 'category'];
    
    // Check required fields
    for (const prop of required) {
        if (!config.hasOwnProperty(prop)) {
            throw new Error(`Required property '${prop}' missing`);
        }
    }
    
    // Warn about unknown properties
    const allProps = [...required, ...optional];
    for (const prop in config) {
        if (!allProps.includes(prop)) {
            console.warn(`Unknown property '${prop}'`);
        }
    }
    
    return true;
}
```

## Icon Management

### Icon Class Resolution
```javascript
// Get icon class with fallback
getIconClass(appId) {
    const app = this.registry[appId];
    return app ? app.iconClass : 'bi-window';
}

// In WindowBase
getIconClass() {
    return `bi-${this.getIcon()}`;
}
```

### Available Icons
- `bi-globe` - Browser
- `bi-terminal` - Terminal
- `bi-envelope` - Email
- `bi-folder` - File Manager
- `bi-cpu` - Process Monitor
- `bi-shield-exclamation` - Malware Scanner
- `bi-router` - Network Monitor
- `bi-journal-text` - System Logs
- `bi-eye-fill` - Evidence Viewer
- `bi-kanban` - Investigation Hub
- `bi-file-text` - Forensic Report

## Level Integration

### Level-Specific Applications
Each level has specific applications available:

```javascript
// Set current level
applicationLauncher.setLevel(level);

// Auto-open level-specific applications
applicationLauncher.autoOpenLevelApps();

// Get level-specific applications
const levelApps = applicationLauncher.getLevelApps();
```

### Level 3 Special Features
```javascript
// Damage tracking
applicationLauncher.addReputationDamage(amount);
applicationLauncher.addFinancialDamage(amount);

// Timer status
const timerStatus = applicationLauncher.getTimerStatus();
```

### Level 5 Evidence Tools
```javascript
// Launch evidence-specific tools
await applicationLauncher.launchEvidenceSpecificTools('disk_image');
await applicationLauncher.launchEvidenceSpecificTools('memory_dump');
await applicationLauncher.launchEvidenceSpecificTools('network_capture');
```

## Performance Optimizations

### 1. **Module Caching**
```javascript
// Cache loaded modules
this.loadedModules = new Map();

// Check cache before loading
if (this.loadedModules.has(appId)) {
    return this.loadedModules.get(appId);
}
```

### 2. **Lazy Loading**
- Applications loaded only when needed
- Level-specific modules loaded per level
- Reduces initial bundle size

### 3. **Efficient Queries**
- Direct object property access
- Map-based lookups for O(1) complexity
- Filter operations only when needed

## Error Handling

### Application Not Found
```javascript
const appConfig = this.appRegistry.getApp(appId);
if (!appConfig) {
    throw new Error(`Application '${appId}' not found in registry`);
}
```

### Module Loading Failures
```javascript
try {
    const module = await import(appConfig.module);
    const AppClass = module[appConfig.className];
    return new AppClass();
} catch (error) {
    throw new Error(`Failed to create app instance: ${error.message}`);
}
```

### Level Restriction Violations
```javascript
if (appConfig.levelSpecific && 
    this.currentLevel !== appConfig.levelSpecific) {
    console.warn(`App ${appId} is level-specific (${appConfig.levelSpecific})`);
    return null; // Fail gracefully
}
```

## Configuration Options

### Registry Configuration
```javascript
const registryConfig = {
    enableCaching: true,           // Enable module caching
    validateOnRegister: true,     // Validate configs on registration
    defaultIconClass: 'bi-window', // Fallback icon
    defaultStorageKey: null        // Default storage key pattern
};
```

### Launcher Configuration
```javascript
const launcherConfig = {
    enableLevelRestrictions: true, // Enforce level restrictions
    enableFirstTimeTracking: true, // Track first-time usage
    enableTutorialIntegration: true, // Enable tutorial triggers
    autoOpenDelay: 1000           // Delay for auto-open apps
};
```

## Integration Points

### WindowManager Integration
```javascript
// WindowManager uses ApplicationLauncher for app launching
this.applicationLauncher = initializeApplicationLauncher(this);

// Launcher creates windows via WindowManager
const windowElement = this.windowManager.createWindow(appId, title, app);
```

### Desktop Integration
```javascript
// Desktop sets level in launcher
this.windowManager.applicationLauncher.setLevel(this.level);

// Launcher auto-opens level apps
this.applicationLauncher.autoOpenLevelApps();
```

### Tutorial System Integration
```javascript
// Tutorial system checks first-time usage
const isFirstTime = !localStorage.getItem(appConfig.storageKey);

// Tutorial manager triggers tutorials
if (window.tutorialManager && window.tutorialManager[startMethod]) {
    window.tutorialManager[startMethod]();
}
```

## Best Practices

### 1. **Always Register Applications**
```javascript
// ✅ Good - Register in registry
appRegistry.registerApp('your-app', config);

// ❌ Bad - Don't bypass registry
const app = new YourApp();
windowManager.createWindow('your-app', 'Your App', app);
```

### 2. **Use Proper Module Paths**
```javascript
// ✅ Good - Relative to registry location
module: './desktop-applications/browser-app.js'

// ❌ Bad - Absolute or incorrect paths
module: '/static/js/browser-app.js'
```

### 3. **Implement Proper Icons**
```javascript
// ✅ Good - Use Bootstrap icons
iconClass: 'bi-globe'

// ❌ Bad - Non-existent icons
iconClass: 'bi-nonexistent-icon'
```

### 4. **Handle Level Restrictions**
```javascript
// ✅ Good - Specify level when needed
levelSpecific: 4

// ❌ Bad - Don't restrict when should be restricted
// Missing levelSpecific for level-specific app
```

## Troubleshooting

### Common Issues

**Application not loading:**
- Verify module path is correct
- Check className matches exported class
- Ensure module is in level-specific loading
- Check browser console for import errors

**Level restrictions not working:**
- Verify levelSpecific is set correctly
- Check currentLevel is set in launcher
- Ensure level comparison handles string/number
- Check for level-specific loading configuration

**First-time tracking not working:**
- Verify storageKey is set
- Check localStorage is accessible
- Ensure markAsOpened is called
- Verify storageKey uniqueness

**Tutorials not triggering:**
- Verify tutorialMethod and startMethod are set
- Check tutorialManager is globally accessible
- Ensure methods exist on tutorialManager
- Check localStorage for completion flags

**Auto-open not working:**
- Verify autoOpen is set to true
- Check level matches levelSpecific
- Ensure setLevel is called before autoOpenLevelApps
- Check for exceptions in auto-open logic

### Debug Mode
Enable detailed logging:
```javascript
console.log('[ApplicationRegistry] Loading app:', appId);
console.log('[ApplicationRegistry] App config:', appConfig);
console.log('[ApplicationLauncher] Current level:', this.currentLevel);
console.log('[ApplicationLauncher] Level apps:', levelApps);
```

## Future Enhancements

### Planned Improvements
1. **Application categories** - Group apps by category
2. **Application search** - Searchable application registry
3. **Application favorites** - User-pinned applications
4. **Application dependencies** - Declare app dependencies
5. **Application versioning** - Support multiple app versions

### Scalability Considerations
- Support for 100+ applications
- Improved module loading performance
- Enhanced caching strategies
- Better memory management

## Related Documentation

- [Simulated PC System](./simulated-pc-system.md)
- [Window Management System](./window-management-system.md)
- [Tutorial System Documentation](./tutorial-system-documentation.md)
- [Level-Specific Documentation](../level-specific/README.md)

## Files and Locations

**Core Registry:**
- `app/static/js/simulated-pc/desktop-components/application-registry.js` - Application registry
- `app/static/js/simulated-pc/desktop-components/application-launcher.js` - Application launcher

**Application Files:**
- `app/static/js/simulated-pc/desktop-components/desktop-applications/browser-app.js`
- `app/static/js/simulated-pc/desktop-components/desktop-applications/email-app.js`
- `app/static/js/simulated-pc/levels/level-four/apps/terminal-app.js`

**Integration:**
- `app/static/js/simulated-pc/desktop-components/window-manager.js` - Window management
- `app/static/js/simulated-pc/desktop.js` - Desktop integration
