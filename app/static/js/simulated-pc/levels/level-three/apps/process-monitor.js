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
        
        this.loadProcesses();
    }

    async loadProcesses() {
        await level3DataManager.loadData();
        this.processes = level3DataManager.getAllProcesses();
        this.updateContent();
    }

    createContent() {
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
                                    <p class="text-sm text-white">Level 3 - Hunt Malicious Processes</p>
                                </div>
                            </div>
                            <div class="text-right text-sm">
                                <div class="text-white">Total: ${this.processes.length}</div>
                                <div class="text-white">Suspicious: ${this.processes.filter(p => !p.trusted).length}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Controls -->
                    <div class="bg-gray-800 px-4 py-3 border-b border-gray-700">
                        <div class="flex items-center justify-between">
                            <div class="flex space-x-3">
                                <button id="refresh-btn" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors">
                                    <i class="bi bi-arrow-clockwise mr-2"></i>Refresh
                                </button>
                                <button id="flag-suspicious-btn" class="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors" ${!this.selectedProcess ? 'disabled' : ''}>
                                    <i class="bi bi-flag mr-2"></i>Flag Process
                                </button>
                                <button id="kill-process-btn" class="px-3 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors" ${!this.selectedProcess || this.selectedProcess.category === 'system' ? 'disabled' : ''}>
                                    <i class="bi bi-x-circle mr-2"></i>Kill Process
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
                                    <th class="px-4 py-3 text-left">Risk</th>
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
                <tr class="process-row cursor-pointer hover:bg-gray-800 border-b border-gray-700 ${isSelected ? 'bg-blue-900' : ''} ${isMalicious ? 'bg-red-900/20' : ''}" 
                    data-pid="${process.pid}">
                    <td class="px-4 py-3">
                        <div class="flex items-center space-x-2">
                            ${isFlagged ? '<i class="bi bi-flag-fill text-yellow-400"></i>' : ''}
                            ${isMalicious ? '<i class="bi bi-exclamation-triangle text-red-400"></i>' : '<i class="bi bi-check-circle text-green-400"></i>'}
                            <span class="${isMalicious ? 'text-red-300' : ''}">${process.name}</span>
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
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded text-xs ${this.getRiskLevelColor(riskLevel)}">${riskLevel}</span>
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
                        ${isMalicious ? '<i class="bi bi-exclamation-triangle text-red-400 mr-2"></i>' : '<i class="bi bi-info-circle text-blue-400 mr-2"></i>'}
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

                        <!-- Security Analysis -->
                        ${isMalicious ? `
                            <div>
                                <h5 class="font-semibold text-red-400 mb-2">⚠️ Security Alert</h5>
                                <div class="bg-red-900/20 border border-red-700 rounded p-3">
                                    <div class="text-sm space-y-2">
                                        <div><strong>Malware Type:</strong> ${process.malwareType}</div>
                                        <div class="text-red-300">This process is flagged as malicious!</div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Risk Factors -->
                        ${riskFactors.length > 0 ? `
                            <div>
                                <h5 class="font-semibold text-yellow-400 mb-2">Risk Factors</h5>
                                <ul class="text-sm text-yellow-200 space-y-1">
                                    ${riskFactors.map(factor => `<li>• ${factor}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}

                        <!-- Damage Info -->
                        ${isMalicious && (process.reputationDamage || process.financialDamage) ? `
                            <div>
                                <h5 class="font-semibold text-red-400 mb-2">Potential Damage</h5>
                                <div class="text-sm space-y-1">
                                    ${process.reputationDamage ? `<div class="text-red-300">Reputation: -${process.reputationDamage}%</div>` : ''}
                                    ${process.financialDamage ? `<div class="text-red-300">Financial: -$${level3DataManager.formatDamage(process.financialDamage)}</div>` : ''}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Actions -->
                <div class="p-4 border-t border-gray-600">
                    <div class="space-y-2">
                        <button id="flag-btn" class="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors">
                            <i class="bi bi-flag mr-2"></i>Flag as Suspicious
                        </button>
                        ${process.category !== 'system' ? `
                            <button id="kill-btn" class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors">
                                <i class="bi bi-x-circle mr-2"></i>Kill Process
                            </button>
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
        if (!process.trusted) return 'HIGH';
        if (process.cpu > 20) return 'MEDIUM';
        if (process.priority === 'High') return 'MEDIUM';
        return 'LOW';
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

        if (process.category === 'system') {
            this.showNotification('Cannot kill system process!', 'error');
            return;
        }

        // Apply damage if killing malicious process (good) or legitimate process (bad)
        try {
            const appLauncher = getApplicationLauncher();
            
            if (!process.trusted) {
                // Killed malicious process - reduce damage
                const reputationRecovery = Math.min(5, process.reputationDamage || 0);
                this.showNotification(`Malicious process terminated! Reputation improved by ${reputationRecovery}%`, 'success');
                // Note: We could implement reputation recovery here if needed
            } else {
                // Killed legitimate process - apply damage
                appLauncher.addReputationDamage(5);
                appLauncher.addFinancialDamage(1000);
                this.showNotification('Warning: Legitimate process killed! Reputation and financial damage applied.', 'error');
            }
        } catch (error) {
            console.error('[ProcessMonitor] Failed to apply damage:', error);
        }

        // Remove process from list
        this.processes = this.processes.filter(p => p.pid !== pid);
        this.selectedProcess = null;
        this.updateContent();
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
        super.cleanup();
    }
}