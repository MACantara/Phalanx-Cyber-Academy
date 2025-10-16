export class BaseEmail {
    constructor(config) {
        this.id = config.id;
        this.folder = config.folder || 'inbox';
        this.sender = config.sender;
        this.subject = config.subject;
        // Convert relative time to actual timestamp
        this.timestamp = config.timestamp || this.parseRelativeTime(config.time);
        this.suspicious = config.suspicious || false;
        this.priority = config.priority || 'normal'; // low, normal, high
        this.attachments = config.attachments || [];
    }

    // Abstract method - must be implemented by subclasses
    createBody() {
        throw new Error('createBody() must be implemented by subclasses');
    }

    // Get the email body (calls createBody internally)
    get body() {
        return this.createBody();
    }

    // Get formatted time for display
    get time() {
        return this.formatTimestamp(this.timestamp);
    }

    // Get full date and time for detailed view
    get fullDateTime() {
        return this.formatFullDateTime(this.timestamp);
    }

    // Parse relative time strings into actual timestamps
    parseRelativeTime(timeString) {
        const now = new Date();
        const lowerTime = timeString.toLowerCase();
        
        if (lowerTime.includes('min ago')) {
            const minutes = parseInt(lowerTime);
            return new Date(now.getTime() - (minutes * 60 * 1000));
        } else if (lowerTime.includes('hour ago') || lowerTime.includes('hours ago')) {
            const hours = parseInt(lowerTime);
            return new Date(now.getTime() - (hours * 60 * 60 * 1000));
        } else if (lowerTime.includes('yesterday')) {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            yesterday.setHours(14, 30, 0, 0); // Set to 2:30 PM
            return yesterday;
        } else if (lowerTime.includes('day ago') || lowerTime.includes('days ago')) {
            const days = parseInt(lowerTime);
            const daysAgo = new Date(now);
            daysAgo.setDate(now.getDate() - days);
            daysAgo.setHours(10, 15, 0, 0); // Set to 10:15 AM
            return daysAgo;
        } else if (lowerTime.includes('last week')) {
            const lastWeek = new Date(now);
            lastWeek.setDate(now.getDate() - 7);
            lastWeek.setHours(16, 45, 0, 0); // Set to 4:45 PM
            return lastWeek;
        } else {
            // If it's already a proper date string, parse it
            const parsed = new Date(timeString);
            return isNaN(parsed.getTime()) ? now : parsed;
        }
    }

    // Format timestamp for email list display
    formatTimestamp(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        // If today, show time
        if (diffInHours < 24 && date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        }
        
        // If yesterday
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday ${date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            })}`;
        }
        
        // If this year, show month/day and time
        if (date.getFullYear() === now.getFullYear()) {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            }) + ', ' + date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        }
        
        // If older, show full date
        return date.toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'short', 
            day: 'numeric' 
        });
    }

    // Format full date and time for email detail view
    formatFullDateTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short'
        });
    }

    // Helper method to extract domain from sender
    getSenderDomain() {
        return this.sender.split('@')[1];
    }

    // Helper method to check if email is from a trusted domain
    isFromTrustedDomain() {
        const trustedDomains = ['example.com', 'securebank.com'];
        return trustedDomains.includes(this.getSenderDomain());
    }

    // Helper method to get email server
    getEmailServer() {
        const domain = this.getSenderDomain();
        return domain.includes('example.com') ? 'mail.example.com' : domain;
    }

    // Static method to create timestamps
    static createTimestamp(hoursAgo = 0, minutesAgo = 0) {
        const now = new Date();
        return new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
    }

    // Static method to create timestamp for specific date
    static createSpecificTimestamp(year, month, day, hour = 12, minute = 0) {
        return new Date(year, month - 1, day, hour, minute, 0, 0);
    }

    // Create styled container for email content
    createStyledContainer(content, containerClass = '', headerInfo = null) {
        const header = headerInfo ? `
            <div class="flex items-center space-x-3 border-b border-gray-200 pb-3 mb-4">
                <div class="w-10 h-10 ${headerInfo.bgColor} rounded flex items-center justify-center">
                    <i class="bi bi-${headerInfo.icon} text-white text-lg"></i>
                </div>
                <div>
                    <span class="block text-base font-bold ${headerInfo.titleColor}">${headerInfo.title}</span>
                    <span class="block text-xs ${headerInfo.subtitleColor}">${headerInfo.subtitle}</span>
                </div>
            </div>
        ` : '';

        return `
            <div class="${containerClass} p-4 rounded-lg border">
                ${header}
                ${content}
            </div>
        `;
    }

    // Create email object compatible with existing system
    toEmailObject() {
        return {
            id: this.id,
            folder: this.folder,
            sender: this.sender,
            subject: this.subject,
            time: this.time,
            fullDateTime: this.fullDateTime,
            timestamp: this.timestamp,
            body: this.body,
            suspicious: this.suspicious,
            priority: this.priority,
            attachments: this.attachments
        };
    }
}
