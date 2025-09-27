import { BaseTargetHost } from './base-target-host.js';

export class VoteDatabaseServer extends BaseTargetHost {
    constructor() {
        super({
            hostname: 'vote-db.municipality.gov',
            ip: '192.168.100.11',
            description: 'SecureVote Pro Database Server',
            os: 'Linux Ubuntu 20.04.3 LTS',
            uptime: '15 days, 3:41:02',
            ports: {
                ...BaseTargetHost.createPort(22, 'ssh', 'OpenSSH 8.2', 'open', 'SSH-2.0-OpenSSH_8.2'),
                ...BaseTargetHost.createPort(3306, 'mysql', 'MySQL 8.0.25', 'open', 'MySQL 8.0.25-0ubuntu0.20.04.1'),
                ...BaseTargetHost.createPort(5432, 'postgresql', 'PostgreSQL 13.4', 'open', 'PostgreSQL 13.4')
            }
        });
        
        // Initialize vulnerabilities after super() call
        this.vulnerabilities = this.initializeVulnerabilities();
    }

    initializeVulnerabilities() {
        return {
            'mysql-info': {
                'vote-db.municipality.gov:3306': [
                    'MySQL Server Information:',
                    'Version: 8.0.25-0ubuntu0.20.04.1',
                    'Root access: Possible with weak credentials',
                    'CRITICAL: Weak MySQL root password detected'
                ]
            }
        };
    }

    // Override to provide database-specific service descriptions
    getServiceDescription(port) {
        const descriptions = {
            22: 'SSH access for database administration',
            3306: 'MySQL database server - primary vote storage',
            5432: 'PostgreSQL database server - backup vote storage'
        };
        return descriptions[port] || 'Unknown service';
    }

    // Check if database has weak credentials
    hasWeakCredentials() {
        return this.hasVulnerability('mysql-info', 3306);
    }

    // Get database risk assessment
    getDatabaseRiskAssessment() {
        const risks = [];
        
        if (this.hasWeakCredentials()) {
            risks.push('Weak root password detected');
        }
        
        if (this.getOpenPorts().length > 2) {
            risks.push('Multiple database services exposed');
        }
        
        return {
            riskLevel: risks.length > 0 ? 'HIGH' : 'MEDIUM',
            risks: risks,
            recommendation: risks.length > 0 ? 'Immediate security review required' : 'Regular security monitoring'
        };
    }
}
