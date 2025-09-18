export class NotificationManager {
    static showNotification(message, type = 'info') {
        // Use centralized toast utility if available
        if (window.toastManager && window.toastManager.showToast) {
            window.toastManager.showToast(message, type);
        } else {
            // Fallback to console log if toast manager not available
            console.log(`Process Monitor Notification [${type}]: ${message}`);
        }
    }
}
