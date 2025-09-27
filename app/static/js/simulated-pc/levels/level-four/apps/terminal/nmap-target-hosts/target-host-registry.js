export class TargetHostRegistry {
    constructor() {
        this.hosts = new Map();
        this.vulnerabilityScripts = new Map();
        this.jsonData = null;
        this.initializeFromAPI();
    }

    async initializeFromAPI() {
        try {
            // Try to load from API first
            const response = await fetch('/api/level4/hosts-data');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.jsonData = data.level4_municipality_hosts;
                    console.log('Loaded Level 4 host data from API:', this.jsonData.length, 'hosts');
                } else {
                    throw new Error('API returned error: ' + data.error);
                }
            } else {
                throw new Error('Failed to fetch from API');
            }
        } catch (error) {
            console.warn('Failed to load from API, trying fallback JSON:', error);
            // Fallback to static JSON file
            try {
                const response = await fetch('/static/js/simulated-pc/levels/level-four/data/level4-hosts-data.json');
                const data = await response.json();
                this.jsonData = data.level4_municipality_hosts;
                console.log('Loaded Level 4 host data from JSON file:', this.jsonData.length, 'hosts');
            } catch (fallbackError) {
                console.error('Failed to load host data:', fallbackError);
                this.jsonData = [];
            }
        }

        this.initializeHosts();
        this.initializeVulnerabilityScripts();
    }

    initializeHosts() {
        if (!this.jsonData) return;

        // Register hosts from JSON data
        this.jsonData.forEach(hostData => {
            // Register by hostname
            if (hostData.hostname) {
                this.hosts.set(hostData.hostname, hostData);
            }

            // Register by IP address for reverse lookups
            if (hostData.ip) {
                this.hosts.set(hostData.ip, hostData);
            }
        });
    }

    initializeVulnerabilityScripts() {
        if (!this.jsonData) return;

        // Aggregate all vulnerabilities from hosts for script-based lookup
        this.jsonData.forEach(host => {
            if (host.vulnerabilities) {
                for (const [scriptName, targets] of Object.entries(host.vulnerabilities)) {
                    if (!this.vulnerabilityScripts.has(scriptName)) {
                        this.vulnerabilityScripts.set(scriptName, {});
                    }
                    const existing = this.vulnerabilityScripts.get(scriptName);
                    Object.assign(existing, targets);
                }
            }
        });
    }

    // Get host by hostname or IP
    getHost(identifier) {
        return this.hosts.get(identifier) || null;
    }

    // Get all registered hosts
    getAllHosts() {
        const uniqueHosts = new Set();
        this.hosts.forEach(host => uniqueHosts.add(host));
        return Array.from(uniqueHosts);
    }

    // Get hosts by category
    getHostsByCategory(category) {
        return this.getAllHosts().filter(host => host.category === category);
    }

    // Resolve target (handles both hostnames and IPs)
    resolveTarget(targetStr) {
        // Handle network ranges
        if (targetStr.includes('/')) {
            return this.getHost(targetStr);
        }

        // Direct lookup
        const host = this.getHost(targetStr);
        if (host) {
            return host;
        }

        // Try to find by IP if hostname was provided, or vice versa
        for (const [key, hostObj] of this.hosts.entries()) {
            if (hostObj.ip === targetStr || hostObj.hostname === targetStr) {
                return hostObj;
            }
        }

        return null;
    }

    // Check if registry is ready (data loaded)
    isReady() {
        return this.jsonData !== null;
    }

    // Wait for registry to be ready
    async waitForReady() {
        while (!this.isReady()) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Get vulnerability information for scripts
    getVulnerabilityScripts() {
        return Object.fromEntries(this.vulnerabilityScripts);
    }

    // Get all vulnerabilities for a specific script
    getScriptVulnerabilities(scriptName) {
        return this.vulnerabilityScripts.get(scriptName) || {};
    }

    // Register a new host
    registerHost(identifier, host) {
        this.hosts.set(identifier, host);
        
        // Update vulnerability scripts
        const vulns = host.vulnerabilities;
        for (const [scriptName, targets] of Object.entries(vulns)) {
            if (!this.vulnerabilityScripts.has(scriptName)) {
                this.vulnerabilityScripts.set(scriptName, {});
            }
            const scriptVulns = this.vulnerabilityScripts.get(scriptName);
            Object.assign(scriptVulns, targets);
        }
    }

    // Remove a host
    unregisterHost(identifier) {
        const host = this.hosts.get(identifier);
        if (host) {
            this.hosts.delete(identifier);
            // Note: Vulnerability cleanup would require more complex logic
            return true;
        }
        return false;
    }

    // Get security summary for all hosts
    getNetworkSecuritySummary() {
        const allHosts = this.getAllHosts();
        const summaries = allHosts.map(host => ({
            hostname: host.hostname,
            ip: host.ip,
            category: host.getCategory(),
            ...host.getSecuritySummary()
        }));

        const totalVulns = summaries.reduce((sum, s) => sum + s.totalVulnerabilities, 0);
        const highRiskHosts = summaries.filter(s => s.riskLevel === 'HIGH').length;

        return {
            totalHosts: allHosts.length,
            totalVulnerabilities: totalVulns,
            highRiskHosts: highRiskHosts,
            hostSummaries: summaries,
            overallRisk: highRiskHosts > 0 ? 'HIGH' : totalVulns > 3 ? 'MEDIUM' : 'LOW'
        };
    }

    // Get available script names
    getAvailableScripts() {
        return Array.from(this.vulnerabilityScripts.keys());
    }

    // Check if host exists
    hasHost(identifier) {
        return this.hosts.has(identifier);
    }

    // Get host count
    getHostCount() {
        return new Set(this.hosts.values()).size;
    }

    // Export registry data for debugging
    exportRegistryData() {
        return {
            hosts: Object.fromEntries(this.hosts.entries()),
            vulnerabilityScripts: Object.fromEntries(this.vulnerabilityScripts),
            securitySummary: this.getNetworkSecuritySummary(),
            dataSource: this.jsonData ? 'JSON loaded' : 'No data'
        };
    }
}

// Create and export singleton instance
let registryInstance = null;

export function getTargetHostRegistry() {
    if (!registryInstance) {
        registryInstance = new TargetHostRegistry();
    }
    return registryInstance;
}

// Export singleton instance for compatibility
export const targetHostRegistry = getTargetHostRegistry();

// Export class for custom instances
export default TargetHostRegistry;
