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
        this.isMaximized = false;
        this.originalDimensions = null;
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

        // Store original dimensions for restore functionality
        this.originalDimensions = {
            width: this.options.width,
            height: this.options.height,
            left: this.windowElement.style.left,
            top: this.windowElement.style.top
        };

        this.windowElement.innerHTML = `
            <div class="window-header bg-gradient-to-r from-gray-700 to-gray-600 px-3 py-2 flex justify-between items-center border-b border-gray-600 cursor-grab select-none">
                <div class="window-title text-white text-sm font-semibold flex items-center space-x-2">
                    <i class="bi bi-${this.getIcon()}"></i>
                    <span>${this.title}</span>
                </div>
                <div class="window-controls flex space-x-1">
                    <button class="window-btn minimize w-6 h-6 rounded bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center text-black text-xs transition-all duration-200 hover:shadow-md cursor-pointer" title="Minimize">
                        <i class="bi bi-dash"></i>
                    </button>
                    <button class="window-btn maximize w-6 h-6 rounded bg-green-500 hover:bg-green-400 flex items-center justify-center text-black text-xs transition-all duration-200 hover:shadow-md cursor-pointer" title="Maximize">
                        <i class="bi bi-square"></i>
                    </button>
                    <button class="window-btn close w-6 h-6 rounded bg-red-500 hover:bg-red-400 flex items-center justify-center text-white text-xs transition-all duration-200 hover:shadow-md cursor-pointer" title="Close">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            </div>
            <div class="window-content h-full overflow-auto bg-black text-white" style="height: calc(100% - 40px);">
                ${this.createContent()}
            </div>
        `;

        return this.windowElement;
    }

    // Store current dimensions as original (for maximize/restore)
    storeOriginalDimensions() {
        if (this.windowElement && !this.isMaximized) {
            this.originalDimensions = {
                width: this.windowElement.style.width,
                height: this.windowElement.style.height,
                left: this.windowElement.style.left,
                top: this.windowElement.style.top
            };
        }
    }

    // Restore window to original dimensions
    restoreOriginalDimensions() {
        if (this.windowElement && this.originalDimensions) {
            this.windowElement.style.width = this.originalDimensions.width;
            this.windowElement.style.height = this.originalDimensions.height;
            this.windowElement.style.left = this.originalDimensions.left;
            this.windowElement.style.top = this.originalDimensions.top;
            this.isMaximized = false;
        }
    }

    // Maximize window
    maximize() {
        if (this.windowElement) {
            if (this.isMaximized) {
                // Restore from maximized
                this.restoreOriginalDimensions();
            } else {
                // Store current dimensions before maximizing
                this.storeOriginalDimensions();
                
                // Maximize
                this.windowElement.style.width = '100%';
                this.windowElement.style.height = 'calc(100% - 50px)';
                this.windowElement.style.left = '0';
                this.windowElement.style.top = '0';
                this.isMaximized = true;
            }
        }
    }

    // Check if window is maximized
    getMaximizedState() {
        return this.isMaximized;
    }

    // Method to handle drag start on maximized window
    handleDragStartOnMaximized(mouseX, mouseY) {
        if (this.isMaximized && this.originalDimensions) {
            // Calculate the relative position where the mouse should be after restore
            const windowWidth = parseInt(this.originalDimensions.width);
            
            // Convert percentage width to pixels if needed
            let actualWidth = windowWidth;
            if (this.originalDimensions.width.includes('%')) {
                const percentage = parseFloat(this.originalDimensions.width) / 100;
                actualWidth = window.innerWidth * percentage;
            }
            
            // Restore window size first
            this.restoreOriginalDimensions();
            
            // Position the window so the mouse cursor is in the center of the title bar
            // This feels more natural than trying to maintain relative position
            const newLeft = mouseX - (actualWidth / 2);
            const newTop = mouseY - 20; // Offset for header height
            
            // Ensure window doesn't go off-screen
            const maxLeft = window.innerWidth - actualWidth;
            const maxTop = window.innerHeight - parseInt(this.originalDimensions.height);
            
            const finalLeft = Math.max(0, Math.min(maxLeft, newLeft));
            const finalTop = Math.max(0, Math.min(maxTop, newTop));
            
            this.windowElement.style.left = `${finalLeft}px`;
            this.windowElement.style.top = `${finalTop}px`;
            
            return {
                left: finalLeft,
                top: finalTop
            };
        }
        return null;
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