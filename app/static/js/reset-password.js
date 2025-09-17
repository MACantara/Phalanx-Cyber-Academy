import PasswordStrengthChecker from "./components/password-strength.js";
import PasswordValidator from "./components/password-validator.js";
import hcaptchaValidator from "./utils/hcaptcha-validator.js";
import PasswordVisibility from "./utils/password-visibility.js";

document.addEventListener("DOMContentLoaded", function () {
    // Initialize password visibility utility
    const passwordVisibility = new PasswordVisibility();
    
    // Initialize password strength checker
    const strengthChecker = new PasswordStrengthChecker("password", {
        showMeter: true,
        showFeedback: true,
        userInputs: [], // User context will be available from backend
    });

    // Initialize password validator for requirements and matching
    const passwordValidator = new PasswordValidator("password", "confirm_password", {
        showValidation: true,
        showMatching: true,
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
    });

    // Form validation on submit
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            
            // Check password validation
            if (!passwordValidator.isValid()) {
                isValid = false;
                const errors = passwordValidator.getValidationErrors();
                
                // Show first error as toast notification if available
                if (window.toastManager && errors.length > 0) {
                    window.toastManager.showToast(errors[0], 'error');
                }
            }
            
            // Check hCaptcha validation
            if (!hcaptchaValidator.validateForm(form)) {
                isValid = false;
                // hcaptchaValidator will handle showing the error
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
});
