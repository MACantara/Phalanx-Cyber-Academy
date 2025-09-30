export class SkipDialogueModal {
    constructor(container) {
        this.container = container;
        this.modal = null;
        this.isVisible = false;
    }

    show() {
        return new Promise((resolve) => {
            if (this.isVisible) return;

            this.createModal();
            this.bindEvents(resolve);
            this.animateIn();
            this.isVisible = true;
        });
    }

    createModal() {
        // Create backdrop
        this.modal = document.createElement('div');
        this.modal.className = 'fixed inset-0 bg-black/75 flex items-center justify-center z-[10001] opacity-0 transition-opacity duration-300 p-4';
        
        // Create modal content
        this.modal.innerHTML = `
            <div class="bg-gray-800 border border-gray-600 shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto transform scale-90 transition-transform duration-300 rounded overflow-hidden" id="modal-content">
                <div class="bg-gray-700 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-600">
                    <div class="flex items-center space-x-2 sm:space-x-3">
                        <i class="bi bi-question-circle text-green-400 text-lg sm:text-xl flex-shrink-0"></i>
                        <h3 class="text-base sm:text-lg font-semibold text-white truncate">Skip Dialogue</h3>
                    </div>
                </div>
                
                <div class="p-4 sm:p-6 bg-gray-800 max-h-[70vh] overflow-y-auto">
                    <div class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                        <div class="bg-gray-700 border border-gray-600 p-2 sm:p-3 rounded flex-shrink-0 self-start">
                            <i class="bi bi-chat-left-text text-green-400 text-xl sm:text-2xl"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-gray-300 mb-2 font-medium text-sm sm:text-base">
                                Are you sure you want to skip this dialogue?
                            </p>
                            <p class="text-gray-400 text-xs sm:text-sm">
                                This dialogue may contain important story information or instructions.
                            </p>
                        </div>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row gap-3 sm:gap-3 sm:justify-end">
                        <button 
                            id="cancel-skip" 
                            class="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-600 text-white border border-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 font-mono text-xs sm:text-sm cursor-pointer rounded touch-manipulation"
                        >
                            <i class="bi bi-arrow-left mr-1"></i><span class="hidden sm:inline">Continue Reading</span><span class="sm:hidden">Continue</span>
                        </button>
                        <button 
                            id="confirm-skip" 
                            class="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-700 hover:bg-green-400 hover:text-black active:bg-green-500 active:text-black text-white border border-gray-600 hover:border-green-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 font-mono text-xs sm:text-sm hover:shadow-lg cursor-pointer rounded touch-manipulation"
                        >
                            <i class="bi bi-skip-end mr-1"></i><span class="hidden sm:inline">Skip Dialogue</span><span class="sm:hidden">Skip</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.container.appendChild(this.modal);
    }

    bindEvents(resolve) {
        const cancelBtn = this.modal.querySelector('#cancel-skip');
        const confirmBtn = this.modal.querySelector('#confirm-skip');
        
        // Cancel button
        cancelBtn.addEventListener('click', () => {
            this.hide();
            resolve(false);
        });
        
        // Touch support for cancel button
        cancelBtn.addEventListener('touchstart', () => {
            this.hide();
            resolve(false);
        }, { passive: true });
        
        // Confirm button
        confirmBtn.addEventListener('click', () => {
            this.hide();
            resolve(true);
        });
        
        // Touch support for confirm button
        confirmBtn.addEventListener('touchstart', () => {
            this.hide();
            resolve(true);
        }, { passive: true });
        
        // Click outside to cancel
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
                resolve(false);
            }
        });
        
        // Escape key to cancel
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleKeyDown);
                this.hide();
                resolve(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        
        // Focus on cancel button by default for safety
        setTimeout(() => {
            cancelBtn.focus();
        }, 100);
    }

    animateIn() {
        setTimeout(() => {
            this.modal.classList.remove('opacity-0');
            const content = this.modal.querySelector('#modal-content');
            content.classList.remove('scale-90');
            content.classList.add('scale-100');
        }, 10);
    }

    hide() {
        if (!this.isVisible) return;
        
        this.modal.classList.add('opacity-0');
        const content = this.modal.querySelector('#modal-content');
        content.classList.remove('scale-100');
        content.classList.add('scale-90');
        
        setTimeout(() => {
            if (this.modal && this.modal.parentNode) {
                this.modal.parentNode.removeChild(this.modal);
            }
            this.modal = null;
            this.isVisible = false;
        }, 300);
    }
}
