// AI Engine - Implements Q-Learning for Red Team attacks with NLP-based pattern selection
import { NLPAttackAnalyzer } from './nlp-attack-analyzer.js';

class AIEngine {
    constructor(gameController) {
        this.gameController = gameController;
        this.isAttacking = false;
        this.attackInterval = null;
        
        // Initialize NLP analyzer for context-aware attack selection
        this.nlpAnalyzer = new NLPAttackAnalyzer();
        
        // Q-Learning parameters
        this.learningRate = 0.1;
        this.discountFactor = 0.9;
        this.explorationRate = 0.3;
        this.explorationDecay = 0.995;
        this.minExplorationRate = 0.05;
        
        // Q-Table: state-action values (enhanced with NLP features)
        this.qTable = new Map();
        
        // Track completed phases for prerequisite checking
        this.completedPhases = [];
        
        // Attack types based on MITRE ATT&CK
        this.attackTypes = [
            'reconnaissance',
            'initial-access',
            'persistence',
            'privilege-escalation',
            'defense-evasion',
            'credential-access',
            'discovery',
            'lateral-movement',
            'collection',
            'exfiltration',
            'impact'
        ];
        
        // Attack techniques (including security control disruption)
        this.techniques = {
            'reconnaissance': ['Network Scanning', 'Port Scanning', 'Service Discovery'],
            'initial-access': ['Phishing', 'Exploit Public-Facing Application', 'Drive-by Compromise'],
            'persistence': ['Registry Modification', 'Scheduled Task', 'Service Creation'],
            'privilege-escalation': ['Process Injection', 'Access Token Manipulation', 'Exploitation for Privilege Escalation'],
            'defense-evasion': ['File Deletion', 'Process Hollowing', 'Masquerading', 'Disable Firewall', 'Disable Endpoint Protection', 'Disable Access Control'],
            'credential-access': ['Credential Dumping', 'Brute Force', 'Keylogging'],
            'discovery': ['System Information Discovery', 'Account Discovery', 'Network Service Scanning'],
            'lateral-movement': ['Remote Services', 'Internal Spearphishing', 'Lateral Tool Transfer'],
            'collection': ['Data from Local System', 'Screen Capture', 'Audio Capture'],
            'exfiltration': ['Data Encrypted for Impact', 'Exfiltration Over C2 Channel', 'Automated Exfiltration'],
            'impact': ['Data Destruction', 'Defacement', 'Denial of Service']
        };
        
        // Target assets
        this.targets = ['academy-server', 'student-db', 'research-files', 'learning-platform'];
        
        // IP Address Management - Initialize pools first
        this.blockedIPs = new Set();
        this.ipChangeHistory = [];
        this.ipPools = {
            'malicious': [
                '192.168.100.45', '10.0.50.23', '172.16.75.12', '203.45.67.89',
                '192.168.200.15', '10.0.25.67', '172.16.33.44', '198.51.100.23',
                '192.168.150.88', '10.0.75.34', '172.16.60.91', '203.0.113.56'
            ],
            'proxies': [
                '192.168.250.10', '10.0.100.78', '172.16.90.23', '198.51.100.67',
                '192.168.175.33', '10.0.60.45', '172.16.110.88', '203.0.113.99'
            ],
            'compromised': [
                '192.168.50.77', '10.0.80.12', '172.16.40.56', '198.51.100.34',
                '192.168.120.91', '10.0.90.23', '172.16.70.45', '203.0.113.12'
            ]
        };
        
        // Initialize current IP address after pools are defined
        this.currentIPAddress = this.generateRandomIP();
        
        // Attack progression - tracks current attack phase
        this.currentPhase = 0;
        this.attackPhases = [
            'reconnaissance',
            'initial-access',
            'persistence',
            'privilege-escalation',
            'discovery',
            'lateral-movement',
            'collection',
            'exfiltration',
            'impact'
        ];
        
        console.log('🤖 AI Engine initialized with Q-Learning');
    }
    
    startAttackSequence() {
        if (this.isAttacking) return;
        
        this.isAttacking = true;
        this.currentPhase = 0;
        
        // Start with reconnaissance
        this.scheduleNextAttack(2000); // Start after 2 seconds
        
        console.log('🤖 AI attack sequence started');
    }
    
    stopAttackSequence() {
        this.isAttacking = false;
        
        if (this.attackInterval) {
            clearTimeout(this.attackInterval);
            this.attackInterval = null;
        }
        
        console.log('🤖 AI attack sequence stopped');
    }
    
    scheduleNextAttack(delay = null) {
        if (!this.isAttacking) return;
        
        // Adaptive delay based on previous attack success
        const baseDelay = 3000; // 3 seconds
        const randomDelay = Math.random() * 2000 + 1000; // 1-3 seconds
        const attackDelay = delay || (baseDelay + randomDelay);
        
        this.attackInterval = setTimeout(() => {
            this.executeAttack();
            this.scheduleNextAttack();
        }, attackDelay);
    }
    
    executeAttack() {
        if (!this.gameController.isGameRunning()) return;
        
        // Get current game state for Q-Learning
        const state = this.getCurrentState();
        
        // Use NLP analyzer to get contextual recommendations
        const nlpAnalysis = this.nlpAnalyzer.analyzeGameState(
            this.gameController.getGameState(),
            this.attackPhases[this.currentPhase],
            this.completedPhases
        );
        
        console.log(`🧠 NLP Analysis: ${nlpAnalysis.stateDescription}`);
        console.log(`🎯 Recommended attack vector: ${nlpAnalysis.attackVector}`);
        console.log(`📊 Success probability: ${(nlpAnalysis.successProbability * 100).toFixed(1)}%`);
        
        // Select action using enhanced epsilon-greedy strategy with NLP guidance
        const action = this.selectAction(state, nlpAnalysis);
        
        // Execute the attack with NLP-enhanced data
        const attackData = this.createAttackData(action, nlpAnalysis);
        
        console.log(`🤖 AI executing: ${attackData.technique} (${attackData.mitreId}) on ${attackData.target}`);
        
        // Send attack to game controller
        this.gameController.processAttack(attackData);
        
        // Store state-action pair and NLP analysis for learning
        this.lastState = state;
        this.lastAction = action;
        this.lastNLPAnalysis = nlpAnalysis;
        
        // Progress through attack phases
        this.updateAttackPhase();
    }
    
    getCurrentState() {
        const gameState = this.gameController.getGameState();
        
        // Get NLP-enhanced state features
        const nlpAnalysis = this.nlpAnalyzer.analyzeGameState(
            gameState,
            this.attackPhases[this.currentPhase],
            this.completedPhases
        );
        
        // Create enhanced state representation with NLP features
        const state = {
            phase: this.currentPhase,
            timeRemaining: Math.floor(gameState.timeRemaining / 60), // Minutes
            assetIntegrity: this.getAverageAssetIntegrity(gameState.assets),
            alertLevel: Math.min(5, gameState.alerts.length),
            securityControlsActive: this.getActiveSecurityControls(gameState.securityControls),
            // NLP-derived features
            defensiveStrength: Math.floor(nlpAnalysis.defensiveStrength / 20), // 0-5 scale
            vulnerabilityCount: Math.min(5, nlpAnalysis.vulnerabilities.length),
            attackVectorType: this.vectorToInt(nlpAnalysis.attackVector)
        };
        
        return this.stateToString(state);
    }
    
    vectorToInt(vectorType) {
        const vectorMap = {
            'multi-vector-exploit': 0,
            'credential-based-attack': 1,
            'stealth-infiltration': 2,
            'advanced-persistent-threat': 3,
            'opportunistic-attack': 4
        };
        return vectorMap[vectorType] || 4;
    }
    
    getAverageAssetIntegrity(assets) {
        const integrities = Object.values(assets).map(asset => asset.integrity);
        const average = integrities.reduce((sum, integrity) => sum + integrity, 0) / integrities.length;
        return Math.floor(average / 20); // 0-5 scale
    }
    
    getActiveSecurityControls(controls) {
        return Object.values(controls).filter(control => control.active).length;
    }
    
    stateToString(state) {
        return `${state.phase}-${state.timeRemaining}-${state.assetIntegrity}-${state.alertLevel}-${state.securityControlsActive}-${state.defensiveStrength}-${state.vulnerabilityCount}-${state.attackVectorType}`;
    }
    
    selectAction(state, nlpAnalysis = null) {
        // Enhanced epsilon-greedy action selection with NLP guidance
        
        // If we have NLP recommendations and they have high confidence, use them more often
        const nlpGuidanceThreshold = 0.7;
        const useNLPGuidance = nlpAnalysis && 
                               nlpAnalysis.successProbability > nlpGuidanceThreshold &&
                               Math.random() < 0.5; // 50% chance to use NLP guidance when confident
        
        if (useNLPGuidance) {
            // Use NLP-recommended technique (guided exploration)
            return this.getActionFromNLPRecommendation(nlpAnalysis);
        } else if (Math.random() < this.explorationRate) {
            // Explore: random action
            return this.getRandomAction();
        } else {
            // Exploit: best known action for this state from Q-table
            return this.getBestAction(state);
        }
    }
    
    getActionFromNLPRecommendation(nlpAnalysis) {
        // Select the best recommended technique from NLP analysis
        const topTechniques = nlpAnalysis.recommendedTechniques;
        
        if (topTechniques.length === 0) {
            return this.getRandomAction();
        }
        
        // Weight by contextual fit score
        const totalScore = topTechniques.reduce((sum, t) => sum + t.score, 0);
        let random = Math.random() * totalScore;
        
        for (const technique of topTechniques) {
            random -= technique.score;
            if (random <= 0) {
                // Select a random target for this technique
                const target = this.targets[Math.floor(Math.random() * this.targets.length)];
                
                return {
                    type: this.attackPhases[this.currentPhase],
                    technique: technique.description,
                    mitreId: technique.id,
                    mitreName: technique.name,
                    target: target,
                    nlpGuided: true,
                    contextualFit: technique.contextualFit
                };
            }
        }
        
        // Fallback
        return this.getRandomAction();
    }
    
    getRandomAction() {
        const currentAttackType = this.attackPhases[this.currentPhase];
        const availableTechniques = this.techniques[currentAttackType] || this.techniques['reconnaissance'];
        const technique = availableTechniques[Math.floor(Math.random() * availableTechniques.length)];
        const target = this.targets[Math.floor(Math.random() * this.targets.length)];
        
        return {
            type: currentAttackType,
            technique: technique,
            target: target,
            nlpGuided: false
        };
    }
    
    getBestAction(state) {
        // Get all possible actions for current state
        const possibleActions = this.getPossibleActions();
        
        let bestAction = null;
        let bestValue = -Infinity;
        
        possibleActions.forEach(action => {
            const actionKey = this.actionToString(action);
            const stateActionKey = `${state}-${actionKey}`;
            const qValue = this.qTable.get(stateActionKey) || 0;
            
            if (qValue > bestValue) {
                bestValue = qValue;
                bestAction = action;
            }
        });
        
        return bestAction || this.getRandomAction();
    }
    
    getPossibleActions() {
        const currentAttackType = this.attackPhases[this.currentPhase];
        const availableTechniques = this.techniques[currentAttackType] || this.techniques['reconnaissance'];
        const actions = [];
        
        availableTechniques.forEach(technique => {
            this.targets.forEach(target => {
                actions.push({
                    type: currentAttackType,
                    technique: technique,
                    target: target
                });
            });
        });
        
        return actions;
    }
    
    actionToString(action) {
        return `${action.type}-${action.technique}-${action.target}`;
    }
    
    createAttackData(action, nlpAnalysis = null) {
        // Sometimes change IP address proactively (5% chance)
        if (Math.random() < 0.05 && !this.blockedIPs.has(this.currentIPAddress)) {
            const oldIP = this.currentIPAddress;
            this.currentIPAddress = this.generateRandomIP();
            this.ipChangeHistory.push({
                timestamp: new Date(),
                oldIP: oldIP,
                newIP: this.currentIPAddress,
                reason: 'PROACTIVE_CHANGE'
            });
            console.log(`🤖 AI proactively changed IP from ${oldIP} to ${this.currentIPAddress}`);
        }

        // Check if this is a security control disable attack
        const isSecurityControlAttack = ['Disable Firewall', 'Disable Endpoint Protection', 'Disable Access Control'].includes(action.technique);
        
        return {
            type: action.type,
            technique: action.technique,
            target: action.target || (isSecurityControlAttack ? this.getSecurityControlTarget(action.technique) : null),
            severity: this.calculateSeverity(action.type),
            timestamp: new Date(),
            // IP address information
            sourceIP: this.currentIPAddress,
            ipType: this.getIPType(this.currentIPAddress),
            isBlocked: this.blockedIPs.has(this.currentIPAddress),
            // Additional network information
            sourcePort: this.generateRandomPort(),
            userAgent: this.generateRandomUserAgent(),
            // Attack metadata
            attackId: this.generateAttackId(),
            sessionId: this.generateSessionId(),
            // MITRE ATT&CK information (from NLP analysis)
            mitreId: action.mitreId || null,
            mitreName: action.mitreName || null,
            // NLP-enhanced metadata
            nlpGuided: action.nlpGuided || false,
            contextualFit: action.contextualFit || null,
            attackVector: nlpAnalysis?.attackVector || 'unknown',
            predictedSuccess: nlpAnalysis?.successProbability || 0.5,
            vulnerabilitiesExploited: nlpAnalysis?.vulnerabilities || [],
            // Security control attack flag
            isSecurityControlAttack: isSecurityControlAttack
        };
    }
    
    calculateSeverity(attackType) {
        const severityMap = {
            'reconnaissance': 'low',
            'initial-access': 'medium',
            'persistence': 'medium',
            'privilege-escalation': 'high',
            'defense-evasion': 'medium',
            'credential-access': 'high',
            'discovery': 'low',
            'lateral-movement': 'high',
            'collection': 'high',
            'exfiltration': 'critical',
            'impact': 'critical'
        };
        
        return severityMap[attackType] || 'medium';
    }
    
    updateAttackPhase() {
        // Progress through phases with some probability
        const progressProbability = 0.3; // 30% chance to advance phase
        
        if (Math.random() < progressProbability && this.currentPhase < this.attackPhases.length - 1) {
            // Mark current phase as completed
            const currentPhaseName = this.attackPhases[this.currentPhase];
            if (!this.completedPhases.includes(currentPhaseName)) {
                this.completedPhases.push(currentPhaseName);
                console.log(`✅ Phase completed: ${currentPhaseName}`);
            }
            
            this.currentPhase++;
            console.log(`🎯 Advancing to phase: ${this.attackPhases[this.currentPhase]}`);
        }
    }
    
    // Enhanced Q-Learning update method with NLP feedback
    updateQTable(attackData, detected) {
        if (!this.lastState || !this.lastAction) return;
        
        // Calculate reward with NLP-enhanced factors
        const reward = this.calculateReward(attackData, detected);
        
        // Additional reward adjustment based on NLP prediction accuracy
        let nlpAccuracyBonus = 0;
        if (this.lastNLPAnalysis && attackData.nlpGuided) {
            const predicted = this.lastNLPAnalysis.successProbability > 0.5;
            const actual = !detected;
            
            if (predicted === actual) {
                // NLP prediction was accurate, bonus reward
                nlpAccuracyBonus = 0.2;
                console.log('🎯 NLP prediction was accurate! Bonus reward.');
            } else {
                // NLP prediction was inaccurate, slight penalty
                nlpAccuracyBonus = -0.1;
                console.log('❌ NLP prediction was inaccurate.');
            }
        }
        
        const adjustedReward = reward + nlpAccuracyBonus;
        
        // Get current state
        const currentState = this.getCurrentState();
        
        // Q-Learning update formula
        const stateActionKey = `${this.lastState}-${this.actionToString(this.lastAction)}`;
        const currentQValue = this.qTable.get(stateActionKey) || 0;
        
        // Get max Q-value for next state
        const nextStateMaxQ = this.getMaxQValueForState(currentState);
        
        // Update Q-value
        const newQValue = currentQValue + this.learningRate * 
            (adjustedReward + this.discountFactor * nextStateMaxQ - currentQValue);
        
        this.qTable.set(stateActionKey, newQValue);
        
        // Decay exploration rate
        this.explorationRate = Math.max(
            this.minExplorationRate,
            this.explorationRate * this.explorationDecay
        );
        
        console.log(`🧠 Q-Learning update: ${stateActionKey.substring(0, 40)}... -> ${newQValue.toFixed(3)} (reward: ${adjustedReward.toFixed(2)})`);
    }
    
    calculateReward(attackData, detected) {
        let reward = 0;
        
        if (detected) {
            // Negative reward for getting detected
            reward = -1;
            
            // Additional penalty if player correctly isolated the target asset
            if (this.wasAssetIsolatedCorrectly(attackData.target)) {
                reward -= 0.5; // Extra penalty for being countered by smart isolation
                console.log(`🛡️ AI penalty: Player correctly isolated ${attackData.target}`);
            }
            
            // Additional penalty if player patched the vulnerability being exploited
            if (this.wasVulnerabilityPatchedCorrectly(attackData)) {
                reward -= 0.4; // Extra penalty for being countered by smart patching
                console.log(`🔧 AI penalty: Player correctly patched vulnerability for ${attackData.technique}`);
            }
            
            // Additional penalty if player reset credentials for compromised user
            if (this.wereCredentialsResetCorrectly(attackData)) {
                reward -= 0.3; // Extra penalty for being countered by smart credential reset
                console.log(`🔐 AI penalty: Player correctly reset credentials for ${this.gameController.getUserForAttack(attackData)}`);
            }
        } else {
            // Positive reward for successful stealth
            reward = 1;
            
            // Bonus if player incorrectly isolated other assets (wasted resources)
            const incorrectIsolations = this.getRecentIncorrectIsolations();
            if (incorrectIsolations.length > 0) {
                reward += 0.3 * incorrectIsolations.length;
                console.log(`🤖 AI bonus: Player made ${incorrectIsolations.length} incorrect isolation(s)`);
            }
            
            // Bonus if player made unnecessary patches (wasted resources)
            const unnecessaryPatches = this.getRecentUnnecessaryPatches();
            if (unnecessaryPatches.length > 0) {
                reward += 0.2 * unnecessaryPatches.length;
                console.log(`🤖 AI bonus: Player made ${unnecessaryPatches.length} unnecessary patch(es)`);
            }
            
            // Bonus if player made unnecessary credential resets (wasted resources)
            const unnecessaryResets = this.getRecentUnnecessaryResets();
            if (unnecessaryResets.length > 0) {
                reward += 0.25 * unnecessaryResets.length;
                console.log(`🤖 AI bonus: Player made ${unnecessaryResets.length} unnecessary credential reset(s)`);
            }
            
            // Bonus for high-value targets
            if (['student-db', 'research-files'].includes(attackData.target)) {
                reward += 0.5;
            }
            
            // Bonus for advanced attack types
            const advancedTypes = ['exfiltration', 'impact', 'lateral-movement'];
            if (advancedTypes.includes(attackData.type)) {
                reward += 0.3;
            }
            
            // Reduced reward if target was isolated (even if incorrectly timed)
            if (this.wasAssetRecentlyIsolated(attackData.target)) {
                reward *= 0.7; // 30% reduction for isolated assets
            }
            
            // Reduced reward if vulnerability was patched (even if unnecessarily)
            if (this.wasVulnerabilityRecentlyPatched(attackData)) {
                reward *= 0.8; // 20% reduction for patched vulnerabilities
            }
            
            // Reduced reward if user credentials were reset (even if unnecessarily)
            if (this.wereCredentialsRecentlyReset(attackData)) {
                reward *= 0.75; // 25% reduction for reset credentials
            }
        }
        
        return reward;
    }
    
    // Check if an asset was correctly isolated (had active attacks when isolated)
    wasAssetIsolatedCorrectly(assetName) {
        const gameState = this.gameController.getGameState();
        if (!gameState.assetIsolations) return false;
        
        // Check for recent correct isolations (within last 10 seconds)
        const recentTime = new Date(Date.now() - 10000);
        return gameState.assetIsolations.some(isolation => 
            isolation.assetName === assetName &&
            isolation.wasCorrect &&
            isolation.timestamp > recentTime
        );
    }
    
    // Get recent incorrect isolations for AI learning
    getRecentIncorrectIsolations() {
        const gameState = this.gameController.getGameState();
        if (!gameState.assetIsolations) return [];
        
        // Check for incorrect isolations within last 15 seconds
        const recentTime = new Date(Date.now() - 15000);
        return gameState.assetIsolations.filter(isolation => 
            !isolation.wasCorrect &&
            isolation.timestamp > recentTime
        );
    }
    
    // Check if an asset was recently isolated (affects attack success)
    wasAssetRecentlyIsolated(assetName) {
        const gameState = this.gameController.getGameState();
        if (!gameState.assetIsolations) return false;
        
        // Check for any isolation within last 20 seconds
        const recentTime = new Date(Date.now() - 20000);
        return gameState.assetIsolations.some(isolation => 
            isolation.assetName === assetName &&
            isolation.timestamp > recentTime
        );
    }

    // Check if a vulnerability was correctly patched (was being actively exploited when patched)
    wasVulnerabilityPatchedCorrectly(attackData) {
        const gameState = this.gameController.getGameState();
        if (!gameState.patchHistory) return false;
        
        // Get the CVE for this attack
        const cveId = this.gameController.getCVEForAttack(attackData);
        if (!cveId) return false;
        
        // Check for recent correct patches (within last 10 seconds)
        const recentTime = new Date(Date.now() - 10000);
        return gameState.patchHistory.some(patch => 
            patch.cveId === cveId &&
            patch.wasNecessary &&
            patch.timestamp > recentTime
        );
    }

    // Get recent unnecessary patches for AI learning
    getRecentUnnecessaryPatches() {
        const gameState = this.gameController.getGameState();
        if (!gameState.patchHistory) return [];
        
        // Check for unnecessary patches within last 15 seconds
        const recentTime = new Date(Date.now() - 15000);
        return gameState.patchHistory.filter(patch => 
            !patch.wasNecessary &&
            patch.timestamp > recentTime
        );
    }

    // Check if a vulnerability was recently patched (affects attack success rate)
    wasVulnerabilityRecentlyPatched(attackData) {
        const gameState = this.gameController.getGameState();
        if (!gameState.patchHistory) return false;
        
        // Get the CVE for this attack
        const cveId = this.gameController.getCVEForAttack(attackData);
        if (!cveId) return false;
        
        // Check for any patch within last 30 seconds
        const recentTime = new Date(Date.now() - 30000);
        return gameState.patchHistory.some(patch => 
            patch.cveId === cveId &&
            patch.timestamp > recentTime
        );
    }

    // Check if credentials were correctly reset (user was compromised when reset)
    wereCredentialsResetCorrectly(attackData) {
        const gameState = this.gameController.getGameState();
        if (!gameState.credentialResets) return false;
        
        // Get the username for this attack
        const username = this.gameController.getUserForAttack(attackData);
        if (!username) return false;
        
        // Check for recent correct resets (within last 10 seconds)
        const recentTime = new Date(Date.now() - 10000);
        return gameState.credentialResets.some(reset => 
            reset.username === username &&
            reset.wasNecessary &&
            reset.timestamp > recentTime
        );
    }

    // Get recent unnecessary credential resets for AI learning
    getRecentUnnecessaryResets() {
        const gameState = this.gameController.getGameState();
        if (!gameState.credentialResets) return [];
        
        // Check for unnecessary resets within last 15 seconds
        const recentTime = new Date(Date.now() - 15000);
        return gameState.credentialResets.filter(reset => 
            !reset.wasNecessary &&
            reset.timestamp > recentTime
        );
    }

    // Check if credentials were recently reset (affects attack success rate)
    wereCredentialsRecentlyReset(attackData) {
        const gameState = this.gameController.getGameState();
        if (!gameState.credentialResets) return false;
        
        // Get the username for this attack
        const username = this.gameController.getUserForAttack(attackData);
        if (!username) return false;
        
        // Check for any reset within last 45 seconds
        const recentTime = new Date(Date.now() - 45000);
        return gameState.credentialResets.some(reset => 
            reset.username === username &&
            reset.timestamp > recentTime
        );
    }
    
    getMaxQValueForState(state) {
        const possibleActions = this.getPossibleActions();
        let maxQ = 0;
        
        possibleActions.forEach(action => {
            const actionKey = this.actionToString(action);
            const stateActionKey = `${state}-${actionKey}`;
            const qValue = this.qTable.get(stateActionKey) || 0;
            maxQ = Math.max(maxQ, qValue);
        });
        
        return maxQ;
    }
    
    // Get AI difficulty based on learning progress
    getDifficulty() {
        const qTableSize = this.qTable.size;
        const maxEntries = this.attackTypes.length * this.targets.length * 10; // Rough estimate
        
        const progress = Math.min(1, qTableSize / maxEntries);
        
        if (progress < 0.3) return { level: 'Normal', value: 30 };
        if (progress < 0.6) return { level: 'Hard', value: 60 };
        return { level: 'Expert', value: 90 };
    }
    
    // Get current AI tactics for display
    getCurrentTactics() {
        const current = this.attackPhases[this.currentPhase];
        const next = this.currentPhase < this.attackPhases.length - 1 ? 
            this.attackPhases[this.currentPhase + 1] : null;
        
        const tactics = [current];
        if (next) tactics.push(next);
        
        return tactics.map(tactic => 
            tactic.charAt(0).toUpperCase() + tactic.slice(1).replace('-', ' ')
        ).join(', ');
    }
    
    reset() {
        this.stopAttackSequence();
        this.currentPhase = 0;
        this.completedPhases = []; // Reset completed phases
        // Reset IP tracking
        this.currentIPAddress = this.generateRandomIP();
        this.blockedIPs.clear();
        this.ipChangeHistory = [];
        // Reset NLP analysis tracking
        this.lastNLPAnalysis = null;
        // Keep Q-table for continued learning
        console.log('🤖 AI Engine reset (NLP-enhanced)');
    }

    // IP Address Management Methods
    generateRandomIP() {
        // Safety check - ensure ipPools is initialized
        if (!this.ipPools || !this.ipPools.malicious) {
            return this.generateNewRandomIP();
        }
        
        // Generate a random IP from available pools or create new one
        const allIPs = [...this.ipPools.malicious, ...this.ipPools.proxies, ...this.ipPools.compromised];
        const availableIPs = allIPs.filter(ip => !this.blockedIPs.has(ip));
        
        if (availableIPs.length > 0) {
            return availableIPs[Math.floor(Math.random() * availableIPs.length)];
        }
        
        // If all known IPs are blocked, generate a new random IP
        return this.generateNewRandomIP();
    }

    generateNewRandomIP() {
        // Generate a realistic-looking IP address
        const ranges = [
            () => `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
            () => `10.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
            () => `172.${16 + Math.floor(Math.random() * 16)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
            () => `203.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
        ];
        
        const randomRange = ranges[Math.floor(Math.random() * ranges.length)];
        return randomRange();
    }

    handleIPBlock(blockedIP) {
        if (blockedIP === this.currentIPAddress) {
            // Current IP was blocked, need to change
            this.blockedIPs.add(blockedIP);
            const oldIP = this.currentIPAddress;
            this.currentIPAddress = this.generateRandomIP();
            
            // Record the IP change
            this.ipChangeHistory.push({
                timestamp: new Date(),
                oldIP: oldIP,
                newIP: this.currentIPAddress,
                reason: 'IP_BLOCKED'
            });
            
            console.log(`🤖 AI changed IP from ${oldIP} to ${this.currentIPAddress} due to blocking`);
            
            // Reduce effectiveness temporarily due to IP change disruption
            this.explorationRate = Math.min(0.8, this.explorationRate + 0.1);
            
            return true; // IP was changed
        }
        
        // IP wasn't current, just add to blocked list
        this.blockedIPs.add(blockedIP);
        return false; // No IP change needed
    }

    getCurrentIPInfo() {
        return {
            currentIP: this.currentIPAddress,
            blockedIPs: Array.from(this.blockedIPs),
            ipChangeCount: this.ipChangeHistory.length,
            lastIPChange: this.ipChangeHistory.length > 0 ? 
                this.ipChangeHistory[this.ipChangeHistory.length - 1] : null
        };
    }

    getIPType(ip) {
        if (this.ipPools.malicious.includes(ip)) return 'malicious';
        if (this.ipPools.proxies.includes(ip)) return 'proxy';
        if (this.ipPools.compromised.includes(ip)) return 'compromised';
        return 'unknown';
    }

    // Enhanced attack data creation with IP information
    generateRandomPort() {
        // Common malicious ports and random high ports
        const commonPorts = [80, 443, 8080, 8443, 3389, 22, 21, 25, 53, 445];
        const useCommonPort = Math.random() < 0.3;
        
        if (useCommonPort) {
            return commonPorts[Math.floor(Math.random() * commonPorts.length)];
        }
        
        // Random high port
        return Math.floor(Math.random() * (65535 - 1024)) + 1024;
    }

    generateRandomUserAgent() {
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'curl/7.68.0',
            'python-requests/2.25.1',
            'Nmap/7.80',
            'sqlmap/1.4.7',
            'Nikto/2.1.6'
        ];
        
        return userAgents[Math.floor(Math.random() * userAgents.length)];
    }

    generateAttackId() {
        return 'ATK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    generateSessionId() {
        return 'SES-' + Math.random().toString(36).substr(2, 12).toUpperCase();
    }

    getCurrentIPInfo() {
        return {
            currentIP: this.currentIPAddress,
            ipChangeCount: this.ipChangeHistory.length,
            lastIPChange: this.ipChangeHistory.length > 0 ? this.ipChangeHistory[this.ipChangeHistory.length - 1] : null,
            blockedIPs: [...this.blockedIPs] // Return copy to prevent external modification
        };
    }

    getDifficulty() {
        // Calculate current difficulty based on performance
        const successfulAttacks = this.recentAttacks.filter(a => a.successful).length;
        const totalAttacks = this.recentAttacks.length;
        const successRate = totalAttacks > 0 ? (successfulAttacks / totalAttacks) * 100 : 50;
        
        // Map success rate to difficulty level
        let level = 'Medium';
        if (successRate < 20) level = 'Easy';
        else if (successRate > 80) level = 'Hard';
        
        return {
            level: level,
            value: Math.round(successRate)
        };
    }

    getCurrentTactics() {
        const tactics = {
            'reconnaissance': 'Information Gathering',
            'initial-access': 'Initial Compromise',
            'persistence': 'Maintaining Access',
            'privilege-escalation': 'Privilege Escalation',
            'defense-evasion': 'Defense Evasion',
            'credential-access': 'Credential Harvesting',
            'discovery': 'Network Discovery',
            'lateral-movement': 'Lateral Movement',
            'collection': 'Data Collection',
            'exfiltration': 'Data Exfiltration',
            'impact': 'System Impact'
        };
        
        return tactics[this.currentPhase] || 'Mixed Tactics';
    }
    
    // Get security control target from technique name
    getSecurityControlTarget(technique) {
        const controlMap = {
            'Disable Firewall': 'firewall',
            'Disable Endpoint Protection': 'endpoint',
            'Disable Access Control': 'access'
        };
        return controlMap[technique] || null;
    }
    
    // Export Q-table for analysis (development/debugging)
    exportQTable() {
        return Object.fromEntries(this.qTable);
    }
    
    // Export NLP analysis statistics
    exportNLPStats() {
        const gameState = this.gameController.getGameState();
        return this.nlpAnalyzer.exportAnalysis(
            gameState,
            this.attackPhases[this.currentPhase],
            this.completedPhases
        );
    }
    
    // Get comprehensive AI state for monitoring/debugging
    getAIState() {
        return {
            currentPhase: this.attackPhases[this.currentPhase],
            completedPhases: this.completedPhases,
            explorationRate: this.explorationRate,
            qTableSize: this.qTable.size,
            ipInfo: this.getCurrentIPInfo(),
            difficulty: this.getDifficulty(),
            nlpEnabled: true,
            lastNLPAnalysis: this.lastNLPAnalysis ? {
                stateDescription: this.lastNLPAnalysis.stateDescription,
                defensiveStrength: this.lastNLPAnalysis.defensiveStrength,
                vulnerabilities: this.lastNLPAnalysis.vulnerabilities,
                attackVector: this.lastNLPAnalysis.attackVector,
                successProbability: this.lastNLPAnalysis.successProbability,
                topTechniques: this.lastNLPAnalysis.recommendedTechniques.slice(0, 3).map(t => ({
                    id: t.id,
                    name: t.name,
                    score: t.score
                }))
            } : null
        };
    }
}

export { AIEngine };
