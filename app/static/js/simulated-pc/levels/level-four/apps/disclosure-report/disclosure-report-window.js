import { WindowBase } from '../../../desktop-components/window-base.js';
import { DisclosureActivityEmitter } from './disclosure-activity-emitter.js';

export class DisclosureReportWindow extends WindowBase {
    constructor() {
        super('disclosure', 'Responsible Disclosure Report', {
            width: '80%',
            height: '85%'
        });
        
        this.submittedFlags = new Set();
        this.flagDetails = new Map();
        
        this.flagDescriptions = new Map([
            ['FLAG-1', 'Environment Configuration Analysis - Found in user environment files (.bashrc)'],
            ['FLAG-2', 'Source Code Security Review - Located in HTML comments and PHP config files'],
            ['FLAG-3', 'Server Configuration Assessment - Discovered in nginx configuration files'],
            ['FLAG-4', 'Environment Variable Exposure - Found in admin environment configuration'],
            ['FLAG-5', 'SUID Binary Analysis - Located in system binaries with elevated privileges'],
            ['FLAG-6', 'Log File Analysis - Discovered in web server access logs'],
            ['FLAG-7', 'Report Completion - Final flag awarded upon successful disclosure']
        ]);

        // Setup activity emission
        this.setupActivityEmission(DisclosureActivityEmitter);
    }

    createContent() {
        return `
            <div class="disclosure-report-container h-full flex flex-col bg-gray-900 text-white">
                <!-- Header Section -->
                <div class="disclosure-header bg-gradient-to-r from-blue-600 to-purple-600 p-4 border-b border-gray-700">
                    <div class="flex items-center space-x-3">
                        <i class="bi bi-shield-check text-2xl"></i>
                        <div>
                            <h1 class="text-xl font-bold">TechCorp Security Assessment</h1>
                            <p class="text-sm opacity-80">Responsible Disclosure Report Submission</p>
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
                                        <option value="">Select Flag Number</option>
                                        <option value="FLAG-1">FLAG-1 - Environment Configuration</option>
                                        <option value="FLAG-2">FLAG-2 - Source Code Review</option>
                                        <option value="FLAG-3">FLAG-3 - Server Configuration</option>
                                        <option value="FLAG-4">FLAG-4 - Environment Variables</option>
                                        <option value="FLAG-5">FLAG-5 - SUID Binary Analysis</option>
                                        <option value="FLAG-6">FLAG-6 - Log File Analysis</option>
                                        <option value="FLAG-7">FLAG-7 - Report Completion</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1">Flag Value:</label>
                                    <input 
                                        type="text" 
                                        id="flag-value" 
                                        placeholder="Enter the complete flag (e.g., FLAG-1{example})"
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

    initialize() {
        super.initialize();
        this.attachEventListeners();
        this.updateProgress();
        
        // Emit initialization activity
        this.emitAppActivity('disclosure_app_opened', {}, {
            total_flags: 7,
            discovered_flags: 0
        });
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

                // Emit successful flag submission
                this.emitAppActivity('flag_submitted', {
                    flag_number: flagNumber,
                    flag_value: flagValue,
                    is_correct: true
                }, {
                    discovery_method: discoveryMethod,
                    total_discovered: this.submittedFlags.size
                });

                // Check if all flags are discovered
                if (this.submittedFlags.size === 7) {
                    this.handleAssessmentComplete();
                }

            } else {
                this.showNotification(result.message || 'Incorrect flag value. Please verify and try again.', 'error');
                
                // Emit failed flag submission
                this.emitAppActivity('flag_submission_failed', {
                    flag_number: flagNumber,
                    attempted_value: flagValue,
                    is_correct: false
                }, {
                    discovery_method: discoveryMethod
                });
            }

        } catch (error) {
            console.error('Error validating flag:', error);
            this.showNotification('Error validating flag. Please try again.', 'error');
            
            // Emit error event
            this.emitAppActivity('flag_validation_error', {
                flag_number: flagNumber,
                error: error.message
            });
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
        
        // Emit assessment completion
        this.emitAppActivity('assessment_completed', {
            all_flags_discovered: true,
            completion_time: new Date().toISOString()
        }, {
            total_flags: 7,
            completion_percentage: 100
        });

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
        
        // Emit app close activity
        this.emitAppActivity('disclosure_app_closed', {
            flags_submitted: this.submittedFlags.size,
            assessment_complete: this.submittedFlags.size === 7
        });
    }
}