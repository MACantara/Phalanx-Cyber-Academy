import { BaseTargetHost } from './base-target-host.js';

export class VoteMainServer extends BaseTargetHost {
    constructor() {
        super({
            hostname: 'vote.municipality.gov',
            ip: '192.168.100.10',
            description: 'SecureVote Pro Main Server',
            os: 'Linux Ubuntu 20.04.3 LTS',
            uptime: '15 days, 3:42:15',
            ports: {
                ...BaseTargetHost.createPort(22, 'ssh', 'OpenSSH 8.2', 'open', 'SSH-2.0-OpenSSH_8.2'),
                ...BaseTargetHost.createPort(80, 'http', 'Apache 2.4.41', 'open', 'Apache/2.4.41 (Ubuntu)'),
                ...BaseTargetHost.createPort(443, 'https', 'Apache 2.4.41', 'open', 'Apache/2.4.41 (Ubuntu) SSL/TLS'),
                ...BaseTargetHost.createPort(3306, 'mysql', 'MySQL 8.0.25', 'open', 'MySQL 8.0.25-0ubuntu0.20.04.1'),
                ...BaseTargetHost.createPort(8080, 'http-alt', 'Jetty 9.4.39', 'open', 'Jetty(9.4.39.v20210325)')
            }
        });
        
        // Initialize vulnerabilities after super() call
        this.vulnerabilities = this.initializeVulnerabilities();
    }

    initializeVulnerabilities() {
        return {
            'http-sql-injection': {
                'vote.municipality.gov:80': [
                    'SQL injection vulnerability found in /voter-lookup endpoint',
                    'Parameter: voter_id appears to be vulnerable to SQL injection',
                    'Payload: \' OR 1=1-- successfully executed',
                    'CRITICAL: Database access possible through injection'
                ],
                'vote.municipality.gov:443': [
                    'SQL injection vulnerability found in /voter-lookup endpoint (HTTPS)',
                    'Same vulnerability present on secure connection'
                ]
            },
            'http-stored-xss': {
                'vote.municipality.gov:80': [
                    'Stored XSS vulnerability found in /results-comments endpoint',
                    'User input not properly sanitized in comment system',
                    'Payload: <script>alert("XSS")</script> successfully stored',
                    'HIGH: Potential for session hijacking and admin impersonation'
                ]
            },
            'http-directory-traversal': {
                'vote.municipality.gov:80': [
                    'Directory traversal vulnerability found',
                    'Path: /admin/../../../etc/passwd accessible',
                    'MEDIUM: Local file inclusion possible'
                ]
            },
            'ssl-cert': {
                'vote.municipality.gov:443': [
                    'SSL Certificate Information:',
                    'Subject: CN=vote.municipality.gov',
                    'Issuer: Self-signed certificate',
                    'Valid from: 2024-01-01 to 2025-01-01',
                    'WARNING: Self-signed certificate - potential MITM risk'
                ]
            },
            'mysql-info': {
                'vote.municipality.gov:3306': [
                    'MySQL Server Information:',
                    'Version: 8.0.25-0ubuntu0.20.04.1',
                    'Authentication: mysql_native_password',
                    'Databases: information_schema, mysql, performance_schema, voting_system'
                ]
            }
        };
    }

    // Override to provide specific service descriptions
    getServiceDescription(port) {
        const descriptions = {
            22: 'SSH access for remote administration',
            80: 'Main voting application web interface',
            443: 'Secure voting application (HTTPS)',
            3306: 'Database connection for vote storage',
            8080: 'Administrative interface for vote management'
        };
        return descriptions[port] || 'Unknown service';
    }

    // Get critical vulnerabilities count
    getCriticalVulnerabilityCount() {
        const allVulns = this.getAllVulnerabilities();
        let criticalCount = 0;
        
        for (const vulns of Object.values(allVulns)) {
            criticalCount += vulns.filter(v => v.includes('CRITICAL')).length;
        }
        
        return criticalCount;
    }

    // Check if host is compromised based on vulnerabilities
    isHighRisk() {
        return this.getCriticalVulnerabilityCount() > 0 || 
               this.hasVulnerability('http-sql-injection') ||
               this.hasVulnerability('http-stored-xss');
    }
}
