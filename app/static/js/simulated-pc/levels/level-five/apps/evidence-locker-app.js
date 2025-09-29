import { ForensicAppBase } from './forensic-app-base.js';

/**
 * Evidence Locker Application - Level 5
 * Visual inventory system for collected evidence with chain of custody tracking
 */
export class EvidenceLockerApp extends ForensicAppBase {
    constructor() {
        super('evidence-locker', 'Digital Evidence Locker', {
            width: '75%',
            height: '65%'
        });
        
        this.selectedEvidence = null;
        this.filterType = 'all';
        this.sortBy = 'acquisition_time';
    }

    createContent() {
        return `
            <div class="evidence-locker-app h-full bg-black text-white p-4 overflow-hidden">
                <!-- Header -->
                <div class="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                    <h2 class="text-xl font-bold text-green-400">Digital Evidence Locker</h2>
                    <div class="flex space-x-4">
                        <div class="text-sm">
                            <span class="text-gray-300">Total Evidence:</span>
                            <span class="text-green-400 font-semibold" id="evidence-count">0</span>
                        </div>
                        <div class="text-sm">
                            <span class="text-gray-300">Analyzed:</span>
                            <span class="text-blue-400 font-semibold" id="analyzed-count">0</span>
                        </div>
                    </div>
                </div>

                <!-- Forensic UI Elements -->
                ${this.createForensicUI().evidencePanel}
                ${this.createForensicUI().complianceIndicator}

                <!-- Controls -->
                <div class="flex justify-between items-center mb-4">
                    <div class="flex space-x-4">
                        <select id="evidence-filter-${this.id}" class="bg-gray-700 text-white px-3 py-1 rounded">
                            <option value="all">All Evidence</option>
                            <option value="disk_image">Disk Images</option>
                            <option value="memory_dump">Memory Dumps</option>
                            <option value="network_capture">Network Captures</option>
                        </select>
                        <select id="evidence-sort-${this.id}" class="bg-gray-700 text-white px-3 py-1 rounded">
                            <option value="acquisition_time">Sort by Time</option>
                            <option value="relevance_score">Sort by Relevance</option>
                            <option value="name">Sort by Name</option>
                            <option value="size">Sort by Size</option>
                        </select>
                    </div>
                    <button id="verify-all-btn-${this.id}" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold">
                        Verify All Evidence
                    </button>
                </div>

                <!-- Evidence Grid -->
                <div class="grid grid-cols-12 gap-4 h-full">
                    <!-- Evidence List -->
                    <div class="col-span-8 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-yellow-400">Evidence Inventory</h3>
                        <div id="evidence-list-${this.id}" class="space-y-2">
                            <!-- Evidence items will be populated here -->
                        </div>
                    </div>

                    <!-- Evidence Details -->
                    <div class="col-span-4 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-yellow-400">Evidence Details</h3>
                        <div id="evidence-details-${this.id}" class="text-sm text-gray-300">
                            <div class="text-center text-gray-500 mt-8">
                                Select evidence to view details
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chain of Custody Modal -->
                <div id="custody-modal-${this.id}" class="fixed inset-0 bg-black bg-opacity-75 hidden z-50 flex items-center justify-center">
                    <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-4 text-green-400">Chain of Custody</h3>
                        <div id="custody-details-${this.id}">
                            <!-- Chain of custody details will be populated here -->
                        </div>
                        <div class="flex justify-end mt-4">
                            <button id="close-custody-modal-${this.id}" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initialize() {
        super.initialize();
        
        this.loadEvidence();
        this.bindEvents();
        
        // Emit evidence locker opened event
        this.emitForensicEvent('evidence_locker_opened', {
            totalEvidence: this.evidenceStore.getAllEvidence().length
        });
    }

    bindEvents() {
        const container = this.windowElement;

        // Filter and sort controls
        const filterSelect = container.querySelector(`#evidence-filter-${this.id}`);
        const sortSelect = container.querySelector(`#evidence-sort-${this.id}`);
        
        filterSelect?.addEventListener('change', (e) => {
            this.filterType = e.target.value;
            this.loadEvidence();
        });

        sortSelect?.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.loadEvidence();
        });

        // Verify all button
        const verifyBtn = container.querySelector(`#verify-all-btn-${this.id}`);
        verifyBtn?.addEventListener('click', () => {
            this.verifyAllEvidence();
        });

        // Close custody modal
        const closeCustodyBtn = container.querySelector(`#close-custody-modal-${this.id}`);
        closeCustodyBtn?.addEventListener('click', () => {
            this.closeCustodyModal();
        });
    }

    loadEvidence() {
        const evidenceList = this.windowElement.querySelector(`#evidence-list-${this.id}`);
        if (!evidenceList) return;

        let evidence = this.evidenceStore.getAllEvidence();
        
        // Apply filter
        if (this.filterType !== 'all') {
            evidence = evidence.filter(item => item.type === this.filterType);
        }

        // Apply sort
        evidence.sort((a, b) => {
            switch (this.sortBy) {
                case 'relevance_score':
                    return b.relevance_score - a.relevance_score;
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'size':
                    return this.parseSizeForSort(b.size) - this.parseSizeForSort(a.size);
                case 'acquisition_time':
                default:
                    return new Date(b.acquisition_time) - new Date(a.acquisition_time);
            }
        });

        evidenceList.innerHTML = evidence.map(item => this.createEvidenceItem(item)).join('');

        // Update counts
        this.updateCounts(evidence);

        // Bind evidence item clicks
        evidenceList.querySelectorAll('.evidence-item').forEach(item => {
            item.addEventListener('click', () => {
                const evidenceId = item.dataset.evidenceId;
                this.selectEvidence(evidenceId);
            });
        });
    }

    createEvidenceItem(evidence) {
        const integrityStatus = this.verifyEvidenceIntegrity(evidence.id);
        const statusColor = integrityStatus.valid ? 'text-green-400' : 'text-red-400';
        const statusIcon = integrityStatus.valid ? 'bi-shield-check' : 'bi-shield-exclamation';
        
        return `
            <div class="evidence-item bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600 transition-colors" 
                 data-evidence-id="${evidence.id}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="bi ${this.getEvidenceIcon(evidence.type)} text-2xl text-blue-400"></i>
                        <div>
                            <div class="font-semibold text-white">${evidence.name}</div>
                            <div class="text-sm text-gray-300">${evidence.type} • ${evidence.size}</div>
                            <div class="text-xs text-gray-400">
                                ${new Date(evidence.acquisition_time).toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="text-right">
                            <div class="text-sm ${statusColor}">
                                <i class="bi ${statusIcon}"></i>
                                ${integrityStatus.valid ? 'Verified' : 'Compromised'}
                            </div>
                            <div class="text-xs text-gray-400">
                                Relevance: ${(evidence.relevance_score * 100).toFixed(0)}%
                            </div>
                        </div>
                        <button class="custody-btn bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                                data-evidence-id="${evidence.id}">
                            Chain
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getEvidenceIcon(type) {
        const icons = {
            'disk_image': 'bi-hdd',
            'memory_dump': 'bi-memory',
            'network_capture': 'bi-diagram-3',
            'log_files': 'bi-journal-text',
            'registry_entries': 'bi-gear',
            'deleted_files': 'bi-trash',
            'metadata': 'bi-tags',
            'browser_history': 'bi-globe',
            'encrypted_volumes': 'bi-lock'
        };
        return icons[type] || 'bi-file-earmark';
    }

    selectEvidence(evidenceId) {
        // Remove previous selection
        this.windowElement.querySelectorAll('.evidence-item').forEach(item => {
            item.classList.remove('ring-2', 'ring-green-400');
        });

        // Add selection to clicked item
        const selectedItem = this.windowElement.querySelector(`[data-evidence-id="${evidenceId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('ring-2', 'ring-green-400');
        }

        this.selectedEvidence = evidenceId;
        this.displayEvidenceDetails(evidenceId);

        // Update chain of custody
        this.updateChainOfCustody(evidenceId, 'evidence_selected');

        // Emit selection event
        this.emitForensicEvent('evidence_selected', {
            evidenceId,
            evidenceName: this.evidenceStore.getEvidence(evidenceId)?.name
        });
    }

    displayEvidenceDetails(evidenceId) {
        const evidence = this.evidenceStore.getEvidence(evidenceId);
        const detailsContainer = this.windowElement.querySelector(`#evidence-details-${this.id}`);
        
        if (!evidence || !detailsContainer) return;

        const integrityStatus = this.verifyEvidenceIntegrity(evidenceId);
        
        detailsContainer.innerHTML = `
            <div class="space-y-4">
                <!-- Basic Information -->
                <div>
                    <h4 class="font-semibold text-white mb-2">${evidence.name}</h4>
                    <div class="space-y-1 text-sm">
                        <div><span class="text-gray-300">Type:</span> <span class="text-blue-400">${evidence.type}</span></div>
                        <div><span class="text-gray-300">Source:</span> <span class="text-blue-400">${evidence.source}</span></div>
                        <div><span class="text-gray-300">Size:</span> <span class="text-blue-400">${evidence.size}</span></div>
                        <div><span class="text-gray-300">Acquired:</span> <span class="text-blue-400">${new Date(evidence.acquisition_time).toLocaleString()}</span></div>
                    </div>
                </div>

                <!-- Hash Verification -->
                <div class="border-t border-gray-600 pt-3">
                    <h5 class="font-semibold text-white mb-2">Hash Verification</h5>
                    <div class="space-y-1 text-xs">
                        <div class="flex justify-between">
                            <span class="text-gray-300">Status:</span>
                            <span class="${integrityStatus.valid ? 'text-green-400' : 'text-red-400'}">
                                ${integrityStatus.valid ? 'Verified' : 'Failed'}
                            </span>
                        </div>
                        <div><span class="text-gray-300">MD5:</span> <span class="text-blue-400 font-mono">${evidence.hash_md5}</span></div>
                        <div><span class="text-gray-300">SHA256:</span> <span class="text-blue-400 font-mono break-all">${evidence.hash_sha256}</span></div>
                    </div>
                </div>

                <!-- Analysis Status -->
                <div class="border-t border-gray-600 pt-3">
                    <h5 class="font-semibold text-white mb-2">Analysis Status</h5>
                    <div class="space-y-1 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-300">Complete:</span>
                            <span class="${evidence.analysis_complete ? 'text-green-400' : 'text-yellow-400'}">
                                ${evidence.analysis_complete ? 'Yes' : 'Pending'}
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">Relevance:</span>
                            <span class="text-blue-400">${(evidence.relevance_score * 100).toFixed(0)}%</span>
                        </div>
                        <div class="text-gray-300">Findings: <span class="text-blue-400">${evidence.findings.length}</span></div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="border-t border-gray-600 pt-3 space-y-2">
                    <button class="w-full bg-green-600 hover:bg-green-700 py-2 rounded text-sm font-semibold"
                            onclick="window.evidenceLocker.analyzeEvidence('${evidenceId}')">
                        Analyze Evidence
                    </button>
                    <button class="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-semibold"
                            onclick="window.evidenceLocker.showChainOfCustody('${evidenceId}')">
                        View Chain of Custody
                    </button>
                    <button class="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded text-sm font-semibold"
                            onclick="window.evidenceLocker.exportEvidence('${evidenceId}')">
                        Export Evidence
                    </button>
                </div>
            </div>
        `;

        // Store reference for button callbacks
        window.evidenceLocker = this;
    }

    analyzeEvidence(evidenceId) {
        const evidence = this.evidenceStore.getEvidence(evidenceId);
        if (!evidence) return;

        // Simulate analysis process
        evidence.analysis_complete = true;
        evidence.findings.push({
            timestamp: new Date().toISOString(),
            type: 'automated_analysis',
            description: `Automated analysis completed for ${evidence.type}`,
            confidence: 0.8
        });

        // Update chain of custody
        this.updateChainOfCustody(evidenceId, 'evidence_analyzed');

        // Emit analysis event
        this.emitForensicEvent('evidence_analyzed', {
            evidenceId,
            analysisType: 'automated',
            findings: evidence.findings
        });

        // Refresh display
        this.displayEvidenceDetails(evidenceId);
        this.loadEvidence();

        // Show success notification
        this.showNotification('Evidence analysis completed successfully', 'success');
    }

    showChainOfCustody(evidenceId) {
        const modal = this.windowElement.querySelector(`#custody-modal-${this.id}`);
        const custodyDetails = this.windowElement.querySelector(`#custody-details-${this.id}`);
        
        if (!modal || !custodyDetails) return;

        // Get chain of custody for this evidence
        const custodyEntries = this.evidenceStore.chainOfCustodyLog
            .filter(entry => entry.evidenceId === evidenceId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        custodyDetails.innerHTML = `
            <div class="space-y-3">
                ${custodyEntries.length === 0 ? 
                    '<div class="text-gray-400 text-center">No chain of custody entries found</div>' :
                    custodyEntries.map(entry => `
                        <div class="bg-gray-700 p-3 rounded">
                            <div class="flex justify-between items-start">
                                <div>
                                    <div class="font-semibold text-white">${entry.action}</div>
                                    <div class="text-sm text-gray-300">By: ${entry.user}</div>
                                    <div class="text-xs text-gray-400">${entry.location || 'Digital Evidence Locker'}</div>
                                </div>
                                <div class="text-xs text-gray-400">
                                    ${new Date(entry.timestamp).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        `;

        modal.classList.remove('hidden');
    }

    closeCustodyModal() {
        const modal = this.windowElement.querySelector(`#custody-modal-${this.id}`);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    exportEvidence(evidenceId) {
        const evidence = this.evidenceStore.getEvidence(evidenceId);
        if (!evidence) return;

        // Update chain of custody
        this.updateChainOfCustody(evidenceId, 'evidence_exported');

        // Emit export event
        this.emitForensicEvent('evidence_exported', {
            evidenceId,
            format: 'forensic_package'
        });

        // Show notification
        this.showNotification('Evidence package exported successfully', 'success');
    }

    verifyAllEvidence() {
        const evidence = this.evidenceStore.getAllEvidence();
        let verified = 0;
        let compromised = 0;

        evidence.forEach(item => {
            const result = this.verifyEvidenceIntegrity(item.id);
            if (result.valid) {
                verified++;
            } else {
                compromised++;
            }
        });

        // Update chain of custody for verification
        this.updateChainOfCustody('bulk_verification', 'all_evidence_verified');

        // Emit verification event
        this.emitForensicEvent('bulk_verification_complete', {
            total: evidence.length,
            verified,
            compromised
        });

        // Refresh display
        this.loadEvidence();

        // Show results
        const message = compromised > 0 ? 
            `Verification complete: ${verified} verified, ${compromised} compromised` :
            `All ${verified} evidence items verified successfully`;
        
        this.showNotification(message, compromised > 0 ? 'warning' : 'success');
    }

    updateCounts(evidence) {
        const totalCount = this.windowElement.querySelector('#evidence-count');
        const analyzedCount = this.windowElement.querySelector('#analyzed-count');

        if (totalCount) {
            totalCount.textContent = evidence.length;
        }

        if (analyzedCount) {
            const analyzed = evidence.filter(item => item.analysis_complete).length;
            analyzedCount.textContent = analyzed;
        }
    }

    parseSizeForSort(sizeStr) {
        const units = { 'B': 1, 'KB': 1024, 'MB': 1024**2, 'GB': 1024**3, 'TB': 1024**4 };
        const match = sizeStr.match(/^([\d.]+)\s*([A-Z]{0,2})$/i);
        if (!match) return 0;
        const [, size, unit] = match;
        return parseFloat(size) * (units[unit.toUpperCase()] || 1);
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
export default EvidenceLockerApp;