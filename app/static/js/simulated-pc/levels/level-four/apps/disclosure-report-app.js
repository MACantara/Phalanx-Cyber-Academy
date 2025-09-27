import { WindowBase } from '/static/js/simulated-pc/desktop-components/window-base.js';
import { loadCTFFlags, getFlagDescriptions } from './index.js';

export class DisclosureReportApp extends WindowBase {
    constructor() {
        super('disclosure', 'Responsible Disclosure Report', {
            width: '80%',
            height: '85%'
        });
        
        this.submittedFlags = new Set();
        this.flagDetails = new Map();
        this.flagDescriptions = new Map(); // Will be loaded dynamically
    }

    createContent() {
        return `
            <div class="disclosure-report-container h-full flex flex-col bg-gray-900 text-white">
                <!-- Header Section -->
                <div class="disclosure-header bg-green-800 px-4 py-3 border-b border-gray-700">
                    <div class="flex items-center space-x-3">
                        <i class="bi bi-shield-check text-2xl text-white"></i>
                        <div>
                            <h1 class="text-xl font-bold text-white">TechCorp Security Assessment</h1>
                            <p class="text-sm text-white opacity-80">Responsible Disclosure Report Submission</p>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="flex-1 flex overflow-hidden">
                    <!-- Left Panel - Flag Submission -->
                    <div class="w-1/2 border-r border-gray-700 flex flex-col">
                        <!-- Flag Submission Form -->
                        <div class="p-4 border-b border-gray-700">
                            <h2 class="text-lg font-semibold mb-4 flex items-center">
                                <i class="bi bi-flag-fill text-red-400 mr-2"></i>
                                Flag Submission
                            </h2>
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-sm font-medium mb-1">Flag Number (1-7):</label>
                                    <select id="flag-number" class="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                                        <option value="">Select Challenge</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1">Flag Value:</label>
                                    <input 
                                        type="text" 
                                        id="flag-value" 
                                        placeholder="Enter the complete flag (e.g., WHT{example})"
                                        class="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1">Discovery Method:</label>
                                    <textarea 
                                        id="discovery-method" 
                                        placeholder="Describe how you discovered this flag..."
                                        rows="3"
                                        class="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none resize-none"
                                    ></textarea>
                                </div>
                                <button 
                                    id="submit-flag" 
                                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2"
                                >
                                    <i class="bi bi-check-circle"></i>
                                    <span>Submit Flag</span>
                                </button>
                            </div>
                        </div>

                        <!-- Progress Section -->
                        <div class="p-4">
                            <h3 class="text-md font-semibold mb-3 flex items-center">
                                <i class="bi bi-clipboard-data text-green-400 mr-2"></i>
                                Assessment Progress
                            </h3>
                            <div class="space-y-2">
                                <div class="flex justify-between text-sm">
                                    <span>Flags Discovered:</span>
                                    <span id="progress-count">0/7</span>
                                </div>
                                <div class="w-full bg-gray-800 rounded-full h-2">
                                    <div id="progress-bar" class="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
                                </div>
                                <div id="completion-message" class="hidden text-center p-3 bg-green-900 border border-green-600 rounded mt-3">
                                    <i class="bi bi-trophy text-yellow-400 text-xl"></i>
                                    <p class="text-green-300 font-medium">Congratulations! All flags discovered!</p>
                                    <p class="text-sm text-green-400 mt-1">You have successfully completed The White Hat Test!</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Panel - Submitted Flags -->
                    <div class="w-1/2 flex flex-col">
                        <div class="p-4 border-b border-gray-700">
                            <h2 class="text-lg font-semibold flex items-center">
                                <i class="bi bi-list-check text-green-400 mr-2"></i>
                                Discovered Vulnerabilities
                            </h2>
                        </div>
                        <div class="flex-1 overflow-y-auto p-4">
                            <div id="submitted-flags" class="space-y-3">
                                <div class="text-center text-gray-500 py-8">
                                    <i class="bi bi-search text-4xl mb-3"></i>
                                    <p>No flags submitted yet</p>
                                    <p class="text-sm">Start exploring the system to discover vulnerabilities!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="disclosure-footer bg-gray-800 border-t border-gray-700 p-3 flex justify-between items-center text-sm">
                    <div class="flex items-center space-x-4">
                        <span class="text-gray-400">Security Assessment Status:</span>
                        <span id="status-indicator" class="px-2 py-1 bg-yellow-600 text-yellow-100 rounded-sm">In Progress</span>
                    </div>
                    <div class="text-gray-400">
                        TechCorp Responsible Disclosure Program
                    </div>
                </div>
            </div>
        `;
    }

    async initialize() {
        super.initialize();
        
        // Load flag descriptions dynamically and populate dropdown
        await this.loadFlagDescriptions();
        await this.populateFlagDropdown();
        
        this.attachEventListeners();
        this.updateProgress();
    }

    async populateFlagDropdown() {
        try {
            // Load CTF configuration from API
            const response = await fetch('/api/level4/flags-config');
            const configData = await response.json();
            
            if (configData.success) {
                const ctfConfig = configData.ctf_config;
                const flagSelect = this.windowElement.querySelector('#flag-number');
                
                // Clear existing options except the first one
                flagSelect.innerHTML = '<option value="">Select Challenge</option>';
                
                // Add options for selected flags
                const selectedFlags = ctfConfig.selected_flags || [];
                selectedFlags.forEach(flagId => {
                    const flagInfo = ctfConfig.flags[flagId];
                    if (flagInfo) {
                        const option = document.createElement('option');
                        option.value = flagId;
                        option.textContent = `${flagId} - ${flagInfo.name}`;
                        flagSelect.appendChild(option);
                    }
                });
                
                console.log('Flag dropdown populated with selected flags');
            }
        } catch (error) {
            console.error('Error loading flag configuration for dropdown:', error);
            // Keep default static options as fallback
        }
    }

    async loadFlagDescriptions() {
        try {
            // Load from API instead of using hardcoded descriptions
            const response = await fetch('/api/level4/flags-config');
            const configData = await response.json();
            
            if (configData.success) {
                const ctfConfig = configData.ctf_config;
                
                // Convert to Map for consistency with existing code
                for (const [flagId, flagInfo] of Object.entries(ctfConfig.flags)) {
                    this.flagDescriptions.set(flagId, flagInfo.challenge_question || flagInfo.name);
                }
                
                console.log('Flag descriptions loaded successfully from API');
                return;
            }
        } catch (error) {
            console.error('Failed to load flag descriptions from API:', error);
        }
        
        // Fallback descriptions with WHT format
        this.flagDescriptions = new Map([
            ['WHT-ENV', 'Environment Reconnaissance Challenge - Found in user environment files (.bashrc)'],
            ['WHT-SRC', 'Source Code Analysis Challenge - Located in HTML comments and PHP config files'],
            ['WHT-CFG', 'Server Configuration Audit Challenge - Discovered in nginx configuration files'],
            ['WHT-ENV2', 'Environment Variable Exposure Challenge - Found in admin environment configuration'],
            ['WHT-SUID', 'SUID Binary Security Challenge - Located in system binaries with elevated privileges'],
            ['WHT-LOG', 'Log File Analysis Challenge - Discovered in web server access logs'],
            ['WHT-COMPL', 'Responsible Disclosure Completion Challenge - Final flag awarded upon successful disclosure']
        ]);
    }

    attachEventListeners() {
        const submitButton = this.windowElement.querySelector('#submit-flag');
        const flagValueInput = this.windowElement.querySelector('#flag-value');

        submitButton?.addEventListener('click', () => this.handleFlagSubmission());
        
        // Allow Enter key to submit
        flagValueInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleFlagSubmission();
            }
        });

        // Auto-clear form when flag number changes
        const flagNumberSelect = this.windowElement.querySelector('#flag-number');
        flagNumberSelect?.addEventListener('change', () => {
            this.clearForm();
        });
    }

    async handleFlagSubmission() {
        const flagNumber = this.windowElement.querySelector('#flag-number').value;
        const flagValue = this.windowElement.querySelector('#flag-value').value.trim();
        const discoveryMethod = this.windowElement.querySelector('#discovery-method').value.trim();

        if (!flagNumber) {
            this.showNotification('Please select a flag number', 'error');
            return;
        }

        if (!flagValue) {
            this.showNotification('Please enter a flag value', 'error');
            return;
        }

        if (!discoveryMethod) {
            this.showNotification('Please describe how you discovered this flag', 'error');
            return;
        }

        // Check if flag has already been submitted
        if (this.submittedFlags.has(flagNumber)) {
            this.showNotification('This flag has already been submitted', 'warning');
            return;
        }

        // Validate flag with API
        try {
            const response = await fetch('/api/level4/validate-flag', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    flag_number: flagNumber,
                    flag_value: flagValue
                })
            });

            const result = await response.json();

            if (result.success && result.is_valid) {
                // Add to submitted flags
                this.submittedFlags.add(flagNumber);
                this.flagDetails.set(flagNumber, {
                    value: flagValue,
                    discoveryMethod: discoveryMethod,
                    timestamp: new Date().toLocaleString()
                });

                this.addFlagToDisplay(flagNumber, flagValue, discoveryMethod, true);
                this.updateProgress();
                this.clearForm();
                this.showNotification('Flag verified and recorded successfully!', 'success');

                // Check if all flags are discovered
                if (this.submittedFlags.size === 7) {
                    this.handleAssessmentComplete();
                }

            } else {
                this.showNotification(result.message || 'Incorrect flag value. Please verify and try again.', 'error');
            }

        } catch (error) {
            console.error('Error validating flag:', error);
            this.showNotification('Error validating flag. Please try again.', 'error');
        }
    }

    addFlagToDisplay(flagNumber, flagValue, discoveryMethod, isCorrect) {
        const container = this.windowElement.querySelector('#submitted-flags');
        
        // Remove empty state if it exists
        const emptyState = container.querySelector('.text-center');
        if (emptyState) {
            emptyState.remove();
        }

        const flagElement = document.createElement('div');
        flagElement.className = 'flag-item bg-gray-800 border border-gray-600 rounded p-3 space-y-2';
        
        const statusColor = isCorrect ? 'text-green-400' : 'text-red-400';
        const statusIcon = isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
        
        flagElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    <i class="bi ${statusIcon} ${statusColor}"></i>
                    <span class="font-semibold">${flagNumber}</span>
                </div>
                <span class="text-xs text-gray-400">${new Date().toLocaleString()}</span>
            </div>
            <div class="text-sm text-gray-300">
                <p class="font-medium">${this.flagDescriptions.get(flagNumber)}</p>
                <p class="text-blue-300 font-mono text-xs mt-1">${flagValue}</p>
            </div>
            <div class="text-xs text-gray-400">
                <strong>Discovery:</strong> ${discoveryMethod}
            </div>
        `;

        container.appendChild(flagElement);
    }

    updateProgress() {
        const progressCount = this.windowElement.querySelector('#progress-count');
        const progressBar = this.windowElement.querySelector('#progress-bar');
        const statusIndicator = this.windowElement.querySelector('#status-indicator');

        const discovered = this.submittedFlags.size;
        const total = 7;
        const percentage = (discovered / total) * 100;

        progressCount.textContent = `${discovered}/${total}`;
        progressBar.style.width = `${percentage}%`;

        // Update status
        if (discovered === 0) {
            statusIndicator.className = 'px-2 py-1 bg-yellow-600 text-yellow-100 rounded-sm';
            statusIndicator.textContent = 'In Progress';
        } else if (discovered < 7) {
            statusIndicator.className = 'px-2 py-1 bg-blue-600 text-blue-100 rounded-sm';
            statusIndicator.textContent = 'Active Assessment';
        } else {
            statusIndicator.className = 'px-2 py-1 bg-green-600 text-green-100 rounded-sm';
            statusIndicator.textContent = 'Assessment Complete';
        }
    }

    handleAssessmentComplete() {
        const completionMessage = this.windowElement.querySelector('#completion-message');
        completionMessage.classList.remove('hidden');
        
        // Scroll to show the completion message
        completionMessage.scrollIntoView({ behavior: 'smooth' });

        // Show special notification
        setTimeout(() => {
            this.showNotification('🎉 Congratulations! You have successfully completed The White Hat Test!', 'success', 5000);
        }, 1000);
    }

    clearForm() {
        this.windowElement.querySelector('#flag-value').value = '';
        this.windowElement.querySelector('#discovery-method').value = '';
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        const colors = {
            success: 'bg-green-600 border-green-500 text-green-100',
            error: 'bg-red-600 border-red-500 text-red-100',
            warning: 'bg-yellow-600 border-yellow-500 text-yellow-100',
            info: 'bg-blue-600 border-blue-500 text-blue-100'
        };

        notification.className = `fixed top-4 right-4 ${colors[type]} border px-4 py-3 rounded shadow-lg z-50 max-w-sm transform transition-all duration-300 translate-x-full opacity-0`;
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span class="text-sm">${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.remove('translate-x-full', 'opacity-0');
        }, 100);

        // Hide notification
        setTimeout(() => {
            notification.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }

    cleanup() {
        super.cleanup();
    }
}