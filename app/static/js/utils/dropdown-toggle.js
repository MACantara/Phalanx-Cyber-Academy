/**
 * Dropdown Toggle Utility
 * ES6 Module for handling dropdown functionality across the application
 */

export class DropdownManager {
    constructor() {
        this.dropdowns = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize dropdown functionality
     */
    init() {
        if (this.isInitialized) return;
        
        // Auto-setup on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
        
        this.isInitialized = true;
        return this;
    }

    /**
     * Setup dropdown event listeners
     */
    setup() {
        this.setupToggleButtons();
        this.setupGlobalListeners();
        return this;
    }

    /**
     * Setup toggle buttons
     */
    setupToggleButtons() {
        const toggleButtons = document.querySelectorAll('[data-dropdown-toggle]');
        console.log('Found toggle buttons:', toggleButtons.length);
        
        toggleButtons.forEach(button => {
            const dropdownId = button.getAttribute('data-dropdown-toggle');
            const dropdown = document.getElementById(dropdownId);
            
            if (dropdown) {
                this.dropdowns.set(dropdownId, {
                    button: button,
                    dropdown: dropdown,
                    isOpen: false
                });

                // Remove existing listeners to prevent duplicates
                button.removeEventListener('click', this.handleToggleClick.bind(this));
                button.addEventListener('click', this.handleToggleClick.bind(this));
                
                console.log('Successfully registered dropdown:', dropdownId);
            } else {
                console.warn('Dropdown element not found for ID:', dropdownId);
            }
        });
    }

    /**
     * Handle toggle button clicks
     * @param {Event} event - Click event
     */
    handleToggleClick(event) {
        event.stopPropagation();
        const dropdownId = event.currentTarget.getAttribute('data-dropdown-toggle');
        this.toggle(dropdownId);
    }

    /**
     * Setup global event listeners
     */
    setupGlobalListeners() {
        // Close dropdowns when clicking outside
        document.addEventListener('click', (event) => {
            this.handleOutsideClick(event);
        });

        // Close dropdowns on escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeAll();
            }
        });

        // Prevent dropdown content clicks from closing (but close on link clicks)
        this.dropdowns.forEach(({ dropdown }) => {
            dropdown.addEventListener('click', (event) => {
                // If clicking a link, close the dropdown and let it navigate
                if (event.target.tagName === 'A' || event.target.closest('a')) {
                    // Close dropdown after a short delay to allow navigation
                    setTimeout(() => this.closeAll(), 100);
                } else {
                    // For non-links, stop propagation to keep dropdown open
                    event.stopPropagation();
                }
            });
        });
    }

    /**
     * Handle clicks outside dropdowns
     * @param {Event} event - Click event
     */
    handleOutsideClick(event) {
        let clickedOnDropdown = false;
        let clickedOnButton = false;

        // Check if clicked on any dropdown or button
        this.dropdowns.forEach(({ button, dropdown }) => {
            if (dropdown.contains(event.target)) {
                clickedOnDropdown = true;
            }
            if (button.contains(event.target)) {
                clickedOnButton = true;
            }
        });

        // Close all dropdowns if clicked outside
        if (!clickedOnDropdown && !clickedOnButton) {
            this.closeAll();
        }
    }

    /**
     * Toggle a specific dropdown
     * @param {string} dropdownId - ID of the dropdown to toggle
     */
    toggle(dropdownId) {
        const dropdownData = this.dropdowns.get(dropdownId);
        if (!dropdownData) return;

        const { dropdown } = dropdownData;
        const isCurrentlyOpen = !dropdown.classList.contains('hidden');

        // Close all other dropdowns first
        this.closeAll();

        // Toggle the requested dropdown
        if (!isCurrentlyOpen) {
            this.open(dropdownId);
        }
    }

    /**
     * Open a specific dropdown
     * @param {string} dropdownId - ID of the dropdown to open
     */
    open(dropdownId) {
        const dropdownData = this.dropdowns.get(dropdownId);
        if (!dropdownData) return;

        const { dropdown } = dropdownData;
        dropdown.classList.remove('hidden');
        dropdownData.isOpen = true;

        // Trigger custom event
        this.dispatchEvent('dropdown:open', { dropdownId, dropdown });
    }

    /**
     * Close a specific dropdown
     * @param {string} dropdownId - ID of the dropdown to close
     */
    close(dropdownId) {
        const dropdownData = this.dropdowns.get(dropdownId);
        if (!dropdownData) return;

        const { dropdown } = dropdownData;
        dropdown.classList.add('hidden');
        dropdownData.isOpen = false;

        // Trigger custom event
        this.dispatchEvent('dropdown:close', { dropdownId, dropdown });
    }

    /**
     * Close all dropdowns
     */
    closeAll() {
        this.dropdowns.forEach((_, dropdownId) => {
            this.close(dropdownId);
        });
    }

    /**
     * Check if a dropdown is open
     * @param {string} dropdownId - ID of the dropdown to check
     * @returns {boolean} - Whether the dropdown is open
     */
    isOpen(dropdownId) {
        const dropdownData = this.dropdowns.get(dropdownId);
        return dropdownData ? dropdownData.isOpen : false;
    }

    /**
     * Register a new dropdown dynamically
     * @param {string} dropdownId - ID of the dropdown
     * @param {HTMLElement} button - Toggle button element
     * @param {HTMLElement} dropdown - Dropdown element
     */
    register(dropdownId, button, dropdown) {
        if (!button || !dropdown) {
            console.error('Invalid button or dropdown element for:', dropdownId);
            return;
        }

        this.dropdowns.set(dropdownId, {
            button: button,
            dropdown: dropdown,
            isOpen: false
        });

        // Setup button listener
        button.removeEventListener('click', this.handleToggleClick.bind(this));
        button.addEventListener('click', this.handleToggleClick.bind(this));

        // Setup dropdown click prevention (but close on link clicks)
        dropdown.addEventListener('click', (event) => {
            // If clicking a link, close the dropdown and let it navigate
            if (event.target.tagName === 'A' || event.target.closest('a')) {
                // Close dropdown after a short delay to allow navigation
                setTimeout(() => this.closeAll(), 100);
            } else {
                // For non-links, stop propagation to keep dropdown open
                event.stopPropagation();
            }
        });

        console.log('Dynamically registered dropdown:', dropdownId);
    }

    /**
     * Unregister a dropdown
     * @param {string} dropdownId - ID of the dropdown to unregister
     */
    unregister(dropdownId) {
        const dropdownData = this.dropdowns.get(dropdownId);
        if (dropdownData) {
            const { button } = dropdownData;
            button.removeEventListener('click', this.handleToggleClick.bind(this));
            this.dropdowns.delete(dropdownId);
        }
    }

    /**
     * Refresh dropdown setup (useful when DOM changes)
     */
    refresh() {
        this.setupToggleButtons();
    }

    /**
     * Dispatch custom events
     * @param {string} eventName - Name of the event
     * @param {Object} detail - Event detail data
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Get all registered dropdown IDs
     * @returns {string[]} - Array of dropdown IDs
     */
    getDropdownIds() {
        return Array.from(this.dropdowns.keys());
    }

    /**
     * Destroy the dropdown manager
     */
    destroy() {
        // Remove all event listeners
        this.dropdowns.forEach(({ button }) => {
            button.removeEventListener('click', this.handleToggleClick.bind(this));
        });

        // Clear dropdowns map
        this.dropdowns.clear();
        this.isInitialized = false;
    }
}

// Create and export a default instance
const dropdownManager = new DropdownManager();

// Named exports
export { dropdownManager };

// Default export
export default dropdownManager;

// Legacy global support for non-module scripts
if (typeof window !== 'undefined') {
    window.DropdownManager = DropdownManager;
    window.dropdownManager = dropdownManager;
    
    // Global utility functions for backward compatibility
    window.toggleDropdown = function(dropdownId) {
        dropdownManager.toggle(dropdownId);
    };
    
    window.closeAllDropdowns = function() {
        dropdownManager.closeAll();
    };
}
