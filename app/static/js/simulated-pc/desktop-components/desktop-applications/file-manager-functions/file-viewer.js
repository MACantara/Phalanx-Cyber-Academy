import { ViewerFactory } from './viewer-factory.js';
import { WindowTracker } from './window-tracker.js';
import { FileTypeDetector } from './file-type-detector.js';

export class FileViewer {
    constructor(fileManagerApp) {
        this.fileManagerApp = fileManagerApp;
        this.windowTracker = new WindowTracker();
    }

    async openFile(fileName, fileData) {
        // Get the window manager from the desktop
        const desktop = this.getDesktop();
        if (!desktop || !desktop.windowManager) {
            console.error('Window manager not available');
            return;
        }

        // Check if this file is already open
        if (this.windowTracker.bringWindowToFront(fileName, desktop)) {
            return; // File is already open, brought to front
        }

        try {
            // Get file content
            const fileContent = this.fileManagerApp.navigator.getFileContent(fileName);
            
            // Create appropriate viewer using factory
            const fileViewerApp = await ViewerFactory.createViewer(fileName, fileData, fileContent);
            
            // Create unique window ID
            const windowId = this.windowTracker.generateWindowId(fileName);
            
            // Create the window using window manager
            const windowElement = desktop.windowManager.createWindow(
                windowId, 
                fileViewerApp.title, 
                fileViewerApp
            );
            
            // Track the window and setup close handling
            this.windowTracker.trackWindow(fileName, windowElement, fileViewerApp);
            this.windowTracker.setupWindowCloseTracking(windowId, windowElement, desktop);
            
        } catch (error) {
            console.error('Failed to open file viewer:', error);
            this.showError(`Failed to open ${fileName}: ${error.message}`);
        }
    }

    showError(message) {
        // Use centralized toast utility if available
        if (window.toastManager && window.toastManager.showToast) {
            window.toastManager.showToast(message, 'error');
        } else {
            // Fallback to console log if toast manager not available
            console.log(`File Viewer Error: ${message}`);
        }
    }

    getDesktop() {
        // Try to get desktop from window manager hierarchy
        const container = this.fileManagerApp.windowElement?.closest('.relative');
        if (container && container.desktop) {
            return container.desktop;
        }
        
        // Fallback: try to get from global scope
        if (window.currentSimulation && window.currentSimulation.desktop) {
            return window.currentSimulation.desktop;
        }
        
        return null;
    }

    closeViewer() {
        const desktop = this.getDesktop();
        this.windowTracker.closeAllWindows(desktop);
    }

    getOpenFileCount() {
        return this.windowTracker.getOpenFileCount();
    }

    isFileOpen(fileName) {
        return this.windowTracker.isFileOpen(fileName);
    }

    getAllOpenFiles() {
        return this.windowTracker.getAllOpenWindows().map(windowId => {
            const metadata = this.windowTracker.getWindowMetadata(windowId);
            return {
                fileName: metadata?.fileName,
                windowId,
                openedAt: metadata?.openedAt,
                fileType: FileTypeDetector.getFileType(metadata?.fileName || ''),
                securityRisk: FileTypeDetector.getSecurityRisk(metadata?.fileName || '', {})
            };
        });
    }

    getFileTypeInfo(fileName) {
        return {
            type: FileTypeDetector.getFileType(fileName),
            category: FileTypeDetector.getFileCategory(fileName),
            isSupported: ViewerFactory.isTypeSupported(fileName),
            supportedTypes: ViewerFactory.getSupportedTypes()
        };
    }

    // Utility methods for file type detection (exposed for external use)
    static isImageFile(fileName) {
        return FileTypeDetector.isImageFile(fileName);
    }

    static isLogFile(fileName) {
        return FileTypeDetector.isLogFile(fileName);
    }

    static getFileType(fileName) {
        return FileTypeDetector.getFileType(fileName);
    }
}