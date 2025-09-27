/**
 * BaseModalComponent - Simple base class for modal dialogs
 */
export class BaseModalComponent {
    constructor() {
        this.modalElement = null;
        this.overlayElement = null;
    }

    /**
     * Show a modal with the given title and content
     * @param {string} title - Modal title
     * @param {string} content - Modal HTML content
     */
    showModal(title, content) {
        // Remove any existing modal first
        this.closeModal();

        // Create overlay
        this.overlayElement = document.createElement('div');
        this.overlayElement.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        this.overlayElement.onclick = (e) => {
            if (e.target === this.overlayElement) {
                this.closeModal();
            }
        };

        // Create modal
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto';
        this.modalElement.innerHTML = `
            <div class="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 class="text-xl font-bold text-white">${title}</h2>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
            <div class="modal-content">
                ${content}
            </div>
        `;

        this.overlayElement.appendChild(this.modalElement);
        document.body.appendChild(this.overlayElement);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close the modal
     */
    closeModal() {
        if (this.overlayElement) {
            this.overlayElement.remove();
            this.overlayElement = null;
            this.modalElement = null;
            
            // Restore body scroll
            document.body.style.overflow = '';
        }
    }

    /**
     * Check if modal is currently open
     */
    isOpen() {
        return this.overlayElement !== null && document.body.contains(this.overlayElement);
    }
}