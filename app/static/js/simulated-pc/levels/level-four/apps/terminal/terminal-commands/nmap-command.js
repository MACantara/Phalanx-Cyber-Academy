import { BaseCommand } from './base-command.js';
import { loadAllLevel4Hosts } from '../../data/index.js';

export class NmapCommand extends BaseCommand {
    constructor(processor) {
        super(processor);
        this.hostsData = null;
        this.lastScanResults = null;
        this.lastScanTarget = null;
        this.wasVulnerabilityScan = false;
        this.initializeHosts();
    }

    async initializeHosts() {
        try {
            const data = await loadAllLevel4Hosts();
            this.hostsData = data.level4_municipality_hosts || [];
            console.log('Nmap: Loaded host data:', this.hostsData.length, 'hosts');
        } catch (error) {
            console.error('Nmap: Failed to load host data:', error);
            this.hostsData = [];
        }
    }

    async waitForHosts() {
        if (!this.hostsData) {
            await this.initializeHosts();
        }
        while (!this.hostsData) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    resolveTarget(targetStr) {
        if (!this.hostsData) {
            return null;
        }

        // Handle network ranges
        if (targetStr.includes('/')) {
            return this.hostsData.find(host => host.hostname === targetStr || host.ip === targetStr);
        }

        // Direct lookup by hostname or IP
        const host = this.hostsData.find(host => 
            host.hostname === targetStr || host.ip === targetStr
        );

        return host || null;
    }

    // Utility methods to replace target registry functionality
    isNetworkRange(target) {
        return target && target.hostType === 'range';
    }

    getNetworkSummary(target) {
        if (this.isNetworkRange(target) && target.networkRange) {
            return {
                activeHosts: target.networkRange.hosts || [],
                subnet: target.networkRange.subnet,
                totalHosts: target.networkRange.totalHosts,
                activeHosts: target.networkRange.activeHosts
            };
        }
        return { activeHosts: [] };
    }

    getVulnerabilityScripts() {
        if (!this.hostsData) return {};
        
        const scripts = {};
        this.hostsData.forEach(host => {
            if (host.vulnerabilities) {
                for (const [scriptName, targets] of Object.entries(host.vulnerabilities)) {
                    if (!scripts[scriptName]) {
                        scripts[scriptName] = {};
                    }
                    Object.assign(scripts[scriptName], targets);
                }
            }
        });
        return scripts;
    }

    async execute(args) {
        if (args.length === 0) {
            this.showBasicUsage();
            return;
        }

        // Parse command line arguments
        const options = this.parseArguments(args);
        
        if (options.help) {
            this.showHelp();
            return;
        }

        if (options.version) {
            this.showVersion();
            return;
        }

        if (!options.target) {
            this.addOutput('nmap: No target specified', 'text-red-400');
            this.addOutput('Try `nmap --help` for more information');
            return;
        }

        // Execute the appropriate scan
        await this.performScan(options);
    }

    parseArguments(args) {
        const options = {
            target: null,
            scanType: 'tcp',
            ports: null,
            verbose: false,
            scriptScan: false,
            vulnScan: false,
            osScan: false,
            serviceScan: false,
            help: false,
            version: false,
            integrate: false
        };

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            
            switch (arg) {
                case '-h':
                case '--help':
                    options.help = true;
                    break;
                case '-V':
                case '--version':
                    options.version = true;
                    break;
                case '-sV':
                    options.serviceScan = true;
                    break;
                case '-O':
                    options.osScan = true;
                    break;
                case '-sC':
                case '--script':
                    options.scriptScan = true;
                    break;
                case '--script=vuln':
                    options.vulnScan = true;
                    break;
                case '-v':
                    options.verbose = true;
                    break;
                case '-p':
                    if (i + 1 < args.length) {
                        options.ports = args[++i];
                    }
                    break;
                case '-sS':
                    options.scanType = 'syn';
                    break;
                case '-sU':
                    options.scanType = 'udp';
                    break;
                case '-A':
                    options.serviceScan = true;
                    options.osScan = true;
                    options.scriptScan = true;
                    break;
                default:
                    if (!arg.startsWith('-') && !options.target) {
                        options.target = arg;
                    }
                    break;
            }
        }

        return options;
    }

    async performScan(options) {
        await this.waitForHosts();
        
        const target = this.resolveTarget(options.target);
        
        if (!target) {
            this.addOutput(`nmap: Failed to resolve "${options.target}"`, 'text-red-400');
            return;
        }

        // Store scan details for integration
        this.lastScanTarget = options.target;
        this.wasVulnerabilityScan = options.vulnScan || options.scriptScan;

        // Show scan initialization
        this.addOutput(`Starting Nmap 7.80 ( https://nmap.org ) at ${new Date().toLocaleString()}`, 'text-green-400');
        this.addOutput(`Nmap scan report for ${target.hostname || options.target} (${target.ip || options.target})`);
        this.addOutput(`Host is up (0.00015s latency).`);
        
        if (options.verbose) {
            this.addOutput(`Scanning ${target.hostname || options.target} [${this.getPortCount(target, options)} ports]`, 'text-blue-400');
        }

        // Perform port scan
        this.performPortScan(target, options);

        // Additional scans based on options
        if (options.serviceScan) {
            this.performServiceScan(target, options);
        }

        if (options.osScan) {
            this.performOsScan(target, options);
        }

        if (options.scriptScan || options.vulnScan) {
            this.performScriptScan(target, options);
        }

        // Show scan completion
        this.addOutput('');
        this.addOutput(`Nmap done: 1 IP address (1 host up) scanned in 2.15 seconds`, 'text-green-400');
        
        // Store scan results for integration
        this.lastScanResults = this.captureOutputAsString();
        this.lastScanTarget = options.target;
        
        // Offer integration with vulnerability scanner
        this.offerVulnerabilityScannerIntegration(options);
    }

    /**
     * Capture the current output as a string for integration
     */
    captureOutputAsString() {
        // Instead of trying to parse DOM, build the output from the scan results
        let output = `Starting Nmap 7.80 ( https://nmap.org ) at ${new Date().toLocaleString()}\n`;
        
        // Add the recent scan output by reconstructing it from the target data
        const target = this.resolveTarget(this.lastScanTarget);
        if (target) {
            output += `Nmap scan report for ${target.hostname || this.lastScanTarget} (${target.ip || this.lastScanTarget})\n`;
            output += `Host is up (0.00015s latency).\n`;
            output += `PORT     STATE SERVICE\n`;
            
            // Add port information
            if (target.ports) {
                Object.entries(target.ports).forEach(([port, portData]) => {
                    const portStr = `${port}/tcp`.padEnd(9);
                    const stateStr = portData.state.padEnd(6);
                    output += `${portStr} ${stateStr} ${portData.service}\n`;
                });
            }
            
            // Add vulnerability script results if this was a vulnerability scan
            if (this.wasVulnerabilityScan && target.vulnerabilities) {
                output += `\nSCRIPT SCAN RESULTS:\n`;
                target.vulnerabilities.forEach(vuln => {
                    if (vuln.source === 'nmap' || vuln.severity === 'critical' || vuln.severity === 'high') {
                        output += `| ${vuln.title || vuln.name}: ${vuln.severity.toUpperCase()}\n`;
                        output += `|   ${vuln.description}\n`;
                        if (vuln.cve) {
                            output += `|   CVE: ${vuln.cve}\n`;
                        }
                    }
                });
            }
        }
        
        output += `\nNmap done: 1 IP address (1 host up) scanned in 2.15 seconds\n`;
        return output;
    }

    /**
     * Offer integration with vulnerability scanner
     */
    offerVulnerabilityScannerIntegration(options) {
        this.addOutput('');
        this.addOutput('VULNERABILITY SCANNER INTEGRATION:', 'text-cyan-400');
        
        // Check if vulnerability scanner contains any vulnerability results
        const hasVulnResults = this.hasVulnerabilityScriptResults();
        
        if (hasVulnResults) {
            this.addOutput('• Vulnerabilities detected in scan results!', 'text-yellow-400');
            this.addOutput('• Use --script vuln for vulnerability scanning', 'text-blue-400');
        } else {
            this.addOutput('• No vulnerabilities detected in this scan', 'text-green-400');
        }
    }

    /**
     * Check if scan results contain vulnerability information
     */
    hasVulnerabilityScriptResults() {
        if (!this.lastScanResults) return false;
        
        const vulnIndicators = [
            'CVE-', 'CRITICAL', 'HIGH', 'VULNERABLE', 
            'EXPLOIT', 'Buffer Overflow', 'SQL Injection'
        ];
        
        return vulnIndicators.some(indicator => 
            this.lastScanResults.toUpperCase().includes(indicator)
        );
    }

    performPortScan(target, options) {
        if (this.isNetworkRange(target)) {
            // Network range scan
            this.addOutput('');
            this.addOutput('HOST DISCOVERY:', 'text-blue-400');
            const networkSummary = this.getNetworkSummary(target);
            networkSummary.activeHosts.forEach(ip => {
                const hostData = this.resolveTarget(ip);
                this.addOutput(`${ip} - ${hostData?.hostname || 'Unknown'} - UP`);
            });
            return;
        }

        const ports = this.getPortsToScan(target, options);
        
        this.addOutput('');
        this.addOutput('PORT     STATE SERVICE', 'text-blue-400');
        
        ports.forEach(([port, portData]) => {
            const state = portData.state;
            const service = portData.service;
            const portStr = `${port}/tcp`.padEnd(9);
            const stateStr = state.padEnd(6);
            const stateColor = state === 'open' ? 'text-green-400' : 'text-red-400';
            
            this.addOutput(`${portStr} ${stateStr} ${service}`, stateColor);
        });
    }

    performServiceScan(target, options) {
        if (this.isNetworkRange(target)) return;

        this.addOutput('');
        this.addOutput('SERVICE DETECTION:', 'text-blue-400');
        
        const ports = this.getPortsToScan(target, options);
        ports.forEach(([port, portData]) => {
            if (portData.state === 'open') {
                this.addOutput(`${port}/tcp  ${portData.service}  ${portData.version}`, 'text-cyan-400');
                if (portData.banner && options.verbose) {
                    this.addOutput(`  Banner: ${portData.banner}`, 'text-gray-400');
                }
            }
        });
    }

    performOsScan(target, options) {
        if (this.isNetworkRange(target)) return;

        this.addOutput('');
        this.addOutput('OS DETECTION:', 'text-blue-400');
        this.addOutput(`Running: ${target.os}`, 'text-yellow-400');
        this.addOutput(`Uptime: ${target.uptime}`, 'text-gray-400');
        this.addOutput('Network Distance: 1 hop', 'text-gray-400');
    }

    performScriptScan(target, options) {
        if (this.isNetworkRange(target)) return;

        this.addOutput('');
        this.addOutput('SCRIPT SCAN RESULTS:', 'text-blue-400');

        const hostname = target.hostname || 'unknown';
        let foundVulns = false;

        // Run vulnerability scripts if requested
        if (options.vulnScan) {
            const vulnerabilityScripts = this.getVulnerabilityScripts();
            
            for (const [scriptName, scriptResults] of Object.entries(vulnerabilityScripts)) {
                for (const [targetPort, results] of Object.entries(scriptResults)) {
                    if (targetPort.includes(hostname)) {
                        foundVulns = true;
                        this.addOutput(`| ${scriptName}:`, 'text-red-400');
                        results.forEach(result => {
                            const severity = this.getVulnerabilitySeverity(result);
                            this.addOutput(`|   ${result}`, severity);
                        });
                        this.addOutput('|');
                    }
                }
            }
        } else {
            // Standard script scan (safer scripts)
            this.addOutput('| http-server-header:', 'text-cyan-400');
            this.addOutput('|   Apache/2.4.41 (Ubuntu)', 'text-gray-400');
            this.addOutput('|');
            this.addOutput('| http-title:', 'text-cyan-400');
            this.addOutput('|   SecureVote Pro - Municipal Voting System', 'text-gray-400');
            this.addOutput('|');
            this.addOutput('| ssl-cert:', 'text-cyan-400');
            this.addOutput('|   Subject: commonName=vote.municipality.gov', 'text-gray-400');
            this.addOutput('|   Issuer: commonName=SecureVote CA', 'text-gray-400');
            this.addOutput('|');
        }

        if (options.vulnScan && foundVulns) {
            this.addOutput('WARNING: Critical vulnerabilities detected!', 'text-red-400');
            this.addOutput('Recommendation: Conduct thorough security assessment', 'text-yellow-400');
        }
    }

    getVulnerabilitySeverity(result) {
        if (result.includes('CRITICAL')) return 'text-red-400';
        if (result.includes('HIGH')) return 'text-red-400';
        if (result.includes('MEDIUM')) return 'text-yellow-400';
        if (result.includes('WARNING')) return 'text-yellow-400';
        return 'text-gray-400';
    }

    getPortsToScan(target, options) {
        if (this.isNetworkRange(target)) return [];

        let portsToCheck = Object.entries(target.ports || {});
        
        if (options.ports) {
            const requestedPorts = options.ports.split(',').map(p => parseInt(p.trim()));
            portsToCheck = portsToCheck.filter(([port]) => requestedPorts.includes(parseInt(port)));
        }
        
        return portsToCheck;
    }

    getPortCount(target, options) {
        if (this.isNetworkRange(target)) {
            const networkSummary = this.getNetworkSummary(target);
            return networkSummary.activeHosts.length;
        }
        
        if (options.ports) {
            return options.ports.split(',').length;
        }
        
        return Object.keys(target.ports).length;
    }

    showBasicUsage() {
        this.addOutput('Nmap 7.80 ( https://nmap.org )');
        this.addOutput('Usage: nmap [Scan Type(s)] [Options] {target specification}');
        this.addOutput('');
        this.addOutput('Examples:');
        this.addOutput('  nmap vote.municipality.gov');
        this.addOutput('  nmap -sV vote.municipality.gov');
        this.addOutput('  nmap --script=vuln vote.municipality.gov');
        this.addOutput('  nmap 192.168.100.0/24');
        this.addOutput('');
        this.addOutput('Try `nmap --help` for more options');
    }

    showVersion() {
        this.addOutput('Nmap version 7.80 ( https://nmap.org )', 'text-green-400');
        this.addOutput('Platform: linux');
        this.addOutput('Compiled with: liblua-5.3.3 openssl-1.1.1 libssh2-1.8.0 libz-1.2.11 libpcre-8.39 libpcap-1.9.1 nmap-libdnet-1.12');
        this.addOutput('Available nsock engines: epoll poll select');
    }

    getHelp() {
        return {
            name: 'nmap',
            description: 'Network exploration tool and security scanner',
            usage: 'nmap [Scan Type(s)] [Options] {target specification}',
            options: [
                { flag: '-sS', description: 'TCP SYN scan (default)' },
                { flag: '-sV', description: 'Version detection' },
                { flag: '-O', description: 'Enable OS detection' },
                { flag: '-A', description: 'Enable aggressive scan (OS detection, version detection, script scanning)' },
                { flag: '-sC', description: 'Equivalent to --script=default' },
                { flag: '--script=vuln', description: 'Run vulnerability detection scripts' },
                { flag: '-p <ports>', description: 'Only scan specified ports' },
                { flag: '-v', description: 'Increase verbosity level' },
                { flag: '--help', description: 'Show this help message' },
                { flag: '--version', description: 'Show version information' }
            ]
        };
    }

    showHelp() {
        const help = this.getHelp();
        this.addOutput(`${help.name} - ${help.description}`, 'text-green-400');
        this.addOutput('');
        this.addOutput(`Usage: ${help.usage}`);
        this.addOutput('');
        this.addOutput('SCAN TECHNIQUES:', 'text-blue-400');
        this.addOutput('  -sS    TCP SYN scan (default)');
        this.addOutput('  -sU    UDP scan');
        this.addOutput('');
        this.addOutput('SERVICE/VERSION DETECTION:', 'text-blue-400');
        this.addOutput('  -sV    Probe open ports to determine service/version info');
        this.addOutput('');
        this.addOutput('OS DETECTION:', 'text-blue-400');
        this.addOutput('  -O     Enable OS detection');
        this.addOutput('');
        this.addOutput('SCRIPT SCAN:', 'text-blue-400');
        this.addOutput('  -sC               Equivalent to --script=default');
        this.addOutput('  --script=<lua scripts>  Run specified scripts');
        this.addOutput('  --script=vuln     Run vulnerability detection scripts');
        this.addOutput('');
        this.addOutput('PORT SPECIFICATION:', 'text-blue-400');
        this.addOutput('  -p <port ranges>  Only scan specified ports');
        this.addOutput('                   Ex: -p22,53,110,143-4564');
        this.addOutput('');
        this.addOutput('MISC:', 'text-blue-400');
        this.addOutput('  -A     Enable aggressive scan (OS detection, version detection, script scanning)');
        this.addOutput('  -v     Increase verbosity level');
        this.addOutput('  -h     Show this help summary');
        this.addOutput('  -V     Show version number');
        this.addOutput('');
        this.addOutput('EXAMPLES:', 'text-blue-400');
        this.addOutput('  nmap vote.municipality.gov');
        this.addOutput('  nmap -sV -O vote.municipality.gov');
        this.addOutput('  nmap --script=vuln vote.municipality.gov');
        this.addOutput('  nmap -p 80,443 vote.municipality.gov');
        this.addOutput('  nmap 192.168.100.0/24');
        this.addOutput('');
        this.addOutput('SEE THE MAN PAGE (https://nmap.org/book/man.html) FOR MORE OPTIONS AND EXAMPLES');
    }
}