import { ForensicAppBase } from './forensic-app-base.js';

/**
 * Memory Forensics Application - Level 5
 * Analysis of memory dumps for process examination and malware detection
 */
export class MemoryForensicsApp extends ForensicAppBase {
    constructor() {
        super('memory-forensics', 'Memory Forensics Suite', {
            width: '75%',
            height: '70%'
        });
        
        this.loadedDump = null;
        this.processes = [];
        this.networkConnections = [];
        this.suspiciousProcesses = [];
        this.analysisMode = 'processes'; // 'processes', 'network', 'malware'
    }

    createContent() {
        return `
            <div class="memory-forensics-app h-full bg-black text-white p-4 overflow-auto flex flex-col">
                <!-- Header -->
                <div class="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                    <h2 class="text-xl font-bold text-purple-400">Memory Forensics Suite</h2>
                    <div class="flex space-x-4 text-sm">
                        <div>
                            <span class="text-gray-300">Loaded:</span>
                            <span class="text-purple-400 font-semibold" id="loaded-dump">None</span>
                        </div>
                        <div>
                            <span class="text-gray-300">Processes:</span>
                            <span class="text-green-400 font-semibold" id="process-count">0</span>
                        </div>
                        <div>
                            <span class="text-gray-300">Threats:</span>
                            <span class="text-red-400 font-semibold" id="threat-count">0</span>
                        </div>
                    </div>
                </div>

                <!-- Forensic UI Elements -->
                ${this.createForensicUI().evidencePanel}

                <!-- Analysis Mode Selector -->
                <div class="flex justify-between items-center mb-4">
                    <div class="flex space-x-2">
                        <button id="mode-processes-${this.id}" class="analysis-mode-btn bg-purple-600 px-4 py-2 rounded text-sm font-semibold">
                            Process Analysis
                        </button>
                        <button id="mode-network-${this.id}" class="analysis-mode-btn bg-gray-600 px-4 py-2 rounded text-sm">
                            Network Connections
                        </button>
                        <button id="mode-malware-${this.id}" class="analysis-mode-btn bg-gray-600 px-4 py-2 rounded text-sm">
                            Malware Detection
                        </button>
                    </div>
                    <div class="flex space-x-2">
                        <button id="load-dump-btn-${this.id}" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold">
                            Load Memory Dump
                        </button>
                        <button id="analyze-dump-btn-${this.id}" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold">
                            Analyze Memory
                        </button>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div class="grid grid-cols-12 gap-4 h-full">
                    <!-- Left Panel - Memory Dumps / Process Tree -->
                    <div class="col-span-3 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-yellow-400">Memory Dumps</h3>
                        <div id="dump-list-${this.id}" class="space-y-2 mb-4">
                            <!-- Available memory dumps will be populated here -->
                        </div>
                        
                        <!-- Process Tree for loaded dump -->
                        <div id="process-tree-${this.id}" class="hidden">
                            <h4 class="font-semibold mb-2 text-green-400">Process Tree</h4>
                            <div id="process-hierarchy-${this.id}" class="text-sm">
                                <!-- Process hierarchy will be populated here -->
                            </div>
                        </div>
                    </div>

                    <!-- Center Panel - Analysis Results -->
                    <div class="col-span-6 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-yellow-400" id="center-panel-title">Process Analysis</h3>
                        
                        <!-- Process Analysis View -->
                        <div id="processes-view-${this.id}" class="analysis-view">
                            <div class="text-center text-gray-500 mt-8">
                                Load a memory dump to begin process analysis
                            </div>
                        </div>

                        <!-- Network Analysis View -->
                        <div id="network-view-${this.id}" class="analysis-view hidden">
                            <div id="network-connections-list-${this.id}">
                                <!-- Network connections will be shown here -->
                            </div>
                        </div>

                        <!-- Malware Detection View -->
                        <div id="malware-view-${this.id}" class="analysis-view hidden">
                            <div id="malware-detection-results-${this.id}">
                                <!-- Malware detection results will be shown here -->
                            </div>
                        </div>
                    </div>

                    <!-- Right Panel - Process Details / Analysis -->
                    <div class="col-span-3 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-yellow-400">Analysis Details</h3>
                        <div id="analysis-details-${this.id}">
                            <div class="text-center text-gray-500 mt-8">
                                Select a process to view details
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Analysis Progress Modal -->
                <div id="analysis-modal-${this.id}" class="fixed inset-0 bg-black bg-opacity-75 hidden z-50 flex items-center justify-center">
                    <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 class="text-lg font-semibold mb-4 text-purple-400">Analyzing Memory Dump</h3>
                        <div class="space-y-4">
                            <div class="bg-gray-700 rounded p-3">
                                <div class="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span id="analysis-progress-${this.id}">0%</span>
                                </div>
                                <div class="w-full bg-gray-600 rounded h-2">
                                    <div id="analysis-progress-bar-${this.id}" class="bg-purple-400 h-2 rounded transition-all duration-300" style="width: 0%"></div>
                                </div>
                            </div>
                            <div class="text-sm text-gray-300" id="analysis-status-${this.id}">Initializing analysis...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initialize() {
        super.initialize();
        
        this.loadAvailableMemoryDumps();
        this.bindEvents();
        
        // Emit memory forensics opened event
        this.emitForensicEvent('memory_forensics_opened', {
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
        const loadBtn = container.querySelector(`#load-dump-btn-${this.id}`);
        const analyzeBtn = container.querySelector(`#analyze-dump-btn-${this.id}`);

        loadBtn?.addEventListener('click', () => this.loadSelectedDump());
        analyzeBtn?.addEventListener('click', () => this.performMemoryAnalysis());
    }

    loadAvailableMemoryDumps() {
        const dumpList = this.windowElement.querySelector(`#dump-list-${this.id}`);
        if (!dumpList) return;

        // Get memory dumps from evidence store
        const memoryDumps = this.evidenceStore.getAllEvidence()
            .filter(evidence => evidence.type === 'memory_dump');

        if (memoryDumps.length === 0) {
            dumpList.innerHTML = '<div class="text-gray-500 text-sm">No memory dumps available</div>';
            return;
        }

        dumpList.innerHTML = memoryDumps.map(dump => `
            <div class="memory-dump-item bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600 transition-colors"
                 data-dump-id="${dump.id}">
                <div class="flex items-center space-x-2">
                    <i class="bi bi-memory text-purple-400"></i>
                    <div>
                        <div class="font-semibold text-white text-sm">${dump.name}</div>
                        <div class="text-xs text-gray-300">${dump.size}</div>
                    </div>
                </div>
            </div>
        `).join('');

        // Bind click events for dump selection
        dumpList.querySelectorAll('.memory-dump-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectMemoryDump(item.dataset.dumpId);
            });
        });
    }

    selectMemoryDump(dumpId) {
        // Remove previous selection
        this.windowElement.querySelectorAll('.memory-dump-item').forEach(item => {
            item.classList.remove('ring-2', 'ring-purple-400');
        });

        // Add selection to clicked item
        const selectedItem = this.windowElement.querySelector(`[data-dump-id="${dumpId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('ring-2', 'ring-purple-400');
        }

        this.selectedDump = dumpId;
        
        // Update loaded dump display
        const evidence = this.evidenceStore.getEvidence(dumpId);
        const loadedDisplay = this.windowElement.querySelector('#loaded-dump');
        if (loadedDisplay && evidence) {
            loadedDisplay.textContent = evidence.name;
        }
    }

    loadSelectedDump() {
        if (!this.selectedDump) {
            this.showNotification('Please select a memory dump first', 'warning');
            return;
        }

        const evidence = this.evidenceStore.getEvidence(this.selectedDump);
        if (!evidence) return;

        // Verify evidence integrity before loading
        const integrity = this.verifyEvidenceIntegrity(this.selectedDump);
        if (!integrity.valid) {
            this.showNotification('Cannot load compromised evidence', 'error');
            return;
        }

        this.loadedDump = evidence;
        
        // Update chain of custody
        this.updateChainOfCustody(this.selectedDump, 'memory_dump_loaded');

        // Generate process data
        this.generateProcessData();

        // Show process tree
        const processTree = this.windowElement.querySelector(`#process-tree-${this.id}`);
        if (processTree) {
            processTree.classList.remove('hidden');
        }

        // Emit load event
        this.emitForensicEvent('memory_dump_loaded', {
            dumpId: this.selectedDump,
            dumpName: evidence.name,
            processCount: this.processes.length
        });

        this.showNotification('Memory dump loaded successfully', 'success');
    }

    generateProcessData() {
        // Simulate process data with forensic significance
        this.processes = [
            {
                pid: 1234,
                name: 'explorer.exe',
                parent: 456,
                priority: 8,
                threads: 12,
                memory: '45MB',
                cpu: '2.3%',
                suspicious: false,
                commandLine: 'C:\\Windows\\explorer.exe',
                startTime: new Date(Date.now() - 86400000).toISOString()
            },
            {
                pid: 5678,
                name: 'cryptor.exe',
                parent: 1234,
                priority: 15,
                threads: 4,
                memory: '128MB',
                cpu: '45.7%',
                suspicious: true,
                commandLine: 'C:\\Users\\TheNull\\Downloads\\cryptor.exe -encrypt',
                startTime: new Date(Date.now() - 3600000).toISOSt
            },
            {
                pid: 9012,
                name: 'svchost.exe',
                parent: 456,
                priority: 8,
                threads: 8,
                memory: '23MB',
                cpu: '1.2%',
                suspicious: false,
                commandLine: 'C:\\Windows\\System32\\svchost.exe -k NetworkService',
                startTime: new Date(Date.now() - 86400000 * 2).toISOString()
            },
            {
                pid: 3456,
                name: 'backdoor.exe',
                parent: 5678,
                priority: 12,
                threads: 2,
                memory: '67MB',
                cpu: '23.1%',
                suspicious: true,
                commandLine: 'C:\\Windows\\Temp\\backdoor.exe -stealth -port 4444',
                startTime: new Date(Date.now() - 7200000).toISOString()
            },
            {
                pid: 7890,
                name: 'chrome.exe',
                parent: 1234,
                priority: 8,
                threads: 16,
                memory: '234MB',
                cpu: '5.4%',
                suspicious: false,
                commandLine: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                startTime: new Date(Date.now() - 14400000).toISOString()
            }
        ];

        // Generate network connections
        this.networkConnections = [
            {
                pid: 5678,
                process: 'cryptor.exe',
                protocol: 'TCP',
                localAddress: '192.168.1.100',
                localPort: 49152,
                remoteAddress: '185.243.67.89',
                remotePort: 443,
                state: 'ESTABLISHED',
                suspicious: true,
                description: 'Suspicious outbound connection to known C&C server'
            },
            {
                pid: 3456,
                process: 'backdoor.exe',
                protocol: 'TCP',
                localAddress: '0.0.0.0',
                localPort: 4444,
                remoteAddress: '0.0.0.0',
                remotePort: 0,
                state: 'LISTENING',
                suspicious: true,
                description: 'Backdoor listening on suspicious port'
            },
            {
                pid: 7890,
                process: 'chrome.exe',
                protocol: 'TCP',
                localAddress: '192.168.1.100',
                localPort: 49153,
                remoteAddress: '142.250.191.14',
                remotePort: 443,
                state: 'ESTABLISHED',
                suspicious: false,
                description: 'Normal HTTPS connection to Google'
            }
        ];

        // Identify suspicious processes
        this.suspiciousProcesses = this.processes.filter(p => p.suspicious);

        // Update counts
        this.updateCounts();
        
        // Update current view
        this.switchAnalysisMode(this.analysisMode);
        this.updateProcessTree();
    }

    switchAnalysisMode(mode) {
        this.analysisMode = mode;

        // Update button states
        this.windowElement.querySelectorAll('.analysis-mode-btn').forEach(btn => {
            btn.classList.remove('bg-purple-600');
            btn.classList.add('bg-gray-600');
        });

        const activeBtn = this.windowElement.querySelector(`#mode-${mode}-${this.id}`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-gray-600');
            activeBtn.classList.add('bg-purple-600');
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
            processes: 'Process Analysis',
            network: 'Network Connections',
            malware: 'Malware Detection'
        };

        const titleElement = this.windowElement.querySelector('#center-panel-title');
        if (titleElement) {
            titleElement.textContent = titles[mode] || 'Analysis';
        }

        // Load appropriate content
        switch (mode) {
            case 'processes':
                this.updateProcessView();
                break;
            case 'network':
                this.updateNetworkView();
                break;
            case 'malware':
                this.updateMalwareView();
                break;
        }

        // Emit mode change event
        this.emitForensicEvent('analysis_mode_changed', {
            mode,
            dumpId: this.selectedDump
        });
    }

    updateProcessView() {
        const processView = this.windowElement.querySelector(`#processes-view-${this.id}`);
        if (!processView || !this.loadedDump) return;

        processView.innerHTML = this.processes.length === 0 ? 
            '<div class="text-center text-gray-500 mt-8">No processes found</div>' :
            `
                <div class="space-y-2">
                    ${this.processes.map(process => `
                        <div class="process-item bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600 transition-colors ${
                            process.suspicious ? 'border-l-4 border-red-500' : ''
                        }" data-pid="${process.pid}">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <i class="bi ${process.suspicious ? 'bi-exclamation-triangle text-red-400' : 'bi-gear text-green-400'}"></i>
                                    <div>
                                        <div class="font-semibold text-white text-sm flex items-center">
                                            ${process.name}
                                            ${process.suspicious ? '<span class="ml-2 bg-red-600 text-xs px-2 py-1 rounded">THREAT</span>' : ''}
                                        </div>
                                        <div class="text-xs text-gray-300">PID: ${process.pid} • Memory: ${process.memory} • CPU: ${process.cpu}</div>
                                    </div>
                                </div>
                                <div class="text-xs text-gray-400">
                                    Priority: ${process.priority}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

        // Bind process click events
        processView.querySelectorAll('.process-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectProcess(parseInt(item.dataset.pid));
            });
        });
    }

    updateNetworkView() {
        const networkView = this.windowElement.querySelector(`#network-connections-list-${this.id}`);
        if (!networkView) return;

        networkView.innerHTML = this.networkConnections.length === 0 ?
            '<div class="text-center text-gray-500 mt-8">No network connections found</div>' :
            `
                <div class="mb-4">
                    <div class="text-sm text-yellow-400 mb-2">
                        Found ${this.networkConnections.length} network connections
                    </div>
                </div>
                <div class="space-y-2">
                    ${this.networkConnections.map(conn => `
                        <div class="network-item bg-gray-700 p-3 rounded ${
                            conn.suspicious ? 'border-l-4 border-red-500' : ''
                        }">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="font-semibold text-white text-sm flex items-center">
                                        ${conn.process} (PID: ${conn.pid})
                                        ${conn.suspicious ? '<span class="ml-2 bg-red-600 text-xs px-2 py-1 rounded">SUSPICIOUS</span>' : ''}
                                    </div>
                                    <div class="text-xs text-gray-300">
                                        ${conn.protocol} ${conn.localAddress}:${conn.localPort} → ${conn.remoteAddress}:${conn.remotePort}
                                    </div>
                                    <div class="text-xs text-yellow-400 mt-1">${conn.description}</div>
                                </div>
                                <div class="text-xs text-gray-400">
                                    ${conn.state}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
    }

    updateMalwareView() {
        const malwareView = this.windowElement.querySelector(`#malware-detection-results-${this.id}`);
        if (!malwareView) return;

        const malwareFindings = [
            {
                process: 'cryptor.exe',
                pid: 5678,
                threat: 'Ransomware',
                severity: 'Critical',
                confidence: 95,
                description: 'File encryption behavior detected',
                indicators: ['Registry modifications', 'File system access patterns', 'Network C&C communication']
            },
            {
                process: 'backdoor.exe',
                pid: 3456,
                threat: 'Remote Access Trojan',
                severity: 'High',
                confidence: 87,
                description: 'Unauthorized remote access capability',
                indicators: ['Network listening port', 'Process injection', 'Stealth mechanisms']
            }
        ];

        malwareView.innerHTML = `
            <div class="mb-4">
                <div class="text-sm text-red-400 mb-2">
                    Malware Detection Results: ${malwareFindings.length} threats identified
                </div>
            </div>
            <div class="space-y-4">
                ${malwareFindings.map(finding => `
                    <div class="malware-finding bg-red-900 bg-opacity-30 p-4 rounded border border-red-600">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <div class="font-semibold text-red-400">${finding.threat}</div>
                                <div class="text-sm text-white">${finding.process} (PID: ${finding.pid})</div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-semibold ${
                                    finding.severity === 'Critical' ? 'text-red-400' :
                                    finding.severity === 'High' ? 'text-orange-400' : 'text-yellow-400'
                                }">${finding.severity}</div>
                                <div class="text-xs text-gray-300">${finding.confidence}% confidence</div>
                            </div>
                        </div>
                        <div class="text-sm text-gray-300 mb-2">${finding.description}</div>
                        <div class="text-xs text-gray-400">
                            <span class="font-semibold">Indicators:</span> ${finding.indicators.join(', ')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    selectProcess(pid) {
        const process = this.processes.find(p => p.pid === pid);
        if (!process) return;

        this.selectedProcess = process;
        this.displayProcessDetails(process);

        // Update chain of custody
        this.updateChainOfCustody(this.selectedDump, `process_examined: ${process.name}`);

        // Emit process selection event
        this.emitForensicEvent('process_selected', {
            processName: process.name,
            pid: process.pid,
            suspicious: process.suspicious
        });
    }

    displayProcessDetails(process) {
        const detailsContainer = this.windowElement.querySelector(`#analysis-details-${this.id}`);
        if (!detailsContainer) return;

        detailsContainer.innerHTML = `
            <div class="space-y-4">
                <!-- Process Information -->
                <div>
                    <h4 class="font-semibold text-white mb-2 flex items-center">
                        <i class="bi ${process.suspicious ? 'bi-exclamation-triangle text-red-400' : 'bi-gear text-green-400'} mr-2"></i>
                        ${process.name}
                    </h4>
                    <div class="space-y-1 text-sm">
                        <div><span class="text-gray-300">PID:</span> <span class="text-blue-400">${process.pid}</span></div>
                        <div><span class="text-gray-300">Parent PID:</span> <span class="text-blue-400">${process.parent}</span></div>
                        <div><span class="text-gray-300">Priority:</span> <span class="text-blue-400">${process.priority}</span></div>
                        <div><span class="text-gray-300">Threads:</span> <span class="text-blue-400">${process.threads}</span></div>
                        <div><span class="text-gray-300">Memory:</span> <span class="text-blue-400">${process.memory}</span></div>
                        <div><span class="text-gray-300">CPU:</span> <span class="text-blue-400">${process.cpu}</span></div>
                        <div><span class="text-gray-300">Started:</span> <span class="text-blue-400">${new Date(process.startTime).toLocaleString()}</span></div>
                    </div>
                </div>

                <!-- Command Line -->
                <div class="border-t border-gray-600 pt-3">
                    <h5 class="font-semibold text-white mb-2">Command Line</h5>
                    <div class="bg-gray-900 p-2 rounded text-xs font-mono text-green-400 break-all">
                        ${process.commandLine}
                    </div>
                </div>

                <!-- Threat Assessment -->
                ${process.suspicious ? `
                    <div class="border-t border-gray-600 pt-3">
                        <h5 class="font-semibold text-white mb-2">Threat Assessment</h5>
                        <div class="bg-red-900 bg-opacity-50 p-3 rounded">
                            <div class="text-sm text-red-200">This process exhibits suspicious behavior and may be malicious.</div>
                        </div>
                    </div>
                ` : ''}

                <!-- Process Actions -->
                <div class="border-t border-gray-600 pt-3 space-y-2">
                    <button class="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-semibold"
                            onclick="window.memoryForensics.dumpProcessMemory(${process.pid})">
                        Dump Process Memory
                    </button>
                    <button class="w-full bg-green-600 hover:bg-green-700 py-2 rounded text-sm font-semibold"
                            onclick="window.memoryForensics.analyzeProcessBehavior(${process.pid})">
                        Analyze Behavior
                    </button>
                    ${process.suspicious ? `
                        <button class="w-full bg-red-600 hover:bg-red-700 py-2 rounded text-sm font-semibold"
                                onclick="window.memoryForensics.quarantineProcess(${process.pid})">
                            Quarantine Process
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        // Store reference for callbacks
        window.memoryForensics = this;
    }

    dumpProcessMemory(pid) {
        const process = this.processes.find(p => p.pid === pid);
        if (!process) return;

        // Update chain of custody
        this.updateChainOfCustody(this.selectedDump, `process_memory_dumped: ${process.name}`);

        // Emit memory dump event
        this.emitForensicEvent('process_memory_dumped', {
            processName: process.name,
            pid: pid,
            suspicious: process.suspicious
        });

        this.showNotification(`Memory dump created for ${process.name}`, 'success');
    }

    analyzeProcessBehavior(pid) {
        const process = this.processes.find(p => p.pid === pid);
        if (!process) return;

        // Update chain of custody
        this.updateChainOfCustody(this.selectedDump, `process_behavior_analyzed: ${process.name}`);

        // Emit behavior analysis event
        this.emitForensicEvent('process_behavior_analyzed', {
            processName: process.name,
            pid: pid,
            behaviors: process.suspicious ? ['File encryption', 'Network communication', 'Registry modification'] : ['Normal operation']
        });

        this.showNotification(`Behavior analysis complete for ${process.name}`, 'success');
    }

    quarantineProcess(pid) {
        const process = this.processes.find(p => p.pid === pid);
        if (!process) return;

        // Update chain of custody
        this.updateChainOfCustody(this.selectedDump, `process_quarantined: ${process.name}`);

        // Emit quarantine event
        this.emitForensicEvent('process_quarantined', {
            processName: process.name,
            pid: pid,
            reason: 'Malicious behavior detected'
        });

        this.showNotification(`Process ${process.name} quarantined successfully`, 'success');
    }

    performMemoryAnalysis() {
        if (!this.loadedDump) {
            this.showNotification('Please load a memory dump first', 'warning');
            return;
        }

        // Show analysis modal
        const modal = this.windowElement.querySelector(`#analysis-modal-${this.id}`);
        if (modal) {
            modal.classList.remove('hidden');
        }

        // Simulate analysis process
        this.simulateAnalysisProgress();
    }

    simulateAnalysisProgress() {
        const progressBar = this.windowElement.querySelector(`#analysis-progress-bar-${this.id}`);
        const progressText = this.windowElement.querySelector(`#analysis-progress-${this.id}`);
        const statusText = this.windowElement.querySelector(`#analysis-status-${this.id}`);
        
        const steps = [
            { progress: 20, status: 'Extracting process information...' },
            { progress: 40, status: 'Analyzing network connections...' },
            { progress: 60, status: 'Scanning for malware signatures...' },
            { progress: 80, status: 'Correlating behavioral patterns...' },
            { progress: 100, status: 'Analysis complete!' }
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
                // Analysis complete
                setTimeout(() => {
                    this.closeAnalysisModal();
                    this.completeAnalysis();
                }, 1000);
            }
        };

        updateProgress();
    }

    closeAnalysisModal() {
        const modal = this.windowElement.querySelector(`#analysis-modal-${this.id}`);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    completeAnalysis() {
        // Update chain of custody
        this.updateChainOfCustody(this.selectedDump, 'memory_analysis_completed');

        // Emit analysis complete event
        this.emitForensicEvent('memory_analysis_completed', {
            dumpId: this.selectedDump,
            processCount: this.processes.length,
            suspiciousProcesses: this.suspiciousProcesses.length,
            networkConnections: this.networkConnections.length
        });

        this.showNotification('Memory analysis completed - Threats detected', 'warning');
    }

    updateProcessTree() {
        const treeContainer = this.windowElement.querySelector(`#process-hierarchy-${this.id}`);
        if (!treeContainer || this.processes.length === 0) return;

        // Build process hierarchy
        const processMap = new Map();
        this.processes.forEach(p => processMap.set(p.pid, p));

        const rootProcesses = this.processes.filter(p => !processMap.has(p.parent));
        
        treeContainer.innerHTML = rootProcesses.map(process => 
            this.renderProcessTree(process, processMap, 0)
        ).join('');
    }

    renderProcessTree(process, processMap, depth) {
        const children = this.processes.filter(p => p.parent === process.pid);
        const indent = '  '.repeat(depth);
        
        let html = `
            <div class="process-tree-item flex items-center space-x-1 py-1 cursor-pointer hover:bg-gray-700 rounded px-1"
                 data-pid="${process.pid}">
                <span class="text-xs">${indent}</span>
                <i class="bi ${process.suspicious ? 'bi-exclamation-triangle text-red-400' : 'bi-gear text-green-400'}"></i>
                <span class="text-sm">${process.name}</span>
                <span class="text-xs text-gray-400">(${process.pid})</span>
            </div>
        `;

        if (children.length > 0) {
            html += children.map(child => 
                this.renderProcessTree(child, processMap, depth + 1)
            ).join('');
        }

        return html;
    }

    updateCounts() {
        const processCount = this.windowElement.querySelector('#process-count');
        const threatCount = this.windowElement.querySelector('#threat-count');

        if (processCount) {
            processCount.textContent = this.processes.length;
        }

        if (threatCount) {
            threatCount.textContent = this.suspiciousProcesses.length;
        }
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
export default MemoryForensicsApp;