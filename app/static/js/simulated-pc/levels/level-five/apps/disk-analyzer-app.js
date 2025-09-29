import { ForensicAppBase } from './forensic-app-base.js';

/**
 * Disk Image Analyzer Application - Level 5
 * Forensic analysis of disk images including file recovery and timeline generation
 */
export class DiskAnalyzerApp extends ForensicAppBase {
    constructor() {
        super('disk-analyzer', 'Disk Image Analyzer', {
            width: '75%',
            height: '70%'
        });
        
        this.mountedImage = null;
        this.currentPath = '/';
        this.selectedFile = null;
        this.scanResults = [];
        this.recoveredFiles = [];
        this.analysisMode = 'filesystem'; // 'filesystem', 'deleted', 'timeline'
    }

    createContent() {
        return `
            <div class="disk-analyzer-app h-full bg-black text-white p-4 overflow-hidden">
                <!-- Header -->
                <div class="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                    <h2 class="text-xl font-bold text-blue-400">Disk Image Analyzer</h2>
                    <div class="flex space-x-4 text-sm">
                        <div>
                            <span class="text-gray-300">Mounted:</span>
                            <span class="text-blue-400 font-semibold" id="mounted-image">None</span>
                        </div>
                        <div>
                            <span class="text-gray-300">Files Found:</span>
                            <span class="text-green-400 font-semibold" id="files-count">0</span>
                        </div>
                    </div>
                </div>

                <!-- Forensic UI Elements -->
                ${this.createForensicUI().evidencePanel}

                <!-- Analysis Mode Selector -->
                <div class="flex justify-between items-center mb-4">
                    <div class="flex space-x-2">
                        <button id="mode-filesystem-${this.id}" class="analysis-mode-btn bg-blue-600 px-4 py-2 rounded text-sm font-semibold">
                            File System
                        </button>
                        <button id="mode-deleted-${this.id}" class="analysis-mode-btn bg-gray-600 px-4 py-2 rounded text-sm">
                            Deleted Files
                        </button>
                        <button id="mode-timeline-${this.id}" class="analysis-mode-btn bg-gray-600 px-4 py-2 rounded text-sm">
                            Timeline
                        </button>
                    </div>
                    <div class="flex space-x-2">
                        <button id="mount-image-btn-${this.id}" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold">
                            Mount Image
                        </button>
                        <button id="deep-scan-btn-${this.id}" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm font-semibold">
                            Deep Scan
                        </button>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div class="grid grid-cols-12 gap-4 h-full">
                    <!-- Left Panel - Image Selection / Navigation -->
                    <div class="col-span-3 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-yellow-400">Evidence Images</h3>
                        <div id="image-list-${this.id}" class="space-y-2 mb-4">
                            <!-- Available disk images will be populated here -->
                        </div>
                        
                        <!-- Navigation for mounted image -->
                        <div id="navigation-${this.id}" class="hidden">
                            <h4 class="font-semibold mb-2 text-green-400">Navigation</h4>
                            <div class="text-xs text-gray-300 mb-2" id="current-path-${this.id}">/</div>
                            <div id="directory-tree-${this.id}" class="text-sm">
                                <!-- Directory tree will be populated here -->
                            </div>
                        </div>
                    </div>

                    <!-- Center Panel - File Browser / Results -->
                    <div class="col-span-6 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-yellow-400" id="center-panel-title">File System Browser</h3>
                        
                        <!-- File System View -->
                        <div id="filesystem-view-${this.id}" class="analysis-view">
                            <div class="text-center text-gray-500 mt-8">
                                Mount a disk image to begin analysis
                            </div>
                        </div>

                        <!-- Deleted Files View -->
                        <div id="deleted-view-${this.id}" class="analysis-view hidden">
                            <div id="deleted-files-list-${this.id}">
                                <!-- Recovered deleted files will be shown here -->
                            </div>
                        </div>

                        <!-- Timeline View -->
                        <div id="timeline-view-${this.id}" class="analysis-view hidden">
                            <div id="timeline-container-${this.id}">
                                <!-- Timeline events will be shown here -->
                            </div>
                        </div>
                    </div>

                    <!-- Right Panel - File Details / Metadata -->
                    <div class="col-span-3 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-yellow-400">File Analysis</h3>
                        <div id="file-details-${this.id}">
                            <div class="text-center text-gray-500 mt-8">
                                Select a file to view details
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Scan Progress Modal -->
                <div id="scan-modal-${this.id}" class="fixed inset-0 bg-black bg-opacity-75 hidden z-50 flex items-center justify-center">
                    <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 class="text-lg font-semibold mb-4 text-blue-400">Analyzing Disk Image</h3>
                        <div class="space-y-4">
                            <div class="bg-gray-700 rounded p-3">
                                <div class="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span id="scan-progress-${this.id}">0%</span>
                                </div>
                                <div class="w-full bg-gray-600 rounded h-2">
                                    <div id="scan-progress-bar-${this.id}" class="bg-blue-400 h-2 rounded transition-all duration-300" style="width: 0%"></div>
                                </div>
                            </div>
                            <div class="text-sm text-gray-300" id="scan-status-${this.id}">Initializing scan...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initialize() {
        super.initialize();
        
        this.loadAvailableImages();
        this.bindEvents();
        
        // Emit disk analyzer opened event
        this.emitForensicEvent('disk_analyzer_opened', {
            mode: this.analysisMode
        });
    }

    bindEvents() {
        const container = this.windowElement;

        // Mode selector buttons
        container.querySelectorAll('.analysis-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.id.split('-')[1];
                this.switchAnalysisMode(mode);
            });
        });

        // Action buttons
        const mountBtn = container.querySelector(`#mount-image-btn-${this.id}`);
        const scanBtn = container.querySelector(`#deep-scan-btn-${this.id}`);

        mountBtn?.addEventListener('click', () => this.mountSelectedImage());
        scanBtn?.addEventListener('click', () => this.performDeepScan());
    }

    loadAvailableImages() {
        const imageList = this.windowElement.querySelector(`#image-list-${this.id}`);
        if (!imageList) return;

        // Get disk images from evidence store
        const diskImages = this.evidenceStore.getAllEvidence()
            .filter(evidence => evidence.type === 'disk_image');

        if (diskImages.length === 0) {
            imageList.innerHTML = '<div class="text-gray-500 text-sm">No disk images available</div>';
            return;
        }

        imageList.innerHTML = diskImages.map(image => `
            <div class="disk-image-item bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600 transition-colors"
                 data-image-id="${image.id}">
                <div class="flex items-center space-x-2">
                    <i class="bi bi-hdd text-blue-400"></i>
                    <div>
                        <div class="font-semibold text-white text-sm">${image.name}</div>
                        <div class="text-xs text-gray-300">${image.size}</div>
                    </div>
                </div>
            </div>
        `).join('');

        // Bind click events for image selection
        imageList.querySelectorAll('.disk-image-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectImage(item.dataset.imageId);
            });
        });
    }

    selectImage(imageId) {
        // Remove previous selection
        this.windowElement.querySelectorAll('.disk-image-item').forEach(item => {
            item.classList.remove('ring-2', 'ring-blue-400');
        });

        // Add selection to clicked item
        const selectedItem = this.windowElement.querySelector(`[data-image-id="${imageId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('ring-2', 'ring-blue-400');
        }

        this.selectedImage = imageId;
        
        // Update mounted image display
        const evidence = this.evidenceStore.getEvidence(imageId);
        const mountedDisplay = this.windowElement.querySelector('#mounted-image');
        if (mountedDisplay && evidence) {
            mountedDisplay.textContent = evidence.name;
        }
    }

    mountSelectedImage() {
        if (!this.selectedImage) {
            this.showNotification('Please select a disk image first', 'warning');
            return;
        }

        const evidence = this.evidenceStore.getEvidence(this.selectedImage);
        if (!evidence) return;

        // Verify evidence integrity before mounting
        const integrity = this.verifyEvidenceIntegrity(this.selectedImage);
        if (!integrity.valid) {
            this.showNotification('Cannot mount compromised evidence', 'error');
            return;
        }

        this.mountedImage = evidence;
        
        // Update chain of custody
        this.updateChainOfCustody(this.selectedImage, 'image_mounted');

        // Generate filesystem structure
        this.generateFilesystem();

        // Show navigation panel
        const navigation = this.windowElement.querySelector(`#navigation-${this.id}`);
        if (navigation) {
            navigation.classList.remove('hidden');
        }

        // Emit mount event
        this.emitForensicEvent('image_mounted', {
            imageId: this.selectedImage,
            imageName: evidence.name
        });

        this.showNotification('Disk image mounted successfully', 'success');
    }

    generateFilesystem() {
        // Simulate filesystem structure
        this.filesystem = {
            '/': {
                type: 'directory',
                name: 'Root',
                children: {
                    'Users': {
                        type: 'directory',
                        name: 'Users',
                        children: {
                            'TheNull': {
                                type: 'directory',
                                name: 'TheNull',
                                children: {
                                    'Documents': { type: 'directory', name: 'Documents', children: {} },
                                    'Downloads': { type: 'directory', name: 'Downloads', children: {} },
                                    'Desktop': { type: 'directory', name: 'Desktop', children: {} }
                                }
                            }
                        }
                    },
                    'Program Files': {
                        type: 'directory',
                        name: 'Program Files',
                        children: {
                            'Suspicious Software': {
                                type: 'directory',
                                name: 'Suspicious Software',
                                children: {}
                            }
                        }
                    },
                    'Windows': {
                        type: 'directory',
                        name: 'Windows',
                        children: {
                            'System32': { type: 'directory', name: 'System32', children: {} },
                            'Temp': { type: 'directory', name: 'Temp', children: {} }
                        }
                    }
                }
            }
        };

        // Add some files with forensic significance
        this.addForensicFiles();
        
        // Update display
        this.updateFilesystemView();
        this.updateDirectoryTree();
    }

    addForensicFiles() {
        // Add suspicious files to the filesystem
        const forensicFiles = [
            {
                path: '/Users/TheNull/Documents/passwords.txt',
                name: 'passwords.txt',
                size: '2.4KB',
                modified: new Date(Date.now() - 86400000 * 3).toISOString(),
                significance: 'Contains encrypted password hashes',
                deleted: false
            },
            {
                path: '/Users/TheNull/Downloads/cryptor.exe',
                name: 'cryptor.exe',
                size: '156KB',
                modified: new Date(Date.now() - 86400000 * 7).toISOString(),
                significance: 'Potential ransomware executable',
                deleted: false
            },
            {
                path: '/Windows/Temp/communication_logs.dat',
                name: 'communication_logs.dat',
                size: '45KB',
                modified: new Date(Date.now() - 86400000 * 1).toISOString(),
                significance: 'Encrypted communication logs',
                deleted: true // This file was deleted
            },
            {
                path: '/Users/TheNull/Desktop/targets.xlsx',
                name: 'targets.xlsx',
                size: '12KB',
                modified: new Date(Date.now() - 86400000 * 2).toISOString(),
                significance: 'List of potential attack targets',
                deleted: true
            }
        ];

        // Store files in our analysis results
        this.scanResults = forensicFiles;
        
        // Update file count
        const fileCount = this.windowElement.querySelector('#files-count');
        if (fileCount) {
            fileCount.textContent = forensicFiles.filter(f => !f.deleted).length;
        }
    }

    switchAnalysisMode(mode) {
        this.analysisMode = mode;

        // Update button states
        this.windowElement.querySelectorAll('.analysis-mode-btn').forEach(btn => {
            btn.classList.remove('bg-blue-600');
            btn.classList.add('bg-gray-600');
        });

        const activeBtn = this.windowElement.querySelector(`#mode-${mode}-${this.id}`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-gray-600');
            activeBtn.classList.add('bg-blue-600');
        }

        // Hide all views
        this.windowElement.querySelectorAll('.analysis-view').forEach(view => {
            view.classList.add('hidden');
        });

        // Show selected view
        const targetView = this.windowElement.querySelector(`#${mode}-view-${this.id}`);
        if (targetView) {
            targetView.classList.remove('hidden');
        }

        // Update panel title
        const titles = {
            filesystem: 'File System Browser',
            deleted: 'Deleted File Recovery',
            timeline: 'Timeline Analysis'
        };

        const titleElement = this.windowElement.querySelector('#center-panel-title');
        if (titleElement) {
            titleElement.textContent = titles[mode] || 'Analysis';
        }

        // Load appropriate content
        switch (mode) {
            case 'filesystem':
                this.updateFilesystemView();
                break;
            case 'deleted':
                this.updateDeletedFilesView();
                break;
            case 'timeline':
                this.updateTimelineView();
                break;
        }

        // Emit mode change event
        this.emitForensicEvent('analysis_mode_changed', {
            mode,
            imageId: this.selectedImage
        });
    }

    updateFilesystemView() {
        const filesystemView = this.windowElement.querySelector(`#filesystem-view-${this.id}`);
        if (!filesystemView || !this.mountedImage) return;

        const activeFiles = this.scanResults.filter(file => !file.deleted);
        
        filesystemView.innerHTML = activeFiles.length === 0 ? 
            '<div class="text-center text-gray-500 mt-8">No files found in current directory</div>' :
            `
                <div class="space-y-2">
                    ${activeFiles.map(file => `
                        <div class="file-item bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600 transition-colors"
                             data-file-path="${file.path}">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <i class="bi ${this.getFileIcon(file.name)} text-blue-400"></i>
                                    <div>
                                        <div class="font-semibold text-white text-sm">${file.name}</div>
                                        <div class="text-xs text-gray-300">${file.size} • ${new Date(file.modified).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div class="text-xs text-yellow-400">Significant</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

        // Bind file click events
        filesystemView.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectFile(item.dataset.filePath);
            });
        });
    }

    updateDeletedFilesView() {
        const deletedView = this.windowElement.querySelector(`#deleted-files-list-${this.id}`);
        if (!deletedView) return;

        const deletedFiles = this.scanResults.filter(file => file.deleted);
        
        deletedView.innerHTML = deletedFiles.length === 0 ?
            '<div class="text-center text-gray-500 mt-8">No deleted files found</div>' :
            `
                <div class="mb-4">
                    <div class="text-sm text-yellow-400 mb-2">
                        Found ${deletedFiles.length} recoverable deleted files
                    </div>
                </div>
                <div class="space-y-2">
                    ${deletedFiles.map(file => `
                        <div class="deleted-file-item bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600 transition-colors border-l-4 border-red-500"
                             data-file-path="${file.path}">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <i class="bi ${this.getFileIcon(file.name)} text-red-400"></i>
                                    <div>
                                        <div class="font-semibold text-white text-sm">${file.name}</div>
                                        <div class="text-xs text-gray-300">${file.size} • Deleted ${new Date(file.modified).toLocaleDateString()}</div>
                                        <div class="text-xs text-yellow-400">${file.significance}</div>
                                    </div>
                                </div>
                                <button class="recover-btn bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs font-semibold"
                                        data-file-path="${file.path}">
                                    Recover
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

        // Bind recovery button events
        deletedView.querySelectorAll('.recover-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.recoverDeletedFile(btn.dataset.filePath);
            });
        });

        // Bind file click events
        deletedView.querySelectorAll('.deleted-file-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectFile(item.dataset.filePath);
            });
        });
    }

    updateTimelineView() {
        const timelineView = this.windowElement.querySelector(`#timeline-container-${this.id}`);
        if (!timelineView) return;

        // Create timeline events from file modifications
        const timelineEvents = this.scanResults.map(file => ({
            timestamp: file.modified,
            event: file.deleted ? 'File deleted' : 'File modified',
            details: `${file.name} (${file.size})`,
            significance: file.significance,
            type: file.deleted ? 'deletion' : 'modification'
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        timelineView.innerHTML = `
            <div class="timeline-container">
                <div class="text-sm text-yellow-400 mb-4">
                    Timeline of file system activities (${timelineEvents.length} events)
                </div>
                <div class="space-y-3">
                    ${timelineEvents.map((event, index) => `
                        <div class="timeline-event bg-gray-700 p-3 rounded border-l-4 ${
                            event.type === 'deletion' ? 'border-red-500' : 'border-blue-500'
                        }">
                            <div class="flex justify-between items-start">
                                <div>
                                    <div class="font-semibold text-white text-sm">${event.event}</div>
                                    <div class="text-sm text-gray-300">${event.details}</div>
                                    <div class="text-xs text-yellow-400 mt-1">${event.significance}</div>
                                </div>
                                <div class="text-xs text-gray-400">
                                    ${new Date(event.timestamp).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    selectFile(filePath) {
        const file = this.scanResults.find(f => f.path === filePath);
        if (!file) return;

        this.selectedFile = file;
        this.displayFileDetails(file);

        // Update chain of custody
        this.updateChainOfCustody(this.selectedImage, `file_examined: ${file.name}`);

        // Emit file selection event
        this.emitForensicEvent('file_selected', {
            fileName: file.name,
            filePath: filePath,
            deleted: file.deleted
        });
    }

    displayFileDetails(file) {
        const detailsContainer = this.windowElement.querySelector(`#file-details-${this.id}`);
        if (!detailsContainer) return;

        detailsContainer.innerHTML = `
            <div class="space-y-4">
                <!-- File Information -->
                <div>
                    <h4 class="font-semibold text-white mb-2 flex items-center">
                        <i class="bi ${this.getFileIcon(file.name)} mr-2"></i>
                        ${file.name}
                    </h4>
                    <div class="space-y-1 text-sm">
                        <div><span class="text-gray-300">Path:</span> <span class="text-blue-400 text-xs font-mono">${file.path}</span></div>
                        <div><span class="text-gray-300">Size:</span> <span class="text-blue-400">${file.size}</span></div>
                        <div><span class="text-gray-300">Modified:</span> <span class="text-blue-400">${new Date(file.modified).toLocaleString()}</span></div>
                        <div><span class="text-gray-300">Status:</span> 
                            <span class="${file.deleted ? 'text-red-400' : 'text-green-400'}">
                                ${file.deleted ? 'Deleted' : 'Active'}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Forensic Significance -->
                <div class="border-t border-gray-600 pt-3">
                    <h5 class="font-semibold text-white mb-2">Forensic Analysis</h5>
                    <div class="bg-yellow-900 bg-opacity-50 p-3 rounded">
                        <div class="text-sm text-yellow-200">${file.significance}</div>
                    </div>
                </div>

                <!-- File Actions -->
                <div class="border-t border-gray-600 pt-3 space-y-2">
                    <button class="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-semibold"
                            onclick="window.diskAnalyzer.analyzeFile('${file.path}')">
                        Deep Analysis
                    </button>
                    <button class="w-full bg-green-600 hover:bg-green-700 py-2 rounded text-sm font-semibold"
                            onclick="window.diskAnalyzer.extractMetadata('${file.path}')">
                        Extract Metadata
                    </button>
                    ${file.deleted ? `
                        <button class="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded text-sm font-semibold"
                                onclick="window.diskAnalyzer.recoverDeletedFile('${file.path}')">
                            Recover File
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        // Store reference for callbacks
        window.diskAnalyzer = this;
    }

    getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const icons = {
            'txt': 'bi-file-text',
            'exe': 'bi-file-binary',
            'dat': 'bi-file-binary',
            'xlsx': 'bi-file-spreadsheet',
            'jpg': 'bi-file-image',
            'png': 'bi-file-image',
            'pdf': 'bi-file-pdf',
            'zip': 'bi-file-zip'
        };
        return icons[ext] || 'bi-file-earmark';
    }

    recoverDeletedFile(filePath) {
        const file = this.scanResults.find(f => f.path === filePath);
        if (!file || !file.deleted) return;

        // Simulate recovery process
        file.deleted = false;
        this.recoveredFiles.push(file);

        // Update chain of custody
        this.updateChainOfCustody(this.selectedImage, `file_recovered: ${file.name}`);

        // Emit recovery event
        this.emitForensicEvent('file_recovered', {
            fileName: file.name,
            filePath: filePath,
            significance: file.significance
        });

        // Update views
        this.updateDeletedFilesView();
        this.updateFilesystemView();

        this.showNotification(`File "${file.name}" recovered successfully`, 'success');
    }

    analyzeFile(filePath) {
        const file = this.scanResults.find(f => f.path === filePath);
        if (!file) return;

        // Simulate file analysis
        const analysisResult = {
            fileName: file.name,
            fileType: this.detectFileType(file.name),
            entropy: Math.random() * 8, // Randomized entropy for demo
            suspicious: file.significance.includes('ransomware') || file.significance.includes('encrypted'),
            findings: this.generateAnalysisFindings(file)
        };

        // Update chain of custody
        this.updateChainOfCustody(this.selectedImage, `file_analyzed: ${file.name}`);

        // Emit analysis event
        this.emitForensicEvent('file_analyzed', {
            ...analysisResult,
            filePath
        });

        this.showNotification(`Analysis complete for "${file.name}"`, 'success');
    }

    extractMetadata(filePath) {
        const file = this.scanResults.find(f => f.path === filePath);
        if (!file) return;

        // Simulate metadata extraction
        const metadata = {
            created: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
            accessed: file.modified,
            modified: file.modified,
            attributes: ['Hidden', 'System'].filter(() => Math.random() > 0.5),
            owner: 'TheNull',
            permissions: '755'
        };

        // Update chain of custody
        this.updateChainOfCustody(this.selectedImage, `metadata_extracted: ${file.name}`);

        // Emit metadata event
        this.emitForensicEvent('metadata_extracted', {
            fileName: file.name,
            filePath,
            metadata
        });

        this.showNotification(`Metadata extracted for "${file.name}"`, 'success');
    }

    detectFileType(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const types = {
            'exe': 'Executable',
            'txt': 'Text Document',
            'dat': 'Data File',
            'xlsx': 'Spreadsheet',
            'jpg': 'Image',
            'png': 'Image',
            'pdf': 'PDF Document'
        };
        return types[ext] || 'Unknown';
    }

    generateAnalysisFindings(file) {
        const findings = [];
        
        if (file.significance.includes('password')) {
            findings.push('Contains credential information');
        }
        if (file.significance.includes('encrypted')) {
            findings.push('File appears to be encrypted');
        }
        if (file.significance.includes('ransomware')) {
            findings.push('Potential malware signature detected');
        }
        if (file.significance.includes('targets')) {
            findings.push('Contains target list data');
        }

        return findings;
    }

    performDeepScan() {
        if (!this.mountedImage) {
            this.showNotification('Please mount a disk image first', 'warning');
            return;
        }

        // Show scan modal
        const modal = this.windowElement.querySelector(`#scan-modal-${this.id}`);
        if (modal) {
            modal.classList.remove('hidden');
        }

        // Simulate scanning process
        this.simulateScanProgress();
    }

    simulateScanProgress() {
        const progressBar = this.windowElement.querySelector(`#scan-progress-bar-${this.id}`);
        const progressText = this.windowElement.querySelector(`#scan-progress-${this.id}`);
        const statusText = this.windowElement.querySelector(`#scan-status-${this.id}`);
        
        const steps = [
            { progress: 20, status: 'Analyzing file allocation table...' },
            { progress: 40, status: 'Scanning for deleted files...' },
            { progress: 60, status: 'Extracting metadata...' },
            { progress: 80, status: 'Building timeline...' },
            { progress: 100, status: 'Scan complete!' }
        ];

        let currentStep = 0;
        
        const updateProgress = () => {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                
                if (progressBar) progressBar.style.width = `${step.progress}%`;
                if (progressText) progressText.textContent = `${step.progress}%`;
                if (statusText) statusText.textContent = step.status;
                
                currentStep++;
                setTimeout(updateProgress, 1000);
            } else {
                // Scan complete
                setTimeout(() => {
                    this.closeScanModal();
                    this.completeScan();
                }, 1000);
            }
        };

        updateProgress();
    }

    closeScanModal() {
        const modal = this.windowElement.querySelector(`#scan-modal-${this.id}`);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    completeScan() {
        // Add additional forensic evidence from deep scan
        const additionalFiles = [
            {
                path: '/Windows/System32/config/security.log',
                name: 'security.log',
                size: '890KB',
                modified: new Date(Date.now() - 86400000 * 1).toISOString(),
                significance: 'Contains login attempts and security events',
                deleted: false
            }
        ];

        this.scanResults.push(...additionalFiles);

        // Update chain of custody
        this.updateChainOfCustody(this.selectedImage, 'deep_scan_completed');

        // Emit scan complete event
        this.emitForensicEvent('deep_scan_completed', {
            imageId: this.selectedImage,
            additionalFiles: additionalFiles.length,
            totalFiles: this.scanResults.length
        });

        // Refresh current view
        this.switchAnalysisMode(this.analysisMode);

        this.showNotification('Deep scan completed - Additional evidence found', 'success');
    }

    updateDirectoryTree() {
        const treeContainer = this.windowElement.querySelector(`#directory-tree-${this.id}`);
        if (!treeContainer || !this.filesystem) return;

        treeContainer.innerHTML = this.renderDirectoryTree(this.filesystem['/'], '/');
    }

    renderDirectoryTree(node, path) {
        if (!node.children) return '';

        return Object.entries(node.children).map(([name, child]) => {
            const fullPath = path === '/' ? `/${name}` : `${path}/${name}`;
            const hasChildren = child.children && Object.keys(child.children).length > 0;
            
            return `
                <div class="tree-item">
                    <div class="flex items-center space-x-1 py-1 cursor-pointer hover:bg-gray-700 rounded px-1"
                         data-path="${fullPath}">
                        <i class="bi ${child.type === 'directory' ? 'bi-folder' : 'bi-file-earmark'} text-yellow-400"></i>
                        <span class="text-sm">${name}</span>
                    </div>
                    ${hasChildren ? `<div class="ml-4">${this.renderDirectoryTree(child, fullPath)}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    showNotification(message, type = 'info') {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded z-50 ${
            type === 'success' ? 'bg-green-600' :
            type === 'warning' ? 'bg-yellow-600' :
            type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        } text-white`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Export for use by application registry
export default DiskAnalyzerApp;