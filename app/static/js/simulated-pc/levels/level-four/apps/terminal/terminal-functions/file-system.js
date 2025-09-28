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
                    'home': { 
                        type: 'directory', 
                        contents: {
                            'researcher': { 
                                type: 'directory', 
                                contents: {
                                    'readme.txt': {
                                        type: 'file',
                                        content: 'File system data failed to load. Please refresh the page.',
                                        size: 56
                                    }
                                }
                            }
                        }
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

    // Helper method to navigate nested directory structure
    getDirectoryData(path) {
        if (path === '/') {
            return this.files['/'];
        }

        // Navigate through nested structure
        const parts = path.split('/').filter(part => part !== '');
        let current = this.files['/'];
        
        for (const part of parts) {
            if (!current || !current.contents || !current.contents[part]) {
                return null;
            }
            current = current.contents[part];
        }
        
        return current;
    }

    // Helper method to get file data from nested structure
    getFileData(directory, filename) {
        const dirData = this.getDirectoryData(directory);
        if (!dirData || dirData.type !== 'directory') {
            return null;
        }

        const contents = dirData.contents || {};
        return contents[filename] || null;
    }

    async   listDirectory(path, showHidden = false) {
        await this.waitForInitialization();
        
        const dir = this.getDirectoryData(path);
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
        const contents = dir.contents || {};
        for (const [name, item] of Object.entries(contents)) {
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
        
        // Special handling for dynamic mission brief
        if (filename === 'mission_brief.txt' && directory === '/home/researcher') {
            return await this.getDynamicMissionBrief();
        }
        
        const file = this.getFileData(directory, filename);
        if (!file || file.type !== 'file') {
            return null;
        }

        // Process escape sequences in file content
        return this.processEscapeSequences(file.content);
    }

    async getDynamicMissionBrief() {
        try {
            const response = await fetch('/api/level4/mission-brief');
            if (!response.ok) {
                throw new Error(`Failed to load mission brief: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.success) {
                return data.content;
            } else {
                throw new Error(data.error || 'Unknown error loading mission brief');
            }
        } catch (error) {
            console.error('Error loading dynamic mission brief:', error);
            // Fallback to static content from nested JSON structure
            const file = this.getFileData('/home/researcher', 'mission_brief.txt');
            if (file) {
                return this.processEscapeSequences(file.content);
            }
            return 'Error: Unable to load mission brief. Please try again.';
        }
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
        
        const dir = this.getDirectoryData(path);
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
