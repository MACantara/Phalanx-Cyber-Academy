// UI Manager - Handles all user interface updates and interactions
class UIManager {
    constructor(gameController) {
        this.gameController = gameController;
        this.terminalOutput = [];
        
        // XP tracking
        this.sessionXP = 0;
        this.currentUserXP = 0;
        this.xpAnimationQueue = [];
        
        console.log('🖥️ UI Manager initialized');
    }
    
    updateDisplay() {
        this.updateSystemStatus();
        this.updateAssetStatus();
        this.updateSecurityControls();
        this.updateTimer();
        this.updateGameControls();
        this.updateAlerts();
        this.updateIncidents();
        this.updateXPDisplay();
        this.updateIsolationAccuracy();
    }
    
    updateSystemStatus() {
        const gameState = this.gameController.getGameState();
        
        // Network status
        const networkStatus = document.getElementById('network-status');
        const networkText = document.getElementById('network-text');
        
        if (gameState.isRunning) {
            networkStatus?.classList.remove('bg-green-400', 'pulse-green');
            networkStatus?.classList.add('bg-orange-500', 'pulse-red');
            if (networkText) networkText.textContent = 'Under Attack';
            if (networkText) networkText.className = 'text-orange-400';
        } else {
            networkStatus?.classList.remove('bg-orange-500', 'pulse-red');
            networkStatus?.classList.add('bg-green-400', 'pulse-green');
            if (networkText) networkText.textContent = 'Secure';
            if (networkText) networkText.className = 'text-green-400';
        }
        
        // Assets status
        const assetsStatus = document.getElementById('assets-status');
        const assetsText = document.getElementById('assets-text');
        const compromisedAssets = Object.values(gameState.assets).filter(asset => asset.status === 'compromised').length;
        const vulnerableAssets = Object.values(gameState.assets).filter(asset => asset.status === 'vulnerable').length;
        
        if (compromisedAssets > 0) {
            assetsStatus?.classList.remove('bg-green-400', 'bg-orange-500');
            assetsStatus?.classList.add('bg-red-500');
            if (assetsText) assetsText.textContent = 'Compromised';
            if (assetsText) assetsText.className = 'text-red-400';
        } else if (vulnerableAssets > 0) {
            assetsStatus?.classList.remove('bg-green-400', 'bg-red-500');
            assetsStatus?.classList.add('bg-orange-500');
            if (assetsText) assetsText.textContent = 'Vulnerable';
            if (assetsText) assetsText.className = 'text-orange-400';
        } else {
            assetsStatus?.classList.remove('bg-red-500', 'bg-orange-500');
            assetsStatus?.classList.add('bg-green-400');
            if (assetsText) assetsText.textContent = 'Protected';
            if (assetsText) assetsText.className = 'text-green-400';
        }
        
        // Alerts count
        const alertsCount = document.getElementById('alerts-count');
        const activeAlerts = gameState.alerts.filter(alert => alert.status === 'detected').length;
        
        if (alertsCount) {
            alertsCount.textContent = `${activeAlerts} Active`;
            alertsCount.className = activeAlerts > 0 ? 'text-red-400' : 'text-gray-300';
        }
        
        const alertsStatus = document.getElementById('alerts-status');
        if (activeAlerts > 0) {
            alertsStatus?.classList.remove('bg-gray-500');
            alertsStatus?.classList.add('bg-red-500', 'pulse-red');
        } else {
            alertsStatus?.classList.remove('bg-red-500', 'pulse-red');
            alertsStatus?.classList.add('bg-gray-500');
        }
    }
    
    updateAssetStatus() {
        const gameState = this.gameController.getGameState();
        
        // Update network nodes with current asset status
        Object.entries(gameState.assets).forEach(([name, asset]) => {
            const networkNode = document.querySelector(`[data-asset="${name}"]`);
            if (networkNode) {
                const statusClass = this.getAssetStatusClass(asset.status);
                
                // Update border color based on status
                networkNode.className = `network-node bg-gray-700 p-4 rounded-lg border-2 cursor-pointer hover:bg-gray-600 transition-colors ${statusClass.node}`;
                
                // Update icon color
                const icon = networkNode.querySelector('i');
                if (icon) {
                    const iconClasses = icon.className.split(' ').filter(cls => !cls.startsWith('text-'));
                    icon.className = iconClasses.join(' ') + ` ${statusClass.text.replace('text-white', 'text-green-400')}`;
                }
                
                // Update progress bar
                const progressBar = networkNode.querySelector('.bg-green-400, .bg-orange-400, .bg-red-400');
                const roundedIntegrity = Math.round(asset.integrity);
                if (progressBar) {
                    progressBar.className = `h-1 rounded ${statusClass.bar}`;
                    progressBar.style.width = `${roundedIntegrity}%`;
                }
                
                // Update integrity text
                const integrityText = networkNode.querySelector('.integrity-text');
                if (integrityText) {
                    integrityText.textContent = `${roundedIntegrity}% Integrity`;
                    integrityText.className = `text-xs text-gray-300 mt-1 integrity-text`;
                }
            }
        });
    }
    
    updateSecurityControls() {
        const gameState = this.gameController.getGameState();
        
        // Update security control visual indicators
        Object.entries(gameState.securityControls).forEach(([controlName, control]) => {
            const controlElement = document.querySelector(`[data-control="${controlName}"]`);
            if (controlElement) {
                const icon = controlElement.querySelector('i');
                const text = controlElement.querySelector('span');
                
                if (control.active) {
                    // Control is enabled
                    controlElement.className = 'security-control bg-gray-700 p-3 rounded border border-green-400 cursor-pointer hover:bg-gray-600 transition-colors';
                    if (icon) {
                        icon.className = this.getSecurityControlIcon(controlName, true);
                    }
                    if (text) {
                        text.className = 'text-xs text-green-400 ms-2';
                    }
                } else {
                    // Control is disabled
                    controlElement.className = 'security-control bg-gray-700 p-3 rounded border border-red-400 cursor-pointer hover:bg-gray-600 transition-colors';
                    if (icon) {
                        icon.className = this.getSecurityControlIcon(controlName, false);
                    }
                    if (text) {
                        text.className = 'text-xs text-red-400 ms-2';
                    }
                }
            }
        });
    }
    
    getSecurityControlIcon(controlName, isActive) {
        const iconMap = {
            'firewall': isActive ? 'bi bi-shield-check text-green-400' : 'bi bi-shield-x text-red-400',
            'endpoint': isActive ? 'bi bi-laptop text-green-400' : 'bi bi-laptop text-red-400', 
            'access': isActive ? 'bi bi-key text-green-400' : 'bi bi-key text-red-400'
        };
        
        return iconMap[controlName] || 'bi bi-question-circle text-gray-400';
    }
    
    getAssetStatusClass(status) {
        const classes = {
            'secure': {
                badge: 'bg-green-400 text-black',
                bar: 'bg-green-400',
                node: 'bg-gray-700 border-green-400',
                text: 'text-white'
            },
            'vulnerable': {
                badge: 'bg-orange-400 text-black',
                bar: 'bg-orange-400',
                node: 'bg-gray-700 border-orange-400',
                text: 'text-white'
            },
            'compromised': {
                badge: 'bg-red-400 text-black',
                bar: 'bg-red-400',
                node: 'bg-gray-700 border-red-400',
                text: 'text-white'
            }
        };
        
        return classes[status] || classes['secure'];
    }
    
    formatAssetName(name) {
        // Return the asset name in terminal command format (e.g., 'academy-server')
        // with a display-friendly version in parentheses
        const displayName = name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        return `${name} (${displayName})`;
    }
    
    updateTimer() {
        const gameState = this.gameController.getGameState();
        const timerElement = document.getElementById('round-timer');
        
        if (timerElement) {
            const minutes = Math.floor(gameState.timeRemaining / 60);
            const seconds = gameState.timeRemaining % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            timerElement.textContent = timeString;
            
            // Change color based on remaining time
            if (gameState.timeRemaining < 300) { // Less than 5 minutes
                timerElement.className = 'text-red-600';
            } else if (gameState.timeRemaining < 600) { // Less than 10 minutes
                timerElement.className = 'text-orange-600';
            } else {
                timerElement.className = 'text-green-400';
            }
        }
    }
    
    updateGameControls() {
        const gameState = this.gameController.getGameState();
        const menuButton = document.getElementById('game-menu-button');
        const pauseButton = document.getElementById('pause-simulation');
        const stopButton = document.getElementById('stop-simulation');
        const resetButton = document.getElementById('reset-simulation');
        
        // Update menu button text based on game state
        if (menuButton) {
            const buttonText = menuButton.querySelector('span');
            if (buttonText) {
                buttonText.textContent = gameState.isRunning ? 'Simulation Active' : 'Simulation Paused';
            }
        }
        
        // Update button states in dropdown
        if (pauseButton) {
            if (gameState.isRunning) {
                pauseButton.innerHTML = '<i class="bi bi-pause-fill me-2 text-orange-400"></i>Pause Simulation';
                pauseButton.disabled = false;
            } else {
                pauseButton.innerHTML = '<i class="bi bi-play-fill me-2 text-green-400"></i>Resume Simulation';
                pauseButton.disabled = false;
            }
        }
        
        if (stopButton) {
            // Stop button should only be enabled when game is running
            // Disable when game is paused or stopped
            if (gameState.isRunning) {
                stopButton.disabled = false;
                stopButton.classList.remove('opacity-50');
            } else {
                stopButton.disabled = true;
                stopButton.classList.add('opacity-50');
            }
        }
    }
    
    addAlert(alert) {
        const alertCenter = document.getElementById('alert-center');
        if (!alertCenter) return;
        
        // Remove "no alerts" message if present
        if (alertCenter.querySelector('.italic')) {
            alertCenter.innerHTML = '';
        }
        
        const severityClass = this.getSeverityClass(alert.severity);
        const alertElement = document.createElement('div');
        // Add unread indicator with border and background
        alertElement.className = `alert-item p-3 rounded-lg border-l-4 ${severityClass.bg} ${severityClass.border} mb-2 cursor-pointer hover:opacity-80 transition-opacity relative border-r-4 border-r-blue-400`;
        alertElement.dataset.alertId = alert.id || Date.now();
        alertElement.dataset.read = 'false';
        
        // Format IP address information
        const ipInfo = alert.sourceIP ? 
            `<div class="text-xs text-gray-400 mt-1">
                <i class="bi bi-globe2 mr-1"></i>Source: ${alert.sourceIP}
                ${alert.ipType ? `<span class="ml-2 px-1 py-0.5 bg-gray-600 rounded text-xs">${alert.ipType}</span>` : ''}
            </div>` : '';
        
        alertElement.innerHTML = `
            <div class="flex items-center">
                <!-- Unread indicator dot -->
                <div class="unread-indicator absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <div class="flex-1 ms-2">
                    <div class="text-sm font-medium ${severityClass.text}">${alert.technique}</div>
                    <div class="text-xs text-white">${this.formatAssetName(alert.target)} • ${alert.timestamp.toLocaleTimeString()}</div>
                    ${ipInfo}
                    ${alert.attackId ? `<div class="text-xs text-gray-500 mt-1">ID: ${alert.attackId}</div>` : ''}
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-xs px-2 py-1 ${severityClass.badge} rounded-full">${alert.severity.toUpperCase()}</span>
                    <span class="read-status text-xs px-2 py-1 bg-blue-500 text-white rounded-full">NEW</span>
                </div>
            </div>
        `;
        
        // Add click handler to mark as read
        alertElement.addEventListener('click', () => {
            this.markAlertAsRead(alertElement);
        });
        
        // Add flash animation for new alerts
        alertElement.style.animation = 'flash 0.5s ease-in-out';
        
        alertCenter.insertBefore(alertElement, alertCenter.firstChild);
        
        // Keep only last 20 alerts
        const alerts = alertCenter.children;
        if (alerts.length > 20) {
            alertCenter.removeChild(alerts[alerts.length - 1]);
        }
    }
    
    markAlertAsRead(alertElement) {
        if (alertElement.dataset.read === 'true') return;
        
        alertElement.dataset.read = 'true';
        
        // Remove unread indicator
        const unreadIndicator = alertElement.querySelector('.unread-indicator');
        if (unreadIndicator) {
            unreadIndicator.remove();
        }
        
        // Remove right border
        alertElement.classList.remove('border-r-4', 'border-r-blue-400');
        
        // Update status badge
        const statusBadge = alertElement.querySelector('.read-status');
        if (statusBadge) {
            statusBadge.textContent = 'READ';
            statusBadge.classList.remove('bg-blue-500');
            statusBadge.classList.add('bg-gray-600');
        }
        
        // Reduce opacity slightly
        alertElement.style.opacity = '0.7';
    }
    
    markAllAlertsRead() {
        const alertCenter = document.getElementById('alert-center');
        if (!alertCenter) return;
        
        const alerts = alertCenter.querySelectorAll('.alert-item[data-read="false"]');
        alerts.forEach(alert => this.markAlertAsRead(alert));
    }
    
    getSeverityClass(severity) {
        const classes = {
            'low': {
                bg: 'bg-gray-700',
                border: 'border-blue-400',
                text: 'text-blue-400',
                badge: 'bg-blue-400 text-black'
            },
            'medium': {
                bg: 'bg-gray-700',
                border: 'border-yellow-400',
                text: 'text-yellow-400',
                badge: 'bg-yellow-400 text-black'
            },
            'high': {
                bg: 'bg-gray-700',
                border: 'border-orange-400',
                text: 'text-orange-400',
                badge: 'bg-orange-400 text-black'
            },
            'critical': {
                bg: 'bg-gray-700',
                border: 'border-red-400',
                text: 'text-red-400',
                badge: 'bg-red-400 text-black'
            }
        };
        
        return classes[severity] || classes['medium'];
    }
    
    updateAlerts() {
        const gameState = this.gameController.getGameState();
        const alertCenter = document.getElementById('alert-center');
        
        if (!alertCenter) return;
        
        // Only show "no alerts" message if there are truly no alerts at all
        const hasAnyAlerts = alertCenter.children.length > 0 && 
                           !alertCenter.querySelector('.italic');
        
        if (gameState.alerts.length === 0 && !hasAnyAlerts) {
            alertCenter.innerHTML = '<div class="text-sm text-gray-600 dark:text-gray-400 italic">No active alerts.</div>';
        }
    }
    
    addIncident(incident) {
        const incidentPanel = document.getElementById('incident-panel');
        if (!incidentPanel) return;
        
        // Remove "no incidents" message if present
        if (incidentPanel.querySelector('.italic')) {
            incidentPanel.innerHTML = '';
        }
        
        const incidentElement = document.createElement('div');
        incidentElement.className = 'p-3 bg-gray-700 border border-red-400 rounded-lg mb-2';
        incidentElement.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="bi bi-exclamation-triangle-fill text-red-400"></i>
                <div>
                    <div class="text-sm font-medium text-red-400">Security Breach Detected</div>
                    <div class="text-xs text-white">
                        ${incident.technique} affected ${this.formatAssetName(incident.target)} • 
                        ${Math.round(incident.damage)}% integrity loss • 
                        ${incident.timestamp.toLocaleTimeString()}
                    </div>
                </div>
            </div>
        `;
        
        incidentPanel.insertBefore(incidentElement, incidentPanel.firstChild);
        
        // Keep only last 5 incidents
        const incidents = incidentPanel.children;
        if (incidents.length > 5) {
            incidentPanel.removeChild(incidents[incidents.length - 1]);
        }
    }
    
    updateIncidents() {
        const gameState = this.gameController.getGameState();
        const incidentPanel = document.getElementById('incident-panel');
        
        if (!incidentPanel) return;
        
        if (gameState.incidents.length === 0) {
            incidentPanel.innerHTML = '<div class="text-sm text-gray-600 dark:text-gray-400 italic">No incidents detected. Monitoring for suspicious activity...</div>';
        }
    }
    
    updateTerminal() {
        const terminalOutput = document.getElementById('terminal-output');
        if (!terminalOutput) return;
        
        // Update output - support both new and old format
        terminalOutput.innerHTML = this.terminalOutput.map(entry => {
            if (typeof entry === 'object' && entry.text && entry.class) {
                return `<div class="${entry.class}">${entry.text}</div>`;
            } else {
                return `<div class="text-gray-300">${entry}</div>`;
            }
        }).join('');
        
        // Scroll to bottom
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
    
    clearTerminal() {
        this.terminalOutput = [];
        this.updateTerminal();
    }

    // XP Tracking Methods using Centralized System
    updateXPDisplay() {
        const gameState = this.gameController.getGameState();
        
        // Try to get accurate XP data from centralized system
        this.updateXPDisplayWithCentralizedData().catch(error => {
            console.warn('[UIManager] Could not load centralized XP data, using local values:', error);
        });
        
        // Update session XP display (both locations)
        const sessionXPElement = document.getElementById('session-xp');
        const sessionXPDetailedElement = document.getElementById('session-xp-detailed');
        if (sessionXPElement) {
            sessionXPElement.textContent = gameState.sessionXP || 0;
        }
        if (sessionXPDetailedElement) {
            sessionXPDetailedElement.textContent = gameState.sessionXP || 0;
        }
        
        // Update current user XP display
        const currentXPElement = document.getElementById('current-xp');
        if (currentXPElement) {
            currentXPElement.textContent = this.currentUserXP;
        }
        
        // Update performance stats
        const attacksMitigatedElement = document.getElementById('attacks-mitigated');
        if (attacksMitigatedElement) {
            attacksMitigatedElement.textContent = gameState.attacksMitigated || 0;
        }
        
        const attacksSuccessfulElement = document.getElementById('attacks-successful');
        if (attacksSuccessfulElement) {
            attacksSuccessfulElement.textContent = gameState.attacksSuccessful || 0;
        }
        
        // Calculate and update defense ratio
        const totalAttacks = (gameState.attacksMitigated || 0) + (gameState.attacksSuccessful || 0);
        const defenseRatio = totalAttacks > 0 ? Math.round(((gameState.attacksMitigated || 0) / totalAttacks) * 100) : 100;
        const defenseRatioElement = document.getElementById('defense-ratio');
        if (defenseRatioElement) {
            defenseRatioElement.textContent = `${defenseRatio}%`;
            // Update color based on performance
            if (defenseRatio >= 80) {
                defenseRatioElement.className = 'text-green-400';
            } else if (defenseRatio >= 60) {
                defenseRatioElement.className = 'text-yellow-400';
            } else {
                defenseRatioElement.className = 'text-red-400';
            }
        }
        
        // Update XP progress bar if available
        const xpProgressElement = document.getElementById('xp-progress');
        if (xpProgressElement && gameState.sessionXP) {
            const progress = Math.min(100, (gameState.sessionXP / 200) * 100); // Cap at 200 XP for full bar
            xpProgressElement.style.width = `${progress}%`;
        }
    }

    async updateXPDisplayWithCentralizedData() {
        try {
            // Import centralized XP calculator for accurate display
            const { XPCalculator } = await import('/static/js/utils/xp-calculator.js');
            const xpCalculator = new XPCalculator();
            
            // Check if loadConfig method exists before calling
            if (typeof xpCalculator.loadConfig === 'function') {
                await xpCalculator.loadConfig();
            }

            // Get current user's total XP using centralized system if method exists
            if (typeof xpCalculator.getUserCurrentXP === 'function') {
                const userXPData = await xpCalculator.getUserCurrentXP();
                if (userXPData && userXPData.success) {
                    this.currentUserXP = userXPData.currentXP;
                    
                    // Update current user XP display with accurate data
                    const currentXPElement = document.getElementById('current-xp');
                    if (currentXPElement) {
                        currentXPElement.textContent = this.currentUserXP;
                    }
                }
            } else {
                // Fallback to local game state for current XP tracking
                const gameState = this.gameController.getGameState();
                this.currentUserXP = gameState.currentXP || 0;
                
                const currentXPElement = document.getElementById('current-xp');
                if (currentXPElement) {
                    currentXPElement.textContent = this.currentUserXP;
                }
            }
        } catch (error) {
            // Fallback to local XP tracking if centralized system is unavailable
            console.warn('[UIManager] Centralized XP system unavailable, using local tracking:', error);
            
            const gameState = this.gameController.getGameState();
            this.currentUserXP = gameState.currentXP || 0;
            
            const currentXPElement = document.getElementById('current-xp');
            if (currentXPElement) {
                currentXPElement.textContent = this.currentUserXP;
            }
        }
    }

    showXPReward(amount, reason = '') {
        try {
            // Use centralized XP calculation for more accurate rewards
            this.calculateAndShowXPReward(amount, reason).catch(error => {
                console.warn('[UIManager] Centralized XP calculation failed, using base amount:', error);
            });
        } catch (error) {
            console.error('[UIManager] Error in XP reward system:', error);
        }
    }

    async calculateAndShowXPReward(amount, reason) {
        // Import centralized XP calculator for accuracy
        const { XPCalculator } = await import('/static/js/utils/xp-calculator.js');
        const xpCalculator = new XPCalculator();
        await xpCalculator.loadConfig();
        
        // Calculate performance-based XP
        const xpData = await xpCalculator.calculatePerformanceBasedXPAsync({
            baseAmount: amount,
            difficulty: 'blue-team-vs-red-team',
            performanceMetrics: {
                efficiency: this.gameController.getGameState().attacksMitigated > 0 ? 
                    this.gameController.getGameState().attacksMitigated / 
                    (this.gameController.getGameState().attacksMitigated + this.gameController.getGameState().attacksSuccessful) : 0,
                timeSpent: 900 - this.gameController.getGameState().timeRemaining,
                sessionProgress: Math.min(1.0, this.gameController.getGameState().sessionXP / 200)
            }
        });
        
        const actualXP = xpData.success ? xpData.xpEarned : amount;
    }

    showXPPenalty(amount, reason = '') {
        try {
            // Use centralized XP calculation for consistent penalties
            this.calculateAndShowXPPenalty(amount, reason).catch(error => {
                console.warn('[UIManager] Centralized XP penalty calculation failed, using base amount:', error);
            });
        } catch (error) {
            console.error('[UIManager] Error in XP penalty system:', error);
        }
    }

    async calculateAndShowXPPenalty(amount, reason) {
        // Import centralized XP calculator
        const { XPCalculator } = await import('/static/js/utils/xp-calculator.js');
        const xpCalculator = new XPCalculator();
        await xpCalculator.loadConfig();
        
        // Calculate penalty based on performance and difficulty
        const penaltyData = await xpCalculator.calculatePerformanceBasedXPAsync({
            baseAmount: -amount,
            difficulty: 'blue-team-vs-red-team',
            performanceMetrics: {
                efficiency: this.gameController.getGameState().attacksMitigated > 0 ? 
                    this.gameController.getGameState().attacksMitigated / 
                    (this.gameController.getGameState().attacksMitigated + this.gameController.getGameState().attacksSuccessful) : 0,
                timeSpent: 900 - this.gameController.getGameState().timeRemaining,
                penaltyMultiplier: 1.2 // Penalties slightly more severe
            }
        });
        
        const actualPenalty = penaltyData.success ? Math.abs(penaltyData.xpEarned) : amount;
    }

    showFloatingXP(amount, type) {
        const gameArea = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-4');
        if (!gameArea) return;
        
        const floatingXP = document.createElement('div');
        floatingXP.className = `fixed z-50 pointer-events-none font-bold text-lg ${
            type === 'reward' ? 'text-green-400' : 'text-red-400'
        }`;
        floatingXP.textContent = `${amount > 0 ? '+' : ''}${amount} XP`;
        
        // Position randomly in the game area
        const rect = gameArea.getBoundingClientRect();
        floatingXP.style.left = `${rect.left + Math.random() * 200}px`;
        floatingXP.style.top = `${rect.top + 50}px`;
        
        document.body.appendChild(floatingXP);
        
        // Animate upward and fade out
        floatingXP.animate([
            { transform: 'translateY(0px)', opacity: 1 },
            { transform: 'translateY(-50px)', opacity: 0 }
        ], {
            duration: 2000,
            easing: 'ease-out'
        }).onfinish = () => {
            floatingXP.remove();
        };
    }

    showXPNotification(amount, type, reason) {
        // Use centralized toast utility if available
        if (window.toastManager && window.toastManager.showToast) {
            const sign = amount > 0 ? '+' : '';
            const message = reason ? 
                `${sign}${amount} XP • ${reason}` : 
                `${sign}${amount} XP`;
            
            // Map XP notification types to toast types
            const toastType = type === 'reward' ? 'success' : 'error';
            window.toastManager.showToast(message, toastType);
        } else {
            // Fallback to console log if toast manager not available
            const sign = amount > 0 ? '+' : '';
            const message = reason ? 
                `${sign}${amount} XP: ${reason}` : 
                `${sign}${amount} XP`;
            console.log(`XP Notification [${type}]: ${message}`);
        }
    }

    // Specialized methods for asset isolation XP feedback
    showAssetIsolationReward(amount, assetName, attacksStopped) {
        // Show floating XP animation
        this.showFloatingXP(amount, 'reward');
        
        // Show detailed notification
        const message = attacksStopped > 1 ? 
            `Excellent! Stopped ${attacksStopped} attacks on ${assetName}` :
            `Great defense! Protected ${assetName} from attack`;
        this.showXPNotification(amount, 'reward', message);
        
        // Add specialized terminal feedback with tactical information
        this.addTerminalOutput(`🛡️  TACTICAL SUCCESS: Asset isolation prevented ${attacksStopped} attack(s)`);
        this.addTerminalOutput(`   💰 Defense Bonus: +${amount} XP earned`);
        
        // Update session stats display
        this.updateXPDisplay();
    }

    showAssetIsolationPenalty(amount, assetName) {
        // Show floating XP penalty animation
        this.showFloatingXP(-amount, 'penalty');
        
        // Show penalty notification
        const message = `Resource waste: No threats detected on ${assetName}`;
        this.showXPNotification(-amount, 'penalty', message);
        
        // Add specialized terminal feedback with learning guidance
        this.addTerminalOutput(`⚠️  TACTICAL WARNING: Unnecessary isolation wastes resources`);
        this.addTerminalOutput(`   💸 Efficiency Penalty: -${amount} XP lost`);
        this.addTerminalOutput(`   💡 TIP: Monitor alerts before isolating assets`);
        
        // Update session stats display
        this.updateXPDisplay();
    }

    showVulnerabilityPatchReward(baseAmount, exploitBonus, cveId) {
        const totalAmount = baseAmount + exploitBonus;
        
        // Show floating XP reward animation
        this.showFloatingXP(totalAmount, 'reward');
        
        // Show reward notification with CVE details
        const message = `Vulnerability patched: ${cveId}`;
        this.showXPNotification(totalAmount, 'reward', message);
        
        // Add specialized terminal feedback with tactical information
        this.addTerminalOutput(`🛡️  VULNERABILITY PATCHED: ${cveId} mitigated`);
        this.addTerminalOutput(`   🎯 Base Patch Reward: +${baseAmount} XP`);
        
        if (exploitBonus > 0) {
            this.addTerminalOutput(`   ⚡ Active Exploit Bonus: +${exploitBonus} XP`);
            this.addTerminalOutput(`   🔥 HIGH PRIORITY: Active exploitation prevented!`);
        }
        
        this.addTerminalOutput(`   📊 Total Reward: +${totalAmount} XP`);
        
        // Update session stats display
        this.updateXPDisplay();
    }

    showVulnerabilityPatchPenalty(amount, cveId) {
        // Show floating XP penalty animation
        this.showFloatingXP(-amount, 'penalty');
        
        // Show penalty notification
        const message = `Unnecessary patch: ${cveId} not actively exploited`;
        this.showXPNotification(-amount, 'penalty', message);
        
        // Add specialized terminal feedback with learning guidance
        this.addTerminalOutput(`🔧  EFFICIENCY WARNING: Unnecessary patching wastes resources`);
        this.addTerminalOutput(`   💸 Preventive Penalty: -${amount} XP lost`);
        this.addTerminalOutput(`   💡 TIP: Focus on actively exploited vulnerabilities first`);
        
        // Update session stats display
        this.updateXPDisplay();
    }

    showCredentialResetReward(baseAmount, compromiseBonus, username) {
        const totalAmount = baseAmount + compromiseBonus;
        
        // Show floating XP reward animation
        this.showFloatingXP(totalAmount, 'reward');
        
        // Show reward notification with username details
        const message = `Credentials reset: ${username}`;
        this.showXPNotification(totalAmount, 'reward', message);
        
        // Add specialized terminal feedback with tactical information
        this.addTerminalOutput(`🔐  CREDENTIALS RESET: ${username} account secured`);
        this.addTerminalOutput(`   🎯 Base Reset Reward: +${baseAmount} XP`);
        
        if (compromiseBonus > 0) {
            this.addTerminalOutput(`   ⚡ Active Compromise Bonus: +${compromiseBonus} XP`);
            this.addTerminalOutput(`   🔥 HIGH PRIORITY: Active compromise mitigated!`);
        }
        
        this.addTerminalOutput(`   📊 Total Reward: +${totalAmount} XP`);
        
        // Update session stats display
        this.updateXPDisplay();
    }

    showCredentialResetPenalty(amount, username) {
        // Show floating XP penalty animation
        this.showFloatingXP(-amount, 'penalty');
        
        // Show penalty notification
        const message = `Unnecessary reset: ${username} not compromised`;
        this.showXPNotification(-amount, 'penalty', message);
        
        // Add specialized terminal feedback with learning guidance
        this.addTerminalOutput(`🔒  SECURITY WARNING: Unnecessary credential resets disrupt users`);
        this.addTerminalOutput(`   💸 Disruption Penalty: -${amount} XP lost`);
        this.addTerminalOutput(`   💡 TIP: Check for active compromises before resetting credentials`);
        
        // Update session stats display
        this.updateXPDisplay();
    }

    // Update XP display to include isolation accuracy stats
    updateIsolationAccuracy() {
        const isolationStats = this.gameController.getIsolationStats();
        
        // Try to update isolation accuracy display if element exists
        const accuracyElement = document.getElementById('isolation-accuracy');
        if (accuracyElement && isolationStats.total > 0) {
            accuracyElement.textContent = `${isolationStats.accuracy}%`;
            
            // Update color based on accuracy
            accuracyElement.className = `font-bold ${
                isolationStats.accuracy >= 80 ? 'text-green-400' :
                isolationStats.accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`;
        }
        
        // Update isolation counts if elements exist
        const correctElement = document.getElementById('correct-isolations');
        const incorrectElement = document.getElementById('incorrect-isolations');
        
        if (correctElement) correctElement.textContent = isolationStats.correct;
        if (incorrectElement) incorrectElement.textContent = isolationStats.incorrect;
    }

    showCompletionBonus(bonus, breakdown) {
        // Show completion bonus modal or notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-800 border border-green-400 p-6 rounded-lg shadow-xl max-w-md';
        
        let breakdownHTML = '';
        if (breakdown) {
            breakdownHTML = Object.entries(breakdown)
                .map(([key, value]) => `<div class="flex justify-between"><span>${key}:</span><span>+${value} XP</span></div>`)
                .join('');
        }
        
        notification.innerHTML = `
            <div class="text-center">
                <div class="text-4xl mb-4">🎉</div>
                <h3 class="text-xl font-bold text-white mb-2">Simulation Complete!</h3>
                <div class="text-2xl font-bold text-green-400 mb-4">+${bonus} Bonus XP</div>
                ${breakdownHTML ? `
                    <div class="text-sm text-gray-300 space-y-1 mb-4">
                        ${breakdownHTML}
                    </div>
                ` : ''}
                <button class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onclick="this.parentElement.parentElement.remove()">
                    Continue
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 8 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 8000);
    }

    setCurrentUserXP(xp) {
        this.currentUserXP = xp;
        this.updateXPDisplay();
    }

    addTerminalOutput(text, type = 'normal') {
        const timestamp = new Date().toLocaleTimeString();
        
        // Check if text already starts with a prefix to avoid duplicates
        const hasPrefix = text.trim().startsWith('$') || text.trim().startsWith('✓') || 
                         text.trim().startsWith('✗') || text.trim().startsWith('ℹ') || 
                         text.trim().startsWith('⚠');
        
        const prefix = type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'info' ? 'ℹ' : type === 'warning' ? '⚠' : '$';
        const colorClass = type === 'success' ? 'text-green-400' : 
                          type === 'error' ? 'text-red-400' : 
                          type === 'info' ? 'text-blue-400' :
                          type === 'warning' ? 'text-yellow-400' :
                          'text-gray-300';
        
        // Only add prefix if text doesn't already have one
        const formattedText = hasPrefix ? `[${timestamp}] ${text}` : `[${timestamp}] ${prefix} ${text}`;
        
        this.terminalOutput.push({
            text: formattedText,
            class: colorClass
        });
        
        this.updateTerminal();
    }
    
    clearTerminal() {
        this.terminalOutput = [];
        const terminalElement = document.getElementById('terminal-output');
        if (terminalElement) {
            terminalElement.innerHTML = '';
            this.addTerminalOutput('Terminal cleared', 'info');
            this.addTerminalOutput('Type "help" to see available commands', 'info');
        }
    }
}

export { UIManager };
