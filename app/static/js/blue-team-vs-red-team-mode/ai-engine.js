// AI Engine - Implements Q-Learning for Red Team attacks
class AIEngine {
    constructor(gameController) {
        this.gameController = gameController;
        this.isAttacking = false;
        this.attackInterval = null;
        
        // Q-Learning parameters
        this.learningRate = 0.1;
        this.discountFactor = 0.9;
        this.explorationRate = 0.3;
        this.explorationDecay = 0.995;
        this.minExplorationRate = 0.05;
        
        // Q-Table: state-action values
        this.qTable = new Map();
        
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
        
        // Attack techniques
        this.techniques = {
            'reconnaissance': ['Network Scanning', 'Port Scanning', 'Service Discovery'],
            'initial-access': ['Phishing', 'Exploit Public-Facing Application', 'Drive-by Compromise'],
            'persistence': ['Registry Modification', 'Scheduled Task', 'Service Creation'],
            'privilege-escalation': ['Process Injection', 'Access Token Manipulation', 'Exploitation for Privilege Escalation'],
            'defense-evasion': ['File Deletion', 'Process Hollowing', 'Masquerading'],
            'credential-access': ['Credential Dumping', 'Brute Force', 'Keylogging'],
            'discovery': ['System Information Discovery', 'Account Discovery', 'Network Service Scanning'],
            'lateral-movement': ['Remote Services', 'Internal Spearphishing', 'Lateral Tool Transfer'],
            'collection': ['Data from Local System', 'Screen Capture', 'Audio Capture'],
            'exfiltration': ['Data Encrypted for Impact', 'Exfiltration Over C2 Channel', 'Automated Exfiltration'],
            'impact': ['Data Destruction', 'Defacement', 'Denial of Service']
        };
        
        // Target assets
        this.targets = ['academy-server', 'student-db', 'research-files', 'learning-platform'];
        
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
        
        // Select action using epsilon-greedy strategy
        const action = this.selectAction(state);
        
        // Execute the attack
        const attackData = this.createAttackData(action);
        
        console.log(`🤖 AI executing: ${attackData.technique} on ${attackData.target}`);
        
        // Send attack to game controller
        this.gameController.processAttack(attackData);
        
        // Store state-action pair for learning
        this.lastState = state;
        this.lastAction = action;
        
        // Progress through attack phases
        this.updateAttackPhase();
    }
    
    getCurrentState() {
        const gameState = this.gameController.getGameState();
        
        // Create state representation
        const state = {
            phase: this.currentPhase,
            timeRemaining: Math.floor(gameState.timeRemaining / 60), // Minutes
            assetIntegrity: this.getAverageAssetIntegrity(gameState.assets),
            alertLevel: Math.min(5, gameState.alerts.length),
            securityControlsActive: this.getActiveSecurityControls(gameState.securityControls)
        };
        
        return this.stateToString(state);
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
        return `${state.phase}-${state.timeRemaining}-${state.assetIntegrity}-${state.alertLevel}-${state.securityControlsActive}`;
    }
    
    selectAction(state) {
        // Epsilon-greedy action selection
        if (Math.random() < this.explorationRate) {
            // Explore: random action
            return this.getRandomAction();
        } else {
            // Exploit: best known action for this state
            return this.getBestAction(state);
        }
    }
    
    getRandomAction() {
        const currentAttackType = this.attackPhases[this.currentPhase];
        const availableTechniques = this.techniques[currentAttackType] || this.techniques['reconnaissance'];
        const technique = availableTechniques[Math.floor(Math.random() * availableTechniques.length)];
        const target = this.targets[Math.floor(Math.random() * this.targets.length)];
        
        return {
            type: currentAttackType,
            technique: technique,
            target: target
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
    
    createAttackData(action) {
        return {
            type: action.type,
            technique: action.technique,
            target: action.target,
            severity: this.calculateSeverity(action.type),
            timestamp: new Date()
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
            this.currentPhase++;
        }
    }
    
    // Q-Learning update method
    updateQTable(attackData, detected) {
        if (!this.lastState || !this.lastAction) return;
        
        // Calculate reward
        const reward = this.calculateReward(attackData, detected);
        
        // Get current state
        const currentState = this.getCurrentState();
        
        // Q-Learning update formula
        const stateActionKey = `${this.lastState}-${this.actionToString(this.lastAction)}`;
        const currentQValue = this.qTable.get(stateActionKey) || 0;
        
        // Get max Q-value for next state
        const nextStateMaxQ = this.getMaxQValueForState(currentState);
        
        // Update Q-value
        const newQValue = currentQValue + this.learningRate * 
            (reward + this.discountFactor * nextStateMaxQ - currentQValue);
        
        this.qTable.set(stateActionKey, newQValue);
        
        // Decay exploration rate
        this.explorationRate = Math.max(
            this.minExplorationRate,
            this.explorationRate * this.explorationDecay
        );
        
        console.log(`🧠 Q-Learning update: ${stateActionKey} -> ${newQValue.toFixed(3)} (reward: ${reward})`);
    }
    
    calculateReward(attackData, detected) {
        let reward = 0;
        
        if (detected) {
            // Negative reward for getting detected
            reward = -1;
        } else {
            // Positive reward for successful stealth
            reward = 1;
            
            // Bonus for high-value targets
            if (['student-db', 'research-files'].includes(attackData.target)) {
                reward += 0.5;
            }
            
            // Bonus for advanced attack types
            const advancedTypes = ['exfiltration', 'impact', 'lateral-movement'];
            if (advancedTypes.includes(attackData.type)) {
                reward += 0.3;
            }
        }
        
        return reward;
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
        // Keep Q-table for continued learning
        console.log('🤖 AI Engine reset');
    }
    
    
    // Export Q-table for analysis (development/debugging)
    exportQTable() {
        return Object.fromEntries(this.qTable);
    }
}

export { AIEngine };
