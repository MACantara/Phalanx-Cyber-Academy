export class DesktopIcons {
    constructor(container, windowManager, levelId = null) {
        this.container = container;
        this.windowManager = windowManager;
        this.levelId = levelId;
        this.selectedIcon = null;
        
        // All available icons
        this.allIcons = [
            { id: 'browser', name: 'Web Browser', icon: 'bi-globe', action: 'openBrowser' },
            { id: 'terminal', name: 'Terminal', icon: 'bi-terminal', action: 'openTerminal' },
            { id: 'files', name: 'File Manager', icon: 'bi-folder', action: 'openFileManager' },
            { id: 'email', name: 'Email Client', icon: 'bi-envelope', action: 'openEmailClient' },
            { id: 'wireshark', name: 'Network Monitor', icon: 'bi-router', action: 'openNetworkMonitor' },
            { id: 'logs', name: 'System Logs', icon: 'bi-journal-text', action: 'openSystemLogs' },
            { id: 'process-monitor', name: 'Process Monitor', icon: 'bi-cpu', action: 'openProcessMonitor' },
            { id: 'malware-scanner', name: 'Malware Scanner', icon: 'bi-shield-exclamation', action: 'openMalwareScanner' },
            { id: 'ransomware-decryptor', name: 'Ransomware Decryptor', icon: 'bi-unlock', action: 'openRansomwareDecryptor' }
        ];
        
        // Set level-specific icons
        this.icons = this.getLevelSpecificIcons();
        this.init();
    }

    getLevelSpecificIcons() {
        // Define which icons are available for each level
        const levelIconMap = {
            1: ['browser'], // Level 1: Misinformation Maze
            2: ['email'], // Level 2: Shadow in the Inbox
            3: ['malware-scanner', 'process-monitor', 'ransomware-decryptor'], // Level 3: Malware Mayhem
            4: ['terminal'], // Level 4: White Hat Test
            5: ['files', 'terminal', 'logs'] // Level 5: Hunt for The Null
        };

        // Get level-specific icon IDs
        const levelIconIds = levelIconMap[this.levelId] || [];
        
        // Filter all icons to only include those for this level
        return this.allIcons.filter(icon => levelIconIds.includes(icon.id));
    }

    init() {
        this.createIcons();
        this.bindEvents();
    }

    createIcons() {
        this.iconsContainer = document.createElement('div');
        this.iconsContainer.className = 'absolute top-5 left-5 flex flex-wrap flex-col';
        this.iconsContainer.style.height = 'calc(100vh - 100px)'; // Reserve space for taskbar + padding
        this.iconsContainer.innerHTML = this.generateIconsHTML();
        this.container.appendChild(this.iconsContainer);
    }

    generateIconsHTML() {
        return this.icons.map(icon => `
            <div class="desktop-icon flex flex-col items-center w-20 cursor-pointer p-2.5 rounded hover:bg-white/25 transition-all duration-200 mb-4" data-action="${icon.action}" data-id="${icon.id}">
                <div class="w-12 h-12 bg-green-400 border-2 border-gray-600 rounded flex items-center justify-center text-2xl text-black mb-1 shadow-lg">
                    <i class="bi ${icon.icon}"></i>
                </div>
                <div class="text-xs text-center text-white text-shadow-sm max-w-[70px] break-words leading-tight">${icon.name}</div>
            </div>
        `).join('');
    }

    bindEvents() {
        // Handle window resize to reposition icons
        window.addEventListener('resize', () => {
            this.repositionIcons();
        });
        
        // Handle icon clicks
        this.iconsContainer.addEventListener('click', (e) => {
            const iconElement = e.target.closest('.desktop-icon');
            if (iconElement) {
                const action = iconElement.getAttribute('data-action');
                if (action && this.windowManager && typeof this.windowManager[action] === 'function') {
                    this.windowManager[action]();
                }
            }
        });
    }
    
    repositionIcons() {
        // Regenerate the layout when window is resized
        this.iconsContainer.innerHTML = this.generateIconsHTML();
    }

    selectIcon(icon) {
        this.clearSelection();
        icon.classList.add('bg-green-400/50', 'border', 'border-green-400', 'border-opacity-75');
        this.selectedIcon = icon;
    }

    clearSelection() {
        if (this.selectedIcon) {
            this.selectedIcon.classList.remove('bg-green-400/50', 'border', 'border-green-400', 'border-opacity-75');
            this.selectedIcon = null;
        }
    }
}
