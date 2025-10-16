export class ShutdownSequence {
    constructor(container) {
        this.container = container;
        this.shutdownLines = [
            { text: 'Initiating secure shutdown sequence...', type: 'info', delay: 30 },
            { text: 'Saving user session data', type: 'info', delay: 40, hasStatus: true, status: '[  OK  ]' },
            { text: 'Closing active applications', type: 'info', delay: 30, hasStatus: true, status: '[  OK  ]' },
            { text: '', type: 'info', delay: 10 },
            { text: 'Securing sensitive training data', type: 'warning', delay: 50, hasStatus: true, status: '[  OK  ]' },
            { text: 'Clearing temporary security logs', type: 'info', delay: 30, hasStatus: true, status: '[  OK  ]' },
            { text: 'Encrypting session artifacts', type: 'info', delay: 40, hasStatus: true, status: '[  OK  ]' },
            { text: '', type: 'info', delay: 10 },
            { text: 'Stopping security services', type: 'success', delay: 40, hasStatus: true, status: '[  OK  ]' },
            { text: 'Stopping Network Manager', type: 'success', delay: 20, hasStatus: false },
            { text: 'Stopping Firewall Protection', type: 'success', delay: 20, hasStatus: false },
            { text: 'Stopping Intrusion Detection System', type: 'success', delay: 20, hasStatus: false },
            { text: 'Stopping Security Monitor Service', type: 'success', delay: 20, hasStatus: false },
            { text: '', type: 'info', delay: 10 },
            { text: 'Finalizing training session data', type: 'info', delay: 40, hasStatus: true, status: '[  OK  ]' },
            { text: 'Uploading progress to secure cloud storage', type: 'info', delay: 60, hasStatus: true, status: '[  OK  ]' },
            { text: 'Verifying data integrity', type: 'info', delay: 30, hasStatus: true, status: '[  OK  ]' },
            { text: '', type: 'info', delay: 30 },
            { text: 'Thank you for training with Phalanx Cyber Academy Academy', type: 'success', delay: 50 },
            { text: 'Your progress has been securely saved', type: 'info', delay: 30 },
            { text: 'System shutdown complete', type: 'success', delay: 40 },
            { text: '', type: 'info', delay: 100 }
        ];
        this.currentLine = 0;
        this.setupContainer();
    }

    setupContainer() {
        // Set up container with Tailwind classes - ensure proper scrolling and responsive design
        this.container.className = 'fixed inset-0 bg-black text-green-400 font-mono text-xs sm:text-sm leading-relaxed p-2 sm:p-4 md:p-6 lg:p-10 overflow-y-auto flex flex-col justify-start items-start';
        // Ensure container can scroll
        this.container.style.overflowY = 'auto';
        this.container.style.height = '100vh';
    }

    async start() {
        return new Promise((resolve) => {
            this.container.innerHTML = '';
            this.displayNextLine(resolve);
        });
    }

    displayNextLine(onComplete) {
        if (this.currentLine >= this.shutdownLines.length) {
            // Add blinking cursor briefly, then fade out only the text content
            const cursor = document.createElement('span');
            cursor.className = 'inline-block w-2 h-3.5 bg-green-400 boot-cursor';
            this.container.appendChild(cursor);
            
            setTimeout(() => {
                // Create a wrapper for all text content to fade out
                const textContent = document.createElement('div');
                textContent.className = 'transition-opacity duration-1000 ease-out';
                
                // Move all existing content into the wrapper
                while (this.container.firstChild) {
                    textContent.appendChild(this.container.firstChild);
                }
                this.container.appendChild(textContent);
                
                // Fade out only the text content, keep background
                setTimeout(() => {
                    textContent.style.opacity = '0';
                    
                    setTimeout(() => {
                        onComplete();
                    }, 1000);
                }, 100);
            }, 200);
            return;
        }

        const line = this.shutdownLines[this.currentLine];
        const lineElement = document.createElement('div');
        
        // Apply styling based on line type
        let typeClasses = '';
        switch(line.type) {
            case 'success':
                typeClasses = 'text-green-400';
                break;
            case 'warning':
                typeClasses = 'text-yellow-400';
                break;
            case 'error':
                typeClasses = 'text-red-400';
                break;
            default:
                typeClasses = 'text-green-400';
        }
        
        lineElement.className = `shutdown-line mb-0.5 whitespace-pre-wrap ${typeClasses}`;
        
        this.container.appendChild(lineElement);
        
        // Auto-scroll to bottom to keep content visible
        this.scrollToBottom();
        
        // Display the line instantly
        if (line.text.trim() !== '') {
            if (line.hasStatus) {
                // For lines with status, show text, brief loading, then status
                lineElement.textContent = line.text;
                
                this.showQuickStatus(lineElement, line, () => {
                    this.currentLine++;
                    setTimeout(() => {
                        this.displayNextLine(onComplete);
                    }, line.delay);
                });
            } else {
                // For regular lines, display instantly
                lineElement.textContent = line.text;
                
                this.currentLine++;
                setTimeout(() => {
                    this.displayNextLine(onComplete);
                }, line.delay);
            }
        } else {
            // For empty lines, just move to next immediately
            this.currentLine++;
            setTimeout(() => {
                this.displayNextLine(onComplete);
            }, line.delay);
        }
    }

    showQuickStatus(element, line, onComplete) {
        // Add quick loading dots
        const dotsElement = document.createElement('span');
        dotsElement.className = 'loading-dots ml-2 text-green-400';
        element.appendChild(dotsElement);
        
        // Show dots very briefly for SSD-like speed
        let dotCount = 0;
        const maxDots = 2; // Reduced dots for faster loading
        const dotInterval = 30; // Very fast dots
        
        const addDot = () => {
            if (dotCount < maxDots) {
                dotsElement.textContent += '.';
                dotCount++;
                setTimeout(addDot, dotInterval);
            } else {
                // Replace dots with status after minimal delay
                setTimeout(() => {
                    dotsElement.remove();
                    
                    // Add status with appropriate color
                    const statusElement = document.createElement('span');
                    statusElement.className = 'ml-4 font-bold';
                    
                    if (line.status === '[ WARN ]') {
                        statusElement.className += ' text-yellow-400';
                    } else if (line.status === '[ FAIL ]') {
                        statusElement.className += ' text-red-400';
                    } else {
                        statusElement.className += ' text-green-400';
                    }
                    
                    statusElement.textContent = line.status;
                    element.appendChild(statusElement);
                    
                    onComplete();
                }, 40); // Minimal delay
            }
        };
        
        setTimeout(addDot, 20); // Start quickly
    }

    scrollToBottom() {
        // Smooth scroll to bottom for better UX
        this.container.scrollTo({
            top: this.container.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Static method to create and run shutdown sequence
    static async runShutdown(container) {
        const shutdownSequence = new ShutdownSequence(container);
        return await shutdownSequence.start();
    }
}
