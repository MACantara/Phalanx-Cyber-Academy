import { WindowBase } from '../../../desktop-components/window-base.js';
import { level3DataManager } from '../data/index.js';
import { getApplicationLauncher } from '../../../desktop-components/application-launcher.js';

export class ProcessMonitorApp extends WindowBase {
    constructor() {
        super('process-monitor', 'Process Monitor', {
            width: '85%',
            height: '75%'
        });
        
        this.processes = [];
        this.selectedProcess = null;
        this.sortColumn = 'name';
        this.sortDirection = 'asc';
        this.flaggedProcesses = new Set();
        this.killedProcesses = new Set();
        this.timer = window.level3Timer;
        
        // Start gradual damage if malware processes exist
        this.damageInterval = null;
        this.startGradualDamage();
        
        this.loadProcesses();
    }

    async loadProcesses() {
        await level3DataManager.loadData();
        this.processes = level3DataManager.getAllProcesses();
        this.updateContent();
    }

    createContent() {
        const totalProcesses = this.processes.length;
        const maliciousProcesses = this.processes.filter(p => !p.trusted).length;
        const killedMalicious = this.processes.filter(p => !p.trusted && this.killedProcesses.has(p.pid)).length;
        const remainingMalicious = maliciousProcesses - killedMalicious;
        
        return `
            <div class="h-full flex bg-gray-900 text-white">
                <!-- Process List -->
                <div class="flex-1 flex flex-col">
                    <!-- Header -->
                    <div class="bg-green-800 px-4 py-3 border-b border-gray-700">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <i class="bi bi-cpu text-2xl text-white"></i>
                                <div>
                                    <h2 class="text-lg font-bold text-white">Process Monitor</h2>
                                    <p class="text-sm text-white">Level 3 - Process Analysis</p>
                                </div>
                            </div>
                            <div class="text-right text-sm">
                                <div class="text-white">Total: ${this.processes.length}</div>
                                <div class="text-white">Running: ${this.processes.filter(p => p.status === 'Running').length}</div>
                                ${remainingMalicious === 0 ? 
                                    '<div class="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium mt-1">✓ ANALYSIS COMPLETE</div>' :
                                    `<div class="bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium mt-1">${remainingMalicious} TO REVIEW</div>`
                                }
                            </div>
                        </div>
                    </div>

                    <!-- Controls -->
                    <div class="bg-gray-800 px-4 py-3 border-b border-gray-700">
                        <div class="flex items-center justify-between">
                            <div class="flex space-x-3">
                                <button id="refresh-btn" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors cursor-pointer">
                                    <i class="bi bi-arrow-clockwise mr-2"></i>Refresh
                                </button>
                                <button id="flag-suspicious-btn" class="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors cursor-pointer" ${!this.selectedProcess ? 'disabled' : ''}>
                                    <i class="bi bi-flag mr-2"></i>Flag Process
                                </button>
                                <button id="kill-process-btn" class="px-3 py-2 ${this.getKillButtonClasses()} rounded transition-colors cursor-pointer" ${!this.selectedProcess ? 'disabled' : ''}>
                                    <i class="bi bi-x-circle mr-2"></i>${this.getKillButtonText()}
                                </button>
                            </div>
                            <div class="text-sm text-gray-400">
                                <span>Click a process to select it</span>
                            </div>
                        </div>
                    </div>

                    <!-- Process Table -->
                    <div class="flex-1 overflow-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-800 sticky top-0">
                                <tr>
                                    <th class="px-4 py-3 text-left cursor-pointer hover:bg-gray-700 sortable" data-column="name">
                                        Process Name ${this.getSortIcon('name')}
                                    </th>
                                    <th class="px-4 py-3 text-left cursor-pointer hover:bg-gray-700 sortable" data-column="pid">
                                        PID ${this.getSortIcon('pid')}
                                    </th>
                                    <th class="px-4 py-3 text-left cursor-pointer hover:bg-gray-700 sortable" data-column="cpu">
                                        CPU % ${this.getSortIcon('cpu')}
                                    </th>
                                    <th class="px-4 py-3 text-left cursor-pointer hover:bg-gray-700 sortable" data-column="memory">
                                        Memory ${this.getSortIcon('memory')}
                                    </th>
                                    <th class="px-4 py-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderProcessRows()}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Process Details Panel -->
                ${this.selectedProcess ? this.renderProcessDetails() : this.renderNoSelection()}
            </div>
        `;
    }

    renderProcessRows() {
        const sortedProcesses = this.getSortedProcesses();
        
        return sortedProcesses.map(process => {
            const isSelected = this.selectedProcess && this.selectedProcess.pid === process.pid;
            const isMalicious = !process.trusted;
            const isFlagged = this.flaggedProcesses.has(process.pid);
            const riskLevel = this.getProcessRiskLevel(process);
            
            return `
                <tr class="process-row cursor-pointer hover:bg-gray-800 border-b border-gray-700 ${isSelected ? 'bg-blue-900' : ''}" 
                    data-pid="${process.pid}">
                    <td class="px-4 py-3">
                        <div class="flex items-center space-x-2">
                            ${isFlagged ? '<i class="bi bi-flag-fill text-yellow-400"></i>' : ''}
                            ${process.category === 'system' ? 
                                '<i class="bi bi-shield text-blue-400" title="System Process"></i>' : ''
                            }
                            <span>${process.name}</span>
                        </div>
                    </td>
                    <td class="px-4 py-3 font-mono">${process.pid}</td>
                    <td class="px-4 py-3">
                        <div class="flex items-center space-x-2">
                            <span>${process.cpu.toFixed(1)}%</span>
                            <div class="w-12 bg-gray-700 rounded-full h-2">
                                <div class="bg-${this.getCpuColor(process.cpu)} h-2 rounded-full" style="width: ${Math.min(process.cpu, 100)}%"></div>
                            </div>
                        </div>
                    </td>
                    <td class="px-4 py-3">${process.memory.toFixed(1)} MB</td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded text-xs ${this.getStatusColor(process.status)}">${process.status}</span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderProcessDetails() {
        const process = this.selectedProcess;
        const isMalicious = !process.trusted;
        const riskFactors = process.riskFactors || [];
        
        return `
            <div class="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
                <!-- Details Header -->
                <div class="bg-gray-700 px-4 py-3 border-b border-gray-600">
                    <h3 class="font-semibold flex items-center">
                        <i class="bi bi-info-circle text-blue-400 mr-2"></i>
                        Process Details
                    </h3>
                </div>

                <!-- Process Info -->
                <div class="flex-1 overflow-auto p-4">
                    <div class="space-y-4">
                        <!-- Basic Info -->
                        <div>
                            <h4 class="font-semibold text-white mb-2">${process.name}</h4>
                            <div class="space-y-2 text-sm">
                                <div><strong>PID:</strong> ${process.pid}</div>
                                <div><strong>Path:</strong> ${process.executable}</div>
                                <div><strong>Category:</strong> ${process.category}</div>
                                <div><strong>Priority:</strong> ${process.priority}</div>
                                <div><strong>Threads:</strong> ${process.threads}</div>
                                <div><strong>Start Time:</strong> ${process.startTime}</div>
                            </div>
                        </div>

                        <!-- Resource Usage -->
                        <div>
                            <h5 class="font-semibold text-white mb-2">Resource Usage</h5>
                            <div class="space-y-2 text-sm">
                                <div>
                                    <div class="flex justify-between">
                                        <span>CPU:</span>
                                        <span>${process.cpu.toFixed(1)}%</span>
                                    </div>
                                    <div class="w-full bg-gray-700 rounded-full h-2 mt-1">
                                        <div class="bg-blue-500 h-2 rounded-full" style="width: ${Math.min(process.cpu, 100)}%"></div>
                                    </div>
                                </div>
                                <div>
                                    <div class="flex justify-between">
                                        <span>Memory:</span>
                                        <span>${process.memory.toFixed(1)} MB</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Description -->
                        <div>
                            <h5 class="font-semibold text-white mb-2">Description</h5>
                            <p class="text-sm text-gray-300">${process.description}</p>
                        </div>

                        <!-- Process Analysis -->
                        ${this.getAllAnalysisData(process).length > 0 || (!process.trusted && (process.reputationDamage || process.financialDamage)) ? `
                            <div>
                                <h5 class="font-semibold text-yellow-400 mb-2">Process Analysis</h5>
                                <div class="bg-yellow-900/20 border border-yellow-700 rounded p-3">
                                    <div class="text-sm space-y-2">
                                        ${this.getAllAnalysisData(process).length > 0 ? `
                                            <div class="text-yellow-200">Behavioral observations:</div>
                                            <ul class="text-yellow-100 space-y-1 ml-2">
                                                ${this.getAllAnalysisData(process).map(item => `<li>• ${item}</li>`).join('')}
                                            </ul>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Actions -->
                <div class="p-4 border-t border-gray-600">
                    <div class="space-y-2">
                        <button id="flag-btn" class="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors cursor-pointer">
                            <i class="bi bi-flag mr-2"></i>Flag as Suspicious
                        </button>
                        
                        <!-- Kill Process Button with contextual styling -->
                        <button id="kill-btn" class="w-full px-3 py-2 ${this.getDetailsPanelKillButtonClasses()} rounded transition-colors cursor-pointer">
                            <i class="bi bi-x-circle mr-2"></i>${this.getDetailsPanelKillButtonText()}
                        </button>
                        
                        <!-- Warning for system processes -->
                        ${process.category === 'system' ? `
                            <div class="mt-2 p-2 bg-red-900/30 border border-red-700 rounded text-xs">
                                <div class="flex items-center">
                                    <i class="bi bi-exclamation-triangle text-red-400 mr-2"></i>
                                    <strong>SYSTEM WARNING</strong>
                                </div>
                                <div class="text-gray-300 mt-1">
                                    This is a system process. Killing system processes may cause system instability and penalties. Analyze carefully before proceeding.
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderNoSelection() {
        return `
            <div class="w-96 bg-gray-800 border-l border-gray-700 flex items-center justify-center">
                <div class="text-center text-gray-400">
                    <i class="bi bi-mouse text-4xl mb-3"></i>
                    <p>Select a process to view details</p>
                </div>
            </div>
        `;
    }

    getSortedProcesses() {
        return [...this.processes].sort((a, b) => {
            let aVal = a[this.sortColumn];
            let bVal = b[this.sortColumn];

            // Handle numeric columns
            if (['cpu', 'memory', 'pid'].includes(this.sortColumn)) {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            } else if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return this.sortDirection === 'asc' ? result : -result;
        });
    }

    getSortIcon(column) {
        if (this.sortColumn !== column) return '';
        return this.sortDirection === 'asc' ? '↑' : '↓';
    }

    getProcessRiskLevel(process) {
        // Calculate risk based on multiple factors instead of just trusted flag
        let riskScore = 0;
        
        // High CPU usage is suspicious
        if (process.cpu > 20) riskScore += 2;
        if (process.cpu > 50) riskScore += 3;
        
        // High memory usage
        if (process.memory > 100) riskScore += 2;
        if (process.memory > 200) riskScore += 3;
        
        // Suspicious paths
        if (process.executable.toLowerCase().includes('temp\\') || 
            process.executable.toLowerCase().includes('downloads\\')) {
            riskScore += 4;
        }
        
        // High priority without clear justification
        if (process.priority === 'High' && process.category !== 'system') {
            riskScore += 2;
        }
        
        // System32 processes that aren't typical Windows components
        if (process.executable.toLowerCase().includes('system32\\') && 
            !['csrss.exe', 'lsass.exe', 'winlogon.exe'].includes(process.name.toLowerCase())) {
            riskScore += 3;
        }
        
        // Return risk level based on score
        if (riskScore >= 6) return 'HIGH';
        if (riskScore >= 3) return 'MEDIUM';
        return 'LOW';
    }

    getAllAnalysisData(process) {
        const allIndicators = [];
        
        // Get behavioral indicators
        const suspicious = this.getSuspiciousIndicators(process);
        allIndicators.push(...suspicious);
        
        // Add risk factors from data if different from suspicious indicators
        if (process.riskFactors && process.riskFactors.length > 0) {
            const uniqueRiskFactors = process.riskFactors.filter(factor => 
                !suspicious.includes(factor)
            );
            allIndicators.push(...uniqueRiskFactors);
        }
        
        return allIndicators;
    }

    getSuspiciousIndicators(process) {
        const indicators = [];
        
        // High resource usage
        if (process.cpu > 20) {
            indicators.push(`High CPU usage (${process.cpu.toFixed(1)}%) for this type of process`);
        }
        if (process.memory > 150) {
            indicators.push(`Unusually high memory consumption (${process.memory.toFixed(1)} MB)`);
        }
        
        // Path analysis
        if (process.executable.toLowerCase().includes('temp\\')) {
            indicators.push('Running from temporary directory - unusual for legitimate software');
        }
        if (process.executable.toLowerCase().includes('downloads\\')) {
            indicators.push('Executing from downloads folder - potential security risk');
        }
        
        // System directory analysis
        if (process.executable.toLowerCase().includes('system32\\')) {
            const knownSystemProcesses = ['system', 'csrss.exe', 'lsass.exe', 'winlogon.exe', 'svchost.exe'];
            if (!knownSystemProcesses.some(known => process.name.toLowerCase().includes(known.toLowerCase()))) {
                indicators.push('Located in System32 but not a recognized Windows component');
            }
        }
        
        // Priority analysis
        if (process.priority === 'High' && process.category !== 'system') {
            indicators.push('Running with high priority without clear system justification');
        }
        
        // Add risk factors from data if available
        if (process.riskFactors && process.riskFactors.length > 0) {
            indicators.push(...process.riskFactors);
        }
        
        return indicators;
    }

    getCpuColor(cpu) {
        if (cpu > 50) return 'red-500';
        if (cpu > 20) return 'yellow-500';
        return 'green-500';
    }

    getStatusColor(status) {
        switch (status.toLowerCase()) {
            case 'running': return 'bg-green-600 text-white';
            case 'suspended': return 'bg-yellow-600 text-white';
            case 'stopped': return 'bg-red-600 text-white';
            default: return 'bg-gray-600 text-white';
        }
    }

    getRiskLevelColor(riskLevel) {
        switch (riskLevel.toLowerCase()) {
            case 'high': return 'bg-red-600 text-white';
            case 'medium': return 'bg-yellow-600 text-white';
            case 'low': return 'bg-green-600 text-white';
            default: return 'bg-gray-600 text-white';
        }
    }
    
    getKillButtonClasses() {
        if (!this.selectedProcess) {
            return 'bg-gray-600 hover:bg-gray-700';
        }
        
        if (this.selectedProcess.category === 'system') {
            // All system processes get the same warning styling
            return 'bg-red-800 hover:bg-red-900 border-2 border-red-600';
        } else {
            // Regular process - standard red
            return 'bg-red-600 hover:bg-red-700';
        }
    }
    
    getKillButtonText() {
        if (!this.selectedProcess) {
            return 'Kill Process';
        }
        
        if (this.selectedProcess.category === 'system') {
            return 'Kill System Process';
        } else {
            return 'Kill Process';
        }
    }
    
    getDetailsPanelKillButtonClasses() {
        const process = this.selectedProcess;
        if (!process) {
            return 'bg-gray-600 hover:bg-gray-700';
        }
        
        if (process.category === 'system') {
            // All system processes get the same warning styling
            return 'bg-red-800 hover:bg-red-900 border-2 border-red-600';
        } else {
            // Regular process - standard red
            return 'bg-red-600 hover:bg-red-700';
        }
    }
    
    getDetailsPanelKillButtonText() {
        const process = this.selectedProcess;
        if (!process) {
            return 'Kill Process';
        }
        
        if (process.category === 'system') {
            return 'Kill System Process';
        } else {
            return 'Kill Process';
        }
    }

    selectProcess(pid) {
        this.selectedProcess = this.processes.find(p => p.pid == pid);
        this.updateContent();
    }

    flagProcess(pid) {
        this.flaggedProcesses.add(pid);
        this.updateContent();
        this.showNotification('Process flagged as suspicious', 'warning');
    }

    async killProcess(pid) {
        const process = this.processes.find(p => p.pid == pid);
        if (!process) return;

        // Mark process as killed
        this.killedProcesses.add(pid);
        
        // Apply damage/recovery based on process type and trust level
        try {
            if (!process.trusted) {
                // Killed malicious process - good action, no penalty regardless of category
                if (process.category === 'system') {
                    // System-level malware (rootkit) - no penalty, correct identification
                    this.showNotification(`System process terminated. Target eliminated.`, 'success');
                } else {
                    // Regular malicious process - no penalty
                    this.showNotification(`Process terminated! Target eliminated.`, 'success');
                }
            } else {
                // Killed legitimate process - penalties based on system criticality
                if (process.category === 'system') {
                    // Critical system process - severe penalties
                    if (this.timer) {
                        this.timer.addReputationDamage(15);
                        this.timer.addFinancialDamage(10000);
                    }
                    this.showNotification('CRITICAL ERROR: Essential system process terminated! Severe reputation and financial damage applied.', 'error');
                } else {
                    // Regular legitimate process - standard penalty
                    if (this.timer) {
                        this.timer.addReputationDamage(5);
                        this.timer.addFinancialDamage(1000);
                    }
                    this.showNotification('Warning: Legitimate process killed! Reputation and financial damage applied.', 'error');
                }
            }
        } catch (error) {
            console.error('[ProcessMonitor] Failed to apply damage:', error);
        }

        // Remove process from list
        this.processes = this.processes.filter(p => p.pid !== pid);
        
        // Clear selection if killed process was selected
        if (this.selectedProcess && this.selectedProcess.pid == pid) {
            this.selectedProcess = null;
        }

        // Check if all malicious processes are killed
        const remainingMalicious = this.processes.filter(p => !p.trusted).length;
        if (remainingMalicious === 0) {
            this.onStageComplete();
        }

        this.updateContent();
    }

    onStageComplete() {
        // Trigger next stage (malware scanner)
        this.showNotification('All suspicious processes eliminated! Launching malware scanner...', 'success');
        
        // Stop gradual damage
        if (this.damageInterval) {
            clearInterval(this.damageInterval);
            this.damageInterval = null;
        }
        
        setTimeout(async () => {
            if (window.applicationLauncher) {
                await window.applicationLauncher.launchForLevel(3, 'malware-scanner', 'Malware Scanner');
            }
        }, 2000);
    }

    startGradualDamage() {
        // Apply gradual damage every 10 seconds while malicious processes exist
        this.damageInterval = setInterval(() => {
            const maliciousProcesses = this.processes.filter(p => !p.trusted && !this.killedProcesses.has(p.pid));
            if (maliciousProcesses.length > 0 && this.timer) {
                // Apply damage based on number of active malicious processes
                const reputationDamage = maliciousProcesses.length * 2; // 2% per process per 10 seconds
                const financialDamage = maliciousProcesses.length * 5000; // $5K per process per 10 seconds
                
                this.timer.addReputationDamage(reputationDamage);
                this.timer.addFinancialDamage(financialDamage);
                
                console.log(`[ProcessMonitor] Gradual damage applied: ${reputationDamage}% reputation, $${financialDamage} financial`);
            }
        }, 10000); // Every 10 seconds
    }

    refreshProcesses() {
        // Simulate minor changes in CPU/memory usage
        this.processes.forEach(process => {
            const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
            process.cpu = Math.max(0.1, process.cpu * (1 + variation));
            process.memory = Math.max(1, process.memory * (1 + variation));
        });
        
        this.updateContent();
        this.showNotification('Process list refreshed', 'info');
    }

    initialize() {
        super.initialize();
        this.bindEvents();
        
        // Mark app as opened
        localStorage.setItem('cyberquest_processmonitor_opened', 'true');
    }

    bindEvents() {
        if (!this.windowElement) return;

        // Control buttons
        const refreshBtn = this.windowElement.querySelector('#refresh-btn');
        const flagBtn = this.windowElement.querySelector('#flag-suspicious-btn');
        const killBtn = this.windowElement.querySelector('#kill-process-btn');

        refreshBtn?.addEventListener('click', () => this.refreshProcesses());
        flagBtn?.addEventListener('click', () => {
            if (this.selectedProcess) this.flagProcess(this.selectedProcess.pid);
        });
        killBtn?.addEventListener('click', () => {
            if (this.selectedProcess) this.killProcess(this.selectedProcess.pid);
        });

        // Process row selection
        this.windowElement.addEventListener('click', (e) => {
            const row = e.target.closest('.process-row');
            if (row) {
                const pid = row.dataset.pid;
                this.selectProcess(pid);
            }

            // Sort headers
            if (e.target.matches('.sortable, .sortable *')) {
                const header = e.target.closest('.sortable');
                const column = header?.dataset.column;
                if (column) this.sortBy(column);
            }

            // Details panel buttons
            if (e.target.matches('#flag-btn, #flag-btn *')) {
                if (this.selectedProcess) this.flagProcess(this.selectedProcess.pid);
            }
            if (e.target.matches('#kill-btn, #kill-btn *')) {
                if (this.selectedProcess) this.killProcess(this.selectedProcess.pid);
            }
        });
    }

    sortBy(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = ['cpu', 'memory', 'pid'].includes(column) ? 'desc' : 'asc';
        }
        this.updateContent();
    }

    showNotification(message, type = 'info') {
        if (window.toastManager && window.toastManager.showToast) {
            window.toastManager.showToast(message, type);
        } else {
            console.log(`[ProcessMonitor] ${type.toUpperCase()}: ${message}`);
        }
    }

    cleanup() {
        // Stop gradual damage interval
        if (this.damageInterval) {
            clearInterval(this.damageInterval);
            this.damageInterval = null;
        }
        
        super.cleanup();
    }
}