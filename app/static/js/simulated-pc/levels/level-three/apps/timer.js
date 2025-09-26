import { WindowBase } from '../../../desktop-components/window-base.js';

export class Level3TimerApp extends WindowBase {
    constructor() {
        super('level3-timer', 'Mission Status', {
            width: '320px',
            height: '200px'
        });
        
        // Timer state
        this.timeRemaining = 15 * 60; // 15 minutes in seconds
        this.timerInterval = null;
        this.isRunning = false;
        
        // Damage tracking
        this.reputationDamage = 0;
        this.financialDamage = 0;
        this.maxReputation = 100;
        this.maxFinancialHealth = 1000000; // $1M starting budget
    }

    createContent() {
        return `
            <div class="p-4 text-white h-full">
                <!-- Timer Display -->
                <div class="mb-4 text-center">
                    <div class="text-xs text-gray-400 mb-1">TIME REMAINING</div>
                    <div class="text-2xl font-bold font-mono ${this.getTimerColor()}" id="timer-display">
                        ${this.formatTime(this.timeRemaining)}
                    </div>
                    <div class="text-xs text-gray-400 mt-1">
                        ${this.isRunning ? 'ACTIVE MISSION' : 'STANDBY'}
                    </div>
                </div>
                
                <!-- Damage Indicators -->
                <div class="space-y-3">
                    <!-- Reputation Damage -->
                    <div class="bg-gray-700 rounded p-3">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-xs text-gray-400">REPUTATION</span>
                            <span class="text-xs ${this.getReputationColor()}">${this.maxReputation - this.reputationDamage}%</span>
                        </div>
                        <div class="w-full bg-gray-600 rounded-full h-2">
                            <div class="bg-gradient-to-r ${this.getReputationBarColor()} h-2 rounded-full transition-all duration-500" 
                                 style="width: ${((this.maxReputation - this.reputationDamage) / this.maxReputation) * 100}%"></div>
                        </div>
                        ${this.reputationDamage > 0 ? `<div class="text-xs text-red-400 mt-1">-${this.reputationDamage}% damage</div>` : ''}
                    </div>
                    
                    <!-- Financial Damage -->
                    <div class="bg-gray-700 rounded p-3">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-xs text-gray-400">BUDGET</span>
                            <span class="text-xs ${this.getFinancialColor()}">$${this.formatMoney(this.maxFinancialHealth - this.financialDamage)}</span>
                        </div>
                        <div class="w-full bg-gray-600 rounded-full h-2">
                            <div class="bg-gradient-to-r ${this.getFinancialBarColor()} h-2 rounded-full transition-all duration-500" 
                                 style="width: ${((this.maxFinancialHealth - this.financialDamage) / this.maxFinancialHealth) * 100}%"></div>
                        </div>
                        ${this.financialDamage > 0 ? `<div class="text-xs text-red-400 mt-1">-$${this.formatMoney(this.financialDamage)} lost</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Timer methods
    startTimer() {
        if (this.timerInterval) return; // Already running
        
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

    // Override initialize to start timer
    initialize() {
        super.initialize();
        
        // Auto-start timer for level 3
        setTimeout(() => {
            this.startTimer();
        }, 2000); // Start after 2 seconds
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

// Global timer control functions - only available for Level 3
export const Level3TimerControls = {
    timer: null,
    
    // Initialize timer (called from desktop only for level 3)
    init(windowManager) {
        // Double check we're in level 3
        let level = null;
        try {
            const simulation = window?.currentSimulation;
            level = simulation?.level?.id || simulation?.level;
        } catch (error) {
            console.warn('[Level3Timer] Cannot access window.currentSimulation, checking later');
            // Try to get level from windowManager or other sources if available
            level = windowManager?.desktop?.level;
        }
        
        if (level !== 3 && level !== '3') {
            console.log('[Level3Timer] Not level 3 (detected level:', level, '), skipping timer initialization');
            return null;
        }
        
        try {
            this.timer = new Level3TimerApp();
            const timerWindow = windowManager.createWindow('level3-timer', 'Mission Status', this.timer, {
                width: '320px',
                height: '200px'
            });
            
            // Position at top right
            if (timerWindow) {
                timerWindow.style.left = 'calc(100% - 340px)';
                timerWindow.style.top = '20px';
                timerWindow.style.zIndex = '1000';
                
                // Make window non-closable and non-minimizable for level 3
                const closeBtn = timerWindow.querySelector('.close');
                const minimizeBtn = timerWindow.querySelector('.minimize');
                if (closeBtn) closeBtn.style.display = 'none';
                if (minimizeBtn) minimizeBtn.style.display = 'none';
            }
            
            return this.timer;
        } catch (error) {
            console.error('[Level3Timer] Error creating timer window:', error);
            return null;
        }
    },
    
    // Add reputation damage
    damageReputation(amount) {
        if (this.timer) {
            this.timer.addReputationDamage(amount);
        }
    },
    
    // Add financial damage
    damageFinances(amount) {
        if (this.timer) {
            this.timer.addFinancialDamage(amount);
        }
    },
    
    // Get current status
    getStatus() {
        return this.timer ? this.timer.getStatus() : null;
    },
    
    // Control timer
    start() {
        if (this.timer) this.timer.startTimer();
    },
    
    pause() {
        if (this.timer) this.timer.pauseTimer();
    },
    
    stop() {
        if (this.timer) this.timer.stopTimer();
    },
    
    reset() {
        if (this.timer) this.timer.resetTimer();
    }
};