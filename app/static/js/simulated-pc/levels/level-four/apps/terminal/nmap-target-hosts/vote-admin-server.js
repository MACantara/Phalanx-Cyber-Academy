import { BaseTargetHost } from './base-target-host.js';

export class VoteAdminServer extends BaseTargetHost {
    constructor() {
        super({
            hostname: 'vote-admin.municipality.gov',
            ip: '192.168.100.12',
            description: 'SecureVote Pro Admin Panel',
            os: 'Linux Ubuntu 20.04.3 LTS',
            uptime: '15 days, 3:40:18',
            ports: {
                ...BaseTargetHost.createPort(22, 'ssh', 'OpenSSH 8.2', 'open', 'SSH-2.0-OpenSSH_8.2'),
                ...BaseTargetHost.createPort(80, 'http', 'nginx 1.18.0', 'open', 'nginx/1.18.0 (Ubuntu)'),
                ...BaseTargetHost.createPort(443, 'https', 'nginx 1.18.0', 'open', 'nginx/1.18.0 (Ubuntu)'),
                ...BaseTargetHost.createPort(8080, 'http-alt', 'AdminPanel 3.2.1', 'open', 'SecureVote Admin v3.2.1')
            }
        });
        
        // Initialize vulnerabilities after super() call
        this.vulnerabilities = this.initializeVulnerabilities();
    }

    initializeVulnerabilities() {
        return {
            'http-directory-traversal': {
                'vote-admin.municipality.gov:8080': [
                    'Directory traversal in admin panel',
                    'Config files accessible via path traversal',
                    'Found: /admin/../config/database.conf',
                    'CRITICAL: Database credentials exposed'
                ]
            },
            'http-default-accounts': {
                'vote-admin.municipality.gov:8080': [
                    'Default credentials detected:',
                    'Username: admin',
                    'Password: password',
                    'CRITICAL: Default admin credentials active'
                ]
            }
        };
    }

    // Override to provide admin-specific service descriptions
    getServiceDescription(port) {
        const descriptions = {
            22: 'SSH access for system administration',
            80: 'Admin panel web interface (HTTP)',
            443: 'Secure admin panel web interface (HTTPS)',
            8080: 'Administrative control panel - high privileges'
        };
        return descriptions[port] || 'Unknown service';
    }

    // Check if admin panel has default credentials
    hasDefaultCredentials() {
        return this.hasVulnerability('http-default-accounts', 8080);
    }

    // Check if config files are exposed
    hasConfigExposure() {
        return this.hasVulnerability('http-directory-traversal', 8080);
    }

    // Get admin security assessment
    getAdminSecurityAssessment() {
        const criticalIssues = [];
        
        if (this.hasDefaultCredentials()) {
            criticalIssues.push('Default admin credentials in use');
        }
        
        if (this.hasConfigExposure()) {
            criticalIssues.push('Configuration files exposed via directory traversal');
        }
        
        return {
            riskLevel: criticalIssues.length > 0 ? 'CRITICAL' : 'MEDIUM',
            criticalIssues: criticalIssues,
            immediateActions: criticalIssues.length > 0 ? [
                'Change default admin password immediately',
                'Patch directory traversal vulnerability',
                'Review admin access logs'
            ] : ['Regular security monitoring']
        };
    }
}
