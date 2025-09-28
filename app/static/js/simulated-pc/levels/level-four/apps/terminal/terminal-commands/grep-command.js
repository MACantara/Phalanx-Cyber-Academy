import { BaseCommand } from './base-command.js';

export class GrepCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'grep',
            description: 'Search for patterns in files',
            usage: 'grep [options] pattern [file...]',
            options: [
                { flag: '-i', description: 'Ignore case distinctions' },
                { flag: '-n', description: 'Show line numbers' },
                { flag: '-r', description: 'Search recursively through directories' },
                { flag: '-l', description: 'Show only filenames that contain matches' },
                { flag: '-v', description: 'Invert match (show lines that don\'t match)' },
                { flag: '--help', description: 'Display this help and exit' }
            ]
        };
    }

    async execute(args) {
        if (args.includes('--help') || args.length === 0) {
            this.showHelp();
            return;
        }

        // Parse options and arguments
        const options = {
            ignoreCase: false,
            showLineNumbers: false,
            recursive: false,
            filesOnly: false,
            invert: false
        };
        
        let pattern = '';
        let files = [];
        let optionsParsed = false;
        
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            
            if (arg.startsWith('-') && !optionsParsed) {
                // Parse options
                if (arg.includes('i')) options.ignoreCase = true;
                if (arg.includes('n')) options.showLineNumbers = true;
                if (arg.includes('r')) options.recursive = true;
                if (arg.includes('l')) options.filesOnly = true;
                if (arg.includes('v')) options.invert = true;
            } else if (!pattern) {
                pattern = arg;
                optionsParsed = true;
            } else {
                files.push(arg);
            }
        }

        if (!pattern) {
            this.addOutput('Error: No pattern specified', 'text-red-500');
            return;
        }

        // If no files specified, search in current directory
        if (files.length === 0) {
            if (options.recursive) {
                files = await this.getAllFilesRecursive(this.getCurrentDirectory());
            } else {
                const items = await this.fileSystem.listDirectory(this.getCurrentDirectory());
                files = items.filter(item => item.type === 'file').map(item => item.name);
            }
        }

        // Perform search
        let totalMatches = 0;
        const results = [];

        for (const filename of files) {
            const filePath = this.fileSystem.resolvePath(this.getCurrentDirectory(), filename);
            
            // Check if file exists by trying to extract directory and filename
            const pathParts = filePath.split('/');
            const fileName = pathParts.pop();
            const dirPath = pathParts.join('/') || '/';
            
            const content = await this.fileSystem.readFile(dirPath, fileName);
            if (content === null) {
                this.addOutput(`grep: ${filename}: No such file or directory`, 'text-red-500');
                continue;
            }

            const matches = this.searchInContent(content, pattern, options, filename);
            if (matches.length > 0) {
                results.push({ filename, matches });
                totalMatches += matches.length;
            }
        }

        // Display results
        if (totalMatches === 0) {
            this.addOutput('No matches found.');
        } else {
            this.displayResults(results, options, files.length > 1);
        }

        // Track evidence patterns for Level 5
        this.trackEvidencePatterns(pattern, results);
    }

    searchInContent(content, pattern, options, filename) {
        const lines = content.split('\n');
        const matches = [];
        
        // Create regex for pattern matching
        const flags = options.ignoreCase ? 'gi' : 'g';
        let regex;
        
        try {
            regex = new RegExp(pattern, flags);
        } catch (e) {
            // If pattern is not valid regex, treat as literal string
            const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            regex = new RegExp(escapedPattern, flags);
        }

        lines.forEach((line, index) => {
            const isMatch = regex.test(line);
            
            // Apply invert option
            if (options.invert ? !isMatch : isMatch) {
                matches.push({
                    lineNumber: index + 1,
                    line: line,
                    filename: filename
                });
            }
        });

        return matches;
    }

    displayResults(results, options, multipleFiles) {
        results.forEach(({ filename, matches }) => {
            if (options.filesOnly) {
                this.addOutput(filename, 'text-blue-500');
            } else {
                matches.forEach(match => {
                    let output = '';
                    
                    if (multipleFiles) {
                        output += `${filename}:`;
                    }
                    
                    if (options.showLineNumbers) {
                        output += `${match.lineNumber}:`;
                    }
                    
                    output += match.line;
                    
                    // Highlight matches in the output
                    const className = match.line.toLowerCase().includes('null') || 
                                    match.line.toLowerCase().includes('cipher') || 
                                    match.line.toLowerCase().includes('192.168.1.100') ? 'suspicious-content' : '';
                    
                    this.addOutput(output, className);
                });
            }
        });
    }

    async getAllFilesRecursive(directory) {
        const files = [];
        
        const traverse = async (dir) => {
            const items = await this.fileSystem.listDirectory(dir, true); // Include hidden files
            
            for (const item of items) {
                if (item.name === '.' || item.name === '..') continue;
                
                const fullPath = dir === '/' ? `/${item.name}` : `${dir}/${item.name}`;
                
                if (item.type === 'file') {
                    files.push(fullPath);
                } else if (item.type === 'directory') {
                    if (await this.fileSystem.directoryExists(fullPath)) {
                        await traverse(fullPath);
                    }
                }
            }
        };
        
        await traverse(directory);
        return files;
    }

    trackEvidencePatterns(pattern, results) {
        // Check if this is Level 5 and track pattern discovery
        const level5Started = localStorage.getItem('cyberquest_level_5_started');
        if (level5Started && window.evidenceTracker) {
            const patternLower = pattern.toLowerCase();
            
            // Check for key patterns
            if (patternLower.includes('192.168.1.100') || 
                results.some(r => r.matches.some(m => m.line.includes('192.168.1.100')))) {
                window.evidenceTracker.markPatternFound('ip_address_192.168.1.100');
            }
            
            if (patternLower.includes('n4ll') || patternLower.includes('null') ||
                results.some(r => r.matches.some(m => m.line.toLowerCase().includes('n4ll')))) {
                window.evidenceTracker.markPatternFound('signature_n4ll');
            }
            
            if (patternLower.includes('tuesday') && patternLower.includes('2am') ||
                results.some(r => r.matches.some(m => {
                    const line = m.line.toLowerCase();
                    return line.includes('tuesday') && line.includes('2am');
                }))) {
                window.evidenceTracker.markPatternFound('timing_tuesday_2am');
            }
            
            // Check for evidence files discovered
            results.forEach(result => {
                const evidenceFiles = ['bot_logs.txt', 'email_headers.txt', 'malware_code.txt', 'login_logs.txt', 'hidden_message.txt'];
                if (evidenceFiles.includes(result.filename)) {
                    window.evidenceTracker.markEvidenceFound(result.filename);
                }
            });
        }
    }
}
