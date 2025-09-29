import { ForensicAppBase } from './forensic-app-base.js';

/**
 * Timeline Constructor Application - Level 5
 * Interactive timeline builder for correlating evidence across multiple sources
 */
export class TimelineConstructorApp extends ForensicAppBase {
    constructor() {
        super('timeline-constructor', 'Timeline Constructor', {
            width: '80%',
            height: '75%'
        });
        
        this.timelineEvents = [];
        this.correlations = [];
        this.selectedEvent = null;
        this.timelineView = 'chronological'; // 'chronological', 'correlation', 'significance'
        this.currentZoom = 'hour'; // 'minute', 'hour', 'day', 'week'
    }

    createContent() {
        return `
            <div class="timeline-constructor-app h-full bg-black text-white p-4 overflow-auto flex flex-col">
                <!-- Header -->
                <div class="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                    <h2 class="text-xl font-bold text-orange-400">Timeline Constructor</h2>
                    <div class="flex space-x-4 text-sm">
                        <div>
                            <span class="text-gray-300">Events:</span>
                            <span class="text-orange-400 font-semibold" id="events-count">0</span>
                        </div>
                        <div>
                            <span class="text-gray-300">Correlations:</span>
                            <span class="text-green-400 font-semibold" id="correlations-count">0</span>
                        </div>
                        <div>
                            <span class="text-gray-300">Zoom:</span>
                            <span class="text-blue-400 font-semibold" id="zoom-level">Hour</span>
                        </div>
                    </div>
                </div>

                <!-- Forensic UI Elements -->
                ${this.createForensicUI().evidencePanel}

                <!-- Timeline Controls -->
                <div class="flex justify-between items-center mb-4">
                    <div class="flex space-x-2">
                        <button id="view-chronological-${this.id}" class="timeline-view-btn bg-orange-600 px-4 py-2 rounded text-sm font-semibold">
                            Chronological
                        </button>
                        <button id="view-correlation-${this.id}" class="timeline-view-btn bg-gray-600 px-4 py-2 rounded text-sm">
                            Correlation View
                        </button>
                        <button id="view-significance-${this.id}" class="timeline-view-btn bg-gray-600 px-4 py-2 rounded text-sm">
                            By Significance
                        </button>
                    </div>
                    <div class="flex space-x-2">
                        <select id="zoom-select-${this.id}" class="bg-gray-700 text-white px-3 py-1 rounded">
                            <option value="minute">Minutes</option>
                            <option value="hour" selected>Hours</option>
                            <option value="day">Days</option>
                            <option value="week">Weeks</option>
                        </select>
                        <button id="build-timeline-btn-${this.id}" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold">
                            Build Timeline
                        </button>
                        <button id="analyze-correlations-btn-${this.id}" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold">
                            Find Correlations
                        </button>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div class="grid grid-cols-12 gap-4 h-full">
                    <!-- Left Panel - Evidence Sources -->
                    <div class="col-span-3 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-yellow-400">Evidence Sources</h3>
                        <div id="evidence-sources-${this.id}" class="space-y-2">
                            <!-- Evidence sources will be populated here -->
                        </div>
                        
                        <!-- Timeline Statistics -->
                        <div class="mt-6">
                            <h4 class="font-semibold mb-2 text-green-400">Timeline Stats</h4>
                            <div id="timeline-stats-${this.id}" class="text-sm space-y-1">
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Total Events:</span>
                                    <span class="text-blue-400" id="total-events">0</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Time Span:</span>
                                    <span class="text-blue-400" id="time-span">-</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Critical Events:</span>
                                    <span class="text-red-400" id="critical-events">0</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Center Panel - Timeline Visualization -->
                    <div class="col-span-6 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-yellow-400" id="timeline-panel-title">Timeline Visualization</h3>
                        
                        <!-- Timeline Container -->
                        <div id="timeline-container-${this.id}" class="timeline-visualization">
                            <div class="text-center text-gray-500 mt-8">
                                Click "Build Timeline" to construct the investigation timeline
                            </div>
                        </div>
                    </div>

                    <!-- Right Panel - Event Details -->
                    <div class="col-span-3 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-yellow-400">Event Details</h3>
                        <div id="event-details-${this.id}">
                            <div class="text-center text-gray-500 mt-8">
                                Select an event to view details
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Correlation Modal -->
                <div id="correlation-modal-${this.id}" class="fixed inset-0 bg-black bg-opacity-75 hidden z-50 flex items-center justify-center">
                    <div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-4 text-orange-400">Event Correlations</h3>
                        <div id="correlation-results-${this.id}">
                            <!-- Correlation results will be populated here -->
                        </div>
                        <div class="flex justify-end mt-4">
                            <button id="close-correlation-modal-${this.id}" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initialize() {
        super.initialize();
        
        this.loadEvidenceSources();
        this.bindEvents();
        
        this.emitForensicEvent('timeline_constructor_opened', {
            view: this.timelineView
        });
    }

    bindEvents() {
        const container = this.windowElement;

        // View selector buttons
        container.querySelectorAll('.timeline-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.id.split('-')[1];
                this.switchTimelineView(view);
            });
        });

        // Control buttons
        const buildBtn = container.querySelector(`#build-timeline-btn-${this.id}`);
        const correlateBtn = container.querySelector(`#analyze-correlations-btn-${this.id}`);
        const zoomSelect = container.querySelector(`#zoom-select-${this.id}`);
        const closeModalBtn = container.querySelector(`#close-correlation-modal-${this.id}`);

        buildBtn?.addEventListener('click', () => this.buildTimeline());
        correlateBtn?.addEventListener('click', () => this.analyzeCorrelations());
        zoomSelect?.addEventListener('change', (e) => this.changeZoom(e.target.value));
        closeModalBtn?.addEventListener('click', () => this.closeCorrelationModal());
    }

    loadEvidenceSources() {
        const sourcesContainer = this.windowElement.querySelector(`#evidence-sources-${this.id}`);
        if (!sourcesContainer) return;

        const allEvidence = this.evidenceStore.getAllEvidence();
        const evidenceTypes = [...new Set(allEvidence.map(e => e.type))];

        sourcesContainer.innerHTML = evidenceTypes.map(type => {
            const typeEvidence = allEvidence.filter(e => e.type === type);
            const typeIcon = this.getEvidenceTypeIcon(type);
            
            return `
                <div class="evidence-source bg-gray-700 p-3 rounded">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-2">
                            <i class="bi ${typeIcon} text-blue-400"></i>
                            <span class="font-semibold text-white text-sm">${this.formatEvidenceType(type)}</span>
                        </div>
                        <span class="text-xs text-gray-400">${typeEvidence.length} items</span>
                    </div>
                    <div class="space-y-1">
                        ${typeEvidence.map(evidence => `
                            <div class="evidence-item text-xs text-gray-300 p-1 rounded hover:bg-gray-600 cursor-pointer"
                                 data-evidence-id="${evidence.id}">
                                ${evidence.name}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Bind evidence item clicks
        sourcesContainer.querySelectorAll('.evidence-item').forEach(item => {
            item.addEventListener('click', () => {
                this.toggleEvidenceSource(item.dataset.evidenceId);
            });
        });
    }

    getEvidenceTypeIcon(type) {
        const icons = {
            'disk_image': 'bi-hdd',
            'memory_dump': 'bi-memory',
            'network_capture': 'bi-diagram-3',
            'log_files': 'bi-journal-text'
        };
        return icons[type] || 'bi-file-earmark';
    }

    formatEvidenceType(type) {
        return type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    toggleEvidenceSource(evidenceId) {
        const item = this.windowElement.querySelector(`[data-evidence-id="${evidenceId}"]`);
        if (!item) return;

        const isSelected = item.classList.contains('bg-blue-600');
        
        if (isSelected) {
            item.classList.remove('bg-blue-600');
            item.classList.add('hover:bg-gray-600');
        } else {
            item.classList.add('bg-blue-600');
            item.classList.remove('hover:bg-gray-600');
        }
    }

    buildTimeline() {
        // Get selected evidence sources
        const selectedSources = Array.from(this.windowElement.querySelectorAll('.evidence-item.bg-blue-600'))
            .map(item => item.dataset.evidenceId);

        if (selectedSources.length === 0) {
            this.showNotification('Please select at least one evidence source', 'warning');
            return;
        }

        // Generate timeline events from selected evidence
        this.generateTimelineEvents(selectedSources);
        
        // Update chain of custody
        this.updateChainOfCustody('timeline_construction', 'timeline_built');

        // Update visualization
        this.updateTimelineVisualization();
        this.updateTimelineStats();

        // Emit timeline built event
        this.emitForensicEvent('timeline_built', {
            evidenceSources: selectedSources.length,
            totalEvents: this.timelineEvents.length,
            timeSpan: this.calculateTimeSpan()
        });

        this.showNotification('Timeline constructed successfully', 'success');
    }

    generateTimelineEvents(selectedSources) {
        this.timelineEvents = [];

        selectedSources.forEach(sourceId => {
            const evidence = this.evidenceStore.getEvidence(sourceId);
            if (!evidence) return;

            // Generate events based on evidence type
            switch (evidence.type) {
                case 'disk_image':
                    this.addDiskImageEvents(evidence);
                    break;
                case 'memory_dump':
                    this.addMemoryDumpEvents(evidence);
                    break;
                case 'network_capture':
                    this.addNetworkCaptureEvents(evidence);
                    break;
            }
        });

        // Sort events chronologically
        this.timelineEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    addDiskImageEvents(evidence) {
        const diskEvents = [
            {
                id: `disk_${Date.now()}_1`,
                timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
                source: evidence.name,
                sourceType: 'disk_image',
                event: 'File Created',
                description: 'Suspicious executable created: cryptor.exe',
                significance: 'high',
                details: {
                    file: 'cryptor.exe',
                    path: '/Users/TheNull/Downloads/',
                    size: '156KB'
                }
            },
            {
                id: `disk_${Date.now()}_2`,
                timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
                source: evidence.name,
                sourceType: 'disk_image',
                event: 'File Modified',
                description: 'Password file accessed: passwords.txt',
                significance: 'medium',
                details: {
                    file: 'passwords.txt',
                    path: '/Users/TheNull/Documents/',
                    action: 'read_write'
                }
            },
            {
                id: `disk_${Date.now()}_3`,
                timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
                source: evidence.name,
                sourceType: 'disk_image',
                event: 'File Deleted',
                description: 'Communication logs deleted: communication_logs.dat',
                significance: 'critical',
                details: {
                    file: 'communication_logs.dat',
                    path: '/Windows/Temp/',
                    reason: 'evidence_destruction'
                }
            }
        ];

        this.timelineEvents.push(...diskEvents);
    }

    addMemoryDumpEvents(evidence) {
        const memoryEvents = [
            {
                id: `memory_${Date.now()}_1`,
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                source: evidence.name,
                sourceType: 'memory_dump',
                event: 'Process Started',
                description: 'Malicious process launched: backdoor.exe',
                significance: 'critical',
                details: {
                    process: 'backdoor.exe',
                    pid: 3456,
                    parentPid: 5678,
                    commandLine: 'backdoor.exe -stealth -port 4444'
                }
            },
            {
                id: `memory_${Date.now()}_2`,
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                source: evidence.name,
                sourceType: 'memory_dump',
                event: 'Network Connection',
                description: 'Outbound connection to C&C server established',
                significance: 'high',
                details: {
                    process: 'cryptor.exe',
                    remoteIP: '185.243.67.89',
                    port: 443,
                    protocol: 'HTTPS'
                }
            }
        ];

        this.timelineEvents.push(...memoryEvents);
    }

    addNetworkCaptureEvents(evidence) {
        const networkEvents = [
            {
                id: `network_${Date.now()}_1`,
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                source: evidence.name,
                sourceType: 'network_capture',
                event: 'Suspicious Traffic',
                description: 'Command and control communication detected',
                significance: 'critical',
                details: {
                    sourceIP: '192.168.1.100',
                    destIP: '185.243.67.89',
                    protocol: 'HTTPS',
                    dataSize: '1420 bytes'
                }
            },
            {
                id: `network_${Date.now()}_2`,
                timestamp: new Date(Date.now() - 1800000).toISOString(),
                source: evidence.name,
                sourceType: 'network_capture',
                event: 'Backdoor Activity',
                description: 'Inbound connection attempt to backdoor port',
                significance: 'high',
                details: {
                    destIP: '192.168.1.100',
                    port: 4444,
                    protocol: 'TCP',
                    flags: ['SYN']
                }
            }
        ];

        this.timelineEvents.push(...networkEvents);
    }

    switchTimelineView(view) {
        this.timelineView = view;

        // Update button states
        this.windowElement.querySelectorAll('.timeline-view-btn').forEach(btn => {
            btn.classList.remove('bg-orange-600');
            btn.classList.add('bg-gray-600');
        });

        const activeBtn = this.windowElement.querySelector(`#view-${view}-${this.id}`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-gray-600');
            activeBtn.classList.add('bg-orange-600');
        }

        // Update visualization
        this.updateTimelineVisualization();

        this.emitForensicEvent('timeline_view_changed', {
            view: view,
            eventCount: this.timelineEvents.length
        });
    }

    updateTimelineVisualization() {
        const container = this.windowElement.querySelector(`#timeline-container-${this.id}`);
        if (!container || this.timelineEvents.length === 0) {
            if (container) {
                container.innerHTML = '<div class="text-center text-gray-500 mt-8">No timeline events to display</div>';
            }
            return;
        }

        let sortedEvents = [...this.timelineEvents];

        // Sort based on current view
        switch (this.timelineView) {
            case 'chronological':
                // Already sorted chronologically
                break;
            case 'correlation':
                // Group by time proximity
                sortedEvents = this.groupEventsByCorrelation();
                break;
            case 'significance':
                sortedEvents.sort((a, b) => {
                    const sigOrder = { 'critical': 3, 'high': 2, 'medium': 1, 'low': 0 };
                    return (sigOrder[b.significance] || 0) - (sigOrder[a.significance] || 0);
                });
                break;
        }

        container.innerHTML = `
            <div class="timeline-events space-y-3">
                ${sortedEvents.map((event, index) => this.renderTimelineEvent(event, index)).join('')}
            </div>
        `;

        // Bind event click handlers
        container.querySelectorAll('.timeline-event').forEach(item => {
            item.addEventListener('click', () => {
                this.selectTimelineEvent(item.dataset.eventId);
            });
        });
    }

    renderTimelineEvent(event, index) {
        const significanceColor = {
            'critical': 'border-red-500 bg-red-900',
            'high': 'border-orange-500 bg-orange-900',
            'medium': 'border-yellow-500 bg-yellow-900',
            'low': 'border-green-500 bg-green-900'
        };

        const sourceTypeIcon = {
            'disk_image': 'bi-hdd',
            'memory_dump': 'bi-memory',
            'network_capture': 'bi-diagram-3'
        };

        return `
            <div class="timeline-event bg-gray-700 border-l-4 ${significanceColor[event.significance] || 'border-gray-500 bg-gray-900'} 
                        bg-opacity-20 p-3 rounded cursor-pointer hover:bg-gray-600 transition-colors"
                 data-event-id="${event.id}">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3">
                        <div class="flex flex-col items-center">
                            <i class="bi ${sourceTypeIcon[event.sourceType] || 'bi-circle'} text-blue-400 text-lg"></i>
                            <div class="text-xs text-gray-400 mt-1">#${index + 1}</div>
                        </div>
                        <div>
                            <div class="font-semibold text-white text-sm flex items-center">
                                ${event.event}
                                <span class="ml-2 px-2 py-1 rounded text-xs ${
                                    event.significance === 'critical' ? 'bg-red-600' :
                                    event.significance === 'high' ? 'bg-orange-600' :
                                    event.significance === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                                }">${event.significance.toUpperCase()}</span>
                            </div>
                            <div class="text-sm text-gray-300 mt-1">${event.description}</div>
                            <div class="text-xs text-blue-400 mt-1">Source: ${event.source}</div>
                        </div>
                    </div>
                    <div class="text-xs text-gray-400 text-right">
                        <div>${new Date(event.timestamp).toLocaleDateString()}</div>
                        <div>${new Date(event.timestamp).toLocaleTimeString()}</div>
                    </div>
                </div>
            </div>
        `;
    }

    selectTimelineEvent(eventId) {
        const event = this.timelineEvents.find(e => e.id === eventId);
        if (!event) return;

        this.selectedEvent = event;
        this.displayEventDetails(event);

        // Highlight selected event
        this.windowElement.querySelectorAll('.timeline-event').forEach(item => {
            item.classList.remove('ring-2', 'ring-orange-400');
        });

        const selectedItem = this.windowElement.querySelector(`[data-event-id="${eventId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('ring-2', 'ring-orange-400');
        }

        this.updateChainOfCustody('timeline_analysis', `event_examined: ${event.event}`);

        this.emitForensicEvent('timeline_event_selected', {
            eventId: event.id,
            eventType: event.event,
            significance: event.significance
        });
    }

    displayEventDetails(event) {
        const detailsContainer = this.windowElement.querySelector(`#event-details-${this.id}`);
        if (!detailsContainer) return;

        detailsContainer.innerHTML = `
            <div class="space-y-4">
                <!-- Event Header -->
                <div>
                    <h4 class="font-semibold text-white mb-2">${event.event}</h4>
                    <div class="space-y-1 text-sm">
                        <div><span class="text-gray-300">Time:</span> <span class="text-blue-400">${new Date(event.timestamp).toLocaleString()}</span></div>
                        <div><span class="text-gray-300">Source:</span> <span class="text-blue-400">${event.source}</span></div>
                        <div><span class="text-gray-300">Type:</span> <span class="text-blue-400">${this.formatEvidenceType(event.sourceType)}</span></div>
                        <div><span class="text-gray-300">Significance:</span> 
                            <span class="${
                                event.significance === 'critical' ? 'text-red-400' :
                                event.significance === 'high' ? 'text-orange-400' :
                                event.significance === 'medium' ? 'text-yellow-400' : 'text-green-400'
                            }">${event.significance.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <!-- Event Description -->
                <div class="border-t border-gray-600 pt-3">
                    <h5 class="font-semibold text-white mb-2">Description</h5>
                    <div class="text-sm text-gray-300">${event.description}</div>
                </div>

                <!-- Event Details -->
                <div class="border-t border-gray-600 pt-3">
                    <h5 class="font-semibold text-white mb-2">Technical Details</h5>
                    <div class="bg-gray-900 p-3 rounded text-xs">
                        ${Object.entries(event.details || {}).map(([key, value]) => `
                            <div class="flex justify-between mb-1">
                                <span class="text-gray-400">${key}:</span>
                                <span class="text-green-400">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Actions -->
                <div class="border-t border-gray-600 pt-3 space-y-2">
                    <button class="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-semibold"
                            onclick="window.timelineConstructor.correlateEvent('${event.id}')">
                        Find Related Events
                    </button>
                    <button class="w-full bg-green-600 hover:bg-green-700 py-2 rounded text-sm font-semibold"
                            onclick="window.timelineConstructor.exportEvent('${event.id}')">
                        Export Event
                    </button>
                </div>
            </div>
        `;

        window.timelineConstructor = this;
    }

    analyzeCorrelations() {
        if (this.timelineEvents.length === 0) {
            this.showNotification('Build a timeline first', 'warning');
            return;
        }

        // Find correlations between events
        this.correlations = this.findEventCorrelations();

        // Show correlation modal
        const modal = this.windowElement.querySelector(`#correlation-modal-${this.id}`);
        const resultsContainer = this.windowElement.querySelector(`#correlation-results-${this.id}`);

        if (modal && resultsContainer) {
            resultsContainer.innerHTML = this.renderCorrelationResults();
            modal.classList.remove('hidden');
        }

        // Update chain of custody
        this.updateChainOfCustody('timeline_analysis', 'correlations_analyzed');

        // Emit correlation analysis event
        this.emitForensicEvent('correlations_analyzed', {
            totalEvents: this.timelineEvents.length,
            correlationsFound: this.correlations.length
        });
    }

    findEventCorrelations() {
        const correlations = [];
        const timeThreshold = 3600000; // 1 hour in milliseconds

        for (let i = 0; i < this.timelineEvents.length; i++) {
            for (let j = i + 1; j < this.timelineEvents.length; j++) {
                const event1 = this.timelineEvents[i];
                const event2 = this.timelineEvents[j];

                const timeDiff = Math.abs(new Date(event1.timestamp) - new Date(event2.timestamp));
                
                // Time-based correlation
                if (timeDiff <= timeThreshold) {
                    correlations.push({
                        id: `corr_${Date.now()}_${i}_${j}`,
                        event1: event1,
                        event2: event2,
                        type: 'temporal',
                        strength: this.calculateCorrelationStrength(event1, event2, timeDiff),
                        description: `Events occurred within ${Math.round(timeDiff / 60000)} minutes of each other`
                    });
                }

                // Process-based correlation
                if (this.areProcessRelated(event1, event2)) {
                    correlations.push({
                        id: `corr_process_${Date.now()}_${i}_${j}`,
                        event1: event1,
                        event2: event2,
                        type: 'process',
                        strength: 0.8,
                        description: 'Events related to the same process or file'
                    });
                }
            }
        }

        return correlations.sort((a, b) => b.strength - a.strength);
    }

    calculateCorrelationStrength(event1, event2, timeDiff) {
        let strength = 1 - (timeDiff / 3600000); // Decrease with time

        // Increase strength for same source type
        if (event1.sourceType === event2.sourceType) {
            strength += 0.2;
        }

        // Increase strength for high significance events
        if (event1.significance === 'critical' || event2.significance === 'critical') {
            strength += 0.3;
        }

        return Math.min(1, Math.max(0, strength));
    }

    areProcessRelated(event1, event2) {
        const getProcessName = (event) => {
            return event.details?.process || event.details?.file || null;
        };

        const process1 = getProcessName(event1);
        const process2 = getProcessName(event2);

        return process1 && process2 && process1 === process2;
    }

    renderCorrelationResults() {
        if (this.correlations.length === 0) {
            return '<div class="text-center text-gray-500">No correlations found</div>';
        }

        return `
            <div class="space-y-4">
                <div class="text-sm text-green-400 mb-4">
                    Found ${this.correlations.length} correlations between timeline events
                </div>
                ${this.correlations.slice(0, 10).map(correlation => `
                    <div class="correlation bg-gray-700 p-4 rounded border border-gray-600">
                        <div class="flex justify-between items-start mb-2">
                            <div class="font-semibold text-white">${correlation.type.toUpperCase()} Correlation</div>
                            <div class="text-sm ${
                                correlation.strength > 0.7 ? 'text-green-400' :
                                correlation.strength > 0.4 ? 'text-yellow-400' : 'text-red-400'
                            }">
                                Strength: ${Math.round(correlation.strength * 100)}%
                            </div>
                        </div>
                        <div class="text-sm text-gray-300 mb-3">${correlation.description}</div>
                        
                        <div class="space-y-2">
                            <div class="bg-gray-800 p-2 rounded">
                                <div class="text-xs text-blue-400">Event 1:</div>
                                <div class="text-sm text-white">${correlation.event1.event}</div>
                                <div class="text-xs text-gray-400">${new Date(correlation.event1.timestamp).toLocaleString()}</div>
                            </div>
                            <div class="bg-gray-800 p-2 rounded">
                                <div class="text-xs text-blue-400">Event 2:</div>
                                <div class="text-sm text-white">${correlation.event2.event}</div>
                                <div class="text-xs text-gray-400">${new Date(correlation.event2.timestamp).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    closeCorrelationModal() {
        const modal = this.windowElement.querySelector(`#correlation-modal-${this.id}`);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    correlateEvent(eventId) {
        const event = this.timelineEvents.find(e => e.id === eventId);
        if (!event) return;

        // Find correlations for this specific event
        const eventCorrelations = this.correlations.filter(c => 
            c.event1.id === eventId || c.event2.id === eventId
        );

        this.showNotification(`Found ${eventCorrelations.length} correlations for this event`, 'success');
    }

    exportEvent(eventId) {
        const event = this.timelineEvents.find(e => e.id === eventId);
        if (!event) return;

        this.updateChainOfCustody('timeline_analysis', `event_exported: ${event.event}`);

        this.emitForensicEvent('timeline_event_exported', {
            eventId: event.id,
            eventType: event.event
        });

        this.showNotification('Event exported successfully', 'success');
    }

    changeZoom(zoomLevel) {
        this.currentZoom = zoomLevel;
        const zoomDisplay = this.windowElement.querySelector('#zoom-level');
        if (zoomDisplay) {
            zoomDisplay.textContent = zoomLevel.charAt(0).toUpperCase() + zoomLevel.slice(1);
        }

        this.updateTimelineVisualization();
    }

    groupEventsByCorrelation() {
        // Implementation for correlation-based grouping
        return this.timelineEvents; // Simplified for now
    }

    calculateTimeSpan() {
        if (this.timelineEvents.length === 0) return '0 hours';

        const timestamps = this.timelineEvents.map(e => new Date(e.timestamp));
        const earliest = Math.min(...timestamps);
        const latest = Math.max(...timestamps);
        const spanMs = latest - earliest;

        const hours = Math.round(spanMs / (1000 * 60 * 60));
        const days = Math.round(hours / 24);

        return days > 0 ? `${days} days` : `${hours} hours`;
    }

    updateTimelineStats() {
        const totalEvents = this.windowElement.querySelector('#total-events');
        const timeSpan = this.windowElement.querySelector('#time-span');
        const criticalEvents = this.windowElement.querySelector('#critical-events');
        const eventsCount = this.windowElement.querySelector('#events-count');
        const correlationsCount = this.windowElement.querySelector('#correlations-count');

        if (totalEvents) totalEvents.textContent = this.timelineEvents.length;
        if (timeSpan) timeSpan.textContent = this.calculateTimeSpan();
        if (criticalEvents) {
            const critical = this.timelineEvents.filter(e => e.significance === 'critical').length;
            criticalEvents.textContent = critical;
        }
        if (eventsCount) eventsCount.textContent = this.timelineEvents.length;
        if (correlationsCount) correlationsCount.textContent = this.correlations.length;
    }

    showNotification(message, type = 'info') {
        // Use centralized toast manager
        if (window.toastManager) {
            window.toastManager.showToast(message, type);
        }
    }
}

export default TimelineConstructorApp;