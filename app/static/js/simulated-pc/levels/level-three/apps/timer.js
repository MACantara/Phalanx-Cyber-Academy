export class Level3TimerApp {
    constructor() {
        this.id = 'level3-timer';
        this.title = 'Mission Status';
        
        // Timer state
        this.timeRemaining = 15 * 60; // 15 minutes in seconds
        this.timerInterval = null;
        this.isRunning = false;
        this.canStart = false; // Only start after Level 3 dialogue
        
        // Damage tracking
        this.reputationDamage = 0;
        this.financialDamage = 0;
        this.maxReputation = 100;
        this.maxFinancialHealth = 1000000; // $1M starting budget
        
        // DOM element
        this.element = null;
        
        // Listen for Level 3 dialogue completion
        this.setupDialogueListener();
    }

    // Create the static timer element
    createElement() {
        this.element = document.createElement('div');
        this.element.id = 'level3-timer-static';
        this.element.className = 'fixed top-4 right-4 bg-gray-800 border border-gray-600 rounded shadow-xl z-50 backdrop-blur-sm';
        this.element.style.width = '220px';
        
        this.updateContent();
        return this.element;
    }

    // Create content HTML
    createContent() {
        return `
            <div class="bg-gradient-to-r from-gray-700 to-gray-600 px-2 py-1.5 border-b border-gray-600">
                <div class="text-white text-xs font-semibold flex items-center justify-between">
                    <div class="flex items-center space-x-1">
                        <i class="bi bi-stopwatch text-yellow-400"></i>
                        <span>MISSION</span>
                    </div>
                    <span class="text-xs ${this.isRunning ? 'text-green-400' : this.canStart ? 'text-yellow-400' : 'text-gray-400'}">
                        ${this.isRunning ? 'ACTIVE' : this.canStart ? 'READY' : 'STANDBY'}
                    </span>
                </div>
            </div>
            <div class="p-2 text-white">
                <!-- Timer Display -->
                <div class="text-center mb-2">
                    <div class="text-lg font-bold font-mono ${this.getTimerColor()}">
                        ${this.formatTime(this.timeRemaining)}
                    </div>
                </div>
                
                <!-- Compact Damage Grid -->
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <!-- Reputation -->
                    <div class="bg-gray-700 rounded p-1.5">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-gray-400">REPUTATION</span>
                            <span class="${this.getReputationColor()}">${this.maxReputation - this.reputationDamage}%</span>
                        </div>
                        <div class="w-full bg-gray-600 rounded-full h-1">
                            <div class="bg-gradient-to-r ${this.getReputationBarColor()} h-1 rounded-full transition-all duration-500" 
                                 style="width: ${((this.maxReputation - this.reputationDamage) / this.maxReputation) * 100}%"></div>
                        </div>
                    </div>
                    
                    <!-- Financial Cost -->
                    <div class="bg-gray-700 rounded p-1.5">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-gray-400">COST</span>
                            <span class="${this.getFinancialColor()}">$${this.formatMoney(this.financialDamage)}</span>
                        </div>
                        <div class="w-full bg-gray-600 rounded-full h-1">
                            <div class="bg-gradient-to-r ${this.getFinancialBarColor()} h-1 rounded-full transition-all duration-500" 
                                 style="width: ${(this.financialDamage / this.maxFinancialHealth) * 100}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Update content of the element
    updateContent() {
        if (this.element) {
            this.element.innerHTML = this.createContent();
        }
    }

    // Append to desktop (called by application launcher)
    appendTo(container) {
        if (!container) {
            console.error('[Level3Timer] No container provided, using document.body');
            container = document.body;
        }
        
        if (!this.element) {
            this.createElement();
        }
        
        try {
            container.appendChild(this.element);
            console.log('[Level3Timer] Timer element appended to container');
        } catch (error) {
            console.error('[Level3Timer] Failed to append timer element:', error);
            // Fallback to document.body
            document.body.appendChild(this.element);
        }
    }

    // Remove from DOM
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    // Timer methods
    startTimer() {
        if (this.timerInterval || !this.canStart) return; // Already running or not ready
        
        this.isRunning = true;
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            
            if (this.timeRemaining <= 0) {
                this.stopTimer();
                this.onTimeUp();
            }
        }, 1000);
        
        this.updateDisplay();
        console.log('[Level3Timer] Timer started after Level 3 dialogue completion');
    }

    // Enable timer start (called after Level 3 dialogue)
    enableTimer() {
        this.canStart = true;
        this.updateDisplay();
        
        // Auto-start after a short delay
        setTimeout(() => {
            this.startTimer();
        }, 1000);
    }

    // Setup listener for Level 3 dialogue completion
    setupDialogueListener() {
        // Listen for storage changes indicating Level 3 dialogue completion
        const checkDialogueComplete = () => {
            if (localStorage.getItem('cyberquest_level_3_started')) {
                this.enableTimer();
            }
        };

        // Check immediately and set up interval to check
        checkDialogueComplete();
        
        // Also listen for storage events
        window.addEventListener('storage', (e) => {
            if (e.key === 'cyberquest_level_3_started' && e.newValue) {
                this.enableTimer();
            }
        });

        // Backup check every second until dialogue completes
        const intervalCheck = setInterval(() => {
            if (localStorage.getItem('cyberquest_level_3_started')) {
                this.enableTimer();
                clearInterval(intervalCheck);
            }
        }, 1000);

        // Clear interval after 30 seconds to avoid infinite checking
        setTimeout(() => clearInterval(intervalCheck), 30000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.isRunning = false;
        this.updateDisplay();
    }

    pauseTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.isRunning = false;
        this.updateDisplay();
    }

    resetTimer() {
        this.stopTimer();
        this.timeRemaining = 15 * 60; // Reset to 15 minutes
        this.updateDisplay();
    }

    // Damage methods
    addReputationDamage(amount) {
        this.reputationDamage = Math.min(this.reputationDamage + amount, this.maxReputation);
        this.updateDisplay();
        
        // Emit event for game logic
        this.emitDamageEvent('reputation', amount, this.reputationDamage);
    }

    addFinancialDamage(amount) {
        this.financialDamage = Math.min(this.financialDamage + amount, this.maxFinancialHealth);
        this.updateDisplay();
        
        // Emit event for game logic
        this.emitDamageEvent('financial', amount, this.financialDamage);
    }

    // Utility methods
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    formatMoney(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(0) + 'K';
        }
        return amount.toString();
    }

    getTimerColor() {
        if (this.timeRemaining > 5 * 60) return 'text-green-400'; // > 5 minutes
        if (this.timeRemaining > 2 * 60) return 'text-yellow-400'; // > 2 minutes
        return 'text-red-400'; // < 2 minutes
    }

    getReputationColor() {
        const remaining = this.maxReputation - this.reputationDamage;
        if (remaining > 70) return 'text-green-400';
        if (remaining > 30) return 'text-yellow-400';
        return 'text-red-400';
    }

    getReputationBarColor() {
        const remaining = this.maxReputation - this.reputationDamage;
        if (remaining > 70) return 'from-green-400 to-green-500';
        if (remaining > 30) return 'from-yellow-400 to-yellow-500';
        return 'from-red-400 to-red-500';
    }

    getFinancialColor() {
        const costRatio = this.financialDamage / this.maxFinancialHealth;
        if (costRatio < 0.3) return 'text-green-400'; // Low cost
        if (costRatio < 0.7) return 'text-yellow-400'; // Medium cost
        return 'text-red-400'; // High cost
    }

    getFinancialBarColor() {
        const costRatio = this.financialDamage / this.maxFinancialHealth;
        if (costRatio < 0.3) return 'from-green-400 to-green-500'; // Low cost
        if (costRatio < 0.7) return 'from-yellow-400 to-yellow-500'; // Medium cost
        return 'from-red-400 to-red-500'; // High cost
    }

    // Event handling
    onTimeUp() {
        // Emit time up event safely
        try {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('level3-time-up', {
                    detail: {
                        reputationDamage: this.reputationDamage,
                        financialDamage: this.financialDamage
                    }
                }));
            }
        } catch (error) {
            console.error('[Level3Timer] Error dispatching time up event:', error);
        }
        
        console.log('[Level3Timer] Time is up!');
    }

    emitDamageEvent(type, amount, total) {
        try {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('level3-damage', {
                    detail: {
                        type: type,
                        amount: amount,
                        total: total,
                        timestamp: Date.now()
                    }
                }));
            }
        } catch (error) {
            console.error('[Level3Timer] Error dispatching damage event:', error);
        }
    }

    // Update the display
    updateDisplay() {
        this.updateContent();
    }

    // Initialize the timer (called by application launcher)
    initialize() {
        console.log('[Level3Timer] Timer initialized as static element, waiting for Level 3 dialogue completion');
    }

    // Cleanup when timer is destroyed
    cleanup() {
        this.stopTimer();
        this.remove();
    }

    // Get current status for saving/API
    getStatus() {
        return {
            timeRemaining: this.timeRemaining,
            reputationDamage: this.reputationDamage,
            financialDamage: this.financialDamage,
            isRunning: this.isRunning
        };
    }

    // Restore status from save/API
    setStatus(status) {
        if (status) {
            this.timeRemaining = status.timeRemaining || this.timeRemaining;
            this.reputationDamage = status.reputationDamage || 0;
            this.financialDamage = status.financialDamage || 0;
            
            if (status.isRunning && !this.isRunning) {
                this.startTimer();
            }
            
            this.updateDisplay();
        }
    }
}

// Export a factory function for easy integration
export function createLevel3Timer() {
    return new Level3TimerApp();
}