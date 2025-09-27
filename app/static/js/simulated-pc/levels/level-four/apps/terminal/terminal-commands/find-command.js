import { BaseCommand } from './base-command.js';

export class FindCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'find',
            description: 'Search for files and directories',
            usage: 'find [path] [options]',
            options: [
                { flag: '-name pattern', description: 'Search for files matching pattern (use quotes for patterns with spaces)' },
                { flag: '-type f', description: 'Find only files' },
                { flag: '-type d', description: 'Find only directories' },
                { flag: '--help', description: 'Display this help and exit' }
            ]
        };
    }

    execute(args) {
        if (args.includes('--help')) {
            this.showHelp();
            return;
        }

        let searchPath = this.getCurrentDirectory();
        let namePattern = null;
        let typeFilter = null;

        // Parse arguments
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            
            if (arg === '-name' && i + 1 < args.length) {
                namePattern = args[i + 1];
                i++; // Skip next argument as it's the pattern
            } else if (arg === '-type' && i + 1 < args.length) {
                typeFilter = args[i + 1];
                i++; // Skip next argument as it's the type
            } else if (!arg.startsWith('-') && i === 0) {
                // First non-option argument is the path
                searchPath = this.fileSystem.resolvePath(this.getCurrentDirectory(), arg);
            }
        }

        // Perform the search
        const results = this.searchFiles(searchPath, namePattern, typeFilter);
        
        if (results.length === 0) {
            this.addOutput('No files found matching the criteria.');
        } else {
            results.forEach(result => {
                const className = result.suspicious ? 'suspicious-file' : 
                                 result.hidden ? 'text-gray-500' : '';
                this.addOutput(result.path, className);
            });
        }

        // Track evidence discovery for Level 5
        this.trackEvidenceDiscovery(results, namePattern);
    }

    searchFiles(searchPath, namePattern, typeFilter) {
        const results = [];
        
        // Get all files in the search path
        const items = this.fileSystem.listDirectory(searchPath, true); // Include hidden files
        
        items.forEach(item => {
            // Skip . and .. entries
            if (item.name === '.' || item.name === '..') return;
            
            // Apply type filter
            if (typeFilter) {
                if (typeFilter === 'f' && item.type !== 'file') return;
                if (typeFilter === 'd' && item.type !== 'directory') return;
            }
            
            // Apply name pattern filter
            if (namePattern) {
                if (!this.matchesPattern(item.name, namePattern)) return;
            }
            
            // Build full path
            const fullPath = searchPath === '/' ? `/${item.name}` : `${searchPath}/${item.name}`;
            
            results.push({
                path: fullPath,
                name: item.name,
                type: item.type,
                suspicious: item.suspicious,
                hidden: item.hidden
            });
        });
        
        // Also search subdirectories recursively
        items.forEach(item => {
            if (item.type === 'directory' && item.name !== '.' && item.name !== '..') {
                const subPath = searchPath === '/' ? `/${item.name}` : `${searchPath}/${item.name}`;
                if (this.fileSystem.directoryExists(subPath)) {
                    const subResults = this.searchFiles(subPath, namePattern, typeFilter);
                    results.push(...subResults);
                }
            }
        });
        
        return results;
    }

    matchesPattern(filename, pattern) {
        // Convert shell pattern to regex
        // * matches any characters
        // ? matches any single character
        let regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        
        const regex = new RegExp(`^${regexPattern}$`, 'i');
        return regex.test(filename);
    }

    trackEvidenceDiscovery(results, pattern) {
        // Check if this is Level 5 and track evidence discovery
        const level5Started = localStorage.getItem('cyberquest_level_5_started');
        if (level5Started && window.evidenceTracker) {
            results.forEach(result => {
                // Check for evidence files
                const evidenceFiles = ['bot_logs.txt', 'email_headers.txt', 'malware_code.txt', 'login_logs.txt', 'hidden_message.txt'];
                if (evidenceFiles.includes(result.name)) {
                    window.evidenceTracker.markEvidenceFound(result.name);
                }
                
                // Check for patterns in search
                if (pattern && pattern.toLowerCase().includes('null')) {
                    window.evidenceTracker.markPatternFound('signature_n4ll');
                }
            });
        }
    }
}
