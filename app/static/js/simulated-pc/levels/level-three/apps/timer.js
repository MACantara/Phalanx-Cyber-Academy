export class Level3TimerApp {
    constructor() {
        this.id = 'level3-timer';
        this.title = 'Mission Status';
        
        // Timer state
        this.timeRemaining = 2 * 60; // 2 minutes in seconds
        this.timerInterval = null;
        this.isRunning = false;
        this.canStart = true; // Can start immediately since created after dialogue
        
        // Damage tracking
        this.reputationDamage = 0;
        this.financialDamage = 0;
        this.maxReputation = 100;
        this.maxFinancialHealth = 1000000; // $1M starting budget
        
        // DOM element
        this.element = null;
    }

    // Create the static timer element
    createElement() {
        this.element = document.createElement('div');
        this.element.id = 'level3-timer-static';
        this.element.className = 'fixed top-2 sm:top-4 right-2 sm:right-4 bg-gray-800 border border-gray-600 rounded shadow-xl z-50 backdrop-blur-sm';
        this.element.style.width = '200px';
        this.element.style.maxWidth = 'calc(100vw - 16px)';
        
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
                        <span class="hidden xs:inline">MISSION</span>
                        <span class="xs:hidden">MISS</span>
                    </div>
                    <span class="text-xs ${this.isRunning ? 'text-green-400' : this.canStart ? 'text-yellow-400' : 'text-gray-300'}">
                        ${this.isRunning ? 'ACTIVE' : this.canStart ? 'READY' : 'STANDBY'}
                    </span>
                </div>
            </div>
            <div class="p-1.5 sm:p-2 text-white">
                <!-- Timer Display -->
                <div class="text-center mb-2">
                    <div class="text-base sm:text-lg font-bold font-mono ${this.getTimerColor()}">
                        ${this.formatTime(this.timeRemaining)}
                    </div>
                </div>
                
                <!-- Compact Damage Grid -->
                <div class="grid grid-cols-1 gap-1.5 sm:gap-2 text-xs">
                    <!-- Reputation -->
                    <div class="bg-gray-700 rounded p-1 sm:p-1.5">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-gray-300 text-xs">
                                <span class="hidden xs:inline">REPUTATION</span>
                                <span class="xs:hidden">REP</span>
                            </span>
                            <span class="${this.getReputationColor()} text-xs">${this.maxReputation - this.reputationDamage}%</span>
                        </div>
                        <div class="w-full bg-gray-600 rounded-full h-1">
                            <div class="bg-gradient-to-r ${this.getReputationBarColor()} h-1 rounded-full transition-all duration-500" 
                                 style="width: ${((this.maxReputation - this.reputationDamage) / this.maxReputation) * 100}%"></div>
                        </div>
                    </div>
                    
                    <!-- Financial Cost -->
                    <div class="bg-gray-700 rounded p-1 sm:p-1.5">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-gray-300 text-xs">COST</span>
                            <span class="${this.getFinancialColor()} text-xs">$${this.formatMoney(this.financialDamage)}</span>
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
        console.log('[Level3Timer] Timer started');
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
        
        // Check for game over
        if (this.reputationDamage >= this.maxReputation) {
            this.onGameOver('reputation');
            return;
        }
        
        // Emit event for game logic
        this.emitDamageEvent('reputation', amount, this.reputationDamage);
    }

    addFinancialDamage(amount) {
        this.financialDamage = Math.min(this.financialDamage + amount, this.maxFinancialHealth);
        this.updateDisplay();
        
        // Check for game over
        if (this.financialDamage >= this.maxFinancialHealth) {
            this.onGameOver('financial');
            return;
        }
        
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
        this.stopTimer();
        this.onGameOver('time');
    }
    
    onGameOver(reason) {
        this.stopTimer();
        
        // Emit game over event safely
        try {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('level3-game-over', {
                    detail: {
                        reason: reason,
                        reputationDamage: this.reputationDamage,
                        financialDamage: this.financialDamage,
                        timeRemaining: this.timeRemaining
                    }
                }));
            }
        } catch (error) {
            console.error('[Level3Timer] Error dispatching game over event:', error);
        }
        
        // Show game over message
        this.showGameOverMessage(reason);
        
        console.log(`[Level3Timer] Game Over! Reason: ${reason}`);
    }
    
    showGameOverMessage(reason) {
        // Remove any existing game over modals first
        const existingModal = document.querySelector('#level3-game-over-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        let message = '';
        let title = 'MISSION FAILED';
        
        switch (reason) {
            case 'reputation':
                message = 'Your organization\'s reputation has been completely destroyed. The tournament has been cancelled and your cybersecurity career is over.';
                break;
            case 'financial':
                message = 'The financial damage from the cyber attack has bankrupted the organization. The tournament is cancelled and lawsuits are pending.';
                break;
            case 'time':
                message = 'Time has run out! The malware has spread throughout the entire tournament network. The championship is cancelled.';
                break;
            default:
                message = 'The cyber attack was not contained in time. Mission failed.';
        }
        
        // Create game over modal with unique ID
        const modal = document.createElement('div');
        modal.id = 'level3-game-over-modal';
        modal.className = 'fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-red-900 border-2 border-red-600 rounded-lg p-4 sm:p-6 md:p-8 w-full max-w-xs sm:max-w-sm md:max-w-lg text-center">
                <div class="text-red-300 mb-3 sm:mb-4">
                    <i class="bi bi-x-circle text-4xl sm:text-5xl md:text-6xl"></i>
                </div>
                <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">${title}</h2>
                <p class="text-red-100 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">${message}</p>
                <div class="space-y-2 sm:space-y-3">
                    <button id="restart-level" class="w-full px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded transition-colors cursor-pointer touch-manipulation text-sm sm:text-base">
                        Restart Level 3
                    </button>
                    <button id="return-levels" class="w-full px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white rounded transition-colors cursor-pointer touch-manipulation text-sm sm:text-base">
                        Return to Levels
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Bind events
        modal.querySelector('#restart-level').addEventListener('click', () => {
            window.location.reload();
        });
        
        modal.querySelector('#return-levels').addEventListener('click', () => {
            window.location.href = '/levels';
        });
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
        console.log('[Level3Timer] Timer initialized as static element, starting countdown');
        
        // Auto-start after a short delay since timer is created after dialogue
        setTimeout(() => {
            this.startTimer();
        }, 1000);
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