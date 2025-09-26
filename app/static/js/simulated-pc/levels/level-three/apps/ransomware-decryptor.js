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
        this.isScanning = false;
        this.isDecrypting = false;
        this.decryptedFiles = new Set();
        this.scanProgress = 0;
        this.decryptionProgress = 0;
        
        this.loadEncryptedFiles();
    }

    async loadEncryptedFiles() {
        await level3DataManager.loadData();
        this.encryptedFiles = level3DataManager.getEncryptedFiles();
        this.updateContent();
    }

    createContent() {
        const totalFiles = this.encryptedFiles.length;
        const decryptedCount = this.decryptedFiles.size;
        const encryptedCount = totalFiles - decryptedCount;
        
        return `
            <div class="h-full flex flex-col bg-gray-900 text-white">
                <!-- Header -->
                <div class="bg-green-600 px-4 py-3 border-b border-gray-700">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <i class="bi bi-unlock text-2xl text-white"></i>
                            <div>
                                <h2 class="text-lg font-bold text-white">Ransomware Recovery Tool</h2>
                                <p class="text-sm text-white">Level 3 - Restore Encrypted Files</p>
                            </div>
                        </div>
                        <div class="text-right text-sm">
                            <div class="text-white">Encrypted: ${encryptedCount}</div>
                            <div class="text-white">Recovered: ${decryptedCount}</div>
                        </div>
                    </div>
                </div>

                <!-- Control Panel -->
                <div class="bg-gray-800 px-4 py-3 border-b border-gray-700">
                    <div class="flex items-center justify-between">
                        <div class="flex space-x-3">
                            <button id="scan-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors ${this.isScanning ? 'opacity-50 cursor-not-allowed' : ''}">
                                <i class="bi bi-search mr-2"></i>Scan for Files
                            </button>
                            <button id="decrypt-all-btn" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors ${this.isDecrypting || encryptedCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
                                <i class="bi bi-unlock-fill mr-2"></i>Decrypt All
                            </button>
                            <button id="stop-btn" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors ${!this.isDecrypting && !this.isScanning ? 'opacity-50 cursor-not-allowed' : ''}">
                                <i class="bi bi-stop-circle mr-2"></i>Stop
                            </button>
                        </div>
                        <div class="flex items-center space-x-4 text-sm">
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
                              `${decryptedCount}/${totalFiles} files recovered`}
                        </span>
                        <span class="text-gray-400">Level 3 Tournament Recovery</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderFileList() {
        if (this.encryptedFiles.length === 0) {
            return `
                <div class="h-full flex items-center justify-center text-gray-400">
                    <div class="text-center">
                        <i class="bi bi-files text-6xl mb-4"></i>
                        <p class="text-lg">No encrypted files detected</p>
                        <p class="text-sm">Click "Scan for Files" to search for encrypted files</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="grid gap-3">
                <h3 class="text-lg font-semibold mb-2 flex items-center">
                    <i class="bi bi-file-lock text-red-500 mr-2"></i>
                    Encrypted Files (${this.encryptedFiles.length})
                </h3>
                ${this.encryptedFiles.map(file => this.renderFileCard(file)).join('')}
            </div>
        `;
    }

    renderFileCard(file) {
        const isDecrypted = this.decryptedFiles.has(file.id);
        const priorityColor = level3DataManager.getPriorityColor(file.priority);
        
        return `
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-750 transition-colors ${isDecrypted ? 'bg-green-900/20' : ''}">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            ${isDecrypted ? 
                                '<i class="bi bi-check-circle text-green-500"></i>' : 
                                '<i class="bi bi-lock text-red-500"></i>'
                            }
                            <h4 class="font-semibold ${isDecrypted ? 'text-green-300' : 'text-white'}">
                                ${isDecrypted ? file.originalName : file.encryptedName}
                            </h4>
                            <span class="px-2 py-1 rounded text-xs ${priorityColor} bg-gray-700">${file.priority}</span>
                        </div>
                        <p class="text-sm text-gray-400 mb-2">${file.description}</p>
                        <div class="text-xs text-gray-500">
                            <div><strong>Size:</strong> ${file.size}</div>
                            ${!isDecrypted ? `<div><strong>Decrypt Time:</strong> ${file.decryptionTime / 1000}s</div>` : ''}
                            ${file.reputationRecovery > 0 ? `<div class="text-green-400"><strong>Reputation Recovery:</strong> +${file.reputationRecovery}%</div>` : ''}
                        </div>
                    </div>
                    <div class="flex flex-col space-y-2 ml-4">
                        ${!isDecrypted ? `
                            <button class="decrypt-btn px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors" data-file-id="${file.id}">
                                <i class="bi bi-unlock mr-1"></i>Decrypt
                            </button>
                        ` : `
                            <div class="px-3 py-1 bg-green-600 rounded text-sm text-center">
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
        this.updateContent();

        // Simulate scanning process
        for (let i = 0; i <= 100; i += 10) {
            this.scanProgress = i;
            this.updateContent();
            await this.sleep(100);
        }

        this.isScanning = false;
        this.updateContent();
        this.showNotification(`Scan complete! Found ${this.encryptedFiles.length} encrypted files`, 'success');
    }

    async decryptFile(fileId) {
        const file = this.encryptedFiles.find(f => f.id === fileId);
        if (!file || this.decryptedFiles.has(fileId)) return;

        this.showNotification(`Decrypting ${file.originalName}...`, 'info');

        // Simulate decryption time
        await this.sleep(file.decryptionTime);

        this.decryptedFiles.add(fileId);
        
        // Apply reputation recovery
        try {
            const appLauncher = getApplicationLauncher();
            if (file.reputationRecovery > 0) {
                // Note: Could implement reputation recovery if needed
                console.log(`[RansomwareDecryptor] File decrypted, reputation improved by ${file.reputationRecovery}%`);
            }
        } catch (error) {
            console.error('[RansomwareDecryptor] Failed to apply reputation recovery:', error);
        }

        this.updateContent();
        this.showNotification(`${file.originalName} decrypted successfully!`, 'success');

        // Check if all files are decrypted
        if (this.decryptedFiles.size === this.encryptedFiles.length) {
            this.showNotification('All files successfully recovered! Tournament data restored.', 'success');
        }
    }

    async decryptAllFiles() {
        if (this.isDecrypting) return;

        const unDecryptedFiles = this.encryptedFiles.filter(file => !this.decryptedFiles.has(file.id));
        if (unDecryptedFiles.length === 0) return;

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
            try {
                const appLauncher = getApplicationLauncher();
                if (file.reputationRecovery > 0) {
                    console.log(`[RansomwareDecryptor] File decrypted, reputation improved by ${file.reputationRecovery}%`);
                }
            } catch (error) {
                console.error('[RansomwareDecryptor] Failed to apply reputation recovery:', error);
            }
        }

        this.decryptionProgress = 100;
        this.isDecrypting = false;
        this.updateContent();

        this.showNotification(`Mass decryption complete! ${completedFiles} files recovered.`, 'success');
    }

    stopOperation() {
        this.isScanning = false;
        this.isDecrypting = false;
        this.scanProgress = 0;
        this.decryptionProgress = 0;
        this.updateContent();
    }

    initialize() {
        super.initialize();
        this.bindEvents();
        
        // Mark app as opened
        localStorage.setItem('cyberquest_ransomwaredecryptor_opened', 'true');
    }

    bindEvents() {
        if (!this.windowElement) return;

        // Control buttons
        const scanBtn = this.windowElement.querySelector('#scan-btn');
        const decryptAllBtn = this.windowElement.querySelector('#decrypt-all-btn');
        const stopBtn = this.windowElement.querySelector('#stop-btn');

        scanBtn?.addEventListener('click', () => this.startScan());
        decryptAllBtn?.addEventListener('click', () => this.decryptAllFiles());
        stopBtn?.addEventListener('click', () => this.stopOperation());

        // File action buttons
        this.windowElement.addEventListener('click', (e) => {
            if (e.target.matches('.decrypt-btn, .decrypt-btn *')) {
                const btn = e.target.closest('.decrypt-btn');
                const fileId = btn?.dataset.fileId;
                if (fileId) this.decryptFile(fileId);
            }
        });
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
        super.cleanup();
    }
}