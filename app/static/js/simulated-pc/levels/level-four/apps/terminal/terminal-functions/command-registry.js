// Import essential terminal commands for beginner ethical hacking
import { LsCommand } from '../terminal-commands/ls-command.js';
import { CdCommand } from '../terminal-commands/cd-command.js';
import { CatCommand } from '../terminal-commands/cat-command.js';
import { PwdCommand } from '../terminal-commands/pwd-command.js';
import { WhoamiCommand } from '../terminal-commands/whoami-command.js';
import { ClearCommand } from '../terminal-commands/clear-command.js';
import { HelpCommand } from '../terminal-commands/help-command.js';
import { HistoryCommand } from '../terminal-commands/history-command.js';
import { EchoCommand } from '../terminal-commands/echo-command.js';
import { FindCommand } from '../terminal-commands/find-command.js';
import { GrepCommand } from '../terminal-commands/grep-command.js';
import { HintsCommand } from '../terminal-commands/hints-command.js';
import { SubmitFlagCommand } from '../terminal-commands/submit-flag-command.js';
import { SudoCommand } from '../terminal-commands/sudo-command.js';

export class CommandRegistry {
    constructor(processor) {
        this.processor = processor;
        this.commands = this.initializeCommands();
    }

    initializeCommands() {
        return {
            // Core file system commands
            'ls': new LsCommand(this.processor),
            'cd': new CdCommand(this.processor),
            'cat': new CatCommand(this.processor),
            'pwd': new PwdCommand(this.processor),
            'find': new FindCommand(this.processor),
            'grep': new GrepCommand(this.processor),
            
            // User information and privileges
            'whoami': new WhoamiCommand(this.processor),
            'sudo': new SudoCommand(this.processor),
            
            // Terminal utilities
            'clear': new ClearCommand(this.processor),
            'echo': new EchoCommand(this.processor),
            'history': new HistoryCommand(this.processor),
            'help': new HelpCommand(this.processor),
            
            // CTF specific commands
            'hints': new HintsCommand(this.processor),
            'submit-flag': new SubmitFlagCommand(this.processor)
        };
    }

    getCommand(commandName) {
        return this.commands[commandName.toLowerCase()];
    }

    hasCommand(commandName) {
        return commandName.toLowerCase() in this.commands;
    }

    getAllCommands() {
        return Object.keys(this.commands);
    }

    registerCommand(name, commandInstance) {
        this.commands[name.toLowerCase()] = commandInstance;
    }

    unregisterCommand(name) {
        delete this.commands[name.toLowerCase()];
    }

    /**
     * Resolve relative and absolute file paths
     * @param {string} currentDirectory - Current working directory
     * @param {string} targetPath - Target path (relative or absolute)
     * @returns {string} - Resolved absolute path
     */
    resolvePath(currentDirectory, targetPath) {
        // Handle absolute paths
        if (targetPath.startsWith('/')) {
            return this.normalizePath(targetPath);
        }

        // Handle relative paths
        let basePath = currentDirectory;
        let parts = targetPath.split('/').filter(part => part !== '');

        for (let part of parts) {
            if (part === '.') {
                // Current directory, no change
                continue;
            } else if (part === '..') {
                // Parent directory
                if (basePath !== '/') {
                    basePath = basePath.split('/').slice(0, -1).join('/') || '/';
                }
            } else {
                // Regular directory or file
                basePath = basePath === '/' ? `/${part}` : `${basePath}/${part}`;
            }
        }

        return this.normalizePath(basePath);
    }

    /**
     * Normalize path by removing duplicate slashes and ensuring proper format
     * @param {string} path - Path to normalize
     * @returns {string} - Normalized path
     */
    normalizePath(path) {
        // Remove duplicate slashes and normalize
        let normalized = path.replace(/\/+/g, '/');
        
        // Ensure it starts with /
        if (!normalized.startsWith('/')) {
            normalized = '/' + normalized;
        }

        // Remove trailing slash unless it's root
        if (normalized.length > 1 && normalized.endsWith('/')) {
            normalized = normalized.slice(0, -1);
        }

        return normalized;
    }

    /**
     * Parse file path to extract directory and filename
     * @param {string} filePath - Full file path
     * @returns {object} - Object with directory and filename properties
     */
    parseFilePath(filePath) {
        const lastSlash = filePath.lastIndexOf('/');
        if (lastSlash === -1) {
            return { directory: '/', filename: filePath };
        }

        const directory = filePath.substring(0, lastSlash) || '/';
        const filename = filePath.substring(lastSlash + 1);

        return { directory, filename };
    }

    /**
     * Check if a path is absolute
     * @param {string} path - Path to check
     * @returns {boolean} - True if absolute path
     */
    isAbsolutePath(path) {
        return path.startsWith('/');
    }

    /**
     * Get parent directory of a given path
     * @param {string} path - Directory path
     * @returns {string} - Parent directory path
     */
    getParentDirectory(path) {
        if (path === '/') return '/';
        
        const normalized = this.normalizePath(path);
        const parts = normalized.split('/').filter(part => part !== '');
        
        if (parts.length <= 1) return '/';
        
        return '/' + parts.slice(0, -1).join('/');
    }

    /**
     * Join path components safely
     * @param {...string} components - Path components to join
     * @returns {string} - Joined path
     */
    joinPath(...components) {
        const joined = components
            .filter(component => component && component !== '')
            .join('/')
            .replace(/\/+/g, '/');
            
        return this.normalizePath(joined);
    }
}
