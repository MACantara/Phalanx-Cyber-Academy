/**
 * Password strength checker using real-time validation
 */

class PasswordStrengthChecker {
    constructor(passwordInputId, options = {}) {
        this.passwordInput = document.getElementById(passwordInputId);
        this.options = {
            showMeter: true,
            showFeedback: true,
            userInputs: [],
            ...options
        };
        
        if (this.passwordInput) {
            this.init();
        }
    }
    
    init() {
        this.createStrengthMeter();
        this.setupEventListeners();
    }
    
    createStrengthMeter() {
        const container = document.createElement('div');
        container.className = 'password-strength-container mt-2';
        
        if (this.options.showMeter) {
            const meter = document.createElement('div');
            meter.className = 'password-strength-meter mb-2';
            meter.innerHTML = `
                <div class="flex space-x-1 mb-1">
                    <div class="strength-bar flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded" data-level="0"></div>
                    <div class="strength-bar flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded" data-level="1"></div>
                    <div class="strength-bar flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded" data-level="2"></div>
                    <div class="strength-bar flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded" data-level="3"></div>
                    <div class="strength-bar flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded" data-level="4"></div>
                </div>
                <div class="strength-label text-xs text-gray-500 dark:text-gray-400"></div>
            `;
            container.appendChild(meter);
        }
        
        if (this.options.showFeedback) {
            const feedback = document.createElement('div');
            feedback.className = 'password-feedback text-xs space-y-1';
            container.appendChild(feedback);
        }
        
        // Find the best insertion point - after any password visibility toggle or directly after the input
        let insertionPoint = this.passwordInput.nextSibling;
        const parentNode = this.passwordInput.parentNode;
        
        // Look for password visibility toggle button
        const toggleButton = parentNode.querySelector('.password-toggle-btn');
        if (toggleButton) {
            insertionPoint = toggleButton.nextSibling;
        }
        
        parentNode.insertBefore(container, insertionPoint);
        this.strengthContainer = container;
    }
    
    setupEventListeners() {
        this.passwordInput.addEventListener('input', (e) => {
            this.checkStrength(e.target.value);
        });
        
        this.passwordInput.addEventListener('focus', () => {
            this.strengthContainer.style.display = 'block';
        });
    }
    
    async checkStrength(password) {
        if (!password) {
            this.updateDisplay(0, 'Enter a password', []);
            return;
        }
        
        try {
            // Make request to backend for strength checking
            const response = await fetch('/api/check-password-strength', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: password,
                    user_inputs: this.options.userInputs
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.updateDisplay(
                    result.score,
                    `${result.strength} - Crack time: ${result.crack_time}`,
                    result.feedback
                );
            } else {
                // Fallback to basic client-side checking
                this.basicStrengthCheck(password);
            }
        } catch (error) {
            // Fallback to basic client-side checking
            this.basicStrengthCheck(password);
        }
    }
    
    basicStrengthCheck(password) {
        let score = 0;
        let feedback = [];
        
        // Start with score 1 for any password that exists (so "very weak" shows up)
        if (password.length > 0) score = 0;
        
        if (password.length >= 8) score++;
        else feedback.push('Use at least 8 characters');
        
        if (/[a-z]/.test(password)) score++;
        else feedback.push('Add lowercase letters');
        
        if (/[A-Z]/.test(password)) score++;
        else feedback.push('Add uppercase letters');
        
        if (/\d/.test(password)) score++;
        else feedback.push('Add numbers');
        
        if (/[^A-Za-z0-9]/.test(password)) score++;
        else feedback.push('Add special characters');
        
        // Cap the score at 5, but map to 0-4 scale for display
        const displayScore = Math.min(score - 1, 4);
        const strengthLabels = ['Very weak', 'Weak', 'Fair', 'Good', 'Very strong'];
        const label = strengthLabels[displayScore] || 'Very weak';
        
        this.updateDisplay(displayScore + 1, label, { suggestions: feedback });
    }
    
    updateDisplay(score, label, feedback) {
        // Update strength meter
        const bars = this.strengthContainer.querySelectorAll('.strength-bar');
        const colors = [
            'bg-red-500',      // Very weak
            'bg-orange-500',   // Weak
            'bg-yellow-500',   // Fair
            'bg-blue-500',     // Good
            'bg-purple-500'    // Very strong
        ];
        
        bars.forEach((bar, index) => {
            // Reset classes
            bar.className = 'strength-bar flex-1 h-1 rounded';
            
            if (index < score && score > 0) {
                bar.classList.add(colors[score - 1]);
            } else {
                bar.classList.add('bg-gray-200', 'dark:bg-gray-700');
            }
        });
        
        // Update label
        const labelEl = this.strengthContainer.querySelector('.strength-label');
        if (labelEl) {
            labelEl.textContent = label;
            labelEl.className = `strength-label text-xs ${this.getLabelColor(score)}`;
        }
        
        // Update feedback
        const feedbackEl = this.strengthContainer.querySelector('.password-feedback');
        if (feedbackEl && feedback) {
            let feedbackHtml = '';
            
            if (feedback.warning) {
                feedbackHtml += `<div class="text-orange-600 dark:text-orange-400">${feedback.warning}</div>`;
            }
            
            if (feedback.suggestions && feedback.suggestions.length > 0) {
                feedback.suggestions.slice(0, 3).forEach(suggestion => {
                    feedbackHtml += `<div class="text-gray-600 dark:text-gray-400">• ${suggestion}</div>`;
                });
            }
            
            feedbackEl.innerHTML = feedbackHtml;
        }
    }
    
    getLabelColor(score) {
        const colors = [
            'text-red-600 dark:text-red-400',      // Very weak
            'text-orange-600 dark:text-orange-400', // Weak
            'text-yellow-600 dark:text-yellow-400', // Fair
            'text-blue-600 dark:text-blue-400',     // Good
            'text-purple-600 dark:text-purple-400'  // Very strong
        ];
        return colors[score - 1] || colors[0];
    }
    
    setUserInputs(inputs) {
        this.options.userInputs = inputs;
    }
}

// Export for use in other modules
export default PasswordStrengthChecker;

// Global utility
if (typeof window !== 'undefined') {
    window.PasswordStrengthChecker = PasswordStrengthChecker;
}
