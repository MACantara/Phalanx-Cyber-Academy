/**
 * CSRF Utilities for Phalanx Cyber Academy
 * Provides helper functions for handling CSRF tokens in AJAX requests
 */

class CSRFUtils {
    constructor() {
        this.token = null;
        this.init();
    }

    init() {
        // Get CSRF token from meta tag
        this.token = this.getTokenFromMeta();
        
        // Setup AJAX defaults if jQuery is available
        if (typeof $ !== 'undefined') {
            this.setupJqueryDefaults();
        }
        
        // Setup fetch defaults
        this.setupFetchDefaults();
    }

    /**
     * Get CSRF token from meta tag
     * @returns {string|null} CSRF token or null if not found
     */
    getTokenFromMeta() {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag ? metaTag.getAttribute('content') : null;
    }

    /**
     * Get CSRF token from hidden form input
     * @param {HTMLFormElement} form - Form element to search
     * @returns {string|null} CSRF token or null if not found
     */
    getTokenFromForm(form) {
        const tokenInput = form.querySelector('input[name="csrf_token"]');
        return tokenInput ? tokenInput.value : null;
    }

    /**
     * Get current CSRF token
     * @returns {string|null} Current CSRF token
     */
    getToken() {
        // Try to get fresh token from meta tag first
        const freshToken = this.getTokenFromMeta();
        return freshToken || this.token;
    }

    /**
     * Setup jQuery AJAX defaults to include CSRF token
     */
    setupJqueryDefaults() {
        const self = this;
        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                    const token = self.getToken();
                    if (token) {
                        xhr.setRequestHeader("X-CSRFToken", token);
                    }
                }
            }
        });
    }

    /**
     * Setup fetch wrapper to include CSRF token
     */
    setupFetchDefaults() {
        const self = this;
        
        // Store original fetch
        const originalFetch = window.fetch;
        
        // Override fetch
        window.fetch = function(url, options = {}) {
            // Only add CSRF token for non-GET requests
            if (!options.method || !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(options.method.toUpperCase())) {
                const token = self.getToken();
                if (token) {
                    options.headers = options.headers || {};
                    options.headers['X-CSRFToken'] = token;
                }
            }
            
            return originalFetch(url, options);
        };
    }

    /**
     * Add CSRF token to FormData
     * @param {FormData} formData - FormData to modify
     * @returns {FormData} Modified FormData with CSRF token
     */
    addTokenToFormData(formData) {
        const token = this.getToken();
        if (token) {
            formData.append('csrf_token', token);
        }
        return formData;
    }

    /**
     * Create headers object with CSRF token
     * @param {Object} additionalHeaders - Additional headers to include
     * @returns {Object} Headers object with CSRF token
     */
    createHeaders(additionalHeaders = {}) {
        const headers = { ...additionalHeaders };
        const token = this.getToken();
        if (token) {
            headers['X-CSRFToken'] = token;
        }
        return headers;
    }

    /**
     * Make a safe AJAX request with CSRF token
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise} Fetch promise
     */
    async safeFetch(url, options = {}) {
        const token = this.getToken();
        
        if (!options.method || !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(options.method.toUpperCase())) {
            options.headers = options.headers || {};
            if (token) {
                options.headers['X-CSRFToken'] = token;
            }
        }
        
        try {
            const response = await fetch(url, options);
            
            // Handle CSRF errors
            if (response.status === 400 && response.headers.get('content-type')?.includes('application/json')) {
                const data = await response.clone().json();
                if (data.error && data.error.includes('CSRF')) {
                    console.warn('CSRF token validation failed, attempting to refresh token');
                    // Refresh token and retry once
                    this.token = this.getTokenFromMeta();
                    if (this.token && this.token !== token) {
                        options.headers['X-CSRFToken'] = this.token;
                        return fetch(url, options);
                    }
                }
            }
            
            return response;
        } catch (error) {
            console.error('CSRF-safe fetch error:', error);
            throw error;
        }
    }

    /**
     * Refresh CSRF token from server
     * @returns {Promise<boolean>} True if token was refreshed successfully
     */
    async refreshToken() {
        try {
            const response = await fetch('/api/csrf-token', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.csrf_token) {
                    this.token = data.csrf_token;
                    
                    // Update meta tag if it exists
                    const metaTag = document.querySelector('meta[name="csrf-token"]');
                    if (metaTag) {
                        metaTag.setAttribute('content', this.token);
                    }
                    
                    return true;
                }
            }
        } catch (error) {
            console.error('Failed to refresh CSRF token:', error);
        }
        
        return false;
    }
}

// Create and export singleton instance
const csrfUtils = new CSRFUtils();
export default csrfUtils;

// Also make available globally for non-module usage
window.csrfUtils = csrfUtils;
