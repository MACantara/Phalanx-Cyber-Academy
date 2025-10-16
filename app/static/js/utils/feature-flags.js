/**
 * Feature Flags Utility
 * Client-side feature flag checking
 */

export class FeatureFlags {
    constructor() {
        this.features = null;
        this.initialized = false;
    }

    /**
     * Initialize feature flags from server
     */
    async init() {
        if (this.initialized) return;

        try {
            const response = await fetch('/api/features/status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });

            if (response.ok) {
                const data = await response.json();
                this.features = data.features;
                this.environment = data.environment;
                this.initialized = true;
                console.log('Feature flags loaded:', this.features);
            }
        } catch (error) {
            console.warn('Failed to load feature flags:', error);
            // Set defaults if API fails
            this.features = {
                EMAIL_VERIFICATION: true,
                LOGIN_ATTEMPTS: true,
                ADMIN_PANEL: true
            };
            this.initialized = true;
        }
    }

    /**
     * Check if a feature is enabled
     * @param {string} featureName - Name of the feature to check
     * @returns {boolean} Whether the feature is enabled
     */
    isEnabled(featureName) {
        if (!this.initialized) {
            console.warn('Feature flags not initialized');
            return true; // Default to enabled if not initialized
        }

        return this.features[featureName] === true;
    }

    /**
     * Get all feature flags
     * @returns {Object} All feature flags
     */
    getAll() {
        return this.features || {};
    }

    /**
     * Check if we're in development environment
     * @returns {boolean} Whether in development
     */
    isDevelopment() {
        return this.environment === 'development';
    }

    /**
     * Check if we're in production environment
     * @returns {boolean} Whether in production
     */
    isProduction() {
        return this.environment === 'production';
    }
}

// Create and export singleton instance
const featureFlags = new FeatureFlags();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => featureFlags.init());
} else {
    featureFlags.init();
}

export default featureFlags;

// Global export for non-module usage
if (typeof window !== 'undefined') {
    window.featureFlags = featureFlags;
}
