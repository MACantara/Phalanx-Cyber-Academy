import { WindowBase } from '../../../desktop-components/window-base.js';
import { level3DataManager } from '../data/index.js';
import { getApplicationLauncher } from '../../../desktop-components/application-launcher.js';

export class RansomwareDecryptorApp extends WindowBase {
    constructor() {
        super('ransomware-decryptor', 'Ransomware Decryptor', {
            width: '75%',
            height: '80%'
        });
        
        this.encryptedFiles = [];
        this.availableFiles = []; // Files available but not yet scanned
        this.isScanning = false;
        this.isDecrypting = false;
        this.decryptedFiles = new Set();
        this.scanProgress = 0;
        this.decryptionProgress = 0;
        this.timer = window.level3Timer;
        this.hasScanned = false; // Track if initial scan has been performed
        
        // Start gradual damage while files remain encrypted
        this.damageInterval = null;
        this.startGradualDamage();
        
        this.loadAvailableFiles();
    }

    async loadAvailableFiles() {
        await level3DataManager.loadData();
        this.availableFiles = level3DataManager.getEncryptedFiles();
        this.updateContent();
    }

    createContent() {
        const totalFiles = this.encryptedFiles.length;
        const decryptedCount = this.decryptedFiles.size;
        const encryptedCount = totalFiles - decryptedCount;
        
        return `
            <div class="h-full flex flex-col bg-gray-900 text-white">
                <!-- Header -->
                <div class="bg-green-800 px-3 sm:px-4 py-3 border-b border-gray-700">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <div class="flex items-center space-x-2 sm:space-x-3">
                            <i class="bi bi-unlock text-xl sm:text-2xl text-white"></i>
                            <div>
                                <h2 class="text-base sm:text-lg font-bold text-white">Ransomware Recovery Tool</h2>
                                <p class="text-xs sm:text-sm text-white">Level 3 - Restore Encrypted Files</p>
                            </div>
                        </div>
                        <div class="text-left sm:text-right text-xs sm:text-sm">
                            <div class="text-white">Encrypted: ${encryptedCount} | Recovered: ${decryptedCount}</div>
                            ${encryptedCount === 0 ? 
                                '<div class="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium mt-1 inline-block">✓ STAGE COMPLETE</div>' :
                                `<div class="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium mt-1 inline-block">${encryptedCount} ENCRYPTED</div>`
                            }
                        </div>
                    </div>
                </div>

                <!-- Control Panel -->
                <div class="bg-gray-800 px-3 sm:px-4 py-3 border-b border-gray-700">
                    <div class="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button id="scan-btn" class="px-3 sm:px-4 py-2 rounded transition-colors text-sm touch-manipulation ${this.isScanning ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 cursor-pointer'}">
                                <i class="bi bi-search mr-1 sm:mr-2"></i>${this.hasScanned ? 'Re-scan Files' : 'Scan for Files'}
                            </button>
                            <button id="decrypt-all-btn" class="px-3 sm:px-4 py-2 rounded transition-colors text-sm touch-manipulation ${(this.isDecrypting || encryptedCount === 0 || !this.hasScanned) ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:bg-green-800 cursor-pointer'}">
                                <i class="bi bi-unlock-fill mr-1 sm:mr-2"></i>Decrypt All
                            </button>
                            <button id="stop-btn" class="px-3 sm:px-4 py-2 rounded transition-colors text-sm touch-manipulation ${(!this.isDecrypting && !this.isScanning) ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:bg-red-800 cursor-pointer'}">
                                <i class="bi bi-stop-circle mr-1 sm:mr-2"></i>Stop
                            </button>
                        </div>
                        <div class="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                            <div class="text-yellow-400">
                                Recovery Progress: ${totalFiles > 0 ? Math.round((decryptedCount / totalFiles) * 100) : 0}%
                            </div>
                        </div>
                    </div>
                    
                    <!-- Progress Bars -->
                    ${this.isScanning ? `
                        <div class="mt-3">
                            <div class="flex items-center justify-between text-sm mb-1">
                                <span>Scanning for encrypted files...</span>
                                <span>${this.scanProgress}%</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-2">
                                <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: ${this.scanProgress}%"></div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${this.isDecrypting ? `
                        <div class="mt-3">
                            <div class="flex items-center justify-between text-sm mb-1">
                                <span>Decrypting files...</span>
                                <span>${this.decryptionProgress}%</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-2">
                                <div class="bg-green-500 h-2 rounded-full transition-all duration-300" style="width: ${this.decryptionProgress}%"></div>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- File List -->
                <div class="flex-1 overflow-auto p-4">
                    ${this.renderFileList()}
                </div>

                <!-- Status Bar -->
                <div class="bg-gray-800 px-4 py-2 border-t border-gray-700 text-sm">
                    <div class="flex justify-between items-center">
                        <span>
                            ${this.isScanning ? 'Scanning for encrypted files...' : 
                              this.isDecrypting ? 'Decryption in progress...' :
                              this.hasScanned ? `${decryptedCount}/${totalFiles} files recovered` :
                              'Ready to scan for encrypted files'}
                        </span>
                        <span class="text-gray-300">Level 3 Tournament Recovery</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderFileList() {
        if (!this.hasScanned) {
            return `
                <div class="h-full flex items-center justify-center text-gray-300 p-4">
                    <div class="text-center max-w-md">
                        <i class="bi bi-search text-4xl sm:text-5xl md:text-6xl mb-4 text-blue-500"></i>
                        <p class="text-base sm:text-lg">No scan performed</p>
                        <p class="text-sm">Click "Scan for Files" to search for encrypted files</p>
                        <div class="mt-4 p-3 sm:p-4 bg-yellow-800/20 border border-yellow-600 rounded-lg">
                            <i class="bi bi-exclamation-triangle text-yellow-500 mr-2"></i>
                            <span class="text-yellow-300 text-xs sm:text-sm">Encrypted files may be present on the system. Scan to detect them.</span>
                        </div>
                    </div>
                </div>
            `;
        }

        if (this.encryptedFiles.length === 0) {
            return `
                <div class="h-full flex items-center justify-center text-gray-300 p-4">
                    <div class="text-center">
                        <i class="bi bi-check-circle text-4xl sm:text-5xl md:text-6xl mb-4 text-green-500"></i>
                        <p class="text-base sm:text-lg">No encrypted files found</p>
                        <p class="text-sm">The system appears to be clean of ransomware encryption</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div class="col-span-full">
                    <h3 class="text-base sm:text-lg font-semibold mb-2 flex items-center">
                        <i class="bi bi-file-lock text-red-500 mr-2"></i>
                        Encrypted Files Detected (${this.encryptedFiles.length})
                    </h3>
                </div>
                ${this.encryptedFiles.map(file => this.renderFileCard(file)).join('')}
            </div>
        `;
    }

    renderFileCard(file) {
        const isDecrypted = this.decryptedFiles.has(file.id);
        const priorityColor = level3DataManager.getPriorityColor(file.priority);
        
        return `
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-750 transition-colors ${isDecrypted ? 'bg-green-900/20' : ''}">
                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div class="flex-1 min-w-0">
                        <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <div class="flex items-center space-x-2">
                                ${isDecrypted ? 
                                    '<i class="bi bi-check-circle text-green-500"></i>' : 
                                    '<i class="bi bi-lock text-red-500"></i>'
                                }
                                <h4 class="font-semibold truncate ${isDecrypted ? 'text-green-300' : 'text-white'}">
                                    ${isDecrypted ? file.originalName : file.encryptedName}
                                </h4>
                            </div>
                            <span class="px-2 py-1 rounded text-xs ${priorityColor} bg-gray-700 flex-shrink-0 self-start sm:self-auto">${file.priority}</span>
                        </div>
                        <p class="text-xs sm:text-sm text-gray-300 mb-2 leading-relaxed">${file.description}</p>
                        <div class="text-xs text-gray-400 space-y-1">
                            <div><strong>Size:</strong> ${file.size}</div>
                            ${!isDecrypted ? `<div><strong>Decrypt Time:</strong> ${file.decryptionTime / 1000}s</div>` : ''}
                            ${file.reputationRecovery > 0 ? `<div class="text-green-400"><strong>Reputation Recovery:</strong> +${file.reputationRecovery}%</div>` : ''}
                        </div>
                    </div>
                    <div class="flex flex-row sm:flex-col gap-2 sm:space-y-2 sm:ml-4 flex-shrink-0">
                        ${!isDecrypted && this.hasScanned ? `
                            <button class="decrypt-btn flex-1 sm:flex-auto px-3 py-1 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded text-xs sm:text-sm transition-colors cursor-pointer touch-manipulation" data-file-id="${file.id}">
                                <i class="bi bi-unlock mr-1"></i>Decrypt
                            </button>
                        ` : !isDecrypted && !this.hasScanned ? `
                            <button class="flex-1 sm:flex-auto px-3 py-1 bg-gray-600 rounded text-xs sm:text-sm cursor-not-allowed opacity-50">
                                <i class="bi bi-unlock mr-1"></i>Decrypt
                            </button>
                        ` : `
                            <div class="flex-1 sm:flex-auto px-3 py-1 bg-green-600 rounded text-xs sm:text-sm text-center">
                                <i class="bi bi-check-circle mr-1"></i>Restored
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    async startScan() {
        if (this.isScanning) return;

        this.isScanning = true;
        this.scanProgress = 0;
        this.encryptedFiles = []; // Clear any previous scan results
        this.updateContent();

        console.log('[RansomwareDecryptor] Starting scan for encrypted files...');

        // Simulate scanning process
        for (let i = 0; i <= 100; i += 5) {
            this.scanProgress = i;
            this.updateContent();
            
            // Gradually "discover" files during the scan
            if (i === 20 && this.availableFiles.length > 0) {
                this.encryptedFiles = this.availableFiles.slice(0, Math.ceil(this.availableFiles.length * 0.3));
                this.updateContent();
            } else if (i === 50 && this.availableFiles.length > 1) {
                this.encryptedFiles = this.availableFiles.slice(0, Math.ceil(this.availableFiles.length * 0.7));
                this.updateContent();
            } else if (i === 80) {
                this.encryptedFiles = [...this.availableFiles];
                this.updateContent();
            }
            
            await this.sleep(80);
        }

        this.isScanning = false;
        this.hasScanned = true;
        this.updateContent();
        
        const filesFound = this.encryptedFiles.length;
        if (filesFound > 0) {
            this.showNotification(`Scan complete! Found ${filesFound} encrypted files that need recovery`, 'warning');
        } else {
            this.showNotification('Scan complete! No encrypted files detected on the system', 'success');
        }
    }

    async decryptFile(fileId) {
        if (!this.hasScanned) {
            this.showNotification('Please scan for files first', 'warning');
            return;
        }
        
        const file = this.encryptedFiles.find(f => f.id === fileId);
        if (!file || this.decryptedFiles.has(fileId)) return;

        this.showNotification(`Decrypting ${file.originalName}...`, 'info');

        // Simulate decryption time
        await this.sleep(file.decryptionTime);

        this.decryptedFiles.add(fileId);
        
        // Apply reputation recovery
        if (file.reputationRecovery > 0 && this.timer) {
            // Remove some reputation damage as reward for recovery
            const currentDamage = this.timer.reputationDamage;
            this.timer.reputationDamage = Math.max(0, currentDamage - file.reputationRecovery);
            this.timer.updateDisplay();
        }

        // Record action in session summary
        if (window.level3SessionSummary) {
            window.level3SessionSummary.recordAction(true); // Decrypting files is a good action
        }

        this.updateContent();
        this.showNotification(`${file.originalName} decrypted successfully!`, 'success');

        // Check if all files are decrypted
        if (this.decryptedFiles.size === this.encryptedFiles.length) {
            this.onStageComplete();
        }
    }

    async decryptAllFiles() {
        console.log('[RansomwareDecryptor] decryptAllFiles called, state:', {
            isDecrypting: this.isDecrypting,
            hasScanned: this.hasScanned,
            encryptedFilesLength: this.encryptedFiles.length,
            decryptedFilesSize: this.decryptedFiles.size
        });
        
        if (this.isDecrypting || !this.hasScanned) {
            if (!this.hasScanned) {
                this.showNotification('Please scan for files first', 'warning');
            }
            return;
        }

        const unDecryptedFiles = this.encryptedFiles.filter(file => !this.decryptedFiles.has(file.id));
        console.log('[RansomwareDecryptor] Undecrypted files:', unDecryptedFiles.length);
        
        if (unDecryptedFiles.length === 0) {
            this.showNotification('No files available for decryption', 'info');
            return;
        }

        this.isDecrypting = true;
        this.decryptionProgress = 0;
        this.updateContent();

        const totalFiles = unDecryptedFiles.length;
        let completedFiles = 0;

        for (const file of unDecryptedFiles) {
            // Update progress
            this.decryptionProgress = Math.round((completedFiles / totalFiles) * 100);
            this.updateContent();

            // Decrypt file
            await this.sleep(file.decryptionTime);
            this.decryptedFiles.add(file.id);
            completedFiles++;

            // Apply reputation recovery
            if (file.reputationRecovery > 0 && this.timer) {
                // Remove some reputation damage as reward for recovery
                const currentDamage = this.timer.reputationDamage;
                this.timer.reputationDamage = Math.max(0, currentDamage - file.reputationRecovery);
                this.timer.updateDisplay();
            }
        }

        this.decryptionProgress = 100;
        this.isDecrypting = false;
        this.updateContent();

        this.showNotification(`Mass decryption complete! ${completedFiles} files recovered.`, 'success');
        
        // Check if all files are now decrypted
        if (this.decryptedFiles.size === this.encryptedFiles.length) {
            this.onStageComplete();
        }
    }

    stopOperation() {
        if (this.isScanning) {
            this.showNotification('Scan cancelled', 'info');
        }
        if (this.isDecrypting) {
            this.showNotification('Decryption process stopped', 'info');
        }
        
        this.isScanning = false;
        this.isDecrypting = false;
        this.scanProgress = 0;
        this.decryptionProgress = 0;
        this.updateContent();
    }
    
    onStageComplete() {
        // Record stage completion in session summary
        if (window.level3SessionSummary) {
            const timeSpent = this.timer ? ((15 * 60) - this.timer.timeRemaining) : 0;
            window.level3SessionSummary.recordStageCompletion('ransomware-decryptor', timeSpent);
        }
        
        // Stop gradual damage
        if (this.damageInterval) {
            clearInterval(this.damageInterval);
            this.damageInterval = null;
        }
        
        this.showNotification('All files successfully recovered! Level 3 complete!', 'success');
        
        // Mark level as completed and trigger completion dialogue
        localStorage.setItem('cyberquest_level_3_decryption_completed', 'true');
        
        setTimeout(() => {
            // Trigger level completion dialogue
            const completionEvent = new CustomEvent('level3-decryption-complete');
            window.dispatchEvent(completionEvent);
        }, 2000);
    }

    startGradualDamage() {
        // Apply gradual damage every 20 seconds while files remain encrypted
        this.damageInterval = setInterval(() => {
            const encryptedCount = this.encryptedFiles.length - this.decryptedFiles.size;
            if (encryptedCount > 0 && this.timer) {
                // Apply damage based on number of encrypted files
                const reputationDamage = encryptedCount * 1; // 1% per file per 20 seconds
                const financialDamage = encryptedCount * 3000; // $3K per file per 20 seconds
                
                this.timer.addReputationDamage(reputationDamage);
                this.timer.addFinancialDamage(financialDamage);
            }
        }, 20000); // Every 20 seconds
    }

    initialize() {
        super.initialize();
        this.handleWindowClick = null; // Initialize the handler reference
        this.bindEvents();
        
        // Mark app as opened
        localStorage.setItem('cyberquest_ransomwaredecryptor_opened', 'true');
    }

    bindEvents() {
        if (!this.windowElement) return;

        // Remove any existing event listeners to avoid duplicates
        this.windowElement.removeEventListener('click', this.handleWindowClick);
        
        // Use event delegation for all buttons to survive content updates
        this.handleWindowClick = (e) => {
            // Control buttons
            if (e.target.matches('#scan-btn, #scan-btn *')) {
                const btn = e.target.closest('#scan-btn');
                if (btn && !this.isScanning) {
                    console.log('[RansomwareDecryptor] Scan button clicked, isScanning:', this.isScanning);
                    this.startScan();
                }
            } else if (e.target.matches('#decrypt-all-btn, #decrypt-all-btn *')) {
                const btn = e.target.closest('#decrypt-all-btn');
                if (btn && !this.isDecrypting && this.hasScanned) {
                    console.log('[RansomwareDecryptor] Decrypt All button clicked, isDecrypting:', this.isDecrypting, 'hasScanned:', this.hasScanned);
                    this.decryptAllFiles();
                }
            } else if (e.target.matches('#stop-btn, #stop-btn *')) {
                const btn = e.target.closest('#stop-btn');
                if (btn && (this.isDecrypting || this.isScanning)) {
                    console.log('[RansomwareDecryptor] Stop button clicked');
                    this.stopOperation();
                }
            } else if (e.target.matches('.decrypt-btn, .decrypt-btn *')) {
                // Individual file decrypt buttons
                const btn = e.target.closest('.decrypt-btn');
                const fileId = btn?.dataset.fileId;
                if (fileId) this.decryptFile(fileId);
            }
        };
        
        this.windowElement.addEventListener('click', this.handleWindowClick);
    }

    showNotification(message, type = 'info') {
        if (window.toastManager && window.toastManager.showToast) {
            window.toastManager.showToast(message, type);
        } else {
            console.log(`[RansomwareDecryptor] ${type.toUpperCase()}: ${message}`);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    cleanup() {
        this.stopOperation();
        
        // Stop gradual damage interval
        if (this.damageInterval) {
            clearInterval(this.damageInterval);
            this.damageInterval = null;
        }
        
        // Remove event listeners
        if (this.windowElement && this.handleWindowClick) {
            this.windowElement.removeEventListener('click', this.handleWindowClick);
            this.handleWindowClick = null;
        }
        
        super.cleanup();
    }
}