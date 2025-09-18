import { WindowBase } from '../window-base.js';
import { RansomwareDecryptorActivityEmitter } from './ransomware-decryptor-functions/ransomware-decryptor-activity-emitter.js';

export class RansomwareDecryptorApp extends WindowBase {
    constructor() {
        super('ransomware-decryptor', 'Ransomware Decryptor', {
            width: '75%',
            height: '88%'
        });
        
        this.encryptedFiles = [];
        this.isScanning = false;
        this.isDecrypting = false;
        this.decryptionProgress = 0;
        this.decryptedFiles = [];
        
        // Set up activity emission system
        try {
            this.setupActivityEmission(RansomwareDecryptorActivityEmitter);
        } catch (error) {
            console.warn('Failed to set up activity emission for ransomware decryptor:', error.message);
            this.activityEmitter = null;
        }
        
        this.initializeEncryptedFiles();
    }

    initializeEncryptedFiles() {
        // Simulated encrypted files from the Gaming Optimizer Pro ransomware
        this.encryptedFiles = [
            {
                id: 'file001',
                name: 'Championship_Brackets.xlsx.encrypted',
                originalName: 'Championship_Brackets.xlsx',
                path: 'C:\\TournamentData\\Championship_Brackets.xlsx.encrypted',
                size: '2.4 MB',
                encryptedBy: 'Gaming Optimizer Pro',
                encryptionType: 'AES-256',
                priority: 'Critical',
                status: 'encrypted'
            },
            {
                id: 'file002',
                name: 'Player_Profiles.db.encrypted',
                originalName: 'Player_Profiles.db',
                path: 'C:\\TournamentData\\Player_Profiles.db.encrypted',
                size: '18.7 MB',
                encryptedBy: 'Gaming Optimizer Pro',
                encryptionType: 'AES-256',
                priority: 'High',
                status: 'encrypted'
            },
            {
                id: 'file003',
                name: 'Tournament_Schedule.pdf.encrypted',
                originalName: 'Tournament_Schedule.pdf',
                path: 'C:\\TournamentData\\Tournament_Schedule.pdf.encrypted',
                size: '1.2 MB',
                encryptedBy: 'Gaming Optimizer Pro',
                encryptionType: 'AES-256',
                priority: 'High',
                status: 'encrypted'
            },
            {
                id: 'file004',
                name: 'Prize_Pool_Distribution.xlsx.encrypted',
                originalName: 'Prize_Pool_Distribution.xlsx',
                path: 'C:\\TournamentData\\Prize_Pool_Distribution.xlsx.encrypted',
                size: '875 KB',
                encryptedBy: 'Gaming Optimizer Pro',
                encryptionType: 'AES-256',
                priority: 'Critical',
                status: 'encrypted'
            },
            {
                id: 'file005',
                name: 'Live_Stream_Config.json.encrypted',
                originalName: 'Live_Stream_Config.json',
                path: 'C:\\StreamingSetup\\Live_Stream_Config.json.encrypted',
                size: '45 KB',
                encryptedBy: 'Gaming Optimizer Pro',
                encryptionType: 'AES-256',
                priority: 'Medium',
                status: 'encrypted'
            },
            {
                id: 'file006',
                name: 'Sponsor_Agreements.docx.encrypted',
                originalName: 'Sponsor_Agreements.docx',
                path: 'C:\\TournamentData\\Legal\\Sponsor_Agreements.docx.encrypted',
                size: '3.1 MB',
                encryptedBy: 'Gaming Optimizer Pro',
                encryptionType: 'AES-256',
                priority: 'High',
                status: 'encrypted'
            }
        ];
    }

    createContent() {
        return `
            <div class="h-full flex flex-col bg-gray-900 text-white">
                <!-- Header -->
                <div class="bg-gray-800 p-4 border-b border-gray-700">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                                <i class="bi bi-unlock text-white"></i>
                            </div>
                            <div>
                                <h2 class="text-lg font-semibold text-white">CyberQuest Ransomware Decryptor</h2>
                                <p class="text-sm text-gray-400">Gaming Optimizer Pro Decryption Tool</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 rounded-full ${this.isScanning || this.isDecrypting ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}"></div>
                            <span class="text-sm text-gray-300">${this.isScanning ? 'Scanning...' : this.isDecrypting ? 'Decrypting...' : 'Ready'}</span>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="flex-1 flex">
                    <!-- Left Panel - Controls -->
                    <div class="w-1/3 bg-gray-800 border-r border-gray-700 p-4">
                        <div class="space-y-4">
                            <!-- Ransomware Info -->
                            <div>
                                <h3 class="text-md font-semibold text-blue-400 mb-3">Detected Ransomware</h3>
                                <div class="bg-red-900/30 border border-red-600 rounded p-3">
                                    <div class="flex items-center space-x-2 mb-2">
                                        <i class="bi bi-exclamation-triangle text-red-400"></i>
                                        <span class="font-semibold text-red-400">Gaming Optimizer Pro</span>
                                    </div>
                                    <div class="text-sm text-gray-300 space-y-1">
                                        <div>Type: <span class="text-red-400">AES-256 Ransomware</span></div>
                                        <div>Files affected: <span class="text-yellow-400">${this.encryptedFiles.length}</span></div>
                                        <div>Status: <span class="text-green-400">Decryptable</span></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Decryption Controls -->
                            <div class="pt-4 border-t border-gray-700">
                                <h3 class="text-md font-semibold text-blue-400 mb-3">Decryption Tools</h3>
                                <div class="space-y-2">
                                    <button id="scan-files-btn" class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold transition-colors cursor-pointer ${this.isScanning ? 'opacity-50 cursor-not-allowed' : ''}" ${this.isScanning ? 'disabled' : ''}>
                                        <i class="bi bi-search mr-2"></i>Scan for Encrypted Files
                                    </button>
                                    <button id="decrypt-all-btn" class="w-full py-3 px-4 bg-green-600 hover:bg-green-500 text-white rounded font-semibold transition-colors cursor-pointer ${this.isDecrypting || this.encryptedFiles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}" ${this.isDecrypting || this.encryptedFiles.length === 0 ? 'disabled' : ''}>
                                        <i class="bi bi-unlock mr-2"></i>Decrypt All Files
                                    </button>
                                </div>
                            </div>

                            <!-- Decryption Status -->
                            <div class="pt-4 border-t border-gray-700">
                                <h3 class="text-md font-semibold text-blue-400 mb-3">Decryption Status</h3>
                                <div class="space-y-2">
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm">Files Found</span>
                                        <span class="text-blue-400 text-sm">${this.encryptedFiles.length}</span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm">Files Decrypted</span>
                                        <span class="text-green-400 text-sm">${this.decryptedFiles.length}</span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm">Success Rate</span>
                                        <span class="text-green-400 text-sm">${this.encryptedFiles.length > 0 ? Math.round((this.decryptedFiles.length / this.encryptedFiles.length) * 100) : 0}%</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Key Information -->
                            <div class="pt-4 border-t border-gray-700">
                                <h3 class="text-md font-semibold text-blue-400 mb-3">Decryption Key</h3>
                                <div class="bg-green-900/30 border border-green-600 rounded p-3">
                                    <div class="text-xs text-green-400 font-mono break-all">
                                        GamingOpt2024_TournamentKey_AES256
                                    </div>
                                    <div class="text-xs text-gray-400 mt-2">
                                        Key extracted from malware analysis
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Panel - File List -->
                    <div class="flex-1 p-4">
                        <div class="h-full flex flex-col">
                            <!-- Progress Bar (shown during decryption) -->
                            <div id="decryption-progress-section" class="mb-4 ${this.isDecrypting ? '' : 'hidden'}">
                                <h3 class="text-md font-semibold text-blue-400 mb-2">Decryption Progress</h3>
                                <div class="bg-gray-700 rounded-full h-3 mb-2">
                                    <div id="progress-bar" class="bg-blue-500 h-3 rounded-full transition-all duration-300" style="width: ${this.decryptionProgress}%"></div>
                                </div>
                                <div class="flex justify-between text-sm text-gray-400">
                                    <span id="decryption-status">Decrypting files...</span>
                                    <span id="decryption-percentage">${this.decryptionProgress}%</span>
                                </div>
                                <div class="mt-2 text-xs text-gray-500" id="current-decryption-file">Processing...</div>
                            </div>

                            <!-- File List -->
                            <div class="flex-1">
                                <div class="flex items-center justify-between mb-3">
                                    <h3 class="text-md font-semibold text-blue-400">Encrypted Files</h3>
                                    <div class="text-sm text-gray-400">
                                        <span>${this.encryptedFiles.filter(f => f.status === 'encrypted').length}</span> files to decrypt
                                    </div>
                                </div>
                                
                                <div id="files-container" class="bg-gray-800 rounded border border-gray-700 h-full overflow-y-auto">
                                    ${this.renderFileList()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Status Bar -->
                <div class="bg-gray-800 p-3 border-t border-gray-700 flex items-center justify-between text-sm">
                    <div class="flex items-center space-x-4">
                        <span class="text-gray-400">Ransomware: Gaming Optimizer Pro</span>
                        <span class="text-gray-400">Encryption: AES-256</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="w-2 h-2 rounded-full ${this.decryptedFiles.length === this.encryptedFiles.length ? 'bg-green-400' : 'bg-yellow-400'}"></div>
                        <span class="text-gray-400">${this.decryptedFiles.length === this.encryptedFiles.length ? 'All files recovered' : 'Recovery in progress'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderFileList() {
        if (this.encryptedFiles.length === 0) {
            return `
                <div class="flex items-center justify-center h-full text-gray-500">
                    <div class="text-center">
                        <i class="bi bi-file-earmark-lock text-4xl mb-2"></i>
                        <p>No encrypted files found</p>
                        <p class="text-sm">Click "Scan for Encrypted Files" to search</p>
                    </div>
                </div>
            `;
        }

        return this.encryptedFiles.map(file => `
            <div class="p-3 border-b border-gray-700 hover:bg-gray-750 transition-colors">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2">
                            <i class="bi ${file.status === 'encrypted' ? 'bi-file-earmark-lock text-red-400' : 'bi-file-earmark-check text-green-400'}"></i>
                            <span class="font-medium ${file.status === 'encrypted' ? 'text-red-400' : 'text-green-400'}">${file.status === 'encrypted' ? file.name : file.originalName}</span>
                            <span class="text-xs bg-${file.priority === 'Critical' ? 'red' : file.priority === 'High' ? 'orange' : 'yellow'}-600 text-white px-2 py-1 rounded">${file.priority}</span>
                        </div>
                        <div class="text-sm text-gray-400 mt-1">${file.path}</div>
                        <div class="text-xs text-gray-500 mt-1">Size: ${file.size} | Encryption: ${file.encryptionType} | Status: ${file.status}</div>
                    </div>
                    <div class="flex space-x-2">
                        ${file.status === 'encrypted' ? `
                            <button class="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs cursor-pointer" onclick="window.ransomwareDecryptorApp.decryptFile('${file.id}')">
                                <i class="bi bi-unlock mr-1"></i>Decrypt
                            </button>
                        ` : `
                            <span class="px-3 py-1 bg-green-600 text-white rounded text-xs">
                                <i class="bi bi-check-circle mr-1"></i>Decrypted
                            </span>
                        `}
                    </div>
                </div>
            </div>
        `).join('');
    }

    bindEvents() {
        const windowElement = this.windowElement;
        if (!windowElement) return;

        // Scan files button
        const scanBtn = windowElement.querySelector('#scan-files-btn');
        if (scanBtn) {
            scanBtn.addEventListener('click', () => {
                this.scanForFiles();
            });
        }

        // Decrypt all button
        const decryptAllBtn = windowElement.querySelector('#decrypt-all-btn');
        if (decryptAllBtn) {
            decryptAllBtn.addEventListener('click', () => {
                this.decryptAllFiles();
            });
        }
    }

    async scanForFiles() {
        if (this.isScanning) return;

        this.isScanning = true;
        
        // Emit scan start activity
        if (this.activityEmitter) {
            this.activityEmitter.emitScanStarted();
        }

        this.updateContent();

        // Simulate scanning process
        await new Promise(resolve => setTimeout(resolve, 2000));

        this.isScanning = false;
        this.updateContent();
        
        // Emit files found activity
        if (this.activityEmitter) {
            this.activityEmitter.emitFilesFound(this.encryptedFiles.length);
        }

        this.showNotification(`Found ${this.encryptedFiles.length} encrypted files`, 'info');
    }

    async decryptFile(fileId) {
        const file = this.encryptedFiles.find(f => f.id === fileId);
        if (!file || file.status !== 'encrypted') return;

        // Emit individual decryption start
        if (this.activityEmitter) {
            this.activityEmitter.emitFileDecryptionStarted(file);
        }

        // Simulate decryption process
        file.status = 'decrypting';
        this.updateContent();

        await new Promise(resolve => setTimeout(resolve, 1500));

        file.status = 'decrypted';
        this.decryptedFiles.push(file);
        
        // Emit individual decryption complete
        if (this.activityEmitter) {
            this.activityEmitter.emitFileDecrypted(file);
        }

        this.updateContent();
        this.showNotification(`${file.originalName} decrypted successfully`, 'success');

        // Check if all files are decrypted
        this.checkDecryptionComplete();
    }

    async decryptAllFiles() {
        if (this.isDecrypting) return;

        this.isDecrypting = true;
        this.decryptionProgress = 0;
        
        // Emit mass decryption start
        if (this.activityEmitter) {
            this.activityEmitter.emitMassDecryptionStarted(this.encryptedFiles.filter(f => f.status === 'encrypted').length);
        }

        this.updateContent();

        const encryptedFiles = this.encryptedFiles.filter(f => f.status === 'encrypted');
        
        for (let i = 0; i < encryptedFiles.length; i++) {
            if (!this.isDecrypting) break;

            const file = encryptedFiles[i];
            this.decryptionProgress = Math.round(((i + 1) / encryptedFiles.length) * 100);
            
            // Update progress
            const statusElement = this.windowElement?.querySelector('#decryption-status');
            const percentageElement = this.windowElement?.querySelector('#decryption-percentage');
            const fileElement = this.windowElement?.querySelector('#current-decryption-file');
            const progressBar = this.windowElement?.querySelector('#progress-bar');
            
            if (statusElement) statusElement.textContent = 'Decrypting files...';
            if (percentageElement) percentageElement.textContent = `${this.decryptionProgress}%`;
            if (fileElement) fileElement.textContent = `Decrypting: ${file.originalName}`;
            if (progressBar) progressBar.style.width = `${this.decryptionProgress}%`;

            // Decrypt the file
            file.status = 'decrypted';
            this.decryptedFiles.push(file);
            
            // Emit individual file decryption
            if (this.activityEmitter) {
                this.activityEmitter.emitFileDecrypted(file);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.isDecrypting = false;
        
        // Emit mass decryption complete
        if (this.activityEmitter) {
            this.activityEmitter.emitMassDecryptionCompleted(this.decryptedFiles.length);
        }

        this.updateContent();
        this.checkDecryptionComplete();
    }

    checkDecryptionComplete() {
        const remainingEncrypted = this.encryptedFiles.filter(f => f.status === 'encrypted').length;
        
        if (remainingEncrypted === 0) {
            this.showNotification('All files successfully decrypted! Tournament data recovered.', 'success');
            
            // Trigger level completion after successful decryption
            setTimeout(() => {
                import('../../dialogues/levels/level-three/level-three-completion.js')
                    .then(({ LevelThreeCompletionDialogue }) => {
                        new LevelThreeCompletionDialogue(this.desktop).start();
                    })
                    .catch(err => console.error('Failed to launch level completion dialogue:', err));
            }, 2000);
        }
    }

    showNotification(message, type = 'info') {
        // Use centralized toast utility if available
        if (window.toastManager && window.toastManager.showToast) {
            window.toastManager.showToast(message, type);
        } else {
            // Fallback to console log if toast manager not available
            console.log(`Ransomware Decryptor Notification [${type}]: ${message}`);
        }
    }

    initialize() {
        super.initialize();
        this.bindEvents();
        
        // Set global reference for button handlers
        window.ransomwareDecryptorApp = this;
        
        // Mark app as opened
        localStorage.setItem('cyberquest_ransomwaredecryptor_opened', 'true');
        
        // Trigger tutorial if not completed
        setTimeout(() => {
            this.checkAndStartTutorial();
        }, 1000);
    }

    async checkAndStartTutorial() {
        try {
            if (window.tutorialManager && window.tutorialManager.shouldAutoStartRansomwareDecryptor) {
                const shouldStart = await window.tutorialManager.shouldAutoStartRansomwareDecryptor();
                if (shouldStart) {
                    console.log('Auto-starting Ransomware Decryptor tutorial...');
                    await window.tutorialManager.startRansomwareDecryptorTutorial();
                }
            }
        } catch (error) {
            console.error('Failed to check/start Ransomware Decryptor tutorial:', error);
        }
    }

    cleanup() {
        if (window.ransomwareDecryptorApp === this) {
            window.ransomwareDecryptorApp = null;
        }
        super.cleanup();
    }
}
