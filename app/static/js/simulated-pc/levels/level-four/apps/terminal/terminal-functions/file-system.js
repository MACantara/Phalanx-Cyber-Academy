import { loadAllLevel4Data } from '../../../data/index.js';

export class FileSystem {
    constructor() {
        this.files = {};
        this.currentUser = 'researcher';
        this.initialized = false;
        
        // Initialize the file system data
        this.initializeFileSystem();
    }

    async initializeFileSystem() {
        try {
            const data = await loadAllLevel4Data();
            if (data && data.fileSystem) {
                this.files = data.fileSystem;
                this.initialized = true;
                console.log('File system initialized with CTF data');
            } else {
                console.error('Failed to load CTF file system data, using fallback');
                this.initializeFallbackFileSystem();
            }
        } catch (error) {
            console.error('Error loading CTF file system:', error);
            this.initializeFallbackFileSystem();
        }
    }

    initializeFallbackFileSystem() {
        // Minimal fallback file system if loading fails
        this.files = {
            '/': {
                type: 'directory',
                contents: {
                    'home': { type: 'directory', contents: {} }
                }
            },
            '/home': {
                type: 'directory',
                contents: {
                    'researcher': { type: 'directory', contents: {} }
                }
            },
            '/home/researcher': {
                type: 'directory',
                contents: {
                    'readme.txt': {
                        type: 'file',
                        content: 'File system data failed to load. Please refresh the page.',
                        size: 56
                    }
                }
            }
        };
        this.initialized = true;
    }

    // Wait for initialization before proceeding with operations
    async waitForInitialization() {
        if (this.initialized) return;
        
        // Wait up to 5 seconds for initialization
        const startTime = Date.now();
        while (!this.initialized && (Date.now() - startTime) < 5000) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!this.initialized) {
            console.warn('File system initialization timeout, using fallback');
            this.initializeFallbackFileSystem();
        }
    }

    async listDirectory(path, showHidden = false) {
        await this.waitForInitialization();
        
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

    async readFile(directory, filename) {
        await this.waitForInitialization();
        
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

    async directoryExists(path) {
        await this.waitForInitialization();
        
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
