import { BaseCommand } from './base-command.js';
import { loadAllLevel4Hosts } from '../../data/index.js';

export class PingCommand extends BaseCommand {
    constructor(processor) {
        super(processor);
        this.hostsData = null;
        this.pingCount = 4;
        this.interval = 1000;
        this.timeout = 5000;
        this.isRunning = false;
        this.currentPing = 0;
        this.initializeHosts();
    }

    async initializeHosts() {
        try {
            const data = await loadAllLevel4Hosts();
            this.hostsData = data.level4_municipality_hosts || [];
            console.log('Ping: Loaded host data:', this.hostsData.length, 'hosts');
        } catch (error) {
            console.error('Ping: Failed to load host data:', error);
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

    async execute(args) {
        if (args.length === 0) {
            this.showBasicUsage();
            return;
        }

        const options = this.parseArguments(args);
        
        if (options.help) {
            this.showHelp();
            return;
        }

        if (!options.target) {
            this.addOutput('ping: missing host operand', 'text-red-400');
            this.addOutput('Try `ping --help` for more information');
            return;
        }

        await this.performPing(options);
    }

    parseArguments(args) {
        const options = {
            target: null,
            count: 4,
            interval: 1000,
            timeout: 5000,
            verbose: false,
            help: false,
            continuous: false,
            packetSize: 32
        };

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            
            switch (arg) {
                case '-h':
                case '--help':
                    options.help = true;
                    break;
                case '-c':
                    if (i + 1 < args.length) {
                        options.count = parseInt(args[++i]) || 4;
                    }
                    break;
                case '-i':
                    if (i + 1 < args.length) {
                        options.interval = parseFloat(args[++i]) * 1000 || 1000;
                    }
                    break;
                case '-W':
                    if (i + 1 < args.length) {
                        options.timeout = parseInt(args[++i]) * 1000 || 5000;
                    }
                    break;
                case '-s':
                    if (i + 1 < args.length) {
                        options.packetSize = parseInt(args[++i]) || 32;
                    }
                    break;
                case '-t':
                    options.continuous = true;
                    break;
                case '-v':
                    options.verbose = true;
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

    async performPing(options) {
        await this.waitForHosts();
        
        const target = this.resolveTarget(options.target);
        
        if (!target) {
            this.addOutput(`ping: cannot resolve ${options.target}: Unknown host`, 'text-red-400');
            return;
        }

        this.isRunning = true;
        this.currentPing = 0;
        this.pingCount = options.continuous ? Infinity : options.count;
        
        const targetHost = target.hostname || target.ip || options.target;
        const targetIP = target.ip || this.generateFakeIP(options.target);
        
        this.addOutput(`PING ${targetHost} (${targetIP}) ${options.packetSize}(${options.packetSize + 28}) bytes of data.`, 'text-green-400');
        
        const statistics = {
            transmitted: 0,
            received: 0,
            times: []
        };

        const pingInterval = setInterval(() => {
            if (!this.isRunning || this.currentPing >= this.pingCount) {
                clearInterval(pingInterval);
                this.showStatistics(targetHost, statistics);
                return;
            }

            this.currentPing++;
            statistics.transmitted++;
            
            const result = this.simulatePingResponse(target, options);
            
            if (result.success) {
                statistics.received++;
                statistics.times.push(result.time);
                
                const timeStr = result.time.toFixed(3);
                const ttlStr = result.ttl;
                
                this.addOutput(
                    `64 bytes from ${targetHost} (${targetIP}): icmp_seq=${this.currentPing} ttl=${ttlStr} time=${timeStr} ms`,
                    'text-cyan-400'
                );
            } else {
                this.addOutput(
                    `From ${targetHost} (${targetIP}): icmp_seq=${this.currentPing} ${result.error}`,
                    'text-red-400'
                );
            }
            
        }, options.interval);

        // Allow manual termination with Ctrl+C simulation
        setTimeout(() => {
            if (this.isRunning && options.continuous) {
                this.addOutput('', 'text-gray-400');
                this.addOutput('--- ping statistics ---', 'text-yellow-400');
                this.addOutput('Ping terminated by user', 'text-gray-400');
                this.isRunning = false;
            }
        }, 30000); // Auto-terminate continuous ping after 30 seconds for demo
    }

    resolveTarget(targetStr) {
        // Try to resolve using the loaded hosts data
        if (this.hostsData) {
            const host = this.hostsData.find(host => 
                host.hostname === targetStr || host.ip === targetStr
            );
            if (host) {
                return {
                    ...host,
                    reachable: true,
                    responseTime: this.generateResponseTime()
                };
            }
        }

        // Check if it looks like an IP address
        if (this.isValidIP(targetStr)) {
            return {
                ip: targetStr,
                hostname: null,
                reachable: true,
                responseTime: this.generateResponseTime()
            };
        }

        // Check if it looks like a hostname
        if (this.isValidHostname(targetStr)) {
            return {
                hostname: targetStr,
                ip: this.generateFakeIP(targetStr),
                reachable: Math.random() > 0.1, // 90% success rate for unknown hosts
                responseTime: this.generateResponseTime()
            };
        }

        return null;
    }

    simulatePingResponse(target, options) {
        // Simulate network conditions
        const packetLoss = this.getPacketLossRate(target);
        const isReachable = target.reachable !== false && Math.random() > packetLoss;
        
        if (!isReachable) {
            const errors = [
                'Destination Host Unreachable',
                'Request timeout',
                'Network is unreachable',
                'No route to host'
            ];
            return {
                success: false,
                error: errors[Math.floor(Math.random() * errors.length)]
            };
        }

        // Generate realistic response time based on target type
        const baseTime = this.getBaseResponseTime(target);
        const jitter = (Math.random() - 0.5) * baseTime * 0.2; // ±10% jitter
        const responseTime = Math.max(0.1, baseTime + jitter);

        return {
            success: true,
            time: responseTime,
            ttl: this.getTTL(target),
            size: options.packetSize
        };
    }

    getPacketLossRate(target) {
        // Simulate different packet loss rates based on target
        if (target.hostname && target.hostname.includes('vote')) {
            return 0.02; // 2% packet loss for voting systems (realistic)
        }
        
        if (target.ip && target.ip.startsWith('192.168.')) {
            return 0.001; // 0.1% packet loss for local network
        }
        
        return 0.05; // 5% packet loss for unknown hosts
    }

    getBaseResponseTime(target) {
        // Generate realistic response times based on target type and location
        if (target.hostname && target.hostname.includes('vote')) {
            return Math.random() * 2 + 0.5; // 0.5-2.5ms for local voting systems
        }
        
        if (target.ip && target.ip.startsWith('192.168.')) {
            return Math.random() * 1 + 0.2; // 0.2-1.2ms for local network
        }
        
        if (target.ip && target.ip.startsWith('10.')) {
            return Math.random() * 0.5 + 0.1; // 0.1-0.6ms for very local network
        }
        
        // Simulate internet hosts
        return Math.random() * 50 + 10; // 10-60ms for internet hosts
    }

    getTTL(target) {
        // Generate realistic TTL values based on target type
        if (target.ip && (target.ip.startsWith('192.168.') || target.ip.startsWith('10.'))) {
            return 64; // Local network TTL
        }
        
        // Simulate different OS/network device TTLs
        const ttlValues = [64, 128, 255, 254, 60, 62];
        return ttlValues[Math.floor(Math.random() * ttlValues.length)];
    }

    showStatistics(targetHost, stats) {
        if (stats.transmitted === 0) return;
        
        this.addOutput('');
        this.addOutput(`--- ${targetHost} ping statistics ---`, 'text-yellow-400');
        
        const lossPercent = Math.round(((stats.transmitted - stats.received) / stats.transmitted) * 100);
        this.addOutput(
            `${stats.transmitted} packets transmitted, ${stats.received} received, ${lossPercent}% packet loss`,
            lossPercent > 10 ? 'text-red-400' : 'text-green-400'
        );
        
        if (stats.times.length > 0) {
            const min = Math.min(...stats.times);
            const max = Math.max(...stats.times);
            const avg = stats.times.reduce((a, b) => a + b, 0) / stats.times.length;
            const mdev = this.calculateMdev(stats.times, avg);
            
            this.addOutput(
                `rtt min/avg/max/mdev = ${min.toFixed(3)}/${avg.toFixed(3)}/${max.toFixed(3)}/${mdev.toFixed(3)} ms`,
                'text-cyan-400'
            );
        }
    }

    calculateMdev(times, avg) {
        if (times.length <= 1) return 0;
        
        const variance = times.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / times.length;
        return Math.sqrt(variance);
    }

    generateFakeIP(hostname) {
        // Generate a consistent fake IP based on hostname
        let hash = 0;
        for (let i = 0; i < hostname.length; i++) {
            hash = ((hash << 5) - hash + hostname.charCodeAt(i)) & 0xffffffff;
        }
        
        // Generate IP in various ranges
        const ranges = [
            () => `192.168.${Math.abs(hash) % 255}.${Math.abs(hash >> 8) % 255}`,
            () => `10.${Math.abs(hash) % 255}.${Math.abs(hash >> 8) % 255}.${Math.abs(hash >> 16) % 255}`,
            () => `172.${16 + Math.abs(hash) % 16}.${Math.abs(hash >> 8) % 255}.${Math.abs(hash >> 16) % 255}`,
            () => `${Math.abs(hash) % 223 + 1}.${Math.abs(hash >> 8) % 255}.${Math.abs(hash >> 16) % 255}.${Math.abs(hash >> 24) % 255}`
        ];
        
        return ranges[Math.abs(hash) % ranges.length]();
    }

    isValidIP(str) {
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(str)) return false;
        
        return str.split('.').every(part => {
            const num = parseInt(part);
            return num >= 0 && num <= 255;
        });
    }

    isValidHostname(str) {
        const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return hostnameRegex.test(str) && str.length <= 253;
    }

    showBasicUsage() {
        this.addOutput('Usage: ping [OPTION...] HOST');
        this.addOutput('Send ICMP ECHO_REQUEST packets to network hosts.');
        this.addOutput('');
        this.addOutput('Examples:');
        this.addOutput('  ping vote.municipality.gov');
        this.addOutput('  ping -c 10 192.168.100.10');
        this.addOutput('  ping -i 0.5 vote-db.municipality.gov');
        this.addOutput('');
        this.addOutput('Try `ping --help` for more options');
    }

    getHelp() {
        return {
            name: 'ping',
            description: 'Send ICMP ECHO_REQUEST packets to network hosts',
            usage: 'ping [OPTIONS] destination',
            options: [
                { flag: '-c <count>', description: 'Stop after sending count packets' },
                { flag: '-i <interval>', description: 'Wait interval seconds between sending packets' },
                { flag: '-s <size>', description: 'Packet size in bytes (default: 32)' },
                { flag: '-t', description: 'Ping continuously until interrupted' },
                { flag: '-W <timeout>', description: 'Timeout in seconds to wait for response' },
                { flag: '-v', description: 'Verbose output' },
                { flag: '--help', description: 'Show this help message' }
            ]
        };
    }

    showHelp() {
        const help = this.getHelp();
        this.addOutput(`${help.name} - ${help.description}`, 'text-green-400');
        this.addOutput('');
        this.addOutput(`Usage: ${help.usage}`);
        this.addOutput('');
        this.addOutput('OPTIONS:', 'text-blue-400');
        help.options.forEach(option => {
            this.addOutput(`  ${option.flag.padEnd(15)} ${option.description}`);
        });
        this.addOutput('');
        this.addOutput('EXAMPLES:', 'text-blue-400');
        this.addOutput('  ping vote.municipality.gov');
        this.addOutput('  ping -c 5 vote-db.municipality.gov');
        this.addOutput('  ping -i 0.2 -c 10 192.168.100.10');
        this.addOutput('  ping -s 1024 vote-admin.municipality.gov');
        this.addOutput('  ping -t 8.8.8.8  # Continuous ping');
        this.addOutput('');
        this.addOutput('NOTE:', 'text-yellow-400');
        this.addOutput('  This is a simulated ping command for the CyberQuest environment.');
        this.addOutput('  It tests connectivity to hosts in the target registry and simulates');
        this.addOutput('  realistic network conditions including packet loss and latency.');
    }

    // Method to stop ping (useful for continuous mode)
    stop() {
        this.isRunning = false;
        this.addOutput('');
        this.addOutput('Ping stopped by user', 'text-yellow-400');
    }
}
