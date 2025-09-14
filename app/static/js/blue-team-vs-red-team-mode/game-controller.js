// Game Controller - Main orchestrator for the Blue Team vs Red Team simulation
class GameController {
    constructor() {
        this.gameState = {
            isRunning: false,
            timeRemaining: 900, // 15 minutes in seconds
            assets: {
                'academy-server': { status: 'secure', integrity: 100 },
                'student-db': { status: 'secure', integrity: 100 },
                'research-files': { status: 'secure', integrity: 100 },
                'learning-platform': { status: 'secure', integrity: 100 }
            },
            alerts: [],
            incidents: [],
            securityControls: {
                firewall: { active: true, effectiveness: 80 },
                endpoint: { active: true, effectiveness: 75 },
                access: { active: true, effectiveness: 85 }
            },
            // XP tracking
            sessionXP: 0,
            attacksMitigated: 0,
            attacksSuccessful: 0,
            currentXP: 0,
            // IP tracking
            blockedIPs: [],
            attackHistory: []
        };
        
        this.aiEngine = null;
        this.uiManager = null;
        this.gameTimer = null;
        
        this.init();
    }
    
    async init() {
        // Import and initialize AI engine and UI manager
        const { AIEngine } = await import('./ai-engine.js');
        const { UIManager } = await import('./ui-manager.js');
        
        this.aiEngine = new AIEngine(this);
        this.uiManager = new UIManager(this);
        
        this.setupEventListeners();
        this.uiManager.updateDisplay();
        
        // Initialize terminal with welcome message
        this.uiManager.addTerminalOutput('$ Defense Command Terminal - Ready');
        this.uiManager.addTerminalOutput('$ Monitoring Project Sentinel Academy...');
        this.uiManager.addTerminalOutput('$ Type "help" for available commands');
        
        // Initialize XP tracking
        await this.initializeXPTracking();
        
        // Auto-start the simulation after a brief delay
        setTimeout(() => {
            this.autoStartGame();
        }, 1000);
        
        console.log('🎮 Game Controller initialized');
    }
    
    setupEventListeners() {
        // Game control menu
        const menuButton = document.getElementById('game-menu-button');
        const menuDropdown = document.getElementById('game-menu-dropdown');
        
        if (menuButton && menuDropdown) {
            menuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                menuDropdown.classList.toggle('hidden');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                menuDropdown.classList.add('hidden');
            });
            
            // Prevent dropdown from closing when clicking inside
            menuDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        // Game control buttons
        document.getElementById('pause-simulation')?.addEventListener('click', () => {
            if (this.gameState.isRunning) {
                this.pauseGame();
            } else {
                this.startGame();
            }
        });
        document.getElementById('stop-simulation')?.addEventListener('click', () => this.stopGame());
        document.getElementById('reset-simulation')?.addEventListener('click', () => this.resetGame());
        document.getElementById('exit-simulation')?.addEventListener('click', () => this.exitToMenu());
        
        // Terminal input
        document.getElementById('terminal-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = e.target.value.trim();
                if (command) {
                    this.handleTerminalCommand(command);
                    e.target.value = '';
                }
            }
        });
        
        // Modal controls
        document.getElementById('play-again')?.addEventListener('click', () => {
            this.hideGameOverModal();
            this.resetGame();
            setTimeout(() => this.autoStartGame(), 500);
        });
        
        document.getElementById('close-modal')?.addEventListener('click', () => {
            this.hideGameOverModal();
        });
    }
    
    startGame() {
        if (this.gameState.isRunning) return;
        
        this.gameState.isRunning = true;
        this.uiManager.updateGameControls();
        
        // Start the game timer
        this.gameTimer = setInterval(() => {
            this.updateTimer();
        }, 1000);
        
        // Start AI engine
        this.aiEngine.startAttackSequence();
        
        console.log('🎮 Game started');
    }
    
    autoStartGame() {
        setTimeout(() => {
            this.startGame();
        }, 1500);
    }
    
    pauseGame() {
        if (!this.gameState.isRunning) return;
        
        this.gameState.isRunning = false;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        this.aiEngine.stopAttackSequence();
        this.uiManager.updateGameControls();
        
        console.log('🎮 Game paused');
    }
    
    exitToMenu() {
        if (confirm('Are you sure you want to exit the simulation and return to the main menu?')) {
            this.stopGame();
            window.location.href = '/blue-vs-red/';
        }
    }
    
    stopGame() {
        // Allow stopping even when paused
        this.gameState.isRunning = false;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        this.aiEngine.stopAttackSequence();
        this.uiManager.updateGameControls();
        
        // Handle XP completion bonus if game was actually running
        this.handleGameCompletion();
        
        console.log('🎮 Game stopped');
    }
    
    resetGame() {
        this.stopGame();
        
        // Reset game state
        this.gameState = {
            isRunning: false,
            timeRemaining: 900,
            assets: {
                'academy-server': { status: 'secure', integrity: 100 },
                'student-db': { status: 'secure', integrity: 100 },
                'research-files': { status: 'secure', integrity: 100 },
                'learning-platform': { status: 'secure', integrity: 100 }
            },
            alerts: [],
            incidents: [],
            securityControls: {
                firewall: { active: true, effectiveness: 80 },
                endpoint: { active: true, effectiveness: 75 },
                access: { active: true, effectiveness: 85 }
            },
            // Reset XP tracking for new session
            sessionXP: 0,
            attacksMitigated: 0,
            attacksSuccessful: 0,
            currentXP: this.gameState.currentXP, // Keep total XP, reset session
            // IP tracking
            blockedIPs: [],
            attackHistory: []
        };
        
        // Reset AI
        this.aiEngine.reset();
        
        // Update UI
        this.uiManager.updateDisplay();
        this.uiManager.clearTerminal();
        this.uiManager.addTerminalOutput('$ Defense Command Terminal - Ready');
        this.uiManager.addTerminalOutput('$ Type "help" for available commands');
        
        console.log('🎮 Game reset');
    }
    
    updateTimer() {
        if (this.gameState.timeRemaining <= 0) {
            this.endGame('victory', 'Time expired! You successfully defended Project Sentinel Academy!');
            return;
        }
        
        this.gameState.timeRemaining--;
        this.uiManager.updateTimer();
    }
    
    // Handle AI attack attempts
    processAttack(attackData) {
        const { type, target, technique, severity, sourceIP } = attackData;
        
        // Store attack in history
        if (!this.gameState.attackHistory) {
            this.gameState.attackHistory = [];
        }
        this.gameState.attackHistory.push({
            ...attackData,
            detectionTime: new Date(),
            blocked: false
        });
        
        // Check if source IP is blocked
        if (this.gameState.blockedIPs && this.gameState.blockedIPs.includes(sourceIP)) {
            this.handleBlockedIPAttack(attackData);
            return; // Attack blocked, don't process further
        }
        
        // Calculate detection probability based on security controls
        const detectionChance = this.calculateDetectionChance(type, technique);
        const detected = Math.random() < detectionChance;
        
        if (detected) {
            this.handleDetectedAttack(attackData);
        } else {
            this.handleUndetectedAttack(attackData);
            // Send to server for XP penalties if attack succeeds
            this.handleAIAction(attackData);
        }
        
        // AI learns from the outcome
        this.aiEngine.updateQTable(attackData, detected);
    }

    handleBlockedIPAttack(attackData) {
        // Attack was blocked by IP blacklist
        this.uiManager.addTerminalOutput(`🛡️  BLOCKED: Attack from ${attackData.sourceIP} (${attackData.technique})`);
        this.uiManager.addTerminalOutput(`   Target: ${attackData.target} | Severity: ${attackData.severity.toUpperCase()}`);
        
        // Mark attack as blocked in history
        const lastAttack = this.gameState.attackHistory[this.gameState.attackHistory.length - 1];
        if (lastAttack) {
            lastAttack.blocked = true;
        }
        
        // Small XP reward for successful blocking
        this.gameState.sessionXP += 2;
        this.gameState.attacksMitigated += 1;
        this.uiManager.showXPReward(2, `Blocked attack from ${attackData.sourceIP}`);
        
        console.log(`🛡️ Attack blocked from IP: ${attackData.sourceIP}`);
    }
    
    calculateDetectionChance(attackType, technique) {
        let baseChance = 0.6; // 60% base detection rate
        
        // Adjust based on security controls
        Object.values(this.gameState.securityControls).forEach(control => {
            if (control.active) {
                baseChance += (control.effectiveness / 100) * 0.1;
            }
        });
        
        // Adjust based on attack type
        const typeModifiers = {
            'reconnaissance': -0.2,
            'initial-access': -0.1,
            'persistence': 0.1,
            'privilege-escalation': 0.0,
            'defense-evasion': -0.3,
            'credential-access': 0.1,
            'discovery': -0.1,
            'lateral-movement': 0.2,
            'collection': 0.3,
            'exfiltration': 0.4,
            'impact': 0.5
        };
        
        baseChance += typeModifiers[attackType] || 0;
        
        return Math.max(0.1, Math.min(0.9, baseChance));
    }
    
    handleDetectedAttack(attackData) {
        const alert = {
            id: Date.now(),
            timestamp: new Date(),
            type: attackData.type,
            target: attackData.target,
            technique: attackData.technique,
            severity: attackData.severity,
            status: 'detected'
        };
        
        this.gameState.alerts.push(alert);
        this.uiManager.addAlert(alert);
        
        // Player has a chance to respond
        this.offerPlayerResponse(alert);
    }
    
    handleUndetectedAttack(attackData) {
        // Attack proceeds undetected
        const success = this.calculateAttackSuccess(attackData);
        
        if (success) {
            this.executeSuccessfulAttack(attackData);
        }
    }
    
    calculateAttackSuccess(attackData) {
        // Base success rate depends on attack type and current defenses
        let successRate = 0.4;
        
        // Adjust based on asset current integrity
        const asset = this.gameState.assets[attackData.target];
        if (asset) {
            successRate += (100 - asset.integrity) / 200; // Damaged assets are easier to attack
        }
        
        return Math.random() < successRate;
    }
    
    executeSuccessfulAttack(attackData) {
        const asset = this.gameState.assets[attackData.target];
        if (!asset) return;
        
        // Damage the asset
        const damage = Math.random() * 30 + 10; // 10-40% damage
        asset.integrity = Math.max(0, asset.integrity - damage);
        
        if (asset.integrity === 0) {
            asset.status = 'compromised';
            this.endGame('defeat', `Critical asset ${attackData.target} has been compromised!`);
            return;
        } else if (asset.integrity < 50) {
            asset.status = 'vulnerable';
        }
        
        // Create incident
        const incident = {
            id: Date.now(),
            timestamp: new Date(),
            type: 'successful-attack',
            target: attackData.target,
            technique: attackData.technique,
            damage: damage
        };
        
        this.gameState.incidents.push(incident);
        this.uiManager.addIncident(incident);
        this.uiManager.updateAssetStatus();
        
    }
    
    offerPlayerResponse(alert) {
        // Present player response options instead of auto-responding.
        // The UI will render clickable action buttons and a brief terminal hint.
        const responses = [
            'block-ip',
            'isolate-asset',
            'increase-monitoring',
            'patch-vulnerability',
            'reset-credentials'
        ];
    }
    
    executePlayerResponse(alert, response) {
        let effectiveness = Math.random() * 0.5 + 0.3; // 30-80% effectiveness
        
        const responseMap = {
            'block-ip': 'IP address blocked',
            'isolate-asset': 'Asset isolated from network',
            'increase-monitoring': 'Monitoring increased',
            'patch-vulnerability': 'Vulnerability patched',
            'reset-credentials': 'Credentials reset'
        };
        
        // Send player action to server for XP tracking
        this.sendPlayerAction(response, alert.target, effectiveness);
        
        // Update security controls effectiveness
        Object.keys(this.gameState.securityControls).forEach(control => {
            this.gameState.securityControls[control].effectiveness = Math.min(100, 
                this.gameState.securityControls[control].effectiveness + effectiveness * 5
            );
        });
        
        // Mark alert as responded
        alert.status = 'responded';
        this.uiManager.updateAlerts();
    }
    
    handleTerminalCommand(command) {
        const cmd = command.toLowerCase().trim();
        const args = cmd.split(' ');
        const baseCmd = args[0];
        
        this.uiManager.addTerminalOutput(`$ ${command}`);
        
        switch (baseCmd) {
            case 'status':
                this.showSystemStatus();
                break;
            case 'assets':
                this.showAssetStatus();
                break;
            case 'alerts':
                this.showActiveAlerts();
                break;
            case 'help':
                this.showHelp();
                break;
            case 'scan':
                this.runSecurityScan();
                break;
            case 'block-ip':
                this.executeBlockIP(args[1]);
                break;
            case 'isolate-asset':
                this.executeIsolateAsset(args[1]);
                break;
            case 'patch-vulnerability':
                this.executePatchVulnerability(args[1]);
                break;
            case 'reset-credentials':
                this.executeResetCredentials(args[1]);
                break;
            case 'increase-monitoring':
                this.executeIncreaseMonitoring();
                break;
            case 'show-ips':
            case 'list-ips':
                this.showIPInformation();
                break;
            case 'show-attacks':
            case 'attack-history':
                this.showAttackHistory();
                break;
            case 'ai-info':
                this.showAIInformation();
                break;
            case 'clear':
                this.uiManager.clearTerminal();
                this.uiManager.addTerminalOutput('$ Defense Command Terminal - Ready');
                break;
            default:
                this.uiManager.addTerminalOutput(`Command not found: ${baseCmd}. Type 'help' for available commands.`);
        }
    }
    
    showSystemStatus() {
        this.uiManager.addTerminalOutput('=== SYSTEM STATUS ===');
        this.uiManager.addTerminalOutput(`Network: ${this.gameState.isRunning ? 'ACTIVE' : 'STANDBY'}`);
        this.uiManager.addTerminalOutput(`Time Remaining: ${this.formatTime(this.gameState.timeRemaining)}`);
        this.uiManager.addTerminalOutput(`Active Alerts: ${this.gameState.alerts.filter(a => a.status === 'detected').length}`);
        this.uiManager.addTerminalOutput(`Security Controls: ${Object.values(this.gameState.securityControls).filter(c => c.active).length}/3 active`);
    }
    
    showAssetStatus() {
        this.uiManager.addTerminalOutput('=== ASSET STATUS ===');
        Object.entries(this.gameState.assets).forEach(([name, asset]) => {
            this.uiManager.addTerminalOutput(`${name}: ${asset.status.toUpperCase()} (${asset.integrity}% integrity)`);
        });
    }
    
    showActiveAlerts() {
        const activeAlerts = this.gameState.alerts.filter(a => a.status === 'detected');
        this.uiManager.addTerminalOutput(`=== ACTIVE ALERTS (${activeAlerts.length}) ===`);
        activeAlerts.slice(-5).forEach(alert => {
            this.uiManager.addTerminalOutput(`${alert.timestamp.toLocaleTimeString()} - ${alert.technique} on ${alert.target}`);
        });
    }
    
    showHelp() {
        this.uiManager.addTerminalOutput('=== DEFENSE COMMAND TERMINAL ===');
        this.uiManager.addTerminalOutput('INFORMATION COMMANDS:');
        this.uiManager.addTerminalOutput('  status                    - Show system status');
        this.uiManager.addTerminalOutput('  assets                    - Show asset integrity');
        this.uiManager.addTerminalOutput('  alerts                    - Show active alerts');
        this.uiManager.addTerminalOutput('  scan                      - Run security scan');
        this.uiManager.addTerminalOutput('  show-ips                  - Show IP information and blocked list');
        this.uiManager.addTerminalOutput('  show-attacks              - Show recent attack history');
        this.uiManager.addTerminalOutput('  ai-info                   - Show AI attacker information');
        this.uiManager.addTerminalOutput('');
        this.uiManager.addTerminalOutput('DEFENSIVE ACTIONS:');
        this.uiManager.addTerminalOutput('  block-ip [address]        - Block suspicious IP address');
        this.uiManager.addTerminalOutput('  isolate-asset [name]      - Isolate asset from network');
        this.uiManager.addTerminalOutput('  patch-vulnerability [cve] - Apply security patch');
        this.uiManager.addTerminalOutput('  reset-credentials [user]  - Reset user credentials');
        this.uiManager.addTerminalOutput('  increase-monitoring       - Enhance monitoring systems');
        this.uiManager.addTerminalOutput('');
        this.uiManager.addTerminalOutput('UTILITY COMMANDS:');
        this.uiManager.addTerminalOutput('  clear                     - Clear terminal screen');
        this.uiManager.addTerminalOutput('  help                      - Show this help');
        this.uiManager.addTerminalOutput('');
        this.uiManager.addTerminalOutput('💡 Tip: Click "Block IP" button in alerts for quick IP blocking');
    }
    
    runSecurityScan() {
        this.uiManager.addTerminalOutput('🔍 Running comprehensive security scan...');
        setTimeout(() => {
            const vulnerabilities = Math.floor(Math.random() * 3);
            this.uiManager.addTerminalOutput(`✅ Scan complete. Found ${vulnerabilities} potential vulnerabilities.`);
            
            if (vulnerabilities > 0) {
                // Improve security controls slightly
                Object.keys(this.gameState.securityControls).forEach(control => {
                    this.gameState.securityControls[control].effectiveness = Math.min(100,
                        this.gameState.securityControls[control].effectiveness + 2
                    );
                });
                this.uiManager.addTerminalOutput('🛡️ Security controls enhanced based on scan results.');
            }
            this.uiManager.updateDisplay();
        }, 2000);
    }
    
    executeBlockIP(ipAddress) {
        if (!ipAddress) {
            this.uiManager.addTerminalOutput('❌ Error: IP address required. Usage: block-ip [address]');
            this.uiManager.addTerminalOutput('   Example: block-ip 192.168.1.100');
            return;
        }
        
        // Validate IP address format
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(ipAddress)) {
            this.uiManager.addTerminalOutput(`❌ Error: Invalid IP address format: ${ipAddress}`);
            return;
        }
        
        this.uiManager.addTerminalOutput(`🚫 Blocking IP address: ${ipAddress}`);
        
        // Add to blocked IPs list in game state
        if (!this.gameState.blockedIPs) {
            this.gameState.blockedIPs = [];
        }
        
        if (!this.gameState.blockedIPs.includes(ipAddress)) {
            this.gameState.blockedIPs.push(ipAddress);
            
            // Notify AI engine about blocked IP
            const ipChanged = this.aiEngine.handleIPBlock(ipAddress);
            
            if (ipChanged) {
                this.uiManager.addTerminalOutput(`⚠️  Detected IP change: Attacker switched to new address`);
                this.uiManager.addTerminalOutput(`🔍 Monitoring new attack patterns...`);
            }
            
            // Enhance firewall effectiveness
            if (this.gameState.securityControls.firewall) {
                this.gameState.securityControls.firewall.effectiveness = Math.min(100,
                    this.gameState.securityControls.firewall.effectiveness + 5
                );
            }
            
            // Send player action for XP tracking
            this.sendPlayerAction('block-ip', ipAddress, 0.8);
            
            this.uiManager.addTerminalOutput(`✅ IP address blocked. Firewall rules updated. (${this.gameState.blockedIPs.length} IPs blocked)`);
        } else {
            this.uiManager.addTerminalOutput(`ℹ️  IP address ${ipAddress} is already blocked.`);
        }
        
        this.uiManager.updateDisplay();
    }
    
    executeIsolateAsset(assetName) {
        if (!assetName) {
            this.uiManager.addTerminalOutput('❌ Error: Asset name required. Usage: isolate-asset [name]');
            this.uiManager.addTerminalOutput('   Available assets: academy-server, student-db, research-files, learning-platform');
            return;
        }
        
        const asset = this.gameState.assets[assetName];
        if (!asset) {
            this.uiManager.addTerminalOutput(`❌ Error: Asset '${assetName}' not found.`);
            return;
        }
        
        this.uiManager.addTerminalOutput(`🔒 Isolating asset: ${assetName}`);
        
        // Temporarily improve asset security
        asset.integrity = Math.min(100, asset.integrity + 10);
        if (asset.status === 'vulnerable') {
            asset.status = 'secure';
        }
        
        this.uiManager.addTerminalOutput(`✅ Asset ${assetName} isolated from network. Security improved.`);
        this.uiManager.updateDisplay();
    }
    
    executePatchVulnerability(cveId) {
        if (!cveId) {
            this.uiManager.addTerminalOutput('❌ Error: CVE ID required. Usage: patch-vulnerability [cve-id]');
            return;
        }
        
        this.uiManager.addTerminalOutput(`🔧 Applying security patch for: ${cveId}`);
        
        setTimeout(() => {
            // Improve all security controls
            Object.keys(this.gameState.securityControls).forEach(control => {
                this.gameState.securityControls[control].effectiveness = Math.min(100,
                    this.gameState.securityControls[control].effectiveness + 3
                );
            });
            
            this.uiManager.addTerminalOutput(`✅ Security patch applied successfully. System hardened.`);
            this.uiManager.updateDisplay();
        }, 1500);
    }
    
    executeResetCredentials(username) {
        if (!username) {
            this.uiManager.addTerminalOutput('❌ Error: Username required. Usage: reset-credentials [username]');
            return;
        }
        
        this.uiManager.addTerminalOutput(`🔄 Resetting credentials for user: ${username}`);
        
        // Enhance access control effectiveness
        if (this.gameState.securityControls.access) {
            this.gameState.securityControls.access.effectiveness = Math.min(100,
                this.gameState.securityControls.access.effectiveness + 7
            );
        }
        
        this.uiManager.addTerminalOutput('✅ User credentials reset. Access controls strengthened.');
        this.uiManager.updateDisplay();
    }
    
    executeIncreaseMonitoring() {
        this.uiManager.addTerminalOutput('📈 Increasing monitoring sensitivity...');
        
        setTimeout(() => {
            // Enhance endpoint protection
            if (this.gameState.securityControls.endpoint) {
                this.gameState.securityControls.endpoint.effectiveness = Math.min(100,
                    this.gameState.securityControls.endpoint.effectiveness + 8
                );
            }
            
            this.uiManager.addTerminalOutput('✅ Monitoring systems enhanced. Better threat detection enabled.');
            this.uiManager.updateDisplay();
        }, 1000);
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    endGame(result, message) {
        this.stopGame();
        this.showGameOverModal(result, message);
    }
    
    showGameOverModal(result, message) {
        const modal = document.getElementById('game-over-modal');
        const icon = document.getElementById('game-result-icon');
        const title = document.getElementById('game-result-title');
        const messageEl = document.getElementById('game-result-message');
        
        if (result === 'victory') {
            icon.innerHTML = '🏆';
            title.textContent = 'Victory!';
            title.className = 'text-2xl font-bold mb-4 text-green-600';
        } else {
            icon.innerHTML = '💥';
            title.textContent = 'Defeat!';
            title.className = 'text-2xl font-bold mb-4 text-red-600';
        }
        
        messageEl.textContent = message;
        modal.classList.remove('hidden');
    }
    
    hideGameOverModal() {
        document.getElementById('game-over-modal').classList.add('hidden');
    }
    
    // Getters for other modules
    getGameState() {
        return this.gameState;
    }
    
    isGameRunning() {
        return this.gameState.isRunning;
    }
    
    // Interactive network methods
    selectNetworkNode(assetName) {
        if (!this.gameState.assets[assetName]) {
            console.log(`Asset ${assetName} not found`);
            return;
        }
        
        const asset = this.gameState.assets[assetName];
        // Show asset details or management options
        console.log(`Selected network node: ${assetName}`, asset);
    }
    
    toggleSecurityControl(controlName) {
        if (!this.gameState.securityControls[controlName]) {
            console.log(`Security control ${controlName} not found`);
            return;
        }
        
        const control = this.gameState.securityControls[controlName];
        control.active = !control.active;
        
        // Update UI to reflect control status
        this.uiManager.updateSecurityControls();
        console.log(`Toggled security control: ${controlName}`, control);
    }
    
    executeResponse(action) {
        if (!this.gameState.isRunning) {
            return;
        }
        
        const responses = {
            'block-ip': 'Blocked suspicious IP addresses',
            'isolate-asset': 'Isolated affected systems from network',
            'increase-monitoring': 'Increased security monitoring levels',
            'patch-vulnerability': 'Applied security patches to vulnerabilities',
            'reset-credentials': 'Reset user credentials for affected accounts'
        };
        
        console.log(`Executed response: ${action}`);
    }

    // XP Tracking Methods
    async initializeXPTracking() {
        try {
            // Fetch current user XP from server
            const response = await fetch('/api/xp-status', {
                method: 'GET',
                headers: {
                    'X-CSRFToken': document.querySelector('meta[name=csrf-token]')?.getAttribute('content') || ''
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.gameState.currentXP = data.currentXP || 0;
                this.uiManager.setCurrentUserXP(data.currentXP || 0);
                console.log('🎯 XP tracking initialized');
            }
        } catch (error) {
            console.error('Failed to initialize XP tracking:', error);
        }
    }

    async sendPlayerAction(action, target = null, effectiveness = 1.0) {
        try {
            const response = await fetch('/api/player-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('meta[name=csrf-token]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    action: action,
                    target: target,
                    effectiveness: effectiveness
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                // Update game state with XP data
                if (data.xpAwarded && data.xpAwarded > 0) {
                    this.gameState.sessionXP += data.xpAwarded;
                    this.gameState.attacksMitigated += 1;
                    this.uiManager.showXPReward(data.xpAwarded, data.reason || action);
                }
                
                return data;
            }
        } catch (error) {
            console.error('Failed to send player action:', error);
        }
        return null;
    }

    async handleAIAction(attackData) {
        try {
            const response = await fetch('/api/ai-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('meta[name=csrf-token]')?.getAttribute('content') || ''
                },
                body: JSON.stringify(attackData)
            });

            if (response.ok) {
                const data = await response.json();
                
                // Handle XP penalties
                if (data.xpPenalty && data.xpPenalty > 0) {
                    this.gameState.sessionXP = Math.max(0, this.gameState.sessionXP - data.xpPenalty);
                    this.gameState.attacksSuccessful += 1;
                    this.uiManager.showXPPenalty(data.xpPenalty, data.reason || 'Attack succeeded');
                }
                
                // Update asset integrity
                if (data.assetUpdates) {
                    Object.entries(data.assetUpdates).forEach(([assetName, updates]) => {
                        if (this.gameState.assets[assetName]) {
                            this.gameState.assets[assetName].integrity = updates.integrity;
                            this.gameState.assets[assetName].status = updates.status;
                        }
                    });
                }
                
                return data;
            }
        } catch (error) {
            console.error('Failed to handle AI action:', error);
        }
        return null;
    }

    async handleGameCompletion() {
        try {
            const response = await fetch('/api/stop-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('meta[name=csrf-token]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    timeRemaining: this.gameState.timeRemaining,
                    assets: this.gameState.assets,
                    sessionXP: this.gameState.sessionXP,
                    attacksMitigated: this.gameState.attacksMitigated,
                    attacksSuccessful: this.gameState.attacksSuccessful
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                // Show completion bonus
                if (data.completionBonus && data.completionBonus > 0) {
                    this.uiManager.showCompletionBonus(data.completionBonus, data.bonusBreakdown);
                    this.gameState.sessionXP += data.completionBonus;
                }
                
                return data;
            }
        } catch (error) {
            console.error('Failed to handle game completion:', error);
        }
        return null;
    }

    showIPInformation() {
        this.uiManager.addTerminalOutput('=== IP ADDRESS INFORMATION ===');
        
        // Get AI IP info
        const aiIPInfo = this.aiEngine.getCurrentIPInfo();
        this.uiManager.addTerminalOutput(`Current Attacker IP: ${aiIPInfo.currentIP}`);
        
        // Show blocked IPs
        if (this.gameState.blockedIPs && this.gameState.blockedIPs.length > 0) {
            this.uiManager.addTerminalOutput(`Blocked IPs (${this.gameState.blockedIPs.length}):`);
            this.gameState.blockedIPs.forEach((ip, index) => {
                this.uiManager.addTerminalOutput(`  ${index + 1}. ${ip}`);
            });
        } else {
            this.uiManager.addTerminalOutput('No IPs currently blocked');
        }
        
        // Show IP change history
        if (aiIPInfo.ipChangeCount > 0) {
            this.uiManager.addTerminalOutput(`Attacker IP changes: ${aiIPInfo.ipChangeCount}`);
            if (aiIPInfo.lastIPChange) {
                const change = aiIPInfo.lastIPChange;
                this.uiManager.addTerminalOutput(`Last change: ${change.oldIP} → ${change.newIP} (${change.reason})`);
            }
        }
    }

    showAttackHistory() {
        this.uiManager.addTerminalOutput('=== RECENT ATTACK HISTORY ===');
        
        if (!this.gameState.attackHistory || this.gameState.attackHistory.length === 0) {
            this.uiManager.addTerminalOutput('No attacks recorded yet');
            return;
        }
        
        // Show last 10 attacks
        const recentAttacks = this.gameState.attackHistory.slice(-10);
        recentAttacks.forEach((attack, index) => {
            const status = attack.blocked ? 'BLOCKED' : 'DETECTED';
            const timestamp = attack.detectionTime.toLocaleTimeString();
            this.uiManager.addTerminalOutput(
                `${timestamp} | ${attack.sourceIP} | ${attack.technique} → ${attack.target} | ${status}`
            );
        });
        
        this.uiManager.addTerminalOutput(`Total attacks: ${this.gameState.attackHistory.length}`);
        this.uiManager.addTerminalOutput(`Blocked: ${this.gameState.attackHistory.filter(a => a.blocked).length}`);
    }

    showAIInformation() {
        this.uiManager.addTerminalOutput('=== AI ATTACKER INFORMATION ===');
        
        const aiIPInfo = this.aiEngine.getCurrentIPInfo();
        const difficulty = this.aiEngine.getDifficulty();
        const tactics = this.aiEngine.getCurrentTactics();
        
        this.uiManager.addTerminalOutput(`Difficulty Level: ${difficulty.level} (${difficulty.value}%)`);
        this.uiManager.addTerminalOutput(`Current Tactics: ${tactics}`);
        this.uiManager.addTerminalOutput(`Active IP: ${aiIPInfo.currentIP}`);
        this.uiManager.addTerminalOutput(`IP Changes: ${aiIPInfo.ipChangeCount}`);
        this.uiManager.addTerminalOutput(`Known Blocked IPs: ${aiIPInfo.blockedIPs.length}`);
        
        // Attack statistics
        if (this.gameState.attackHistory) {
            const totalAttacks = this.gameState.attackHistory.length;
            const blockedAttacks = this.gameState.attackHistory.filter(a => a.blocked).length;
            const blockRate = totalAttacks > 0 ? Math.round((blockedAttacks / totalAttacks) * 100) : 0;
            
            this.uiManager.addTerminalOutput(`Attack Success Rate: ${100 - blockRate}%`);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameController = new GameController();
});

export { GameController };
