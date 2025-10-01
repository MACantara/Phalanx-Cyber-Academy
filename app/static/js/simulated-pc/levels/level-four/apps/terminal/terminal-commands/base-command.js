export class BaseCommand {
    constructor(processor) {
        this.processor = processor;
        this.fileSystem = processor.fileSystem;
        this.terminalApp = processor.terminalApp;
    }

    execute(args) {
        throw new Error('Command must implement execute method');
    }

    getHelp() {
        return {
            name: this.constructor.name.replace('Command', '').toLowerCase(),
            description: 'No description available',
            usage: 'command',
            options: []
        };
    }

    showHelp() {
        const help = this.getHelp();
        this.addOutput(`Usage: ${help.usage}`);
        this.addOutput(`Description: ${help.description}`);
        if (help.options.length > 0) {
            this.addOutput('Options:');
            help.options.forEach(option => {
                this.addOutput(`  ${option.flag.padEnd(12)} ${option.description}`);
            });
        }
    }

    addOutput(text, className = '') {
        this.processor.addOutput(text, className);
    }

    getCurrentDirectory() {
        return this.processor.currentDirectory;
    }

    setCurrentDirectory(path) {
        this.processor.currentDirectory = path;
    }

    getUsername() {
        return this.processor.username;
    }

    getHostname() {
        return this.processor.hostname;
    }

    /**
     * Resolve a file or directory path (relative or absolute)
     * @param {string} path - Path to resolve
     * @returns {string} - Resolved absolute path
     */
    resolvePath(path) {
        if (!path) return this.getCurrentDirectory();
        
        // Use command registry's path resolution utilities
        return this.processor.commandRegistry.resolvePath(this.getCurrentDirectory(), path);
    }

    /**
     * Parse a file path into directory and filename components
     * @param {string} filePath - File path to parse
     * @returns {object} - Object with directory and filename properties
     */
    parseFilePath(filePath) {
        return this.processor.commandRegistry.parseFilePath(filePath);
    }

    /**
     * Check if a path is absolute
     * @param {string} path - Path to check
     * @returns {boolean} - True if absolute path
     */
    isAbsolutePath(path) {
        return this.processor.commandRegistry.isAbsolutePath(path);
    }

    /**
     * Join path components safely
     * @param {...string} components - Path components to join
     * @returns {string} - Joined path
     */
    joinPath(...components) {
        return this.processor.commandRegistry.joinPath(...components);
    }

    /**
     * Read file with path resolution
     * @param {string} filePath - File path (relative or absolute)
     * @returns {Promise<string|null>} - File content or null if not found
     */
    async readFile(filePath) {
        if (this.isAbsolutePath(filePath)) {
            const { directory, filename } = this.parseFilePath(filePath);
            return await this.fileSystem.readFile(directory, filename);
        } else {
            return await this.fileSystem.readFile(this.getCurrentDirectory(), filePath);
        }
    }

    /**
     * Check if file exists with path resolution
     * @param {string} filePath - File path (relative or absolute)
     * @returns {Promise<boolean>} - True if file exists
     */
    async fileExists(filePath) {
        if (this.isAbsolutePath(filePath)) {
            const { directory, filename } = this.parseFilePath(filePath);
            return await this.fileSystem.fileExists(directory, filename);
        } else {
            return await this.fileSystem.fileExists(this.getCurrentDirectory(), filePath);
        }
    }

    /**
     * Check if directory exists with path resolution
     * @param {string} dirPath - Directory path (relative or absolute)
     * @returns {Promise<boolean>} - True if directory exists
     */
    async directoryExists(dirPath) {
        const resolvedPath = this.resolvePath(dirPath);
        return await this.fileSystem.directoryExists(resolvedPath);
    }

    /**
     * List directory contents with path resolution
     * @param {string} dirPath - Directory path (relative or absolute)
     * @param {boolean} showHidden - Whether to show hidden files
     * @returns {Promise<Array>} - Array of directory contents
     */
    async listDirectory(dirPath, showHidden = false) {
        const resolvedPath = this.resolvePath(dirPath || '.');
        return await this.fileSystem.listDirectory(resolvedPath, showHidden);
    }
}
