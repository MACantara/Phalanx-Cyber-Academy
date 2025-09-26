/**
 * Level 3: Malware Mayhem - Data exports
 * Central export file for all Level 3 data modules
 */

/**
 * Level 3 Data Manager - Simplified data handling for timed gameplay
 */
export class Level3DataManager {
    constructor() {
        this.malwareData = null;
        this.processData = null;
        this.encryptedFilesData = null;
        this.loaded = false;
    }

    async loadData() {
        if (this.loaded) return;

        try {
            const [malwareResponse, processResponse, filesResponse] = await Promise.all([
                fetch('/static/js/simulated-pc/levels/level-three/data/malware-data.json'),
                fetch('/static/js/simulated-pc/levels/level-three/data/process-data.json'),
                fetch('/static/js/simulated-pc/levels/level-three/data/encrypted-files-data.json')
            ]);

            this.malwareData = await malwareResponse.json();
            this.processData = await processResponse.json();
            this.encryptedFilesData = await filesResponse.json();
            this.loaded = true;

            console.log('[Level3DataManager] All data loaded successfully');
        } catch (error) {
            console.error('[Level3DataManager] Failed to load data:', error);
            // Fallback to empty data
            this.malwareData = {};
            this.processData = { system: [], gaming: [], application: [], malware: [] };
            this.encryptedFilesData = { level3_ransomware_files: [] };
            this.loaded = true;
        }
    }

    // Malware data methods
    getMalwareByFilename(filename) {
        if (!this.loaded) {
            console.warn('[Level3DataManager] Data not loaded yet');
            return null;
        }
        return this.malwareData[filename.toLowerCase()] || null;
    }

    getMalwareByPath(filePath) {
        if (!this.loaded) {
            console.warn('[Level3DataManager] Data not loaded yet');
            return null;
        }
        
        // Find malware by matching the full path
        return Object.values(this.malwareData).find(malware => 
            malware.path && malware.path.toLowerCase() === filePath.toLowerCase()
        ) || null;
    }

    getAllMalware() {
        if (!this.loaded) return {};
        return this.malwareData;
    }

    isMaliciousFile(filename) {
        return this.getMalwareByFilename(filename) !== null;
    }

    // Process data methods
    getAllProcesses() {
        if (!this.loaded) return [];
        
        const allProcesses = [];
        Object.keys(this.processData).forEach(category => {
            this.processData[category].forEach(process => {
                // Add runtime properties
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

    getMaliciousProcesses() {
        if (!this.loaded) return [];
        return this.processData.malware || [];
    }

    // Encrypted files data methods
    getEncryptedFiles() {
        if (!this.loaded) return [];
        return this.encryptedFilesData.level3_ransomware_files || [];
    }

    getFileById(fileId) {
        const files = this.getEncryptedFiles();
        return files.find(file => file.id === fileId) || null;
    }

    // Timer integration methods
    calculateTotalReputationDamage() {
        const malwareItems = Object.values(this.malwareData);
        return malwareItems.reduce((total, malware) => total + (malware.reputationDamage || 0), 0);
    }

    calculateTotalFinancialDamage() {
        const malwareItems = Object.values(this.malwareData);
        return malwareItems.reduce((total, malware) => total + (malware.financialDamage || 0), 0);
    }

    getMaxReputationRecovery() {
        const files = this.getEncryptedFiles();
        return files.reduce((total, file) => total + (file.reputationRecovery || 0), 0);
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
