import { WindowBase } from '../../../desktop-components/window-base.js';

export class Level3TimerApp extends WindowBase {
    constructor() {
        super('level3-timer', 'Mission Status', {
            width: '280px',
            height: '160px',
            resizable: false,
            maximizable: false
        });
        
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
        
        // Listen for Level 3 dialogue completion
        this.setupDialogueListener();
    }

    createContent() {
        return `
            <div class="p-3 text-white h-full overflow-hidden">
                <!-- Timer Display -->
                <div class="mb-3 text-center">
                    <div class="text-xs text-gray-400 mb-1">TIME REMAINING</div>
                    <div class="text-xl font-bold font-mono ${this.getTimerColor()}" id="timer-display">
                        ${this.formatTime(this.timeRemaining)}
                    </div>
                    <div class="text-xs text-gray-400">
                        ${this.isRunning ? 'ACTIVE' : this.canStart ? 'READY' : 'STANDBY'}
                    </div>
                </div>
                
                <!-- Damage Indicators -->
                <div class="space-y-2">
                    <!-- Reputation -->
                    <div class="bg-gray-700 rounded p-2">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-xs text-gray-400">REPUTATION</span>
                            <span class="text-xs ${this.getReputationColor()}">${this.maxReputation - this.reputationDamage}%</span>
                        </div>
                        <div class="w-full bg-gray-600 rounded-full h-1.5">
                            <div class="bg-gradient-to-r ${this.getReputationBarColor()} h-1.5 rounded-full transition-all duration-500" 
                                 style="width: ${((this.maxReputation - this.reputationDamage) / this.maxReputation) * 100}%"></div>
                        </div>
                    </div>
                    
                    <!-- Financial -->
                    <div class="bg-gray-700 rounded p-2">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-xs text-gray-400">BUDGET</span>
                            <span class="text-xs ${this.getFinancialColor()}">$${this.formatMoney(this.maxFinancialHealth - this.financialDamage)}</span>
                        </div>
                        <div class="w-full bg-gray-600 rounded-full h-1.5">
                            <div class="bg-gradient-to-r ${this.getFinancialBarColor()} h-1.5 rounded-full transition-all duration-500" 
                                 style="width: ${((this.maxFinancialHealth - this.financialDamage) / this.maxFinancialHealth) * 100}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
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
        const remaining = (this.maxFinancialHealth - this.financialDamage) / this.maxFinancialHealth;
        if (remaining > 0.7) return 'text-green-400';
        if (remaining > 0.3) return 'text-yellow-400';
        return 'text-red-400';
    }

    getFinancialBarColor() {
        const remaining = (this.maxFinancialHealth - this.financialDamage) / this.maxFinancialHealth;
        if (remaining > 0.7) return 'from-green-400 to-green-500';
        if (remaining > 0.3) return 'from-yellow-400 to-yellow-500';
        return 'from-red-400 to-red-500';
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
        if (this.windowElement) {
            this.updateContent();
        }
    }

    // Override initialize - don't auto-start timer
    initialize() {
        super.initialize();
        
        // Timer will only start after Level 3 dialogue completion
        console.log('[Level3Timer] Timer initialized, waiting for Level 3 dialogue completion');
    }

    // Override cleanup to stop timer
    cleanup() {
        this.stopTimer();
        super.cleanup();
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