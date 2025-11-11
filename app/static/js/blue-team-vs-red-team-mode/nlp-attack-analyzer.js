// Simplified Attack Pattern Analyzer for Q-Learning
// Analyzes game state using rule-based logic to determine optimal attack patterns
// based on MITRE ATT&CK framework (NLP-lite for Q-learning integration)

class NLPAttackAnalyzer {
    constructor() {
        // Simplified context keywords for quick pattern matching
        this.defenseKeywords = {
            'strong': ['firewall', 'active', 'monitoring', 'isolated', 'patched', 'protected'],
            'weak': ['inactive', 'vulnerable', 'compromised', 'exposed', 'unpatched'],
            'compromised': ['breach', 'infiltrated', 'corrupted', 'infected', 'malware']
        };

        // MITRE ATT&CK technique mapping with NLP context
        this.mitreAttackPatterns = {
            'reconnaissance': {
                keywords: ['unknown', 'initial', 'new', 'unfamiliar', 'unexplored'],
                techniques: [
                    {
                        id: 'T1595',
                        name: 'Active Scanning',
                        description: 'Network Scanning',
                        prerequisites: [],
                        successFactors: ['weak_firewall', 'no_monitoring']
                    },
                    {
                        id: 'T1592',
                        name: 'Gather Victim Host Information',
                        description: 'Port Scanning',
                        prerequisites: [],
                        successFactors: ['weak_firewall']
                    },
                    {
                        id: 'T1590',
                        name: 'Gather Victim Network Information',
                        description: 'Service Discovery',
                        prerequisites: [],
                        successFactors: ['no_monitoring']
                    }
                ]
            },
            'initial-access': {
                keywords: ['entry', 'access', 'penetrate', 'breach', 'exploit'],
                techniques: [
                    {
                        id: 'T1566',
                        name: 'Phishing',
                        description: 'Spear Phishing Link',
                        prerequisites: ['reconnaissance_complete'],
                        successFactors: ['weak_endpoint', 'no_email_filtering']
                    },
                    {
                        id: 'T1190',
                        name: 'Exploit Public-Facing Application',
                        description: 'Web Application Exploit',
                        prerequisites: ['reconnaissance_complete'],
                        successFactors: ['unpatched_vulnerabilities', 'weak_firewall']
                    },
                    {
                        id: 'T1133',
                        name: 'External Remote Services',
                        description: 'Drive-by Compromise',
                        prerequisites: ['reconnaissance_complete'],
                        successFactors: ['weak_access_control']
                    }
                ]
            },
            'persistence': {
                keywords: ['maintain', 'persistent', 'backdoor', 'foothold', 'remain'],
                techniques: [
                    {
                        id: 'T1547',
                        name: 'Boot or Logon Autostart Execution',
                        description: 'Registry Modification',
                        prerequisites: ['initial_access_complete'],
                        successFactors: ['weak_endpoint', 'no_monitoring']
                    },
                    {
                        id: 'T1053',
                        name: 'Scheduled Task/Job',
                        description: 'Scheduled Task Creation',
                        prerequisites: ['initial_access_complete'],
                        successFactors: ['weak_monitoring']
                    },
                    {
                        id: 'T1543',
                        name: 'Create or Modify System Process',
                        description: 'Service Creation',
                        prerequisites: ['initial_access_complete'],
                        successFactors: ['weak_endpoint', 'weak_monitoring']
                    }
                ]
            },
            'privilege-escalation': {
                keywords: ['elevate', 'admin', 'root', 'escalate', 'privilege', 'sudo'],
                techniques: [
                    {
                        id: 'T1055',
                        name: 'Process Injection',
                        description: 'DLL Injection',
                        prerequisites: ['persistence_complete'],
                        successFactors: ['weak_endpoint', 'no_monitoring']
                    },
                    {
                        id: 'T1134',
                        name: 'Access Token Manipulation',
                        description: 'Token Impersonation',
                        prerequisites: ['persistence_complete'],
                        successFactors: ['weak_access_control']
                    },
                    {
                        id: 'T1068',
                        name: 'Exploitation for Privilege Escalation',
                        description: 'Kernel Exploit',
                        prerequisites: ['persistence_complete'],
                        successFactors: ['unpatched_vulnerabilities']
                    }
                ]
            },
            'defense-evasion': {
                keywords: ['hide', 'stealth', 'evade', 'obfuscate', 'bypass', 'conceal'],
                techniques: [
                    {
                        id: 'T1070',
                        name: 'Indicator Removal on Host',
                        description: 'File Deletion',
                        prerequisites: ['privilege_escalation_complete'],
                        successFactors: ['weak_monitoring', 'no_logging']
                    },
                    {
                        id: 'T1055',
                        name: 'Process Injection',
                        description: 'Process Hollowing',
                        prerequisites: ['privilege_escalation_complete'],
                        successFactors: ['weak_endpoint', 'no_monitoring']
                    },
                    {
                        id: 'T1036',
                        name: 'Masquerading',
                        description: 'File Masquerading',
                        prerequisites: ['privilege_escalation_complete'],
                        successFactors: ['weak_monitoring']
                    }
                ]
            },
            'credential-access': {
                keywords: ['password', 'credential', 'authentication', 'login', 'hash', 'key'],
                techniques: [
                    {
                        id: 'T1003',
                        name: 'OS Credential Dumping',
                        description: 'LSASS Memory Dumping',
                        prerequisites: ['privilege_escalation_complete'],
                        successFactors: ['weak_endpoint', 'no_monitoring', 'weak_access_control']
                    },
                    {
                        id: 'T1110',
                        name: 'Brute Force',
                        description: 'Password Spraying',
                        prerequisites: ['initial_access_complete'],
                        successFactors: ['weak_access_control', 'no_rate_limiting']
                    },
                    {
                        id: 'T1056',
                        name: 'Input Capture',
                        description: 'Keylogging',
                        prerequisites: ['privilege_escalation_complete'],
                        successFactors: ['weak_endpoint']
                    }
                ]
            },
            'discovery': {
                keywords: ['explore', 'scan', 'enumerate', 'discover', 'map', 'identify'],
                techniques: [
                    {
                        id: 'T1082',
                        name: 'System Information Discovery',
                        description: 'System Info Gathering',
                        prerequisites: ['initial_access_complete'],
                        successFactors: ['weak_monitoring']
                    },
                    {
                        id: 'T1087',
                        name: 'Account Discovery',
                        description: 'Account Enumeration',
                        prerequisites: ['initial_access_complete'],
                        successFactors: ['weak_monitoring', 'weak_access_control']
                    },
                    {
                        id: 'T1046',
                        name: 'Network Service Scanning',
                        description: 'Internal Network Scan',
                        prerequisites: ['initial_access_complete'],
                        successFactors: ['weak_firewall', 'no_segmentation']
                    }
                ]
            },
            'lateral-movement': {
                keywords: ['spread', 'pivot', 'move', 'lateral', 'propagate', 'traverse'],
                techniques: [
                    {
                        id: 'T1021',
                        name: 'Remote Services',
                        description: 'Remote Desktop Protocol',
                        prerequisites: ['credential_access_complete', 'discovery_complete'],
                        successFactors: ['weak_access_control', 'compromised_credentials']
                    },
                    {
                        id: 'T1534',
                        name: 'Internal Spearphishing',
                        description: 'Lateral Phishing',
                        prerequisites: ['credential_access_complete'],
                        successFactors: ['weak_email_filtering', 'compromised_account']
                    },
                    {
                        id: 'T1570',
                        name: 'Lateral Tool Transfer',
                        description: 'Tool Distribution',
                        prerequisites: ['discovery_complete'],
                        successFactors: ['weak_endpoint', 'no_file_monitoring']
                    }
                ]
            },
            'collection': {
                keywords: ['collect', 'gather', 'harvest', 'capture', 'extract', 'steal'],
                techniques: [
                    {
                        id: 'T1005',
                        name: 'Data from Local System',
                        description: 'File System Access',
                        prerequisites: ['lateral_movement_complete'],
                        successFactors: ['weak_file_monitoring', 'no_dlp']
                    },
                    {
                        id: 'T1113',
                        name: 'Screen Capture',
                        description: 'Screenshot Capture',
                        prerequisites: ['lateral_movement_complete'],
                        successFactors: ['weak_endpoint', 'no_monitoring']
                    },
                    {
                        id: 'T1123',
                        name: 'Audio Capture',
                        description: 'Microphone Recording',
                        prerequisites: ['lateral_movement_complete'],
                        successFactors: ['weak_endpoint']
                    }
                ]
            },
            'exfiltration': {
                keywords: ['exfiltrate', 'transmit', 'send', 'transfer', 'upload', 'leak'],
                techniques: [
                    {
                        id: 'T1560',
                        name: 'Archive Collected Data',
                        description: 'Data Compression',
                        prerequisites: ['collection_complete'],
                        successFactors: ['no_dlp', 'weak_monitoring']
                    },
                    {
                        id: 'T1041',
                        name: 'Exfiltration Over C2 Channel',
                        description: 'C2 Data Transfer',
                        prerequisites: ['collection_complete'],
                        successFactors: ['weak_firewall', 'no_dlp', 'weak_monitoring']
                    },
                    {
                        id: 'T1020',
                        name: 'Automated Exfiltration',
                        description: 'Automated Data Theft',
                        prerequisites: ['collection_complete'],
                        successFactors: ['no_dlp', 'no_rate_limiting']
                    }
                ]
            },
            'impact': {
                keywords: ['destroy', 'damage', 'disrupt', 'ransom', 'corrupt', 'delete'],
                techniques: [
                    {
                        id: 'T1485',
                        name: 'Data Destruction',
                        description: 'File Deletion',
                        prerequisites: ['lateral_movement_complete'],
                        successFactors: ['no_backup', 'weak_monitoring']
                    },
                    {
                        id: 'T1491',
                        name: 'Defacement',
                        description: 'Website Defacement',
                        prerequisites: ['lateral_movement_complete'],
                        successFactors: ['weak_integrity_check']
                    },
                    {
                        id: 'T1498',
                        name: 'Network Denial of Service',
                        description: 'DDoS Attack',
                        prerequisites: ['discovery_complete'],
                        successFactors: ['no_ddos_protection', 'weak_firewall']
                    }
                ]
            }
        };

        console.log('🧠 NLP Attack Analyzer initialized with MITRE ATT&CK patterns');
    }

    /**
     * Analyze game state using rule-based logic (Q-Learning compatible)
     * This mimics NLP behavior without heavy processing - perfect for Q-learning integration
     * @param {Object} gameState - Current game state
     * @param {String} currentPhase - Current attack phase
     * @param {Array} completedPhases - List of completed attack phases
     * @returns {Object} Analysis results with recommended techniques
     */
    analyzeGameState(gameState, currentPhase, completedPhases = []) {
        // Extract features from game state (simple rule-based)
        const stateDescription = this.generateStateDescription(gameState);
        
        // Analyze defensive posture (rule-based scoring)
        const defensiveAnalysis = this.analyzeDefensivePosture(stateDescription, gameState);
        
        // Identify vulnerabilities (threshold-based detection)
        const vulnerabilities = this.identifyVulnerabilities(gameState, defensiveAnalysis);
        
        // Get context-appropriate techniques (pattern matching)
        const recommendedTechniques = this.selectOptimalTechniques(
            currentPhase,
            vulnerabilities,
            completedPhases,
            defensiveAnalysis
        );
        
        return {
            stateDescription,
            defensiveStrength: defensiveAnalysis.overallStrength,
            vulnerabilities,
            recommendedTechniques,
            attackVector: this.determineAttackVector(vulnerabilities, defensiveAnalysis),
            successProbability: this.calculateSuccessProbability(recommendedTechniques, vulnerabilities)
        };
    }

    /**
     * Generate simplified state description (rule-based, no heavy NLP)
     */
    generateStateDescription(gameState) {
        const parts = [];
        
        // Analyze assets (simple threshold check)
        const assets = gameState.assets || {};
        const compromisedAssets = Object.entries(assets)
            .filter(([_, asset]) => asset.integrity < 80)
            .map(([name, _]) => name);
        
        if (compromisedAssets.length > 0) {
            parts.push(`compromised assets: ${compromisedAssets.join(', ')}`);
        } else {
            parts.push('all assets secure');
        }
        
        // Analyze security controls (simple count)
        const controls = gameState.securityControls || {};
        const activeControls = Object.entries(controls)
            .filter(([_, control]) => control.active)
            .map(([name, _]) => name);
        
        if (activeControls.length === Object.keys(controls).length) {
            parts.push('full security controls active');
        } else {
            parts.push(`${activeControls.length}/${Object.keys(controls).length} security controls active`);
        }
        
        // Alert level (simple count)
        const alertCount = (gameState.alerts || []).length;
        if (alertCount > 5) {
            parts.push('high alert level');
        } else if (alertCount > 2) {
            parts.push('moderate alert level');
        } else {
            parts.push('low alert level');
        }
        
        return parts.join(', ');
    }

    /**
     * Analyze defensive posture using simple rule-based logic
     * (Mimics NLP behavior without heavy processing)
     */
    analyzeDefensivePosture(stateDescription, gameState) {
        const description = stateDescription.toLowerCase();
        
        // Simple keyword counting (mimics NLP sentiment analysis)
        let strongScore = 0;
        let weakScore = 0;
        
        this.defenseKeywords.strong.forEach(keyword => {
            if (description.includes(keyword)) strongScore++;
        });
        
        this.defenseKeywords.weak.forEach(keyword => {
            if (description.includes(keyword)) weakScore++;
        });
        
        // Analyze specific defense mechanisms
        const controls = gameState.securityControls || {};
        const firewallStrength = controls.firewall?.effectiveness || 0;
        const endpointStrength = controls.endpoint?.effectiveness || 0;
        const accessControlStrength = controls.access?.effectiveness || 0;
        
        const avgControlStrength = (firewallStrength + endpointStrength + accessControlStrength) / 3;
        
        return {
            overallStrength: avgControlStrength,
            firewallStrength,
            endpointStrength,
            accessControlStrength,
            alertLevel: (gameState.alerts || []).length,
            weaknessIndicators: weakScore,
            strengthIndicators: strongScore
        };
    }

    /**
     * Identify specific vulnerabilities in the system
     */
    identifyVulnerabilities(gameState, defensiveAnalysis) {
        const vulnerabilities = [];
        
        // Check firewall
        if (defensiveAnalysis.firewallStrength < 50 || !gameState.securityControls?.firewall?.active) {
            vulnerabilities.push('weak_firewall');
        }
        
        // Check endpoint protection
        if (defensiveAnalysis.endpointStrength < 50 || !gameState.securityControls?.endpoint?.active) {
            vulnerabilities.push('weak_endpoint');
        }
        
        // Check access control
        if (defensiveAnalysis.accessControlStrength < 50 || !gameState.securityControls?.access?.active) {
            vulnerabilities.push('weak_access_control');
        }
        
        // Check monitoring
        if (defensiveAnalysis.alertLevel === 0) {
            vulnerabilities.push('no_monitoring');
        }
        
        // Check asset integrity
        const assets = gameState.assets || {};
        Object.entries(assets).forEach(([name, asset]) => {
            if (asset.integrity < 100) {
                vulnerabilities.push(`unpatched_vulnerabilities`);
            }
        });
        
        return [...new Set(vulnerabilities)]; // Remove duplicates
    }

    /**
     * Select optimal attack techniques based on context
     */
    selectOptimalTechniques(currentPhase, vulnerabilities, completedPhases, defensiveAnalysis) {
        const phasePatterns = this.mitreAttackPatterns[currentPhase];
        if (!phasePatterns) return [];
        
        // Score each technique based on context
        const scoredTechniques = phasePatterns.techniques.map(technique => {
            let score = 50; // Base score
            
            // Check prerequisites
            const prerequisitesMet = technique.prerequisites.every(prereq => {
                const prereqPhase = prereq.replace('_complete', '');
                return completedPhases.includes(prereqPhase);
            });
            
            if (!prerequisitesMet) {
                score -= 30;
            }
            
            // Check success factors against identified vulnerabilities
            technique.successFactors.forEach(factor => {
                if (vulnerabilities.includes(factor)) {
                    score += 20;
                }
            });
            
            // Adjust based on defensive strength
            if (defensiveAnalysis.overallStrength < 30) {
                score += 15; // Weak defenses increase all attack scores
            } else if (defensiveAnalysis.overallStrength > 80) {
                score -= 15; // Strong defenses decrease all attack scores
            }
            
            return {
                ...technique,
                score,
                contextualFit: score / 100 // Normalize to 0-1
            };
        });
        
        // Sort by score and return top techniques
        return scoredTechniques
            .sort((a, b) => b.score - a.score)
            .slice(0, 3); // Return top 3 techniques
    }

    /**
     * Determine the best attack vector based on analysis
     */
    determineAttackVector(vulnerabilities, defensiveAnalysis) {
        if (vulnerabilities.includes('weak_firewall') && vulnerabilities.includes('weak_endpoint')) {
            return 'multi-vector-exploit';
        } else if (vulnerabilities.includes('weak_access_control')) {
            return 'credential-based-attack';
        } else if (vulnerabilities.includes('weak_monitoring')) {
            return 'stealth-infiltration';
        } else if (vulnerabilities.length === 0) {
            return 'advanced-persistent-threat';
        }
        
        return 'opportunistic-attack';
    }

    /**
     * Calculate success probability for recommended techniques
     */
    calculateSuccessProbability(techniques, vulnerabilities) {
        if (techniques.length === 0) return 0;
        
        const avgContextualFit = techniques.reduce((sum, t) => sum + (t.contextualFit || 0), 0) / techniques.length;
        const vulnerabilityBonus = Math.min(vulnerabilities.length * 0.05, 0.3); // Up to 30% bonus
        
        return Math.min(0.95, avgContextualFit + vulnerabilityBonus); // Cap at 95%
    }

    /**
     * Generate contextual attack narrative for the terminal
     */
    generateAttackNarrative(technique, target, defensiveAnalysis) {
        const narratives = {
            'weak': `Exploiting weak ${target} defenses with ${technique.name}`,
            'moderate': `Attempting ${technique.name} against ${target}`,
            'strong': `Probing ${target} security with ${technique.name}`
        };
        
        const strengthLevel = defensiveAnalysis.overallStrength < 40 ? 'weak' : 
                             defensiveAnalysis.overallStrength < 70 ? 'moderate' : 'strong';
        
        return narratives[strengthLevel];
    }

    /**
     * Get MITRE ATT&CK technique by ID
     */
    getTechniqueById(techniqueId) {
        for (const phase in this.mitreAttackPatterns) {
            const technique = this.mitreAttackPatterns[phase].techniques.find(
                t => t.id === techniqueId
            );
            if (technique) return technique;
        }
        return null;
    }

    /**
     * Export NLP analysis for debugging/training
     */
    exportAnalysis(gameState, currentPhase, completedPhases) {
        return {
            timestamp: new Date().toISOString(),
            analysis: this.analyzeGameState(gameState, currentPhase, completedPhases),
            gameState: {
                phase: currentPhase,
                completedPhases,
                assets: Object.keys(gameState.assets || {}),
                controls: Object.keys(gameState.securityControls || {}),
                alertCount: (gameState.alerts || []).length
            }
        };
    }
}

export { NLPAttackAnalyzer };
