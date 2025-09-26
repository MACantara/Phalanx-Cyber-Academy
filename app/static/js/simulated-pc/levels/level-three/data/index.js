/**
 * Level 3: Malware Mayhem - Data exports
 * Central export file for all Level 3 data modules
 */

/**
 * Level 3 Data Manager - Simplified data handling using API backend
 */
export class Level3DataManager {
    constructor() {
        this.malwareData = null;
        this.processData = null;
        this.encryptedFilesData = null;
        this.loaded = false;
        
        // Selected random subsets for gameplay (loaded from API)
        this.selectedMalware = {};
        this.selectedProcesses = [];
        this.selectedEncryptedFiles = [];
    }

    async loadData() {
        if (this.loaded) return;

        try {
            // Load data from the new Level 3 API endpoint
            const response = await fetch('/api/level3/game-data');
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const apiData = await response.json();
            
            if (!apiData.success) {
                throw new Error(`API error: ${apiData.error}`);
            }

            // Extract data from API response
            const gameData = apiData.data;
            this.selectedMalware = gameData.malware || {};
            this.selectedProcesses = this.buildProcessList(gameData.processes || {});
            this.selectedEncryptedFiles = gameData.encrypted_files?.level3_ransomware_files || [];
            
            // For compatibility, also store the full data structures
            this.malwareData = gameData.malware || {};
            this.processData = gameData.processes || {};
            this.encryptedFilesData = gameData.encrypted_files || {};
            
            this.loaded = true;

            console.log('[Level3DataManager] Data loaded from API successfully');
            console.log('[Level3DataManager] Selected:', {
                malware: Object.keys(this.selectedMalware).length,
                processes: this.selectedProcesses.length,
                files: this.selectedEncryptedFiles.length
            });
            
        } catch (error) {
            console.error('[Level3DataManager] Failed to load data from API:', error);
            
            // Fallback to empty data
            this.malwareData = {};
            this.processData = { system: [], gaming: [], application: [], malware: [] };
            this.encryptedFilesData = { level3_ransomware_files: [] };
            this.selectedMalware = {};
            this.selectedProcesses = [];
            this.selectedEncryptedFiles = [];
            this.loaded = true;
        }
    }

    /**
     * Build the complete process list from API data
     */
    buildProcessList(processData) {
        const allProcesses = [];
        
        // Add all process types
        ['system', 'gaming', 'application', 'malware'].forEach(category => {
            const processes = processData[category] || [];
            processes.forEach(process => {
                // Add runtime properties for display
                const processWithRuntime = {
                    ...process,
                    pid: 1000 + Math.floor(Math.random() * 8999),
                    threads: Math.floor(Math.random() * 20) + 1,
                    startTime: new Date(Date.now() - Math.random() * 86400000).toLocaleString(),
                    status: 'Running',
                    suspicious: !process.trusted
                };
                allProcesses.push(processWithRuntime);
            });
        });
        
        return allProcesses;
    }

    // Malware data methods - now use API-loaded data
    getMalwareByFilename(filename) {
        if (!this.loaded) {
            console.warn('[Level3DataManager] Data not loaded yet');
            return null;
        }
        return this.selectedMalware[filename.toLowerCase()] || null;
    }

    getMalwareByPath(filePath) {
        if (!this.loaded) {
            console.warn('[Level3DataManager] Data not loaded yet');
            return null;
        }
        
        // Find malware by matching the full path in selected subset
        return Object.values(this.selectedMalware).find(malware => 
            malware.path && malware.path.toLowerCase() === filePath.toLowerCase()
        ) || null;
    }

    getAllMalware() {
        if (!this.loaded) return {};
        return this.selectedMalware;
    }

    isMaliciousFile(filename) {
        return this.getMalwareByFilename(filename) !== null;
    }

    // Process data methods - now use API-loaded data
    getAllProcesses() {
        if (!this.loaded) return [];
        return this.selectedProcesses;
    }

    getMaliciousProcesses() {
        if (!this.loaded) return [];
        return this.selectedProcesses.filter(process => !process.trusted);
    }

    // Encrypted files data methods - now use API-loaded data
    getEncryptedFiles() {
        if (!this.loaded) return [];
        return this.selectedEncryptedFiles;
    }

    getFileById(fileId) {
        const files = this.getEncryptedFiles();
        return files.find(file => file.id === fileId) || null;
    }

    // Timer integration methods - calculate from API-loaded data
    calculateTotalReputationDamage() {
        const malwareItems = Object.values(this.selectedMalware);
        return malwareItems.reduce((total, malware) => total + (malware.reputationDamage || 0), 0);
    }

    calculateTotalFinancialDamage() {
        const malwareItems = Object.values(this.selectedMalware);
        return malwareItems.reduce((total, malware) => total + (malware.financialDamage || 0), 0);
    }

    getMaxReputationRecovery() {
        return this.selectedEncryptedFiles.reduce((total, file) => total + (file.reputationRecovery || 0), 0);
    }

    // Utility methods
    formatSize(size) {
        return size; // Already formatted in data
    }

    formatDamage(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(0) + 'K';
        }
        return amount.toString();
    }

    getRiskColor(riskLevel) {
        switch (riskLevel.toLowerCase()) {
            case 'critical': return 'text-red-500';
            case 'high': return 'text-red-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-green-400';
            default: return 'text-gray-300';
        }
    }

    getPriorityColor(priority) {
        switch (priority.toLowerCase()) {
            case 'critical': return 'text-red-500';
            case 'high': return 'text-red-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-green-400';
            default: return 'text-gray-300';
        }
    }
}

// Create singleton instance
export const level3DataManager = new Level3DataManager();

// Auto-load data when module is imported
level3DataManager.loadData();

export const level3DataLoaded = true;
