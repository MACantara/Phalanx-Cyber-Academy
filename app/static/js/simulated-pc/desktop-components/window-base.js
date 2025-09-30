export class WindowBase {
    constructor(id, title, options = {}) {
        this.id = id;
        this.title = title;
        this.options = {
            width: '60%',
            height: '50%',
            ...options
        };
        this.windowElement = null;
        this.activityEmitter = null; // Will be set by child classes
        this.loadScrollbarStyles();
    }

    // Load scrollbar styles from external CSS file
    loadScrollbarStyles() {
        // Check if styles are already loaded
        if (document.getElementById('window-scrollbar-styles')) return;

        const link = document.createElement('link');
        link.id = 'window-scrollbar-styles';
        link.rel = 'stylesheet';
        link.href = '/static/css/simulated-pc/windows.css';
        document.head.appendChild(link);
    }

    // Abstract method to be implemented by child classes
    createContent() {
        throw new Error('createContent() must be implemented by child classes');
    }

    // Get the icon for this window
    getIcon() {
        const icons = {
            'browser': 'globe',
            'terminal': 'terminal',
            'files': 'folder',
            'email': 'envelope',
            'wireshark': 'router',
            'security': 'shield-check',
            'logs': 'journal-text',
            'help': 'question-circle',
            'hint': 'lightbulb',
            'progress': 'clipboard-data'
        };
        return icons[this.id] || 'window';
    }

    // Get the icon class for taskbar
    getIconClass() {
        return `bi-${this.getIcon()}`;
    }

    // Create the window structure
    createWindow() {
        this.windowElement = document.createElement('div');
        this.windowElement.className = 'absolute bg-gray-800 border border-gray-600 rounded shadow-2xl overflow-hidden min-w-72 min-h-48 backdrop-blur-lg';
        this.windowElement.style.width = this.options.width;
        this.windowElement.style.height = this.options.height;
        this.windowElement.style.left = `${Math.random() * 20 + 10}%`;
        this.windowElement.style.top = `${Math.random() * 20 + 10}%`;



        this.windowElement.innerHTML = `
            <div class="window-header bg-gradient-to-r from-gray-700 to-gray-600 px-3 py-2 flex justify-center items-center border-b border-gray-600 select-none">
                <div class="window-title text-white text-sm font-semibold flex items-center space-x-2">
                    <i class="bi bi-${this.getIcon()}"></i>
                    <span>${this.title}</span>
                </div>
            </div>
            <div class="window-content h-full overflow-auto bg-black text-white" style="height: calc(100% - 40px);">
                ${this.createContent()}
            </div>
        `;

        return this.windowElement;
    }


    // Activity emission setup - must be called by child classes
    setupActivityEmission(activityEmitterClass) {
        if (!activityEmitterClass) {
            throw new Error(`Application '${this.id}' must provide an ActivityEmitter class that extends ActivityEmitterBase`);
        }

        // Create instance without validation for now - validation will happen during initialization
        this.activityEmitter = new activityEmitterClass(this.id, this.title);
        
        // Verify custom events are implemented
        try {
            this.activityEmitter.initializeCustomEvents();
        } catch (error) {
            console.error(`Failed to initialize custom events for ${this.id}:`, error.message);
            throw error;
        }
    }

    // Common activity emission methods
    emitAppActivity(activityType, data = {}, additionalData = {}) {
        if (this.activityEmitter) {
            this.activityEmitter.emitActivity(activityType, data, additionalData);
        }
    }

    emitUserAction(action, details = {}) {
        if (this.activityEmitter) {
            this.activityEmitter.emitUserAction(action, details);
        }
    }

    emitSecurityEvent(severity, description, details = {}) {
        if (this.activityEmitter) {
            this.activityEmitter.emitSecurityEvent(severity, description, details);
        }
    }

    // Initialize the window after creation
    initialize() {
        // Emit app started event if activity emitter is set up
        if (this.activityEmitter) {
            this.activityEmitter.emitAppStarted();
        }
        
        // Override in child classes for specific initialization
    }

    // Clean up when window is closed
    cleanup() {
        // Emit app stopped event if activity emitter is set up
        if (this.activityEmitter) {
            this.activityEmitter.emitAppStopped();
        }
        
        // Override in child classes for specific cleanup
    }

    // Update window content (useful for dynamic content)
    updateContent() {
        const contentElement = this.windowElement?.querySelector('.window-content');
        if (contentElement) {
            contentElement.innerHTML = this.createContent();
        }
    }

    // Get window state for saving/restoring
    getState() {
        if (!this.windowElement) return null;

        return {
            id: this.id,
            title: this.title,
            width: this.windowElement.style.width,
            height: this.windowElement.style.height,
            left: this.windowElement.style.left,
            top: this.windowElement.style.top,
            isMaximized: this.isMaximized,
            zIndex: this.windowElement.style.zIndex
        };
    }

    // Restore window state
    setState(state) {
        if (!this.windowElement || !state) return;

        this.windowElement.style.width = state.width;
        this.windowElement.style.height = state.height;
        this.windowElement.style.left = state.left;
        this.windowElement.style.top = state.top;
        this.windowElement.style.zIndex = state.zIndex;
        this.isMaximized = state.isMaximized;
    }
}