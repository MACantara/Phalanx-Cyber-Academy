export class BootSequence {
    constructor(container) {
        this.container = container;
        this.bootLines = [
            { text: 'CyberQuest Security Training Environment v2.1.0', type: 'info', delay: 30 },
            { text: 'Copyright (c) 2025 CyberQuest Training Systems', type: 'info', delay: 30 },
            { text: '', type: 'info', delay: 10 },
            { text: 'Initializing secure training environment', type: 'info', delay: 50, hasStatus: true, status: '[  OK  ]' },
            { text: 'Loading kernel modules and core services', type: 'info', delay: 60, hasStatus: true, status: '[  OK  ]' },
            { text: '', type: 'info', delay: 10 },
            { text: 'Starting security services', type: 'success', delay: 40, hasStatus: true, status: '[  OK  ]', bundle: 'security' },
            { text: 'Loading Network Manager', type: 'success', delay: 20, hasStatus: false, bundle: 'security' },
            { text: 'Loading Firewall Protection', type: 'success', delay: 20, hasStatus: false, bundle: 'security' },
            { text: 'Loading Intrusion Detection System', type: 'success', delay: 20, hasStatus: false, bundle: 'security' },
            { text: 'Loading Security Monitor Service', type: 'success', delay: 20, hasStatus: false, bundle: 'security' },
            { text: 'Scanning for network devices', type: 'warning', delay: 50, hasStatus: true, status: '[ WARN ]' },
            { text: 'Running security scan', type: 'success', delay: 40, hasStatus: true, status: '[  OK  ]' },
            { text: '', type: 'info', delay: 10 },
            { text: 'Preparing training environment', type: 'info', delay: 40, hasStatus: true, status: '[  OK  ]', bundle: 'training' },
            { text: 'Loading scenario data', type: 'info', delay: 20, hasStatus: false, bundle: 'training' },
            { text: 'Preparing virtual environment', type: 'info', delay: 20, hasStatus: false, bundle: 'training' },
            { text: 'Finalizing training setup', type: 'success', delay: 30, hasStatus: false, bundle: 'training' },
            { text: '', type: 'info', delay: 30 },
            { text: 'Welcome to the CyberQuest Training Lab', type: 'success', delay: 50 },
            { text: 'Type "help" for available commands', type: 'info', delay: 30 },
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

    displayNextLine(onComplete) {
        if (this.currentLine >= this.bootLines.length) {
            // Add blinking cursor
            const cursor = document.createElement('span');
            cursor.className = 'inline-block w-2 h-3.5 bg-green-400 boot-cursor';
            this.container.appendChild(cursor);
            
            setTimeout(() => {
                onComplete();
            }, 200);
            return;
        }

        const line = this.bootLines[this.currentLine];
        const lineElement = document.createElement('div');
        
        // Apply Tailwind classes based on line type
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
        
        lineElement.className = `boot-line mb-0.5 whitespace-pre-wrap ${typeClasses}`;
        
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
                // For bundled items, display instantly
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

    async start() {
        return new Promise((resolve) => {
            this.container.innerHTML = '';
            this.displayNextLine(resolve);
        });
    }

    scrollToBottom() {
        // Smooth scroll to bottom for better UX
        this.container.scrollTo({
            top: this.container.scrollHeight,
            behavior: 'smooth'
        });
    }
}