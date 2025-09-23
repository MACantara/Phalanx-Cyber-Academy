import { PageRegistry } from '../../../levels/level-one/pages/page-registry.js';
import { ALL_EMAILS, loadEmailsFromCSV } from '../../../levels/level-two/emails/email-registry.js';

export class PacketCapture {
    constructor(networkMonitorApp) {
        this.app = networkMonitorApp;
        this.isCapturing = false;
        this.captureInterval = null;
        this.packetQueue = [];
        this.captureSpeed = 1500; // milliseconds between packets
        this.pageRegistry = new PageRegistry();
        this.trafficSources = this.initializeTrafficSources();
    }

    initializeTrafficSources() {
        return {
            websites: this.buildWebsiteTrafficSources(),
            email: this.buildEmailTrafficSources(),
            system: this.buildSystemTrafficSources()
        };
    }

    buildWebsiteTrafficSources() {
        const websites = [];
        const pages = this.pageRegistry.getAllPages();
        
        pages.forEach(page => {
            const domain = page.url.replace(/^https?:\/\//, '');
            const isSecure = page.url.startsWith('https://');
            const suspicious = page.securityLevel === 'dangerous';
            
            // Use the IP address from the page configuration
            const ip = page.ipAddress || this.generateIPFromDomain(domain);
            
            // Build traffic patterns based on page security level
            const patterns = this.buildWebsitePatterns(page, isSecure, suspicious);
            
            websites.push({
                domain: domain,
                ip: ip,
                suspicious: suspicious,
                securityLevel: page.securityLevel,
                patterns: patterns
            });
        });
        
        return websites;
    }

    buildEmailTrafficSources() {
        const emailSources = [];
        const uniqueServers = new Set();
        
        ALL_EMAILS.forEach(email => {
            // Extract server from email sender
            const serverDomain = this.extractServerFromEmail(email.sender);
            
            if (!uniqueServers.has(serverDomain)) {
                uniqueServers.add(serverDomain);
                
                const ip = this.generateIPFromDomain(serverDomain);
                const suspicious = email.suspicious || false;
                const patterns = this.buildEmailPatterns(serverDomain, suspicious);
                
                emailSources.push({
                    server: serverDomain,
                    ip: ip,
                    suspicious: suspicious,
                    patterns: patterns
                });
            }
        });
        
        return emailSources;
    }

    buildSystemTrafficSources() {
        return [
            {
                destination: '8.8.8.8',
                patterns: [
                    { protocol: 'DNS', info: 'System DNS lookup', weight: 2 }
                ]
            },
            {
                destination: '1.1.1.1',
                patterns: [
                    { protocol: 'DNS', info: 'CloudFlare DNS query', weight: 1 }
                ]
            },
            {
                destination: '192.168.1.1',
                patterns: [
                    { protocol: 'TCP', info: 'Router communication', weight: 1 },
                    { protocol: 'UDP', info: 'DHCP renewal', weight: 1 }
                ]
            }
        ];
    }

    buildWebsitePatterns(page, isSecure, suspicious) {
        const patterns = [];
        const domain = page.url.replace(/^https?:\/\//, '');
        const protocol = isSecure ? 'HTTPS' : 'HTTP';
        
        // DNS lookup (always first)
        patterns.push({
            protocol: 'DNS',
            info: `Standard query A ${domain}${suspicious ? ' [Suspicious domain]' : ''}`,
            weight: 1
        });

        if (suspicious) {
            // Suspicious site patterns
            patterns.push(
                {
                    protocol: protocol,
                    info: `GET ${this.getSuspiciousPath(page)} [${isSecure ? 'Self-signed cert' : 'Insecure'}]`,
                    weight: 3
                },
                {
                    protocol: protocol,
                    info: `POST /collect-data [${suspicious ? 'Suspicious' : 'Malicious'}]`,
                    weight: 2
                },
                {
                    protocol: 'TCP',
                    info: suspicious ? 'Connection to known scam server' : 'Data exfiltration attempt',
                    weight: 1
                }
            );
        } else {
            // Legitimate site patterns
            const securityInfo = this.getSecurityInfo(page);
            patterns.push(
                {
                    protocol: protocol,
                    info: `GET ${this.getLegitimateePath(page)} ${securityInfo}`,
                    weight: 3
                },
                {
                    protocol: protocol,
                    info: `GET /css/styles.css`,
                    weight: 2
                },
                {
                    protocol: protocol,
                    info: `GET /js/app.js`,
                    weight: 2
                },
                {
                    protocol: 'TCP',
                    info: this.getTLSInfo(page),
                    weight: 1
                }
            );
        }

        return patterns;
    }

    buildEmailPatterns(serverDomain, suspicious) {
        const patterns = [];
        
        if (suspicious) {
            patterns.push(
                {
                    protocol: 'SMTP',
                    info: `${this.getSuspiciousEmailType(serverDomain)} delivery [SUSPICIOUS]`,
                    weight: 3
                },
                {
                    protocol: 'HTTP',
                    info: 'Malicious link tracking',
                    weight: 2
                },
                {
                    protocol: 'TCP',
                    info: 'Suspicious mail relay',
                    weight: 1
                }
            );
        } else {
            patterns.push(
                {
                    protocol: 'SMTP',
                    info: `Legitimate email delivery from ${serverDomain}`,
                    weight: 2
                },
                {
                    protocol: 'IMAP',
                    info: 'Fetch inbox messages',
                    weight: 3
                },
                {
                    protocol: 'TCP',
                    info: 'Mail server connection',
                    weight: 1
                }
            );
        }

        return patterns;
    }

    // Helper methods for pattern generation
    extractServerFromEmail(emailAddress) {
        const domain = emailAddress.split('@')[1];
        return domain.includes('cyberquest.com') ? 'mail.cyberquest.com' : domain;
    }

    generateIPFromDomain(domain) {
        // Generate consistent IP addresses based on domain hash
        let hash = 0;
        for (let i = 0; i < domain.length; i++) {
            hash = ((hash << 5) - hash + domain.charCodeAt(i)) & 0xffffffff;
        }
        
        // Convert to IP components
        const a = Math.abs(hash % 223) + 1; // Avoid 0 and reserved ranges
        const b = Math.abs((hash >> 8) % 256);
        const c = Math.abs((hash >> 16) % 256);
        const d = Math.abs((hash >> 24) % 254) + 1; // Avoid .0
        
        return `${a}.${b}.${c}.${d}`;
    }

    getSuspiciousPath(page) {
        const suspiciousPaths = ['/win-prize.html', '/claim-now.php', '/urgent-verify', '/fake-login'];
        return suspiciousPaths[Math.floor(Math.random() * suspiciousPaths.length)];
    }

    getLegitimateePath(page) {
        if (page.url.includes('bank')) return '/login';
        if (page.url.includes('news')) return '/articles';
        if (page.url.includes('cyberquest')) return '/training';
        return '/index.html';
    }

    getSecurityInfo(page) {
        if (page.securityLevel === 'secure-ev') return '[Extended Validation]';
        if (page.securityLevel === 'secure') return '[Valid Certificate]';
        return '';
    }

    getTLSInfo(page) {
        if (page.securityLevel === 'secure-ev') return 'TLS 1.3 handshake [4096-bit RSA]';
        if (page.securityLevel === 'secure') return 'TLS 1.2 handshake';
        return 'TLS handshake';
    }

    getSuspiciousEmailType(serverDomain) {
        if (serverDomain.includes('verifysystem-alerts')) return 'Phishing email';
        if (serverDomain.includes('totally-real')) return 'Spam email [Nigerian Prince]';
        return 'Suspicious email';
    }

    startCapture() {
        if (this.isCapturing) return;
        
        this.isCapturing = true;
        
        this.updateCaptureButton();
        
        // Show capture started message
        this.showCaptureStarted();
    }

    stopCapture() {
        if (!this.isCapturing) return;
        
        this.isCapturing = false;
        if (this.captureInterval) {
            clearInterval(this.captureInterval);
            this.captureInterval = null;
        }
        
        this.updateCaptureButton();
        
        // Show capture stopped message
        this.showCaptureStopped();
    }

    showCaptureStarted() {
        if (!this.isCapturing) return;
        
        const startPacket = {
            id: 'capture-start-' + Date.now(),
            time: new Date().toTimeString().split(' ')[0],
            source: 'SYSTEM',
            destination: 'MONITOR',
            protocol: 'INFO',
            info: 'Network capture started - monitoring user activity',
            suspicious: false,
            isAlert: true
        };
        
        this.packetQueue.push(startPacket);
        this.app.addPacketToList(startPacket);
    }

    showCaptureStopped() {
        const stopPacket = {
            id: 'capture-stop-' + Date.now(),
            time: new Date().toTimeString().split(' ')[0],
            source: 'SYSTEM',
            destination: 'MONITOR',
            protocol: 'INFO',
            info: 'Network capture stopped',
            suspicious: false,
            isAlert: true
        };
        
        this.packetQueue.push(stopPacket);
        this.app.addPacketToList(stopPacket);
    }

    // Enhanced website traffic generation with more detailed packets
    generateWebsiteTraffic(url) {
        if (!this.isCapturing) return;
        
        const domain = url.replace(/^https?:\/\//, '');
        const website = this.trafficSources.websites.find(site => site.domain === domain);
        
        if (website) {
            // Generate a realistic sequence of packets for this website
            website.patterns.forEach((pattern, index) => {
                setTimeout(() => {
                    // Outgoing packet
                    const packet = {
                        id: Date.now() + Math.random(),
                        time: new Date().toTimeString().split(' ')[0],
                        source: '192.168.1.100',
                        destination: website.ip, // Use the IP from page configuration
                        protocol: pattern.protocol,
                        info: pattern.info,
                        suspicious: website.suspicious
                    };
                    this.packetQueue.push(packet);
                    this.app.addPacketToList(packet);
                    
                    // Simulate response if it's an HTTP/HTTPS request
                    if (pattern.protocol === 'HTTP' || pattern.protocol === 'HTTPS') {
                        setTimeout(() => {
                            const responsePacket = {
                                id: Date.now() + Math.random(),
                                time: new Date().toTimeString().split(' ')[0],
                                source: website.ip, // Use the IP from page configuration
                                destination: '192.168.1.100',
                                protocol: pattern.protocol,
                                info: pattern.info.replace('GET', 'Response: 200 OK').replace('POST', 'Response: 200 OK'),
                                suspicious: website.suspicious
                            };
                            this.packetQueue.push(responsePacket);
                            this.app.addPacketToList(responsePacket);
                        }, index * 150);
                    }
                }, index * 200);
            });
        }
    }

    generateEmailTraffic(emailSender) {
        if (!this.isCapturing) return;
        
        const serverDomain = this.extractServerFromEmail(emailSender);
        const emailServer = this.trafficSources.email.find(e => e.server === serverDomain);
        
        if (emailServer) {
            // Generate email-related traffic sequence
            emailServer.patterns.forEach((pattern, index) => {
                setTimeout(() => {
                    const packet = {
                        id: Date.now() + Math.random(),
                        time: new Date().toTimeString().split(' ')[0],
                        source: emailServer.server,
                        destination: '192.168.1.100',
                        protocol: pattern.protocol,
                        info: pattern.info,
                        suspicious: emailServer.suspicious
                    };
                    this.packetQueue.push(packet);
                    this.app.addPacketToList(packet);
                }, index * 300);
            });
        }
    }

    // Generate background system traffic only when specifically triggered
    generateSystemTraffic(triggerReason = 'System activity') {
        if (!this.isCapturing) return;
        
        // Only generate minimal system traffic when actually needed
        const systemPacket = {
            id: Date.now() + Math.random(),
            time: new Date().toTimeString().split(' ')[0],
            source: '192.168.1.100',
            destination: '8.8.8.8',
            protocol: 'DNS',
            info: `System DNS lookup - ${triggerReason}`,
            suspicious: false
        };
        
        this.packetQueue.push(systemPacket);
        this.app.addPacketToList(systemPacket);
    }

    updateCaptureButton() {
        const button = this.app.windowElement?.querySelector('#live-capture-btn');
        if (button) {
            if (this.isCapturing) {
                button.textContent = 'Stop Capture';
                button.className = 'px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors duration-200 cursor-pointer';
            } else {
                button.textContent = 'Live Capture';
                button.className = 'px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors duration-200 cursor-pointer';
            }
        }
    }

    getPackets() {
        return this.packetQueue;
    }

    clearPackets() {
        this.packetQueue = [];
        this.app.clearPacketList();
        
        // Show empty state message
        if (this.isCapturing) {
            setTimeout(() => {
                this.showCaptureStarted();
            }, 100);
        }
    }
}