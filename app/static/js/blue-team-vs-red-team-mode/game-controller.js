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
        setTimeout(async () => {
            await this.autoStartGame();
        }, 1000);
        
        console.log('🎮 Game Controller initialized');
    }
    
    setupEventListeners() {
        // Handle page unload to properly end session
        window.addEventListener('beforeunload', async (e) => {
            if (this.gameState.isRunning) {
                // Use fetch with keepalive for more reliable session termination
                try {
                    await fetch('/blue-vs-red/api/exit-game', {
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
                        }),
                        keepalive: true
                    });
                } catch (error) {
                    console.log('Failed to send exit signal during page unload');
                }
            }
        });

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
        document.getElementById('pause-simulation')?.addEventListener('click', async () => {
            if (this.gameState.isRunning) {
                this.pauseGame();
            } else {
                await this.startGame();
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
        document.getElementById('play-again')?.addEventListener('click', async () => {
            this.hideGameOverModal();
            await this.resetGame();
            setTimeout(async () => await this.autoStartGame(), 500);
        });
        
        document.getElementById('close-modal')?.addEventListener('click', () => {
            this.hideGameOverModal();
        });
    }
    
    async startGame() {
        if (this.gameState.isRunning) return;
        
        try {
            console.log('[BlueTeamVsRedTeam] Starting game with centralized session management');

            // First, call the Blue Team vs Red Team specific start-game endpoint
            // This initializes the Flask session properly
            const startGameResponse = await fetch('/blue-vs-red/api/start-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({})
            });

            if (!startGameResponse.ok) {
                throw new Error(`Failed to start game: ${startGameResponse.status}`);
            }

            const startGameResult = await startGameResponse.json();
            console.log('[BlueTeamVsRedTeam] Game started on backend:', startGameResult);

            if (startGameResult.success && startGameResult.gameState) {
                // Update local game state with backend data
                this.gameState = { ...this.gameState, ...startGameResult.gameState };
                
                // Store session ID
                if (this.gameState.session_id) {
                    localStorage.setItem('blue_red_session_id', this.gameState.session_id);
                    window.currentSessionId = this.gameState.session_id;
                }
            }

            // Also try centralized session management for compatibility
            try {
                const { GameProgressManager } = await import('/static/js/utils/game-progress-manager.js');
                const progressManager = new GameProgressManager();

                const sessionResult = await progressManager.startLevel({
                    levelId: 'blue-team-vs-red-team',
                    sessionName: 'blue-team-vs-red-team',
                    resetProgress: false
                });

                console.log('[BlueTeamVsRedTeam] Centralized session result:', sessionResult);
            } catch (progressError) {
                console.warn('[BlueTeamVsRedTeam] Centralized session management failed:', progressError);
                // Continue anyway since we have the main game session
            }
            
        } catch (error) {
            console.error('[BlueTeamVsRedTeam] Error starting game:', error);
            alert('Failed to start game. Please try again.');
            return;
        }
        
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
    
    async autoStartGame() {
        setTimeout(async () => {
            await this.startGame();
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
    
    async exitToMenu() {
        if (confirm('Are you sure you want to exit the simulation and return to the main menu?')) {
            await this.handleGameExit();
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
    
    async resetGame() {
        await this.handleGameReset();
        
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
            attackHistory: [],
            activeAttacks: new Map(), // Reset active attacks tracking
            assetIsolations: [], // Reset isolation history
            activeVulnerabilities: new Map(), // Reset vulnerability tracking
            patchHistory: [], // Reset patch history
            compromisedUsers: new Map(), // Reset user compromise tracking
            credentialResets: [] // Reset credential reset history
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
        
        // Track active attacks per asset for isolation XP calculation
        if (!this.gameState.activeAttacks) {
            this.gameState.activeAttacks = new Map();
        }
        const assetAttacks = this.gameState.activeAttacks.get(target) || [];
        assetAttacks.push({
            ...attackData,
            attackStartTime: new Date(),
            isActive: true
        });
        this.gameState.activeAttacks.set(target, assetAttacks);
        
        // Track active vulnerabilities being exploited for patch XP calculation
        const exploitedCVE = this.getCVEForAttack(attackData);
        if (exploitedCVE) {
            if (!this.gameState.activeVulnerabilities) {
                this.gameState.activeVulnerabilities = new Map();
            }
            const vulnExploits = this.gameState.activeVulnerabilities.get(exploitedCVE) || [];
            vulnExploits.push({
                ...attackData,
                cveId: exploitedCVE,
                exploitStartTime: new Date(),
                isActive: true
            });
            this.gameState.activeVulnerabilities.set(exploitedCVE, vulnExploits);
        }
        
        // Track user credential compromises for reset XP calculation
        const compromisedUser = this.getUserForAttack(attackData);
        if (compromisedUser) {
            if (!this.gameState.compromisedUsers) {
                this.gameState.compromisedUsers = new Map();
            }
            const userCompromises = this.gameState.compromisedUsers.get(compromisedUser) || [];
            userCompromises.push({
                ...attackData,
                username: compromisedUser,
                compromiseStartTime: new Date(),
                isActive: true
            });
            this.gameState.compromisedUsers.set(compromisedUser, userCompromises);
        }
        
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
            sourceIP: attackData.sourceIP,
            ipType: attackData.ipType,
            attackId: attackData.attackId,
            sessionId: attackData.sessionId,
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
        
        // Mark attacks as completed for XP tracking
        if (this.gameState.activeAttacks && this.gameState.activeAttacks.has(attackData.target)) {
            const assetAttacks = this.gameState.activeAttacks.get(attackData.target);
            assetAttacks.forEach(attack => {
                if (attack.attackId === attackData.attackId) {
                    attack.isActive = false;
                    attack.attackCompletedTime = new Date();
                }
            });
        }
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
        const trimmedCommand = command.trim();
        const args = trimmedCommand.split(' ');
        const baseCmd = args[0].toLowerCase(); // Only convert base command to lowercase
        
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
            case 'isolation-stats':
                this.showIsolationStatistics();
                break;
            case 'active-attacks':
                this.showActiveAttacksPerAsset();
                break;
            case 'tactical-guide':
                this.showTacticalGuidance();
                break;
            case 'patch-stats':
                this.showPatchStatistics();
                break;
            case 'active-vulnerabilities':
                this.showActiveVulnerabilities();
                break;
            case 'patch-guide':
                this.showPatchGuidance();
                break;
            case 'compromised-users':
                this.showCompromisedUsers();
                break;
            case 'reset-stats':
                this.showResetStatistics();
                break;
            case 'reset-guide':
                this.showResetGuidance();
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
        this.uiManager.addTerminalOutput('  isolation-stats           - Show asset isolation performance');
        this.uiManager.addTerminalOutput('  active-attacks            - Show current attacks per asset');
        this.uiManager.addTerminalOutput('  tactical-guide            - Show isolation strategy tips');
        this.uiManager.addTerminalOutput('  patch-stats               - Show vulnerability patch performance');
        this.uiManager.addTerminalOutput('  active-vulnerabilities   - Show current vulnerabilities being exploited');
        this.uiManager.addTerminalOutput('  patch-guide               - Show vulnerability patching strategy tips');
        this.uiManager.addTerminalOutput('  compromised-users         - Show current compromised user accounts');
        this.uiManager.addTerminalOutput('  reset-stats               - Show credential reset performance');
        this.uiManager.addTerminalOutput('  reset-guide               - Show credential reset strategy tips');
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
        this.uiManager.addTerminalOutput('   Analyzing network vulnerabilities...');
        this.uiManager.addTerminalOutput('   Checking for active exploits...');
        
        setTimeout(() => {
            // Get current vulnerability state
            const activeVulns = this.gameState.activeVulnerabilities || new Map();
            const totalVulnerabilities = Math.floor(Math.random() * 4) + 2; // 2-5 vulnerabilities
            
            this.uiManager.addTerminalOutput('');
            this.uiManager.addTerminalOutput(`✅ Scan complete. Found ${totalVulnerabilities} vulnerabilities.`);
            this.uiManager.addTerminalOutput('');
            this.uiManager.addTerminalOutput('=== VULNERABILITY REPORT ===');
            
            // Generate comprehensive CVE list with current exploitation status
            const allCVEs = [
                { cve: 'CVE-2024-0001', severity: 'HIGH', description: 'Phishing Vector Vulnerability', technique: 'Phishing' },
                { cve: 'CVE-2024-0002', severity: 'CRITICAL', description: 'Public Application Exploit', technique: 'Exploit Public-Facing Application' },
                { cve: 'CVE-2024-0003', severity: 'MEDIUM', description: 'Drive-by Download Weakness', technique: 'Drive-by Compromise' },
                { cve: 'CVE-2024-0004', severity: 'HIGH', description: 'Process Injection Flaw', technique: 'Process Injection' },
                { cve: 'CVE-2024-0005', severity: 'HIGH', description: 'Token Manipulation Bug', technique: 'Access Token Manipulation' },
                { cve: 'CVE-2024-0006', severity: 'CRITICAL', description: 'Privilege Escalation Exploit', technique: 'Exploitation for Privilege Escalation' },
                { cve: 'CVE-2024-0007', severity: 'MEDIUM', description: 'Registry Modification Vulnerability', technique: 'Registry Modification' },
                { cve: 'CVE-2024-0008', severity: 'HIGH', description: 'Scheduled Task Exploit', technique: 'Scheduled Task' },
                { cve: 'CVE-2024-0009', severity: 'HIGH', description: 'Service Creation Flaw', technique: 'Service Creation' },
                { cve: 'CVE-2024-0010', severity: 'CRITICAL', description: 'Remote Services Vulnerability', technique: 'Remote Services' }
            ];
            
            // Select random vulnerabilities for this scan
            const selectedVulns = allCVEs.slice(0, totalVulnerabilities);
            let activeExploitCount = 0;
            
            selectedVulns.forEach((vuln, index) => {
                const activeExploits = this.getActiveExploitsForCVE(vuln.cve);
                const isExploited = activeExploits.length > 0;
                
                if (isExploited) activeExploitCount++;
                
                const severityIcon = vuln.severity === 'CRITICAL' ? '🔴' : 
                                   vuln.severity === 'HIGH' ? '🟠' : '🟡';
                const exploitStatus = isExploited ? '🚨 ACTIVELY EXPLOITED' : '💤 Dormant';
                
                this.uiManager.addTerminalOutput(`${index + 1}. ${vuln.cve} [${severityIcon} ${vuln.severity}] - ${exploitStatus}`);
                this.uiManager.addTerminalOutput(`   └─ ${vuln.description}`);
                
                if (isExploited) {
                    this.uiManager.addTerminalOutput(`   └─ ⚡ ${activeExploits.length} active exploit(s) detected`);
                    this.uiManager.addTerminalOutput(`   └─ 💰 PATCH NOW: patch-vulnerability ${vuln.cve}`);
                } else {
                    this.uiManager.addTerminalOutput(`   └─ 💡 Monitor for activity before patching`);
                }
                this.uiManager.addTerminalOutput('');
            });
            
            // Summary and recommendations
            this.uiManager.addTerminalOutput('=== PATCH RECOMMENDATIONS ===');
            
            if (activeExploitCount > 0) {
                this.uiManager.addTerminalOutput(`🎯 HIGH PRIORITY: ${activeExploitCount} CVE(s) being actively exploited`);
                this.uiManager.addTerminalOutput('💰 Patch actively exploited CVEs for maximum XP rewards');
                this.uiManager.addTerminalOutput('⚠️  Avoid patching dormant vulnerabilities (XP penalty)');
            } else {
                this.uiManager.addTerminalOutput('✅ No active exploitation detected');
                this.uiManager.addTerminalOutput('💡 Monitor alerts for exploitation before patching');
                this.uiManager.addTerminalOutput('⚠️  Preventive patching will result in XP penalties');
            }
            
            this.uiManager.addTerminalOutput('');
            this.uiManager.addTerminalOutput('📊 COMMANDS:');
            this.uiManager.addTerminalOutput('  • active-vulnerabilities  - Monitor real-time exploitation');
            this.uiManager.addTerminalOutput('  • patch-guide             - Strategic patching guidance');
            this.uiManager.addTerminalOutput('  • patch-stats             - Track patch performance');
            
            // Improve security controls slightly from scan
            if (totalVulnerabilities > 0) {
                Object.keys(this.gameState.securityControls).forEach(control => {
                    this.gameState.securityControls[control].effectiveness = Math.min(100,
                        this.gameState.securityControls[control].effectiveness + 2
                    );
                });
                this.uiManager.addTerminalOutput('');
                this.uiManager.addTerminalOutput('🛡️ Security controls enhanced based on scan results.');
            }
            
            this.uiManager.updateDisplay();
        }, 2500);
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
        
        this.uiManager.addTerminalOutput(`🔒 Isolating asset: ${assetName}...`);
        
        // Check for active attacks against this asset
        const activeAttacks = this.getActiveAttacksForAsset(assetName);
        const hasActiveAttacks = activeAttacks.length > 0;
        
        // Calculate XP reward/penalty based on isolation correctness
        const isolationData = {
            assetName: assetName,
            timestamp: new Date(),
            wasCorrect: hasActiveAttacks,
            activeAttacksCount: activeAttacks.length,
            assetIntegrityBefore: asset.integrity,
            assetStatusBefore: asset.status
        };
        
        // Apply isolation effects
        if (hasActiveAttacks) {
            // Correct isolation - stronger defensive effects
            asset.integrity = Math.min(100, asset.integrity + 20);
            if (asset.status === 'vulnerable') {
                asset.status = 'secure';
            }
            
            // Mark active attacks as mitigated
            activeAttacks.forEach(attack => {
                attack.isActive = false;
                attack.mitigatedBy = 'asset-isolation';
                attack.mitigationTime = new Date();
            });
            
            // Award XP for correct isolation
            const baseXP = 15; // Base XP for correct isolation
            const bonusXP = activeAttacks.length * 5; // Bonus per attack stopped
            const totalXP = baseXP + bonusXP;
            
            this.gameState.sessionXP += totalXP;
            this.gameState.attacksMitigated += activeAttacks.length;
            
            this.uiManager.addTerminalOutput(`✅ Correct isolation! Stopped ${activeAttacks.length} active attack(s).`);
            this.uiManager.addTerminalOutput(`   Asset ${assetName} secured. Security significantly improved.`);
            this.uiManager.showAssetIsolationReward(totalXP, assetName, activeAttacks.length);
            
            // Send positive action to server
            this.sendPlayerAction('isolate-asset-correct', assetName, 1.0);
            
        } else {
            // Incorrect isolation - normal defensive effects but XP penalty
            asset.integrity = Math.min(100, asset.integrity + 5); // Smaller improvement
            if (asset.status === 'vulnerable') {
                asset.status = 'secure';
            }
            
            // XP penalty for unnecessary isolation
            const penaltyXP = 8; // Penalty for wrong isolation
            this.gameState.sessionXP = Math.max(0, this.gameState.sessionXP - penaltyXP);
            
            this.uiManager.addTerminalOutput(`⚠️  Unnecessary isolation. No active attacks against ${assetName}.`);
            this.uiManager.addTerminalOutput(`   Asset secured but resources wasted.`);
            this.uiManager.showAssetIsolationPenalty(penaltyXP, assetName);
            
            // Send negative action to server
            this.sendPlayerAction('isolate-asset-incorrect', assetName, 0.3);
        }
        
        // Store isolation data for analysis
        if (!this.gameState.assetIsolations) {
            this.gameState.assetIsolations = [];
        }
        this.gameState.assetIsolations.push(isolationData);
        
        this.uiManager.updateDisplay();
    }
    
    executePatchVulnerability(cveId) {
        if (!cveId) {
            this.uiManager.addTerminalOutput('❌ Error: CVE ID required. Usage: patch-vulnerability [cve-id]');
            this.uiManager.addTerminalOutput('   Common CVE IDs: CVE-2024-0001, CVE-2024-0002, CVE-2024-0003');
            return;
        }
        
        // Validate CVE format
        if (!this.isValidCVEId(cveId)) {
            this.uiManager.addTerminalOutput(`❌ Error: Invalid CVE format '${cveId}'. Use format: CVE-YYYY-NNNN`);
            return;
        }
        
        this.uiManager.addTerminalOutput(`🔧 Analyzing vulnerability: ${cveId}...`);
        
        // Check for active exploits of this vulnerability
        const activeExploits = this.getActiveExploitsForCVE(cveId);
        const hasActiveExploits = activeExploits.length > 0;
        
        // Calculate XP reward/penalty based on patch necessity
        const patchData = {
            cveId: cveId,
            timestamp: new Date(),
            wasNecessary: hasActiveExploits,
            activeExploitsCount: activeExploits.length,
            systemStateeBefore: this.getSecurityControlsSnapshot()
        };
        
        setTimeout(() => {
            if (hasActiveExploits) {
                // Correct patch - stronger security improvements
                Object.keys(this.gameState.securityControls).forEach(control => {
                    this.gameState.securityControls[control].effectiveness = Math.min(100,
                        this.gameState.securityControls[control].effectiveness + 8
                    );
                });
                
                // Mark exploits as patched
                activeExploits.forEach(exploit => {
                    exploit.isActive = false;
                    exploit.patchedBy = 'vulnerability-patch';
                    exploit.patchTime = new Date();
                });
                
                // Award XP for necessary patch
                const baseXP = 20; // Base XP for correct patch
                const bonusXP = activeExploits.length * 8; // Bonus per exploit stopped
                const totalXP = baseXP + bonusXP;
                
                this.gameState.sessionXP += totalXP;
                this.gameState.attacksMitigated += activeExploits.length;
                
                this.uiManager.addTerminalOutput(`✅ Critical patch applied! Stopped ${activeExploits.length} active exploit(s).`);
                this.uiManager.addTerminalOutput(`   Vulnerability ${cveId} secured. System significantly hardened.`);
                this.uiManager.showVulnerabilityPatchReward(totalXP, cveId, activeExploits.length);
                
                // Send positive action to server
                this.sendPlayerAction('patch-vulnerability-correct', cveId, 1.0);
                
            } else {
                // Unnecessary patch - minimal security improvement but XP penalty
                Object.keys(this.gameState.securityControls).forEach(control => {
                    this.gameState.securityControls[control].effectiveness = Math.min(100,
                        this.gameState.securityControls[control].effectiveness + 2
                    );
                });
                
                // XP penalty for unnecessary patch
                const penaltyXP = 10; // Penalty for patching non-exploited vulnerability
                this.gameState.sessionXP = Math.max(0, this.gameState.sessionXP - penaltyXP);
                
                this.uiManager.addTerminalOutput(`⚠️  Preventive patch applied. No active exploits of ${cveId} detected.`);
                this.uiManager.addTerminalOutput(`   System hardened but patch was not urgently needed.`);
                this.uiManager.showVulnerabilityPatchPenalty(penaltyXP, cveId);
                
                // Send negative action to server
                this.sendPlayerAction('patch-vulnerability-unnecessary', cveId, 0.4);
            }
            
            // Store patch data for analysis
            if (!this.gameState.patchHistory) {
                this.gameState.patchHistory = [];
            }
            this.gameState.patchHistory.push(patchData);
            
            this.uiManager.updateDisplay();
        }, 1500);
    }
    
    executeResetCredentials(username) {
        if (!username) {
            this.uiManager.addTerminalOutput('❌ Error: Username required. Usage: reset-credentials [username]');
            this.uiManager.addTerminalOutput('   Common usernames: admin, student1, professor, guest');
            return;
        }
        
        // Validate username format
        if (!this.isValidUsername(username)) {
            this.uiManager.addTerminalOutput(`❌ Error: Invalid username format '${username}'. Use alphanumeric characters only.`);
            return;
        }
        
        this.uiManager.addTerminalOutput(`🔄 Analyzing user account: ${username}...`);
        
        // Check for active compromises of this user
        const activeCompromises = this.getActiveCompromisesForUser(username);
        const hasActiveCompromises = activeCompromises.length > 0;
        
        // Calculate XP reward/penalty based on reset necessity
        const resetData = {
            username: username,
            timestamp: new Date(),
            wasNecessary: hasActiveCompromises,
            activeCompromisesCount: activeCompromises.length,
            systemStateBefore: this.getSecurityControlsSnapshot()
        };
        
        // Add to reset history for tracking
        if (!this.gameState.credentialResets) {
            this.gameState.credentialResets = [];
        }
        this.gameState.credentialResets.push(resetData);
        
        if (hasActiveCompromises) {
            // Calculate XP for necessary reset
            const baseXP = 25; // Base XP for resetting compromised credentials
            const compromiseBonus = activeCompromises.length * 10; // Bonus per active compromise
            const totalXP = baseXP + compromiseBonus;
            
            // Award XP directly to game state
            this.gameState.sessionXP += totalXP;
            this.gameState.attacksMitigated += activeCompromises.length;
            
            // Show reward through UI
            this.uiManager.showCredentialResetReward(baseXP, compromiseBonus, username);
            
            // Clear user compromises
            if (this.gameState.compromisedUsers) {
                const userCompromises = this.gameState.compromisedUsers.get(username) || [];
                userCompromises.forEach(compromise => compromise.isActive = false);
            }
            
            this.uiManager.addTerminalOutput(`🛡️ ${activeCompromises.length} active compromise(s) mitigated`);
            
            // Send positive action to server (if server tracking exists)
            if (typeof this.sendPlayerAction === 'function') {
                this.sendPlayerAction('reset-credentials-correct', username, 1.0);
            }
        } else {
            // Penalty for unnecessary reset
            const penaltyXP = 12; // Penalty XP for resetting clean credentials
            
            // Apply XP penalty directly to game state
            this.gameState.sessionXP = Math.max(0, this.gameState.sessionXP - penaltyXP);
            
            // Show penalty through UI  
            this.uiManager.showCredentialResetPenalty(penaltyXP, username);
            
            // Send negative action to server (if server tracking exists)
            if (typeof this.sendPlayerAction === 'function') {
                this.sendPlayerAction('reset-credentials-unnecessary', username, 0.3);
            }
        }
        
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
    
    // Helper method to get active attacks for a specific asset
    getActiveAttacksForAsset(assetName) {
        if (!this.gameState.activeAttacks) {
            return [];
        }
        
        const assetAttacks = this.gameState.activeAttacks.get(assetName) || [];
        
        // Filter for attacks that are still active and recent (within last 30 seconds)
        const now = new Date();
        const activeThreshold = 30000; // 30 seconds
        
        return assetAttacks.filter(attack => {
            return attack.isActive && 
                   (now - attack.attackStartTime) < activeThreshold;
        });
    }
    
    // Method to get isolation statistics for performance tracking
    getIsolationStats() {
        if (!this.gameState.assetIsolations) {
            return { correct: 0, incorrect: 0, total: 0, accuracy: 0 };
        }
        
        const correct = this.gameState.assetIsolations.filter(isolation => isolation.wasCorrect).length;
        const total = this.gameState.assetIsolations.length;
        const incorrect = total - correct;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        
        return { correct, incorrect, total, accuracy };
    }

    // CVE ID mapping to attack techniques for vulnerability tracking
    getCVEForAttack(attackData) {
        const cveMap = {
            // Initial Access CVEs
            'Phishing': 'CVE-2024-0001',
            'Exploit Public-Facing Application': 'CVE-2024-0002',
            'Drive-by Compromise': 'CVE-2024-0003',
            
            // Privilege Escalation CVEs
            'Process Injection': 'CVE-2024-0004',
            'Access Token Manipulation': 'CVE-2024-0005',
            'Exploitation for Privilege Escalation': 'CVE-2024-0006',
            
            // Persistence CVEs
            'Registry Modification': 'CVE-2024-0007',
            'Scheduled Task': 'CVE-2024-0008',
            'Service Creation': 'CVE-2024-0009',
            
            // Lateral Movement CVEs
            'Remote Services': 'CVE-2024-0010',
            'Internal Spearphishing': 'CVE-2024-0011',
            'Lateral Tool Transfer': 'CVE-2024-0012',
            
            // Impact CVEs
            'Data Destruction': 'CVE-2024-0013',
            'Defacement': 'CVE-2024-0014',
            'Denial of Service': 'CVE-2024-0015'
        };
        
        return cveMap[attackData.technique] || null;
    }

    // Validate CVE ID format
    isValidCVEId(cveId) {
        const cvePattern = /^CVE-\d{4}-\d{4,7}$/;
        return cvePattern.test(cveId);
    }

    // Get active exploits for a specific CVE
    getActiveExploitsForCVE(cveId) {
        if (!this.gameState.activeVulnerabilities) {
            return [];
        }
        
        const cveExploits = this.gameState.activeVulnerabilities.get(cveId) || [];
        
        // Filter for exploits that are still active and recent (within last 45 seconds)
        const now = new Date();
        const activeThreshold = 45000; // 45 seconds
        
        return cveExploits.filter(exploit => {
            return exploit.isActive && 
                   (now - exploit.exploitStartTime) < activeThreshold;
        });
    }

    // Get security controls snapshot for tracking
    getSecurityControlsSnapshot() {
        const snapshot = {};
        Object.entries(this.gameState.securityControls).forEach(([name, control]) => {
            snapshot[name] = {
                active: control.active,
                effectiveness: control.effectiveness
            };
        });
        return snapshot;
    }

    // Method to get patch statistics for performance tracking
    getPatchStats() {
        if (!this.gameState.patchHistory) {
            return { necessary: 0, unnecessary: 0, total: 0, accuracy: 0 };
        }
        
        const necessary = this.gameState.patchHistory.filter(patch => patch.wasNecessary).length;
        const total = this.gameState.patchHistory.length;
        const unnecessary = total - necessary;
        const accuracy = total > 0 ? Math.round((necessary / total) * 100) : 0;
        
        return { necessary, unnecessary, total, accuracy };
    }

    // Username mapping to attack techniques for credential compromise tracking
    getUserForAttack(attackData) {
        const userMap = {
            // Credential Access attacks
            'Phishing': 'student1',
            'Credential Dumping': 'admin',
            'Brute Force': 'guest',
            
            // Initial Access with credential compromise
            'Drive-by Compromise': 'professor',
            'Exploit Public-Facing Application': 'webadmin',
            
            // Privilege Escalation with user compromise
            'Access Token Manipulation': 'admin',
            'Process Injection': 'system',
            
            // Persistence attacks affecting user accounts
            'Account Manipulation': 'student2',
            'Registry Modification': 'localuser',
            
            // Lateral Movement with credential theft
            'Remote Services': 'networkadmin',
            'Internal Spearphishing': 'faculty'
        };
        
        return userMap[attackData.technique] || null;
    }

    // Validate username format
    isValidUsername(username) {
        const usernamePattern = /^[a-zA-Z0-9_-]{3,20}$/;
        return usernamePattern.test(username);
    }

    // Get active compromises for a specific user
    getActiveCompromisesForUser(username) {
        if (!this.gameState.compromisedUsers) {
            return [];
        }
        
        const userCompromises = this.gameState.compromisedUsers.get(username) || [];
        
        // Filter for compromises that are still active and recent (within last 60 seconds)
        const now = new Date();
        const activeThreshold = 60000; // 60 seconds
        
        return userCompromises.filter(compromise => {
            return compromise.isActive && 
                   (now - compromise.compromiseStartTime) < activeThreshold;
        });
    }

    // Method to get credential reset statistics for performance tracking
    getResetStats() {
        if (!this.gameState.credentialResets) {
            return { necessary: 0, unnecessary: 0, total: 0, accuracy: 0 };
        }
        
        const necessary = this.gameState.credentialResets.filter(reset => reset.wasNecessary).length;
        const total = this.gameState.credentialResets.length;
        const unnecessary = total - necessary;
        const accuracy = total > 0 ? Math.round((necessary / total) * 100) : 0;
        
        return { necessary, unnecessary, total, accuracy };
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
            const response = await fetch('/blue-vs-red/api/xp-status', {
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
            const response = await fetch('/blue-vs-red/api/player-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('meta[name=csrf-token]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    action: action,
                    target: target,
                    effectiveness: effectiveness,
                    successful: true  // Mark defensive actions as successful
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
            const response = await fetch('/blue-vs-red/api/ai-action', {
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
            console.log('[BlueTeamVsRedTeam] Handling game completion with centralized system');

            // Import centralized utilities
            const { GameProgressManager } = await import('/static/js/utils/game-progress-manager.js');
            const progressManager = new GameProgressManager();

            // Calculate performance score based on game metrics
            const performanceScore = this.calculateGamePerformanceScore();
            const sessionId = this.gameState.session_id || localStorage.getItem('blue_red_session_id');

            if (sessionId) {
                // First, attach to the existing session that was started externally
                const startTime = parseInt(localStorage.getItem('blue_red_session_start_time') || Date.now());
                progressManager.attachToExistingSession(
                    sessionId,
                    'blue-team-vs-red-team', // Level ID
                    'Blue Team vs Red Team Mode', // Level name
                    'intermediate', // Difficulty
                    startTime
                );

                // Now complete the level using centralized system
                const sessionResult = await progressManager.completeLevel(performanceScore, {
                    timeRemaining: this.gameState.timeRemaining,
                    assetsIntegrity: this.calculateAverageAssetIntegrity(),
                    attacksMitigated: this.gameState.attacksMitigated,
                    attacksSuccessful: this.gameState.attacksSuccessful,
                    sessionXP: this.gameState.sessionXP,
                    totalActions: this.gameState.attacksMitigated + this.gameState.attacksSuccessful,
                    defenseEfficiency: this.gameState.attacksMitigated > 0 ? 
                        (this.gameState.attacksMitigated / (this.gameState.attacksMitigated + this.gameState.attacksSuccessful)) * 100 : 0,
                    completionTime: 900 - this.gameState.timeRemaining,
                    assetDetails: this.gameState.assets,
                    customEndpoint: '/blue-vs-red/api/stop-game'
                });

                if (sessionResult.success) {
                    console.log('[BlueTeamVsRedTeam] Game completed with centralized system:', sessionResult);
                    
                    // Show completion bonus if awarded
                    if (sessionResult.completionBonus && sessionResult.completionBonus > 0) {
                        this.uiManager.showCompletionBonus(sessionResult.completionBonus, sessionResult.bonusBreakdown);
                        this.gameState.sessionXP += sessionResult.completionBonus;
                    }

                    // Show total XP earned
                    if (sessionResult.xp_awarded) {
                        this.uiManager.showXPReward(sessionResult.xp_awarded, 'Session Completion');
                    }
                    
                    // Clear session data
                    localStorage.removeItem('blue_red_session_id');
                    window.currentSessionId = null;
                    
                    return sessionResult;
                } else {
                    console.error('[BlueTeamVsRedTeam] Centralized completion failed:', sessionResult.error);
                }
            } else {
                console.warn('[BlueTeamVsRedTeam] No session ID for completion');
            }
        } catch (error) {
            console.error('[BlueTeamVsRedTeam] Error handling completion with centralized system:', error);
        }
    }

    calculateGamePerformanceScore() {
        // Calculate performance score based on multiple factors
        const timeBonus = this.gameState.timeRemaining / 900 * 25; // Up to 25 points for time
        const assetBonus = this.calculateAverageAssetIntegrity() / 100 * 30; // Up to 30 points for asset protection
        const defenseBonus = this.gameState.attacksMitigated > 0 ? 
            (this.gameState.attacksMitigated / (this.gameState.attacksMitigated + this.gameState.attacksSuccessful)) * 25 : 0; // Up to 25 points for defense
        const xpBonus = Math.min(20, this.gameState.sessionXP / 50); // Up to 20 points for XP earned
        
        return Math.round(timeBonus + assetBonus + defenseBonus + xpBonus);
    }

    calculateAverageAssetIntegrity() {
        const assets = Object.values(this.gameState.assets);
        const totalIntegrity = assets.reduce((sum, asset) => sum + asset.integrity, 0);
        return assets.length > 0 ? totalIntegrity / assets.length : 0;
    }

    async handleGameExit() {
        try {
            console.log('[BlueTeamVsRedTeam] Handling game exit with centralized system');

            // Import centralized utilities
            const { GameProgressManager } = await import('/static/js/utils/game-progress-manager.js');
            const progressManager = new GameProgressManager();

            const sessionId = this.gameState.session_id || localStorage.getItem('blue_red_session_id');
            
            if (sessionId) {
                // First, attach to the existing session that was started externally
                const startTime = parseInt(localStorage.getItem('blue_red_session_start_time') || Date.now());
                progressManager.attachToExistingSession(
                    sessionId,
                    'blue-team-vs-red-team', // Level ID
                    'Blue Team vs Red Team Mode', // Level name
                    'intermediate', // Difficulty
                    startTime
                );

                // End session using centralized system (early exit)
                const sessionResult = await progressManager.completeLevel(this.calculateGamePerformanceScore(), {
                    timeRemaining: this.gameState.timeRemaining,
                    assetsIntegrity: this.calculateAverageAssetIntegrity(),
                    attacksMitigated: this.gameState.attacksMitigated,
                    attacksSuccessful: this.gameState.attacksSuccessful,
                    sessionXP: this.gameState.sessionXP,
                    earlyExit: true,
                    completionTime: 900 - this.gameState.timeRemaining,
                    customEndpoint: '/blue-vs-red/api/exit-game'
                });

                if (sessionResult.success) {
                    console.log('[BlueTeamVsRedTeam] Game exit handled with centralized system:', sessionResult);
                    
                    // Clear session data
                    localStorage.removeItem('blue_red_session_id');
                    window.currentSessionId = null;
                    
                    return sessionResult;
                } else {
                    console.error('[BlueTeamVsRedTeam] Centralized exit failed:', sessionResult.error);
                }
            } else {
                console.warn('[BlueTeamVsRedTeam] No session ID for exit ');
            }
        } catch (error) {
            console.error('[BlueTeamVsRedTeam] Error handling exit with centralized system:', error);
        }
    }

    async handleGameReset() {
        try {
            const response = await fetch('/blue-vs-red/api/reset-game', {
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
                console.log('Game session reset:', data);
                return data;
            }
        } catch (error) {
            console.error('Failed to handle game reset:', error);
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

    showIsolationStatistics() {
        const stats = this.getIsolationStats();
        
        this.uiManager.addTerminalOutput('=== ASSET ISOLATION PERFORMANCE ===');
        this.uiManager.addTerminalOutput(`Total Isolations: ${stats.total}`);
        this.uiManager.addTerminalOutput(`Correct Isolations: ${stats.correct} ✅`);
        this.uiManager.addTerminalOutput(`Incorrect Isolations: ${stats.incorrect} ❌`);
        this.uiManager.addTerminalOutput(`Accuracy Rate: ${stats.accuracy}%`);
        
        if (stats.total > 0) {
            const xpEarned = stats.correct * 15; // Average XP per correct isolation
            const xpLost = stats.incorrect * 8;  // Average XP per incorrect isolation
            const netXP = xpEarned - xpLost;
            
            this.uiManager.addTerminalOutput('');
            this.uiManager.addTerminalOutput('XP IMPACT:');
            this.uiManager.addTerminalOutput(`XP Earned: +${xpEarned}`);
            this.uiManager.addTerminalOutput(`XP Lost: -${xpLost}`);
            this.uiManager.addTerminalOutput(`Net XP: ${netXP >= 0 ? '+' : ''}${netXP}`);
            
            // Provide performance feedback
            this.uiManager.addTerminalOutput('');
            if (stats.accuracy >= 80) {
                this.uiManager.addTerminalOutput('🏆 EXCELLENT: Elite tactical awareness!');
            } else if (stats.accuracy >= 60) {
                this.uiManager.addTerminalOutput('👍 GOOD: Solid defensive instincts');
            } else if (stats.accuracy >= 40) {
                this.uiManager.addTerminalOutput('⚠️  FAIR: Room for improvement');
            } else {
                this.uiManager.addTerminalOutput('📚 LEARNING: Focus on attack indicators');
            }
        }
    }

    showActiveAttacksPerAsset() {
        this.uiManager.addTerminalOutput('=== ACTIVE ATTACK MONITORING ===');
        
        const assetNames = Object.keys(this.gameState.assets);
        let hasActiveAttacks = false;
        
        assetNames.forEach(assetName => {
            const activeAttacks = this.getActiveAttacksForAsset(assetName);
            const status = activeAttacks.length > 0 ? '🚨 UNDER ATTACK' : '🛡️  SECURE';
            
            this.uiManager.addTerminalOutput(`${assetName.toUpperCase()}: ${status}`);
            
            if (activeAttacks.length > 0) {
                hasActiveAttacks = true;
                activeAttacks.forEach((attack, index) => {
                    const timeElapsed = Math.round((Date.now() - attack.attackStartTime) / 1000);
                    this.uiManager.addTerminalOutput(`  └─ ${attack.technique} (${timeElapsed}s ago)`);
                });
                this.uiManager.addTerminalOutput(`  💡 RECOMMENDATION: Consider isolating ${assetName}`);
            }
        });
        
        if (!hasActiveAttacks) {
            this.uiManager.addTerminalOutput('');
            this.uiManager.addTerminalOutput('✅ All assets secure - No immediate threats detected');
            this.uiManager.addTerminalOutput('💡 TIP: Avoid unnecessary isolations to maintain XP efficiency');
        }
    }

    showTacticalGuidance() {
        this.uiManager.addTerminalOutput('=== ASSET ISOLATION TACTICAL GUIDE ===');
        this.uiManager.addTerminalOutput('');
        this.uiManager.addTerminalOutput('🎯 WHEN TO ISOLATE:');
        this.uiManager.addTerminalOutput('  • Active attacks detected against specific asset');
        this.uiManager.addTerminalOutput('  • Asset integrity below 70% and under threat');
        this.uiManager.addTerminalOutput('  • Multiple attack techniques targeting same asset');
        this.uiManager.addTerminalOutput('  • High-value assets (student-db, research-files)');
        this.uiManager.addTerminalOutput('');
        this.uiManager.addTerminalOutput('⚠️  WHEN NOT TO ISOLATE:');
        this.uiManager.addTerminalOutput('  • No active alerts for the target asset');
        this.uiManager.addTerminalOutput('  • Asset already at 100% integrity and secure');
        this.uiManager.addTerminalOutput('  • Recent attacks were against different assets');
        this.uiManager.addTerminalOutput('');
        this.uiManager.addTerminalOutput('💰 XP OPTIMIZATION:');
        this.uiManager.addTerminalOutput('  • Correct isolation: +15 XP base + 5 XP per attack stopped');
        this.uiManager.addTerminalOutput('  • Incorrect isolation: -8 XP penalty');
        this.uiManager.addTerminalOutput('  • Monitor "active-attacks" command for guidance');
        this.uiManager.addTerminalOutput('');
        this.uiManager.addTerminalOutput('📊 PRO TIPS:');
        this.uiManager.addTerminalOutput('  • Use "alerts" to see current threats');
        this.uiManager.addTerminalOutput('  • Check "isolation-stats" to track performance');
        this.uiManager.addTerminalOutput('  • Timing matters - isolate during active attacks');
    }

    showPatchStatistics() {
        const stats = this.getPatchStats();
        
        this.uiManager.addTerminalOutput('=== VULNERABILITY PATCH PERFORMANCE ===');
        this.uiManager.addTerminalOutput(`Total Patches Applied: ${stats.total}`);
        this.uiManager.addTerminalOutput(`Necessary Patches: ${stats.necessary} ✅`);
        this.uiManager.addTerminalOutput(`Unnecessary Patches: ${stats.unnecessary} ❌`);
        this.uiManager.addTerminalOutput(`Efficiency Rate: ${stats.accuracy}%`);
        
        if (stats.total > 0) {
            const xpEarned = stats.necessary * 20; // Average XP per necessary patch
            const xpLost = stats.unnecessary * 10;  // Average XP per unnecessary patch
            const netXP = xpEarned - xpLost;
            
            this.uiManager.addTerminalOutput('');
            this.uiManager.addTerminalOutput('XP IMPACT:');
            this.uiManager.addTerminalOutput(`XP Earned: +${xpEarned}`);
            this.uiManager.addTerminalOutput(`XP Lost: -${xpLost}`);
            this.uiManager.addTerminalOutput(`Net XP: ${netXP >= 0 ? '+' : ''}${netXP}`);
            
            // Provide performance feedback
            this.uiManager.addTerminalOutput('');
            if (stats.accuracy >= 85) {
                this.uiManager.addTerminalOutput('🏆 EXCELLENT: Master patch management!');
            } else if (stats.accuracy >= 70) {
                this.uiManager.addTerminalOutput('👍 GOOD: Strong vulnerability response');
            } else if (stats.accuracy >= 50) {
                this.uiManager.addTerminalOutput('⚠️  FAIR: Focus on active exploits');
            } else {
                this.uiManager.addTerminalOutput('📚 LEARNING: Prioritize actively exploited CVEs');
            }
        }
    }

    showActiveVulnerabilities() {
        this.uiManager.addTerminalOutput('=== ACTIVE VULNERABILITY MONITORING ===');
        
        if (!this.gameState.activeVulnerabilities || this.gameState.activeVulnerabilities.size === 0) {
            this.uiManager.addTerminalOutput('✅ No active vulnerability exploits detected');
            this.uiManager.addTerminalOutput('💡 TIP: Avoid unnecessary patching to maintain XP efficiency');
            return;
        }
        
        let hasActiveExploits = false;
        
        this.gameState.activeVulnerabilities.forEach((exploits, cveId) => {
            const activeExploits = this.getActiveExploitsForCVE(cveId);
            
            if (activeExploits.length > 0) {
                hasActiveExploits = true;
                const status = '🚨 ACTIVELY EXPLOITED';
                this.uiManager.addTerminalOutput(`${cveId}: ${status}`);
                
                activeExploits.forEach((exploit, index) => {
                    const timeElapsed = Math.round((Date.now() - exploit.exploitStartTime) / 1000);
                    this.uiManager.addTerminalOutput(`  └─ ${exploit.technique} (${timeElapsed}s ago)`);
                });
                this.uiManager.addTerminalOutput(`  💡 RECOMMENDATION: Patch ${cveId} for maximum XP`);
            }
        });
        
        if (!hasActiveExploits) {
            this.uiManager.addTerminalOutput('✅ No current active exploits - All vulnerabilities dormant');
            this.uiManager.addTerminalOutput('💡 TIP: Wait for active exploitation before patching for XP rewards');
        }
    }

    showPatchGuidance() {
        this.uiManager.addTerminalOutput('=== VULNERABILITY PATCHING TACTICAL GUIDE ===');
        this.uiManager.addTerminalOutput('');
        this.uiManager.addTerminalOutput('🎯 WHEN TO PATCH:');
        this.uiManager.addTerminalOutput('  • CVE is being actively exploited by attackers');
        this.uiManager.addTerminalOutput('  • Multiple exploit attempts using same vulnerability');
        this.uiManager.addTerminalOutput('  • High-impact attack techniques detected');
        this.uiManager.addTerminalOutput('  • Critical infrastructure vulnerabilities under attack');
        this.uiManager.addTerminalOutput('');
        this.uiManager.addTerminalOutput('⚠️  WHEN NOT TO PATCH:');
        this.uiManager.addTerminalOutput('  • No active exploitation detected for the CVE');
        this.uiManager.addTerminalOutput('  • Preventive patching without immediate threat');
        this.uiManager.addTerminalOutput('  • CVE already patched recently');
        this.uiManager.addTerminalOutput('');
        this.uiManager.addTerminalOutput('💰 XP OPTIMIZATION:');
        this.uiManager.addTerminalOutput('  • Necessary patch: +20 XP base + 8 XP per exploit blocked');
        this.uiManager.addTerminalOutput('  • Unnecessary patch: -10 XP penalty');
        this.uiManager.addTerminalOutput('  • Monitor "active-vulnerabilities" for guidance');
        this.uiManager.addTerminalOutput('');
        this.uiManager.addTerminalOutput('📊 PRO TIPS:');
        this.uiManager.addTerminalOutput('  • Use "alerts" to identify attack techniques and their CVEs');
        this.uiManager.addTerminalOutput('  • Check "patch-stats" to track efficiency');
        this.uiManager.addTerminalOutput('  • Timing is key - patch during active exploitation');
        this.uiManager.addTerminalOutput('  • Focus on CVEs being exploited, not preventive patching');
    }

    showCompromisedUsers() {
        this.uiManager.addTerminalOutput('=== COMPROMISED USER ACCOUNT MONITORING ===');
        
        if (!this.gameState.compromisedUsers || this.gameState.compromisedUsers.size === 0) {
            this.uiManager.addTerminalOutput('✅ No compromised user accounts detected');
            this.uiManager.addTerminalOutput('💡 TIP: Avoid unnecessary credential resets to maintain XP efficiency');
            return;
        }
        
        let hasActiveCompromises = false;
        
        this.gameState.compromisedUsers.forEach((compromises, username) => {
            const activeCompromises = this.getActiveCompromisesForUser(username);
            
            if (activeCompromises.length > 0) {
                hasActiveCompromises = true;
                const status = '🚨 COMPROMISED';
                this.uiManager.addTerminalOutput(`${username}: ${status}`);
                
                activeCompromises.forEach((compromise, index) => {
                    const timeElapsed = Math.round((Date.now() - compromise.compromiseStartTime) / 1000);
                    this.uiManager.addTerminalOutput(`  └─ ${compromise.technique} (${timeElapsed}s ago)`);
                });
                this.uiManager.addTerminalOutput(`  💡 RECOMMENDATION: reset-credentials ${username}`);
            }
        });
        
        if (!hasActiveCompromises) {
            this.uiManager.addTerminalOutput('✅ No current active compromises - All accounts secure');
            this.uiManager.addTerminalOutput('💡 TIP: Wait for active compromises before resetting credentials for XP rewards');
        }
    }

    showResetStatistics() {
        const stats = this.getResetStats();
        
        this.uiManager.addTerminalOutput('=== CREDENTIAL RESET PERFORMANCE ===');
        this.uiManager.addTerminalOutput(`Total Resets Executed: ${stats.total}`);
        this.uiManager.addTerminalOutput(`Necessary Resets: ${stats.necessary} ✅`);
        this.uiManager.addTerminalOutput(`Unnecessary Resets: ${stats.unnecessary} ❌`);
        this.uiManager.addTerminalOutput(`Efficiency Rate: ${stats.accuracy}%`);
        
        if (stats.total > 0) {
            const xpEarned = stats.necessary * 25; // Average XP per necessary reset
            const xpLost = stats.unnecessary * 12;  // Average XP per unnecessary reset
            const netXP = xpEarned - xpLost;
            
            this.uiManager.addTerminalOutput('');
            this.uiManager.addTerminalOutput('XP IMPACT:');
            this.uiManager.addTerminalOutput(`XP Earned: +${xpEarned}`);
            this.uiManager.addTerminalOutput(`XP Lost: -${xpLost}`);
            this.uiManager.addTerminalOutput(`Net XP: ${netXP >= 0 ? '+' : ''}${netXP}`);
            
            // Provide performance feedback
            this.uiManager.addTerminalOutput('');
            if (stats.accuracy >= 90) {
                this.uiManager.addTerminalOutput('🏆 EXCELLENT: Elite security operations!');
            } else if (stats.accuracy >= 75) {
                this.uiManager.addTerminalOutput('👍 GOOD: Strong credential management');
            } else if (stats.accuracy >= 60) {
                this.uiManager.addTerminalOutput('⚠️  FAIR: Focus on compromised accounts only');
            } else {
                this.uiManager.addTerminalOutput('📚 LEARNING: Monitor active compromises before resetting');
            }
        }
    }

    showResetGuidance() {
        this.uiManager.addTerminalOutput('=== CREDENTIAL RESET TACTICAL GUIDE ===');
        this.uiManager.addTerminalOutput('');
        this.uiManager.addTerminalOutput('🎯 WHEN TO RESET CREDENTIALS:');
        this.uiManager.addTerminalOutput('  • User account is actively compromised by attackers');
        this.uiManager.addTerminalOutput('  • Multiple attack techniques targeting same user');
        this.uiManager.addTerminalOutput('  • Credential theft or manipulation detected');
        this.uiManager.addTerminalOutput('  • High-privilege accounts under attack');
        this.uiManager.addTerminalOutput('');
        this.uiManager.addTerminalOutput('⚠️  WHEN NOT TO RESET:');
        this.uiManager.addTerminalOutput('  • No active compromise detected for the user');
        this.uiManager.addTerminalOutput('  • Preventive resets without immediate threat');
        this.uiManager.addTerminalOutput('  • Credentials already reset recently');
        this.uiManager.addTerminalOutput('  • User account shows no suspicious activity');
        this.uiManager.addTerminalOutput('');
        this.uiManager.addTerminalOutput('💰 XP OPTIMIZATION:');
        this.uiManager.addTerminalOutput('  • Necessary reset: +25 XP base + 10 XP per active compromise');
        this.uiManager.addTerminalOutput('  • Unnecessary reset: -12 XP penalty');
        this.uiManager.addTerminalOutput('  • Monitor "compromised-users" for guidance');
        this.uiManager.addTerminalOutput('');
        this.uiManager.addTerminalOutput('📊 PRO TIPS:');
        this.uiManager.addTerminalOutput('  • Use "alerts" to identify credential-based attacks');
        this.uiManager.addTerminalOutput('  • Check "reset-stats" to track efficiency');
        this.uiManager.addTerminalOutput('  • Timing is key - reset during active compromises');
        this.uiManager.addTerminalOutput('  • Focus on compromised accounts, not preventive resets');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameController = new GameController();
});

export { GameController };
