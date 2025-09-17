/**
 * Client-side password validation utility
 * Handles password matching and basic requirements validation
 */

class PasswordValidator {
    constructor(passwordInputId, confirmPasswordInputId, options = {}) {
        this.passwordInput = document.getElementById(passwordInputId);
        this.confirmPasswordInput = document.getElementById(confirmPasswordInputId);
        this.options = {
            showValidation: true,
            showMatching: true,
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            ...options
        };
        
        if (this.passwordInput && this.confirmPasswordInput) {
            this.init();
        }
    }
    
    init() {
        this.createValidationElements();
        this.setupEventListeners();
    }
    
    createValidationElements() {
        // Create password requirements validation
        if (this.options.showValidation) {
            const validationContainer = document.createElement('div');
            validationContainer.className = 'password-validation mt-2';
            validationContainer.innerHTML = `
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Password must contain:
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400 space-x-4">
                    <span class="requirement-item inline-flex items-center" data-requirement="length">
                        <i class="bi bi-circle mr-1 text-gray-400 requirement-icon text-xs"></i>
                        <span>${this.options.minLength}+ chars</span>
                    </span>
                    ${this.options.requireUppercase ? `
                    <span class="requirement-item inline-flex items-center" data-requirement="uppercase">
                        <i class="bi bi-circle mr-1 text-gray-400 requirement-icon text-xs"></i>
                        <span>A-Z</span>
                    </span>` : ''}
                    ${this.options.requireLowercase ? `
                    <span class="requirement-item inline-flex items-center" data-requirement="lowercase">
                        <i class="bi bi-circle mr-1 text-gray-400 requirement-icon text-xs"></i>
                        <span>a-z</span>
                    </span>` : ''}
                    ${this.options.requireNumbers ? `
                    <span class="requirement-item inline-flex items-center" data-requirement="numbers">
                        <i class="bi bi-circle mr-1 text-gray-400 requirement-icon text-xs"></i>
                        <span>0-9</span>
                    </span>` : ''}
                    ${this.options.requireSpecialChars ? `
                    <span class="requirement-item inline-flex items-center" data-requirement="special">
                        <i class="bi bi-circle mr-1 text-gray-400 requirement-icon text-xs"></i>
                        <span>!@#$</span>
                    </span>` : ''}
                </p>
            `;
            
            // Find the best insertion point - after any password visibility toggle or directly after the input
            let insertionPoint = this.passwordInput.nextSibling;
            const parentNode = this.passwordInput.parentNode;
            
            // Look for password visibility toggle button
            const toggleButton = parentNode.querySelector('.password-toggle-btn');
            if (toggleButton) {
                insertionPoint = toggleButton.nextSibling;
            }
            
            parentNode.insertBefore(validationContainer, insertionPoint);
            this.validationContainer = validationContainer;
        }
        
        // Create password matching validation
        if (this.options.showMatching) {
            const matchingContainer = document.createElement('div');
            matchingContainer.className = 'password-matching mt-2 hidden';
            
            // Create inline container for password visibility toggle and matching status
            const inlineContainer = document.createElement('div');
            inlineContainer.className = 'flex justify-between items-center';
            
            // Add password matching status on the left
            const matchStatus = document.createElement('p');
            matchStatus.className = 'text-xs flex items-center';
            matchStatus.id = 'password-match-status';
            matchStatus.innerHTML = `
                <i class="bi bi-circle mr-2 text-gray-400"></i>
                <span class="text-gray-600 dark:text-gray-400">Passwords match</span>
            `;
            inlineContainer.appendChild(matchStatus);
            
            matchingContainer.appendChild(inlineContainer);
            
            // Find the best insertion point - after any password visibility toggle or directly after the input
            let insertionPoint = this.confirmPasswordInput.nextSibling;
            const parentNode = this.confirmPasswordInput.parentNode;
            
            // Look for password visibility toggle button
            const toggleButton = parentNode.querySelector('.password-toggle-btn');
            if (toggleButton) {
                insertionPoint = toggleButton.nextSibling;
            }
            
            parentNode.insertBefore(matchingContainer, insertionPoint);
            this.matchingContainer = matchingContainer;
            
            // Move the password visibility toggle to the inline container if it exists
            if (toggleButton) {
                // Remove the toggle from its current position and add it to our inline container
                const visibilityContainer = parentNode.querySelector('.password-visibility-container');
                if (visibilityContainer) {
                    visibilityContainer.remove(); // Remove the standalone container
                }
                toggleButton.className = 'password-toggle-btn text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none transition-colors duration-200 cursor-pointer';
                inlineContainer.appendChild(toggleButton);
            }
        }
    }
    
    setupEventListeners() {
        // Validate password requirements on input
        this.passwordInput.addEventListener('input', () => {
            this.validateRequirements();
            this.validateMatching();
        });
        
        // Validate password matching on confirm input
        this.confirmPasswordInput.addEventListener('input', () => {
            this.validateMatching();
        });
        
        // Show/hide validation on focus/blur
        this.passwordInput.addEventListener('focus', () => {
            if (this.validationContainer) {
                this.validationContainer.style.display = 'block';
            }
        });
        
        this.confirmPasswordInput.addEventListener('focus', () => {
            if (this.matchingContainer) {
                this.matchingContainer.classList.remove('hidden');
            }
        });
    }
    
    validateRequirements() {
        if (!this.validationContainer) return true;
        
        const password = this.passwordInput.value;
        const requirements = {
            length: password.length >= this.options.minLength,
            uppercase: !this.options.requireUppercase || /[A-Z]/.test(password),
            lowercase: !this.options.requireLowercase || /[a-z]/.test(password),
            numbers: !this.options.requireNumbers || /\d/.test(password),
            special: !this.options.requireSpecialChars || /[^A-Za-z0-9]/.test(password)
        };
        
        // Update visual indicators
        Object.entries(requirements).forEach(([requirement, valid]) => {
            const item = this.validationContainer.querySelector(`[data-requirement="${requirement}"]`);
            if (item) {
                const icon = item.querySelector('.requirement-icon');
                const span = item.querySelector('span');
                
                if (valid) {
                    icon.className = 'bi bi-check-circle-fill mr-1 text-green-500 requirement-icon text-xs';
                    span.className = 'text-green-600 dark:text-green-400 font-medium';
                } else {
                    icon.className = 'bi bi-circle mr-1 text-gray-400 requirement-icon text-xs';
                    span.className = 'text-gray-600 dark:text-gray-400';
                }
            }
        });
        
        return Object.values(requirements).every(valid => valid);
    }
    
    validateMatching() {
        if (!this.matchingContainer) return true;
        
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        
        // Only show matching validation if confirm password has content
        if (!confirmPassword) {
            this.matchingContainer.classList.add('hidden');
            return true;
        }
        
        this.matchingContainer.classList.remove('hidden');
        
        const isMatching = password === confirmPassword;
        const statusElement = this.matchingContainer.querySelector('#password-match-status');
        const icon = statusElement.querySelector('i');
        const span = statusElement.querySelector('span');
        
        if (isMatching) {
            icon.className = 'bi bi-check-circle-fill mr-2 text-green-500';
            span.className = 'text-green-600 dark:text-green-400 font-medium';
            span.textContent = 'Passwords match';
        } else {
            icon.className = 'bi bi-x-circle-fill mr-2 text-red-500';
            span.className = 'text-red-600 dark:text-red-400 font-medium';
            span.textContent = 'Passwords do not match';
        }
        
        return isMatching;
    }
    
    isValid() {
        const requirementsValid = this.validateRequirements();
        const matchingValid = this.validateMatching();
        return requirementsValid && matchingValid;
    }
    
    getValidationErrors() {
        const errors = [];
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        
        if (password.length < this.options.minLength) {
            errors.push(`Password must be at least ${this.options.minLength} characters long`);
        }
        
        if (this.options.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (this.options.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (this.options.requireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        if (this.options.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        
        if (password !== confirmPassword) {
            errors.push('Passwords do not match');
        }
        
        return errors;
    }
}

// Export for use in other modules
export default PasswordValidator;

// Global utility
if (typeof window !== 'undefined') {
    window.PasswordValidator = PasswordValidator;
}
