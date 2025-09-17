/**
 * Password Visibility Utility
 * Provides show/hide password functionality with Bootstrap icons
 */

class PasswordVisibility {
    constructor() {
        this.toggleButtons = new Map();
        this.init();
    }

    init() {
        // Auto-initialize all password fields on page load
        this.initializePasswordFields();
        
        // Listen for dynamically added password fields
        this.observePasswordFields();
    }

    /**
     * Initialize all existing password fields
     */
    initializePasswordFields() {
        const passwordFields = document.querySelectorAll('input[type="password"]');
        passwordFields.forEach(field => {
            if (!this.isAlreadyInitialized(field)) {
                this.addToggleButton(field);
            }
        });
    }

    /**
     * Check if a password field already has a toggle button
     */
    isAlreadyInitialized(field) {
        return field.parentElement.querySelector('.password-toggle-btn') !== null;
    }

    /**
     * Add show/hide toggle button to a password field
     */
    addToggleButton(passwordField) {
        // Skip if field is already initialized
        if (this.isAlreadyInitialized(passwordField)) {
            return;
        }

        const fieldContainer = passwordField.parentElement;
        
        // Make the container relative if it isn't already
        if (getComputedStyle(fieldContainer).position === 'static') {
            fieldContainer.style.position = 'relative';
        }

        // Create toggle button as text link
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'password-toggle-btn text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none transition-colors duration-200 cursor-pointer mt-1 block w-full text-right';
        toggleButton.setAttribute('aria-label', 'Toggle password visibility');
        toggleButton.textContent = 'Show password';

        // Add click event listener
        toggleButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.togglePasswordVisibility(passwordField, toggleButton);
        });

        // Store reference
        this.toggleButtons.set(passwordField, toggleButton);

        // Insert the button after the password field container
        fieldContainer.parentNode.insertBefore(toggleButton, fieldContainer.nextSibling);
    }

    /**
     * Toggle password visibility
     */
    togglePasswordVisibility(passwordField, toggleButton) {
        const isPassword = passwordField.type === 'password';
        
        if (isPassword) {
            // Show password
            passwordField.type = 'text';
            toggleButton.textContent = 'Hide password';
            toggleButton.setAttribute('aria-label', 'Hide password');
        } else {
            // Hide password
            passwordField.type = 'password';
            toggleButton.textContent = 'Show password';
            toggleButton.setAttribute('aria-label', 'Show password');
        }

        // Brief visual feedback
        toggleButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            toggleButton.style.transform = 'scale(1)';
        }, 100);
    }

    /**
     * Observe for dynamically added password fields
     */
    observePasswordFields() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node is a password field
                        if (node.type === 'password') {
                            this.addToggleButton(node);
                        }
                        
                        // Check for password fields within the added node
                        const passwordFields = node.querySelectorAll && node.querySelectorAll('input[type="password"]');
                        if (passwordFields) {
                            passwordFields.forEach(field => {
                                if (!this.isAlreadyInitialized(field)) {
                                    this.addToggleButton(field);
                                }
                            });
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Manually initialize a specific password field
     */
    initializeField(passwordField) {
        if (passwordField && passwordField.type === 'password') {
            this.addToggleButton(passwordField);
        }
    }

    /**
     * Remove toggle button from a password field
     */
    removeToggleButton(passwordField) {
        const toggleButton = this.toggleButtons.get(passwordField);
        if (toggleButton && toggleButton.parentElement) {
            toggleButton.parentElement.removeChild(toggleButton);
            this.toggleButtons.delete(passwordField);
        }
    }

    /**
     * Get all initialized password fields
     */
    getInitializedFields() {
        return Array.from(this.toggleButtons.keys());
    }

    /**
     * Destroy all toggle buttons (useful for cleanup)
     */
    destroy() {
        this.toggleButtons.forEach((toggleButton, passwordField) => {
            this.removeToggleButton(passwordField);
        });
        this.toggleButtons.clear();
    }
}

// Create global instance
window.passwordVisibility = new PasswordVisibility();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PasswordVisibility;
}

// Also make it available as a default export for ES6 modules
export default PasswordVisibility;