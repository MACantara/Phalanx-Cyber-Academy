export class FileSystem {
    constructor() {
        this.files = {
            '/home/trainee': {
                type: 'directory',
                contents: {
                    'Documents': { type: 'directory', contents: {} },
                    'Downloads': { type: 'directory', contents: {} },
                    'Desktop': { type: 'directory', contents: {} },
                    'Evidence': { type: 'directory', contents: {} },
                    'suspicious_file.txt': { 
                        type: 'file', 
                        content: 'WARNING: This file contains suspicious content!\nDo not execute or share this file.\nReport to security team immediately.',
                        suspicious: true,
                        size: 1337
                    },
                    'readme.txt': {
                        type: 'file',
                        content: 'Welcome to CyberQuest Training Environment!\n\nThis is a simulated terminal for cybersecurity training.\nExplore the file system and learn basic Linux commands.\n\nFor help, type: help',
                        size: 256
                    },
                    '.bashrc': {
                        type: 'file',
                        content: '# ~/.bashrc: executed by bash(1) for non-login shells.\nexport PATH=/usr/local/bin:/usr/bin:/bin\nPS1="\\u@\\h:\\w\\$ "',
                        size: 128,
                        hidden: true
                    }
                }
            },
            '/home/trainee/Documents': {
                type: 'directory',
                contents: {
                    'security_report.txt': {
                        type: 'file',
                        content: 'SECURITY INCIDENT REPORT\n========================\n\nDate: 2024-12-20\nIncident Type: Phishing Attempt\nStatus: Resolved\n\nA suspicious email was detected and quarantined.\nNo systems were compromised.',
                        size: 512
                    }
                }
            },
            '/home/trainee/Downloads': {
                type: 'directory',
                contents: {
                    'malware_sample.exe': {
                        type: 'file',
                        content: 'DANGER: This is a malware sample for training purposes only!\nDo not execute this file on a real system!',
                        suspicious: true,
                        size: 2048
                    }
                }
            },
            '/home/trainee/Evidence': {
                type: 'directory',
                contents: {
                    'bot_logs.txt': {
                        type: 'file',
                        content: 'Bot Network Activity Log\n========================\n[2024-08-01 14:32:15] Bot ID: N4LL-001 connecting from 192.168.1.100\n[2024-08-01 14:32:16] Command received: SCAN_NETWORK\n[2024-08-01 14:32:17] Target identified: vote.municipality.gov\n[2024-08-01 14:32:18] Payload deployed: exploit_db_v2.3\n[2024-08-01 14:32:19] Escalation attempt: ADMIN_OVERRIDE\n[2024-08-01 14:32:20] Connection established to C&C: nullcommand.onion\n[2024-08-01 14:32:21] Data exfiltration initiated\n[2024-08-01 14:32:22] Bot reporting to master: "THE_NULL"\n[2024-08-01 14:32:23] Next target queued: municipal-backup.local',
                        suspicious: true,
                        size: 2458
                    },
                    'email_headers.txt': {
                        type: 'file',
                        content: 'Email Header Analysis\n====================\nReceived: from unknown-sender.darkweb.onion\nDate: Mon, 01 Aug 2024 14:30:00 +0000\nFrom: "System Administrator" <nullsender@fake-domain.com>\nTo: admin@vote.municipality.gov\nSubject: Urgent Security Update Required\nX-Originating-IP: 192.168.1.100\nX-Spam-Score: 9.8/10.0\nX-Mailer: N4LL_MAILER_v1.2\nMessage-ID: <null001@darkcommand.onion>\nUser-Agent: The Null Command Center\nX-Priority: 1 (Highest)\nX-Custom-Header: SIGNATURE_N4LL_2024',
                        suspicious: true,
                        size: 1847
                    },
                    'malware_code.txt': {
                        type: 'file',
                        content: 'Malware Source Code Analysis\n============================\n// N4LL Backdoor v2.3\n// Author: [REDACTED]\n// Target: Municipal Voting Systems\n\nclass N4llBackdoor {\n    constructor() {\n        this.signature = "N4LL_SIGNATURE_2024";\n        this.command_server = "nullcommand.onion";\n        this.target_systems = ["vote.municipality.gov"];\n    }\n    \n    exploit() {\n        // SQL injection targeting voter database\n        let payload = "\\"; DROP TABLE voters; --";\n        this.executeCommand(payload);\n    }\n    \n    reportToMaster() {\n        // Report successful breach to "THE_NULL"\n        this.sendMessage("Target compromised - The Null");\n    }\n}',
                        suspicious: true,
                        size: 3241
                    },
                    'login_logs.txt': {
                        type: 'file',
                        content: 'Failed Login Attempts\n====================\n[2024-08-04 11:25:30] Failed login for user: admin from 192.168.1.100\n[2024-08-04 11:25:31] Failed login for user: root from 192.168.1.100\n[2024-08-04 11:25:32] Failed login for user: administrator from 192.168.1.100\n[2024-08-04 11:25:33] Failed login for user: dr.cipher from 192.168.1.100\n[2024-08-04 11:25:34] SUCCESSFUL login for user: dr.cipher from 192.168.1.100\n[2024-08-04 11:25:35] User dr.cipher accessed sensitive files\n[2024-08-04 11:25:36] User dr.cipher modified system configurations\n[2024-08-04 11:25:37] User dr.cipher initiated data transfer\n[2024-08-04 11:25:38] Connection terminated by dr.cipher',
                        suspicious: true,
                        size: 4187
                    },
                    'case_summary.txt': {
                        type: 'file',
                        content: 'Investigation Case Summary\n=========================\nCase ID: CYBERQUEST-L5-001\nDate Opened: 2024-08-05\nLead Investigator: [TRAINEE]\nStatus: ACTIVE\n\nSummary:\nA sophisticated cyber attack has been detected targeting municipal voting systems. The attacker, known as "The Null", has left various digital fingerprints across multiple systems. Evidence suggests the use of automated bots, phishing campaigns, and custom malware.\n\nKey Evidence:\n- Bot network logs showing C&C communications\n- Phishing email headers with suspicious origins\n- Custom malware with distinctive signatures\n- Login attempts showing credential stuffing\n\nObjective: Identify "The Null" and trace attack vectors.',
                        size: 1234
                    },
                    'timeline.txt': {
                        type: 'file',
                        content: 'Attack Timeline Reconstruction\n=============================\n2024-08-01 14:30:00 - Phishing email sent to admin@vote.municipality.gov\n2024-08-01 14:32:15 - Bot network activation from 192.168.1.100\n2024-08-01 14:32:17 - Initial reconnaissance of target systems\n2024-08-01 14:32:18 - Malware payload deployment\n2024-08-04 11:25:30 - Brute force login attempts begin\n2024-08-04 11:25:34 - Successful compromise of dr.cipher account\n2024-08-04 11:25:35 - Privilege escalation and data access\n2024-08-05 08:12:44 - Evidence of data exfiltration\n2024-08-05 10:00:00 - Investigation initiated',
                        size: 987
                    },
                    '.hidden': {
                        type: 'directory',
                        hidden: true,
                        contents: {
                            'hidden_message.txt': {
                                type: 'file',
                                content: 'CONFIDENTIAL COMMUNICATION LOG\n==============================\n[ENCRYPTED CHANNEL]\nFrom: The Null Command Center\nTo: Agent N4LL-001\n\nMission Status: SUCCESS\nTarget: Municipal Voting Database\nCompromised Accounts: dr.cipher@municipality.gov\nData Extracted: 47,382 voter records\nBackdoor Status: ACTIVE\n\nNext Phase: Prepare for election manipulation\nRendezvous Point: nullcommand.onion/secure\nSignature: THE_NULL_2024\n\n[END ENCRYPTED MESSAGE]\n\nNote: Dr. Cipher appears to be the mastermind behind "The Null" operation.\nReal identity: Dr. Marcus Cipher, Former IT Security Consultant\nKnown aliases: NullMaster, CipherNull, The_Null\nLast known location: Encrypted TOR network',
                                hidden: true,
                                size: 1337
                            }
                        }
                    }
                }
            },
            '/home/trainee/Evidence/.hidden': {
                type: 'directory',
                hidden: true,
                contents: {
                    'hidden_message.txt': {
                        type: 'file',
                        content: 'CONFIDENTIAL COMMUNICATION LOG\n==============================\n[ENCRYPTED CHANNEL]\nFrom: The Null Command Center\nTo: Agent N4LL-001\n\nMission Status: SUCCESS\nTarget: Municipal Voting Database\nCompromised Accounts: dr.cipher@municipality.gov\nData Extracted: 47,382 voter records\nBackdoor Status: ACTIVE\n\nNext Phase: Prepare for election manipulation\nRendezvous Point: nullcommand.onion/secure\nSignature: THE_NULL_2024\n\n[END ENCRYPTED MESSAGE]\n\nNote: O2ymandi4s appears to be the mastermind behind "The Null" operation.\nReal identity: Dr. Clarice "Cipher" Kim, Cybersecurity Instructor at CyberQuest Academy\nKnown aliases: O2ymandi4s, CipherNull, The_Null_Leader\nMotive: Revenge against academy due to dissatisfaction with its direction\nGoal: Wipe cyberspace clean for a fresh start\nStatus: Current employee with ideological grievances against the institution',
                        hidden: true,
                        size: 1337
                    }
                }
            }
        };
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

        return file.content;
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
