import { ForensicAppBase } from './forensic-app-base.js';

/**
 * Network Analyzer Application - Level 5
 * Analysis of network traffic captures for forensic investigation
 */
export class NetworkAnalyzerApp extends ForensicAppBase {
    constructor() {
        super('network-analyzer', 'Network Traffic Analyzer', {
            width: '80%',
            height: '75%'
        });
        
        this.loadedCapture = null;
        this.packets = [];
        this.conversations = [];
        this.suspiciousTraffic = [];
        this.analysisMode = 'packets'; // 'packets', 'conversations', 'protocols'
        this.selectedPacket = null;
    }

    createContent() {
        return `
            <div class="network-analyzer-app h-full bg-black text-white p-4 overflow-hidden">
                <!-- Header -->
                <div class="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                    <h2 class="text-xl font-bold text-cyan-400">Network Traffic Analyzer</h2>
                    <div class="flex space-x-4 text-sm">
                        <div>
                            <span class="text-gray-300">Loaded:</span>
                            <span class="text-cyan-400 font-semibold" id="loaded-capture">None</span>
                        </div>
                        <div>
                            <span class="text-gray-300">Packets:</span>
                            <span class="text-green-400 font-semibold" id="packet-count">0</span>
                        </div>
                        <div>
                            <span class="text-gray-300">Threats:</span>
                            <span class="text-red-400 font-semibold" id="threat-count">0</span>
                        </div>
                    </div>
                </div>

                <!-- Forensic UI Elements -->
                ${this.createForensicUI().evidencePanel}

                <!-- Analysis Controls -->
                <div class="flex justify-between items-center mb-4">
                    <div class="flex space-x-2">
                        <button id="mode-packets-${this.id}" class="analysis-mode-btn bg-cyan-600 px-4 py-2 rounded text-sm font-semibold">
                            Packet Analysis
                        </button>
                        <button id="mode-conversations-${this.id}" class="analysis-mode-btn bg-gray-600 px-4 py-2 rounded text-sm">
                            Conversations
                        </button>
                        <button id="mode-protocols-${this.id}" class="analysis-mode-btn bg-gray-600 px-4 py-2 rounded text-sm">
                            Protocol Analysis
                        </button>
                    </div>
                    <div class="flex space-x-2">
                        <button id="load-capture-btn-${this.id}" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold">
                            Load Capture
                        </button>
                        <button id="analyze-traffic-btn-${this.id}" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold">
                            Analyze Traffic
                        </button>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div class="grid grid-cols-12 gap-4 h-full">
                    <!-- Left Panel - Captures / Filters -->
                    <div class="col-span-3 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-yellow-400">Network Captures</h3>
                        <div id="capture-list-${this.id}" class="space-y-2 mb-4">
                            <!-- Available network captures will be populated here -->
                        </div>
                        
                        <!-- Traffic Filters -->
                        <div id="traffic-filters-${this.id}">
                            <h4 class="font-semibold mb-2 text-green-400">Traffic Filters</h4>
                            <div class="space-y-2 text-sm">
                                <div>
                                    <label class="text-gray-300">Protocol:</label>
                                    <select id="protocol-filter-${this.id}" class="w-full bg-gray-700 text-white px-2 py-1 rounded text-xs">
                                        <option value="all">All</option>
                                        <option value="TCP">TCP</option>
                                        <option value="UDP">UDP</option>
                                        <option value="HTTPS">HTTPS</option>
                                        <option value="HTTP">HTTP</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="text-gray-300">Suspicious Only:</label>
                                    <input type="checkbox" id="suspicious-filter-${this.id}" class="ml-2">
                                </div>
                                <button id="apply-filters-btn-${this.id}" class="w-full bg-blue-600 hover:bg-blue-700 py-1 rounded text-xs">
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Center Panel - Traffic Analysis -->
                    <div class="col-span-6 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-yellow-400" id="center-panel-title">Packet Analysis</h3>
                        
                        <!-- Packet Analysis View -->
                        <div id="packets-view-${this.id}" class="analysis-view">
                            <div class="text-center text-gray-500 mt-8">
                                Load a network capture to begin analysis
                            </div>
                        </div>

                        <!-- Conversations View -->
                        <div id="conversations-view-${this.id}" class="analysis-view hidden">
                            <div id="conversations-list-${this.id}">
                                <!-- Network conversations will be shown here -->
                            </div>
                        </div>

                        <!-- Protocol Analysis View -->
                        <div id="protocols-view-${this.id}" class="analysis-view hidden">
                            <div id="protocol-stats-${this.id}">
                                <!-- Protocol statistics will be shown here -->
                            </div>
                        </div>
                    </div>

                    <!-- Right Panel - Packet Details -->
                    <div class="col-span-3 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-yellow-400">Packet Details</h3>
                        <div id="packet-details-${this.id}">
                            <div class="text-center text-gray-500 mt-8">
                                Select a packet to view details
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initialize() {
        super.initialize();
        
        this.loadAvailableCaptures();
        this.bindEvents();
        
        this.emitForensicEvent('network_analyzer_opened', {
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
        const loadBtn = container.querySelector(`#load-capture-btn-${this.id}`);
        const analyzeBtn = container.querySelector(`#analyze-traffic-btn-${this.id}`);
        const applyFiltersBtn = container.querySelector(`#apply-filters-btn-${this.id}`);

        loadBtn?.addEventListener('click', () => this.loadSelectedCapture());
        analyzeBtn?.addEventListener('click', () => this.performTrafficAnalysis());
        applyFiltersBtn?.addEventListener('click', () => this.applyFilters());
    }

    loadAvailableCaptures() {
        const captureList = this.windowElement.querySelector(`#capture-list-${this.id}`);
        if (!captureList) return;

        const networkCaptures = this.evidenceStore.getAllEvidence()
            .filter(evidence => evidence.type === 'network_capture');

        if (networkCaptures.length === 0) {
            captureList.innerHTML = '<div class="text-gray-500 text-sm">No network captures available</div>';
            return;
        }

        captureList.innerHTML = networkCaptures.map(capture => `
            <div class="network-capture-item bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600 transition-colors"
                 data-capture-id="${capture.id}">
                <div class="flex items-center space-x-2">
                    <i class="bi bi-diagram-3 text-cyan-400"></i>
                    <div>
                        <div class="font-semibold text-white text-sm">${capture.name}</div>
                        <div class="text-xs text-gray-300">${capture.size}</div>
                    </div>
                </div>
            </div>
        `).join('');

        captureList.querySelectorAll('.network-capture-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectNetworkCapture(item.dataset.captureId);
            });
        });
    }

    selectNetworkCapture(captureId) {
        this.windowElement.querySelectorAll('.network-capture-item').forEach(item => {
            item.classList.remove('ring-2', 'ring-cyan-400');
        });

        const selectedItem = this.windowElement.querySelector(`[data-capture-id="${captureId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('ring-2', 'ring-cyan-400');
        }

        this.selectedCapture = captureId;
        const evidence = this.evidenceStore.getEvidence(captureId);
        const loadedDisplay = this.windowElement.querySelector('#loaded-capture');
        if (loadedDisplay && evidence) {
            loadedDisplay.textContent = evidence.name;
        }
    }

    loadSelectedCapture() {
        if (!this.selectedCapture) {
            this.showNotification('Please select a network capture first', 'warning');
            return;
        }

        const evidence = this.evidenceStore.getEvidence(this.selectedCapture);
        if (!evidence) return;

        const integrity = this.verifyEvidenceIntegrity(this.selectedCapture);
        if (!integrity.valid) {
            this.showNotification('Cannot load compromised evidence', 'error');
            return;
        }

        this.loadedCapture = evidence;
        this.updateChainOfCustody(this.selectedCapture, 'network_capture_loaded');
        this.generateTrafficData();

        this.emitForensicEvent('network_capture_loaded', {
            captureId: this.selectedCapture,
            captureName: evidence.name,
            packetCount: this.packets.length
        });

        this.showNotification('Network capture loaded successfully', 'success');
    }

    generateTrafficData() {
        // Simulate network traffic with forensic significance
        this.packets = [
            {
                id: 1,
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                source: '192.168.1.100',
                destination: '185.243.67.89',
                protocol: 'HTTPS',
                port: 443,
                size: 1420,
                flags: ['SYN', 'ACK'],
                payload: 'Encrypted TLS handshake',
                suspicious: true,
                description: 'Connection to known C&C server'
            },
            {
                id: 2,
                timestamp: new Date(Date.now() - 3500000).toISOString(),
                source: '192.168.1.100',
                destination: '185.243.67.89',
                protocol: 'HTTPS',
                port: 443,
                size: 2048,
                flags: ['PSH', 'ACK'],
                payload: 'Encrypted command data',
                suspicious: true,
                description: 'Suspected malware command transmission'
            },
            {
                id: 3,
                timestamp: new Date(Date.now() - 2700000).toISOString(),
                source: '192.168.1.100',
                destination: '142.250.191.14',
                protocol: 'HTTPS',
                port: 443,
                size: 856,
                flags: ['ACK'],
                payload: 'Normal HTTPS traffic',
                suspicious: false,
                description: 'Standard web browsing'
            },
            {
                id: 4,
                timestamp: new Date(Date.now() - 1800000).toISOString(),
                source: '0.0.0.0',
                destination: '192.168.1.100',
                protocol: 'TCP',
                port: 4444,
                size: 64,
                flags: ['SYN'],
                payload: 'Connection attempt',
                suspicious: true,
                description: 'Inbound connection to backdoor port'
            }
        ];

        this.conversations = [
            {
                id: 1,
                addressA: '192.168.1.100',
                addressB: '185.243.67.89',
                packets: 15,
                bytes: 34567,
                duration: '00:45:23',
                suspicious: true,
                description: 'Persistent connection to suspicious IP'
            },
            {
                id: 2,
                addressA: '192.168.1.100',
                addressB: '142.250.191.14',
                packets: 42,
                bytes: 125890,
                duration: '01:23:45',
                suspicious: false,
                description: 'Normal web browsing session'
            }
        ];

        this.suspiciousTraffic = this.packets.filter(p => p.suspicious);
        this.updateCounts();
        this.switchAnalysisMode(this.analysisMode);
    }

    switchAnalysisMode(mode) {
        this.analysisMode = mode;

        this.windowElement.querySelectorAll('.analysis-mode-btn').forEach(btn => {
            btn.classList.remove('bg-cyan-600');
            btn.classList.add('bg-gray-600');
        });

        const activeBtn = this.windowElement.querySelector(`#mode-${mode}-${this.id}`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-gray-600');
            activeBtn.classList.add('bg-cyan-600');
        }

        this.windowElement.querySelectorAll('.analysis-view').forEach(view => {
            view.classList.add('hidden');
        });

        const targetView = this.windowElement.querySelector(`#${mode}-view-${this.id}`);
        if (targetView) {
            targetView.classList.remove('hidden');
        }

        const titles = {
            packets: 'Packet Analysis',
            conversations: 'Network Conversations', 
            protocols: 'Protocol Statistics'
        };

        const titleElement = this.windowElement.querySelector('#center-panel-title');
        if (titleElement) {
            titleElement.textContent = titles[mode] || 'Analysis';
        }

        switch (mode) {
            case 'packets':
                this.updatePacketsView();
                break;
            case 'conversations':
                this.updateConversationsView();
                break;
            case 'protocols':
                this.updateProtocolsView();
                break;
        }
    }

    updatePacketsView() {
        const packetsView = this.windowElement.querySelector(`#packets-view-${this.id}`);
        if (!packetsView || !this.loadedCapture) return;

        packetsView.innerHTML = this.packets.length === 0 ? 
            '<div class="text-center text-gray-500 mt-8">No packets found</div>' :
            `
                <div class="space-y-1">
                    ${this.packets.map(packet => `
                        <div class="packet-item bg-gray-700 p-2 rounded cursor-pointer hover:bg-gray-600 transition-colors text-sm ${
                            packet.suspicious ? 'border-l-4 border-red-500' : ''
                        }" data-packet-id="${packet.id}">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <span class="text-xs text-gray-400 w-8">#${packet.id}</span>
                                    <span class="text-cyan-400 w-24">${packet.source}</span>
                                    <i class="bi bi-arrow-right text-gray-400"></i>
                                    <span class="text-green-400 w-24">${packet.destination}</span>
                                    <span class="text-blue-400 w-16">${packet.protocol}</span>
                                    <span class="text-gray-300 w-16">${packet.size}B</span>
                                    ${packet.suspicious ? '<span class="bg-red-600 text-xs px-2 py-1 rounded">THREAT</span>' : ''}
                                </div>
                                <div class="text-xs text-gray-400">
                                    ${new Date(packet.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

        packetsView.querySelectorAll('.packet-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectPacket(parseInt(item.dataset.packetId));
            });
        });
    }

    updateConversationsView() {
        const conversationsView = this.windowElement.querySelector(`#conversations-list-${this.id}`);
        if (!conversationsView) return;

        conversationsView.innerHTML = this.conversations.length === 0 ?
            '<div class="text-center text-gray-500 mt-8">No conversations found</div>' :
            `
                <div class="space-y-2">
                    ${this.conversations.map(conv => `
                        <div class="conversation-item bg-gray-700 p-3 rounded ${
                            conv.suspicious ? 'border-l-4 border-red-500' : ''
                        }">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="font-semibold text-white text-sm flex items-center">
                                        ${conv.addressA} ↔ ${conv.addressB}
                                        ${conv.suspicious ? '<span class="ml-2 bg-red-600 text-xs px-2 py-1 rounded">SUSPICIOUS</span>' : ''}
                                    </div>
                                    <div class="text-xs text-gray-300">
                                        ${conv.packets} packets • ${conv.bytes} bytes • Duration: ${conv.duration}
                                    </div>
                                    <div class="text-xs text-yellow-400 mt-1">${conv.description}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
    }

    updateProtocolsView() {
        const protocolsView = this.windowElement.querySelector(`#protocol-stats-${this.id}`);
        if (!protocolsView) return;

        const protocolStats = this.calculateProtocolStats();

        protocolsView.innerHTML = `
            <div class="space-y-4">
                <div class="mb-4">
                    <h4 class="font-semibold text-white mb-2">Protocol Distribution</h4>
                    <div class="space-y-2">
                        ${Object.entries(protocolStats).map(([protocol, stats]) => `
                            <div class="protocol-stat bg-gray-700 p-3 rounded">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <div class="font-semibold text-white">${protocol}</div>
                                        <div class="text-sm text-gray-300">${stats.packets} packets (${stats.percentage}%)</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm text-blue-400">${stats.bytes} bytes</div>
                                        ${stats.suspicious > 0 ? `<div class="text-xs text-red-400">${stats.suspicious} suspicious</div>` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    calculateProtocolStats() {
        const stats = {};
        const totalPackets = this.packets.length;

        this.packets.forEach(packet => {
            if (!stats[packet.protocol]) {
                stats[packet.protocol] = {
                    packets: 0,
                    bytes: 0,
                    suspicious: 0
                };
            }

            stats[packet.protocol].packets++;
            stats[packet.protocol].bytes += packet.size;
            if (packet.suspicious) {
                stats[packet.protocol].suspicious++;
            }
        });

        // Calculate percentages
        Object.keys(stats).forEach(protocol => {
            stats[protocol].percentage = Math.round((stats[protocol].packets / totalPackets) * 100);
        });

        return stats;
    }

    selectPacket(packetId) {
        const packet = this.packets.find(p => p.id === packetId);
        if (!packet) return;

        this.selectedPacket = packet;
        this.displayPacketDetails(packet);

        this.updateChainOfCustody(this.selectedCapture, `packet_examined: ${packet.id}`);

        this.emitForensicEvent('packet_selected', {
            packetId: packet.id,
            source: packet.source,
            destination: packet.destination,
            suspicious: packet.suspicious
        });
    }

    displayPacketDetails(packet) {
        const detailsContainer = this.windowElement.querySelector(`#packet-details-${this.id}`);
        if (!detailsContainer) return;

        detailsContainer.innerHTML = `
            <div class="space-y-4">
                <!-- Packet Header -->
                <div>
                    <h4 class="font-semibold text-white mb-2 flex items-center">
                        <i class="bi ${packet.suspicious ? 'bi-exclamation-triangle text-red-400' : 'bi-diagram-3 text-cyan-400'} mr-2"></i>
                        Packet #${packet.id}
                    </h4>
                    <div class="space-y-1 text-sm">
                        <div><span class="text-gray-300">Time:</span> <span class="text-blue-400">${new Date(packet.timestamp).toLocaleString()}</span></div>
                        <div><span class="text-gray-300">Protocol:</span> <span class="text-blue-400">${packet.protocol}</span></div>
                        <div><span class="text-gray-300">Size:</span> <span class="text-blue-400">${packet.size} bytes</span></div>
                        <div><span class="text-gray-300">Port:</span> <span class="text-blue-400">${packet.port}</span></div>
                    </div>
                </div>

                <!-- Network Info -->
                <div class="border-t border-gray-600 pt-3">
                    <h5 class="font-semibold text-white mb-2">Network Information</h5>
                    <div class="space-y-1 text-sm">
                        <div><span class="text-gray-300">Source:</span> <span class="text-cyan-400 font-mono">${packet.source}</span></div>
                        <div><span class="text-gray-300">Destination:</span> <span class="text-green-400 font-mono">${packet.destination}</span></div>
                        <div><span class="text-gray-300">Flags:</span> <span class="text-blue-400">${packet.flags.join(', ')}</span></div>
                    </div>
                </div>

                <!-- Payload -->
                <div class="border-t border-gray-600 pt-3">
                    <h5 class="font-semibold text-white mb-2">Payload</h5>
                    <div class="bg-gray-900 p-2 rounded text-xs font-mono text-green-400">
                        ${packet.payload}
                    </div>
                </div>

                <!-- Forensic Analysis -->
                <div class="border-t border-gray-600 pt-3">
                    <h5 class="font-semibold text-white mb-2">Analysis</h5>
                    <div class="${packet.suspicious ? 'bg-red-900 bg-opacity-50' : 'bg-green-900 bg-opacity-50'} p-3 rounded">
                        <div class="text-sm ${packet.suspicious ? 'text-red-200' : 'text-green-200'}">${packet.description}</div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="border-t border-gray-600 pt-3 space-y-2">
                    <button class="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-semibold"
                            onclick="window.networkAnalyzer.analyzePacket(${packet.id})">
                        Deep Analysis
                    </button>
                    <button class="w-full bg-green-600 hover:bg-green-700 py-2 rounded text-sm font-semibold"
                            onclick="window.networkAnalyzer.exportPacket(${packet.id})">
                        Export Packet
                    </button>
                </div>
            </div>
        `;

        window.networkAnalyzer = this;
    }

    analyzePacket(packetId) {
        const packet = this.packets.find(p => p.id === packetId);
        if (!packet) return;

        this.updateChainOfCustody(this.selectedCapture, `packet_analyzed: ${packet.id}`);
        
        this.emitForensicEvent('packet_analyzed', {
            packetId: packet.id,
            protocol: packet.protocol,
            suspicious: packet.suspicious
        });

        this.showNotification(`Packet #${packet.id} analysis complete`, 'success');
    }

    exportPacket(packetId) {
        const packet = this.packets.find(p => p.id === packetId);
        if (!packet) return;

        this.updateChainOfCustody(this.selectedCapture, `packet_exported: ${packet.id}`);

        this.emitForensicEvent('packet_exported', {
            packetId: packet.id,
            format: 'pcap'
        });

        this.showNotification(`Packet #${packet.id} exported successfully`, 'success');
    }

    performTrafficAnalysis() {
        if (!this.loadedCapture) {
            this.showNotification('Please load a network capture first', 'warning');
            return;
        }

        this.updateChainOfCustody(this.selectedCapture, 'traffic_analysis_completed');

        this.emitForensicEvent('traffic_analysis_completed', {
            captureId: this.selectedCapture,
            totalPackets: this.packets.length,
            suspiciousPackets: this.suspiciousTraffic.length,
            conversations: this.conversations.length
        });

        this.showNotification('Traffic analysis completed - Threats detected', 'warning');
    }

    applyFilters() {
        // Implementation would filter packets based on selected criteria
        this.updatePacketsView();
        this.showNotification('Filters applied', 'success');
    }

    updateCounts() {
        const packetCount = this.windowElement.querySelector('#packet-count');
        const threatCount = this.windowElement.querySelector('#threat-count');

        if (packetCount) {
            packetCount.textContent = this.packets.length;
        }

        if (threatCount) {
            threatCount.textContent = this.suspiciousTraffic.length;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded z-50 ${
            type === 'success' ? 'bg-green-600' :
            type === 'warning' ? 'bg-yellow-600' :
            type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        } text-white`;
        notification.textContent = message;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

export default NetworkAnalyzerApp;