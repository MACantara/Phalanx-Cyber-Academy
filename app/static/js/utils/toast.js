/**
 * Toast notification handler
 * Handles auto-dismiss and manual close functionality for flash messages
 */

class ToastManager {
    constructor() {
        this.autoHideDelay = 5000; // 5 seconds
        this.init();
    }

    init() {
        this.setupToastListeners();
        this.startAutoHideTimers();
    }

    setupToastListeners() {
        // Handle manual close buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-dismiss-toast]')) {
                const toast = e.target.closest('[data-flash-toast]');
                this.hideToast(toast);
            }
        });
    }

    startAutoHideTimers() {
        const toasts = document.querySelectorAll('[data-flash-toast]');
        toasts.forEach((toast) => {
            const category = toast.dataset.category;
            
            // Don't auto-hide error messages
            if (category === 'error') return;
            
            setTimeout(() => {
                this.hideToast(toast);
            }, this.autoHideDelay);
        });
    }

    hideToast(toast) {
        if (!toast) return;
        
        // Add fade out animation
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'opacity 300ms ease-out, transform 300ms ease-out';
        
        // Remove from DOM after animation
        setTimeout(() => {
            toast.remove();
            
            // Remove container if no toasts left
            const container = document.getElementById('toast-container');
            if (container && container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }

    // Public method to create new toasts dynamically
    showToast(message, category = 'info') {
        const container = this.getOrCreateContainer();
        const toast = this.createToastElement(message, category);
        container.appendChild(toast);
        
        // Start auto-hide timer for new toast
        if (category !== 'error') {
            setTimeout(() => {
                this.hideToast(toast);
            }, this.autoHideDelay);
        }
    }

    getOrCreateContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed top-4 right-4 z-50 space-y-3 max-w-sm';
            document.body.appendChild(container);
        }
        return container;
    }

    createToastElement(message, category) {
        const toast = document.createElement('div');
        const icons = {
            success: 'bi-check-circle-fill',
            error: 'bi-exclamation-triangle-fill',
            warning: 'bi-exclamation-circle-fill',
            info: 'bi-info-circle-fill'
        };

        const colors = {
            success: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/90 dark:to-emerald-900/90 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700',
            error: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/90 dark:to-rose-900/90 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700',
            warning: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/90 dark:to-amber-900/90 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700',
            info: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/90 dark:to-indigo-900/90 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700'
        };

        const buttonColors = {
            success: 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200',
            error: 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200',
            warning: 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200',
            info: 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200'
        };

        toast.className = `flex items-center justify-between p-4 text-sm rounded-xl shadow-lg animate-slide-in-right ${colors[category] || colors.info}`;
        toast.setAttribute('data-flash-toast', '');
        toast.setAttribute('data-category', category);

        toast.innerHTML = `
            <div class="flex items-center">
                <i class="bi ${icons[category] || icons.info} mr-2 ${buttonColors[category] || buttonColors.info}"></i>
                <span class="font-medium">${message}</span>
            </div>
            <button type="button" class="ml-4 text-lg font-bold cursor-pointer hover:scale-110 transition-transform duration-200 ${buttonColors[category] || buttonColors.info}" data-dismiss-toast>
                <i class="bi bi-x"></i>
            </button>
        `;

        return toast;
    }
}

// Initialize toast manager when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.toastManager = new ToastManager();
    });
} else {
    window.toastManager = new ToastManager();
}

// Export for use in other modules
export default ToastManager;
