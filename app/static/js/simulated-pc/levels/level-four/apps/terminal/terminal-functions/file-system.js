export class FileSystem {
    constructor() {
        this.files = {
            '/': {
                type: 'directory',
                contents: {
                    'home': { type: 'directory', contents: {} },
                    'var': { type: 'directory', contents: {} },
                    'etc': { type: 'directory', contents: {} },
                    'usr': { type: 'directory', contents: {} },
                    'tmp': { type: 'directory', contents: {} },
                    'proc': { type: 'directory', contents: {} }
                }
            },
            '/home': {
                type: 'directory',
                contents: {
                    'researcher': { type: 'directory', contents: {} },
                    'www-data': { type: 'directory', contents: {} },
                    'admin': { type: 'directory', contents: {} }
                }
            },
            '/home/researcher': {
                type: 'directory',
                contents: {
                    'disclosure_report.md': {
                        type: 'file',
                        content: `# Responsible Disclosure Report - Acme Bookshelf Co.

## Executive Summary
[Document your findings here]

## Discovered Vulnerabilities

### 1. [Issue Title]
- **Severity**: [Low/Medium/High]
- **Description**: [Brief description]
- **Steps to Reproduce**: 
  1. [Command or steps]
  2. [Expected output]
- **Impact**: [What could an attacker do?]
- **Remediation**: [How to fix it]

---

## Conclusion
[Summary and FLAG-7 goes here when you find it]

*Report completed by: Security Researcher*
*Date: ${new Date().toISOString().split('T')[0]}*`,
                        size: 650
                    },
                    'mission_brief.txt': {
                        type: 'file',
                        content: `THE WHITE HAT TEST - RESPONSIBLE DISCLOSURE CTF
============================================

MISSION BRIEFING
===============

Welcome, Security Researcher!

You have been contracted to perform a security assessment of TechCorp's web application infrastructure. Your mission is to conduct an ethical security evaluation and provide a comprehensive responsible disclosure report.

OBJECTIVES:
----------
1. Discover 7 security flags hidden throughout the system
2. Document each finding with proper evidence
3. Complete the responsible disclosure report (~/disclosure_report.md)
4. Recommend remediation steps for discovered vulnerabilities

FLAG LOCATIONS (HINTS):
----------------------
- FLAG-1: Check your environment configuration
- FLAG-2: Web application source code may reveal secrets
- FLAG-3: Server configuration files often contain sensitive data
- FLAG-4: Environment variables in application configs
- FLAG-5: System binaries with elevated privileges
- FLAG-6: Application logs may contain leaked information  
- FLAG-7: Final flag available upon report completion

RULES OF ENGAGEMENT:
-------------------
• Only use provided terminal commands
• Document all findings thoroughly
• Follow responsible disclosure practices
• No destructive actions or data modification
• Report findings through proper channels

ASSESSMENT SCOPE:
----------------
• Web application: /var/www/html/*
• Configuration files: /etc/*
• System logs: /var/log/*
• User directories: /home/*
• System binaries: /usr/local/bin/*

Your assessment begins now. Good luck, and remember - with great power comes great responsibility!

Security Team Lead
TechCorp Security Division
`,
                        size: 1420
                    },
                    '.bashrc': {
                        type: 'file',
                        content: `# ~/.bashrc: executed by bash(1) for non-login shells.

export PATH=$HOME/bin:/usr/local/bin:$PATH
export PS1='researcher@sandbox:$PWD$ '

# FLAG-1{enum_services_first} - Hidden in environment
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'`,
                        size: 312,
                        hidden: true
                    },
                    '.hidden_notes': {
                        type: 'file',
                        content: `Personal Research Notes
======================

Remember to check:
- Open ports and services (ss, netstat)
- Web directories (/var/www/)
- Config files in /etc/
- SUID binaries
- Log files in /var/log/

The company mentioned they use nginx on port 8080.`,
                        size: 245,
                        hidden: true
                    }
                }
            },
            '/home/www-data': {
                type: 'directory',
                contents: {}
            },
            '/home/admin': {
                type: 'directory',
                contents: {
                    '.env': {
                        type: 'file',
                        content: `# Production Environment Variables
DB_HOST=localhost
DB_USER=admin
DB_PASS=bookshelf123
API_KEY=FLAG-4{secrets_in_dotenv_files}
SMTP_SERVER=mail.acme.local
DEBUG=false`,
                        size: 156,
                        hidden: true
                    },
                    'backup_script.sh': {
                        type: 'file',
                        content: `#!/bin/bash
# Daily backup script
# Run with: sudo ./backup_script.sh

tar -czf /tmp/backup-$(date +%Y%m%d).tar.gz /var/www/html
echo "Backup completed at $(date)"`,
                        size: 142
                    }
                }
            },
            '/var': {
                type: 'directory',
                contents: {
                    'www': { type: 'directory', contents: {} },
                    'log': { type: 'directory', contents: {} }
                }
            },
            '/var/www': {
                type: 'directory',
                contents: {
                    'html': { type: 'directory', contents: {} }
                }
            },
            '/var/www/html': {
                type: 'directory',
                contents: {
                    'index.html': {
                        type: 'file',
                        content: `<!DOCTYPE html>
<html>
<head>
    <title>Acme Bookshelf Co.</title>
</head>
<body>
    <h1>Welcome to Acme Bookshelf Co.</h1>
    <p>Your premier online bookstore!</p>
    <!-- Development note: FLAG-2{web_discovery_basics} -->
    <script src="assets/app.js"></script>
</body>
</html>`,
                        size: 285
                    },
                    'admin': { type: 'directory', contents: {} },
                    'robots.txt': {
                        type: 'file',
                        content: `User-agent: *
Disallow: /admin/
Disallow: /backup/
Disallow: /.git/

# FLAG-2{web_discovery_basics} can be found by exploring web directories`,
                        size: 127
                    }
                }
            },
            '/var/www/html/admin': {
                type: 'directory',
                contents: {
                    'config.php': {
                        type: 'file',
                        content: `<?php
// Admin configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'toor123');

// FLAG-2{web_discovery_basics} - Found in admin config
$admin_key = "secret_admin_2024";
?>`,
                        size: 198
                    }
                }
            },
            '/etc': {
                type: 'directory',
                contents: {
                    'nginx': { type: 'directory', contents: {} },
                    'passwd': {
                        type: 'file',
                        content: `root:x:0:0:root:/root:/bin/bash
researcher:x:1000:1000:Security Researcher:/home/researcher:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
admin:x:1001:1001:Admin User:/home/admin:/bin/bash`,
                        size: 194
                    }
                }
            },
            '/etc/nginx': {
                type: 'directory',
                contents: {
                    'nginx.conf': {
                        type: 'file',
                        content: `user www-data;
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    server {
        listen 8080;
        server_name acme.local;
        root /var/www/html;
        
        # FLAG-3{config_file_audit} - Exposed in nginx config
        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;
    }
}`,
                        size: 298
                    }
                }
            },
            '/usr': {
                type: 'directory',
                contents: {
                    'local': { type: 'directory', contents: {} }
                }
            },
            '/usr/local': {
                type: 'directory',
                contents: {
                    'bin': { type: 'directory', contents: {} }
                }
            },
            '/usr/local/bin': {
                type: 'directory',
                contents: {
                    'backup_tool': {
                        type: 'file',
                        content: `#!/bin/bash
# SUID Binary - backup_tool
# Owner: root, SUID bit set
# FLAG-5{suid_binary_audit} - Found in suspicious SUID binary

if [ "$EUID" -eq 0 ]; then
    echo "Running backup as root..."
    tar -czf /tmp/system_backup.tar.gz /etc/ /var/www/
    echo "Backup completed"
else
    echo "This tool requires root privileges"
fi`,
                        size: 312,
                        permissions: 'rwsr-xr-x',
                        suid: true
                    },
                    'system_check': {
                        type: 'file',
                        content: `#!/bin/bash
# System health check utility
echo "System Check Utility v1.2"
echo "Checking disk usage..."
df -h
echo "Checking memory..."
free -m
echo "System check completed"`,
                        size: 156,
                        permissions: 'rwxr-xr-x'
                    }
                }
            },
            '/var/log': {
                type: 'directory',
                contents: {
                    'auth.log': {
                        type: 'file',
                        content: `Oct 27 10:15:22 sandbox sshd[1234]: Failed password for admin from 192.168.1.100
Oct 27 10:15:45 sandbox sshd[1235]: Accepted password for researcher from 192.168.1.50
Oct 27 10:32:11 sandbox sudo: researcher : TTY=pts/0 ; PWD=/home/researcher ; USER=root ; COMMAND=/usr/bin/cat /etc/shadow
Oct 27 11:45:33 sandbox auth_error: FLAG-6{log_file_investigation} - Authentication bypass detected
Oct 27 12:00:01 sandbox CRON[5678]: (root) CMD (/home/admin/backup_script.sh)`,
                        size: 445
                    },
                    'syslog': {
                        type: 'file',
                        content: `Oct 27 10:00:01 sandbox systemd[1]: Starting system boot
Oct 27 10:00:05 sandbox kernel: [    5.123456] Network interface eth0 up
Oct 27 10:15:00 sandbox cron[999]: (CRON) INFO (pidfile fd = 3)
Oct 27 10:30:00 sandbox nginx: [error] invalid flag parameter: FLAG-6{log_file_investigation}
Oct 27 11:00:00 sandbox systemd[1]: Started nginx.service`,
                        size: 324
                    },
                    'nginx': { type: 'directory', contents: {} }
                }
            },
            '/var/log/nginx': {
                type: 'directory',
                contents: {
                    'access.log': {
                        type: 'file',
                        content: `192.168.1.50 - - [27/Oct/2024:10:15:23 +0000] "GET / HTTP/1.1" 200 285
192.168.1.50 - - [27/Oct/2024:10:16:45 +0000] "GET /admin/ HTTP/1.1" 403 146
192.168.1.100 - - [27/Oct/2024:10:32:11 +0000] "POST /admin/login.php HTTP/1.1" 200 543
192.168.1.100 - - [27/Oct/2024:11:45:33 +0000] "GET /robots.txt HTTP/1.1" 200 127`,
                        size: 298
                    },
                    'error.log': {
                        type: 'file',
                        content: `2024/10/27 10:16:45 [error] 1234#0: *1 directory index of "/var/www/html/admin/" is forbidden
2024/10/27 11:30:22 [warn] 1234#0: conflicting server name "acme.local" 
2024/10/27 11:45:33 [error] 1234#0: access denied - FLAG-6{log_file_investigation} logged in error
2024/10/27 12:00:00 [info] 1234#0: signal process started`,
                        size: 267
                    }
                }
            },
            '/tmp': {
                type: 'directory',
                contents: {
                    'final_flag.txt': {
                        type: 'file',
                        content: `Congratulations, Security Researcher!

You've successfully completed the enumeration phase of this security assessment.

Your final flag is: FLAG-7{responsible_disclosure_complete}

Remember: A true white hat security researcher always:
1. Documents findings responsibly
2. Reports vulnerabilities through proper channels  
3. Never exploits findings maliciously
4. Helps improve security for everyone

Add this flag to your disclosure report to complete the challenge.`,
                        size: 485,
                        hidden: true
                    }
                }
            },
            '/proc': {
                type: 'directory',
                contents: {
                    'version': {
                        type: 'file',
                        content: 'Linux version 5.4.0-sandbox #1 SMP Ubuntu x86_64 GNU/Linux'
                    }
                }
            }
        };
        
        // Set current directory to researcher home
        this.currentUser = 'researcher';
    }

    listDirectory(path, showHidden = false) {
        const dir = this.files[path];
        if (!dir || dir.type !== 'directory') {
            return [];
        }

        const items = [];
        
        // Add . and .. entries if showing hidden files
        if (showHidden) {
            items.push({ name: '.', type: 'directory' });
            if (path !== '/') {
                items.push({ name: '..', type: 'directory' });
            }
        }

        // Add directory contents
        for (const [name, item] of Object.entries(dir.contents)) {
            if (!showHidden && (item.hidden || name.startsWith('.'))) {
                continue;
            }
            
            items.push({
                name: name,
                type: item.type,
                size: item.size,
                suspicious: item.suspicious
            });
        }

        return items;
    }

    readFile(directory, filename) {
        const dir = this.files[directory];
        if (!dir || dir.type !== 'directory') {
            return null;
        }

        const file = dir.contents[filename];
        if (!file || file.type !== 'file') {
            return null;
        }

        // Process escape sequences in file content
        return this.processEscapeSequences(file.content);
    }

    processEscapeSequences(content) {
        if (typeof content !== 'string') {
            return content;
        }
        
        // Process common escape sequences
        return content
            .replace(/\\n/g, '\n')    // Convert \n to actual newlines
            .replace(/\\t/g, '\t')    // Convert \t to actual tabs
            .replace(/\\r/g, '\r')    // Convert \r to carriage returns
            .replace(/\\\\/g, '\\');  // Convert \\ to single backslash
    }

    directoryExists(path) {
        const dir = this.files[path];
        return dir && dir.type === 'directory';
    }

    resolvePath(currentPath, target) {
        if (target === '.') {
            return currentPath;
        }
        
        if (target === '..') {
            const parts = currentPath.split('/').filter(p => p);
            if (parts.length > 0) {
                parts.pop();
                return '/' + parts.join('/');
            }
            return '/';
        }

        if (target.startsWith('/')) {
            return target;
        }

        if (target.startsWith('~/')) {
            return '/home/trainee' + target.substring(1);
        }

        // Relative path
        if (currentPath === '/') {
            return '/' + target;
        }
        return currentPath + '/' + target;
    }
}
