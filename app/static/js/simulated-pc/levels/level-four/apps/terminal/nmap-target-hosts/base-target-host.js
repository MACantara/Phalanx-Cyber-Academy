export class BaseTargetHost {
    constructor(config) {
        this.hostname = config.hostname;
        this.ip = config.ip;
        this.description = config.description;
        this.ports = config.ports || {};
        this.os = config.os || 'Unknown';
        this.uptime = config.uptime || '0 days, 0:00:00';
        this.vulnerabilities = config.vulnerabilities || {};
        this.networkRange = config.networkRange || null;
        this.hostType = config.hostType || 'single'; // 'single' or 'range'
    }

    // Get port information with state, service, and version
    getPortInfo(port) {
        return this.ports[port] || null;
    }

    // Get all open ports
    getOpenPorts() {
        return Object.entries(this.ports)
            .filter(([port, info]) => info.state === 'open')
            .map(([port, info]) => ({ port: parseInt(port), ...info }));
    }

    // Get all closed/filtered ports
    getClosedPorts() {
        return Object.entries(this.ports)
            .filter(([port, info]) => info.state !== 'open')
            .map(([port, info]) => ({ port: parseInt(port), ...info }));
    }

    // Get vulnerabilities for a specific script
    getVulnerabilities(scriptName) {
        return this.vulnerabilities[scriptName] || {};
    }

    // Get all vulnerabilities for this host
    getAllVulnerabilities() {
        const allVulns = {};
        for (const [scriptName, targets] of Object.entries(this.vulnerabilities)) {
            for (const [target, vulns] of Object.entries(targets)) {
                if (target.includes(this.hostname) || target.includes(this.ip)) {
                    if (!allVulns[scriptName]) {
                        allVulns[scriptName] = [];
                    }
                    allVulns[scriptName] = allVulns[scriptName].concat(vulns);
                }
            }
        }
        return allVulns;
    }

    // Check if host has specific vulnerability
    hasVulnerability(scriptName, port = null) {
        const vulns = this.getVulnerabilities(scriptName);
        if (port) {
            const target = `${this.hostname}:${port}`;
            return vulns[target] && vulns[target].length > 0;
        }
        return Object.keys(vulns).length > 0;
    }

    // Get service banner for a port
    getServiceBanner(port) {
        const portInfo = this.getPortInfo(port);
        return portInfo ? portInfo.banner : null;
    }

    // Check if this is a network range
    isNetworkRange() {
        return this.hostType === 'range';
    }

    // Get hosts in network range (for range-type hosts)
    getNetworkHosts() {
        return this.networkRange ? this.networkRange.hosts : [];
    }

    // Convert to object for nmap compatibility
    toHostObject() {
        return {
            hostname: this.hostname,
            ip: this.ip,
            description: this.description,
            ports: this.ports,
            os: this.os,
            uptime: this.uptime,
            vulnerabilities: this.vulnerabilities,
            hostType: this.hostType,
            networkRange: this.networkRange
        };
    }

    // Get security assessment summary
    getSecuritySummary() {
        const openPorts = this.getOpenPorts();
        const allVulns = this.getAllVulnerabilities();
        const vulnCount = Object.values(allVulns).reduce((total, vulns) => total + vulns.length, 0);
        
        return {
            openPorts: openPorts.length,
            totalVulnerabilities: vulnCount,
            criticalServices: openPorts.filter(p => [22, 80, 443, 3306, 8080].includes(p.port)),
            riskLevel: this.calculateRiskLevel(openPorts.length, vulnCount)
        };
    }

    // Calculate risk level based on open ports and vulnerabilities
    calculateRiskLevel(openPortCount, vulnCount) {
        if (vulnCount >= 3 || openPortCount >= 5) return 'HIGH';
        if (vulnCount >= 1 || openPortCount >= 3) return 'MEDIUM';
        return 'LOW';
    }

    // Get host category (server, database, admin, network, etc.)
    getCategory() {
        if (this.hostname.includes('vote-db')) return 'database';
        if (this.hostname.includes('vote-admin')) return 'administration';
        if (this.hostname.includes('vote')) return 'application';
        if (this.isNetworkRange()) return 'network';
        return 'server';
    }

    // Static helper methods
    static generateCertExpiration(monthsFromNow) {
        const date = new Date();
        date.setMonth(date.getMonth() + monthsFromNow);
        return date.toISOString().split('T')[0];
    }

    static createPort(port, service, version, state = 'open', banner = null) {
        return {
            [port]: {
                service,
                version,
                state,
                banner: banner || `${service}/${version}`
            }
        };
    }

    static createVulnerability(target, vulnerabilities) {
        return { [target]: vulnerabilities };
    }
}
