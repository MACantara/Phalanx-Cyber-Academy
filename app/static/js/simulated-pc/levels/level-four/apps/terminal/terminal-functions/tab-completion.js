export class TabCompletion {
    constructor(commandProcessor) {
        this.processor = commandProcessor;
        this.fileSystem = commandProcessor.fileSystem;
        this.commandRegistry = commandProcessor.commandRegistry;
    }

    getCompletion(inputText, cursorPosition) {
        const beforeCursor = inputText.substring(0, cursorPosition);
        const afterCursor = inputText.substring(cursorPosition);
        const parts = beforeCursor.split(/\s+/);
        const currentPart = parts[parts.length - 1] || '';
        
        // If we're completing the first word (command name)
        if (parts.length === 1 || (parts.length === 2 && beforeCursor.endsWith(' ') === false)) {
            return this.completeCommand(currentPart, beforeCursor, afterCursor);
        }
        
        // If we're completing arguments
        const command = parts[0].toLowerCase();
        const commandInstance = this.commandRegistry.getCommand(command);
        
        if (commandInstance) {
            // Try command-specific argument completion first
            const argCompletion = this.completeCommandArguments(command, parts, currentPart, beforeCursor, afterCursor);
            if (argCompletion) {
                return argCompletion;
            }
            
            // Fall back to file/directory completion for commands that support it
            if (this.commandSupportsFileCompletion(command)) {
                return this.completeFilePath(currentPart, beforeCursor, afterCursor, command);
            }
        }
        
        return null;
    }

    completeCommand(partial, beforeCursor, afterCursor) {
        const commands = this.commandRegistry.getAllCommands();
        const matches = commands.filter(cmd => cmd.startsWith(partial.toLowerCase()));
        
        if (matches.length === 0) {
            return null;
        }
        
        if (matches.length === 1) {
            // Single match - complete it
            const completion = matches[0];
            const beforeCompletion = beforeCursor.substring(0, beforeCursor.length - partial.length);
            return {
                newText: beforeCompletion + completion + ' ' + afterCursor,
                newCursorPosition: beforeCompletion.length + completion.length + 1
            };
        }
        
        // Multiple matches - show them and complete common prefix
        const commonPrefix = this.findCommonPrefix(matches);
        if (commonPrefix.length > partial.length) {
            const beforeCompletion = beforeCursor.substring(0, beforeCursor.length - partial.length);
            return {
                newText: beforeCompletion + commonPrefix + afterCursor,
                newCursorPosition: beforeCompletion.length + commonPrefix.length,
                suggestions: matches
            };
        }
        
        return {
            newText: beforeCursor + afterCursor,
            newCursorPosition: beforeCursor.length,
            suggestions: matches
        };
    }

    commandSupportsFileCompletion(command) {
        const fileCommands = ['cd', 'ls', 'cat', 'help'];
        return fileCommands.includes(command);
    }

    completeFilePath(partial, beforeCursor, afterCursor, command = null) {
        try {
            // Handle different path formats
            let basePath = this.processor.currentDirectory;
            let searchPattern = partial;
            let pathPrefix = '';
            
            if (partial.includes('/')) {
                const lastSlash = partial.lastIndexOf('/');
                pathPrefix = partial.substring(0, lastSlash + 1);
                searchPattern = partial.substring(lastSlash + 1);
                
                if (partial.startsWith('/')) {
                    // Absolute path
                    basePath = pathPrefix.slice(0, -1) || '/';
                } else if (partial.startsWith('~/')) {
                    // Home directory path
                    basePath = '/home/trainee' + pathPrefix.substring(1);
                    if (basePath.endsWith('/') && basePath !== '/') {
                        basePath = basePath.slice(0, -1);
                    }
                } else {
                    // Relative path
                    basePath = this.fileSystem.resolvePath(this.processor.currentDirectory, pathPrefix.slice(0, -1));
                }
            }
            
            // Get directory contents
            const showHidden = searchPattern.startsWith('.');
            const items = this.fileSystem.listDirectory(basePath, showHidden);
            
            // Filter based on command requirements
            let filteredItems = items.filter(item => item.name.startsWith(searchPattern));
            
            // Command-specific filtering
            if (command === 'cd') {
                // Only show directories for cd command
                filteredItems = filteredItems.filter(item => item.type === 'directory');
            } else if (command === 'cat') {
                // Only show files for cat command
                filteredItems = filteredItems.filter(item => item.type === 'file');
            }
            
            const matches = filteredItems.map(item => {
                let displayName = item.name;
                // Add trailing slash for directories
                if (item.type === 'directory' && !displayName.endsWith('/')) {
                    displayName += '/';
                }
                return {
                    name: displayName,
                    type: item.type,
                    suspicious: item.suspicious,
                    fullPath: pathPrefix + displayName
                };
            });
            
            if (matches.length === 0) {
                return null;
            }
            
            if (matches.length === 1) {
                // Single match - complete it
                const match = matches[0];
                const beforeCompletion = beforeCursor.substring(0, beforeCursor.length - partial.length);
                return {
                    newText: beforeCompletion + match.fullPath + afterCursor,
                    newCursorPosition: beforeCompletion.length + match.fullPath.length
                };
            }
            
            // Multiple matches
            const matchNames = matches.map(m => m.name);
            const commonPrefix = this.findCommonPrefix(matchNames);
            
            if (commonPrefix.length > searchPattern.length) {
                const beforeCompletion = beforeCursor.substring(0, beforeCursor.length - searchPattern.length);
                const newPath = pathPrefix + commonPrefix;
                return {
                    newText: beforeCompletion + newPath + afterCursor,
                    newCursorPosition: beforeCompletion.length + newPath.length,
                    suggestions: matchNames
                };
            }
            
            return {
                newText: beforeCursor + afterCursor,
                newCursorPosition: beforeCursor.length,
                suggestions: matchNames
            };
            
        } catch (error) {
            return null;
        }
    }

    completeCommandArguments(command, parts, currentPart, beforeCursor, afterCursor) {
        const commandInstance = this.commandRegistry.getCommand(command);
        if (!commandInstance || !commandInstance.getHelp) {
            return null;
        }

        const helpInfo = commandInstance.getHelp();
        const availableOptions = helpInfo.options || [];
        
        // If current part starts with -, complete flags/options
        if (currentPart.startsWith('-')) {
            const flagMatches = availableOptions
                .filter(opt => opt.flag.startsWith(currentPart))
                .map(opt => opt.flag.split(',')[0].trim()); // Take first flag variant
            
            if (flagMatches.length === 0) {
                return null;
            }
            
            if (flagMatches.length === 1) {
                const match = flagMatches[0];
                const beforeCompletion = beforeCursor.substring(0, beforeCursor.length - currentPart.length);
                return {
                    newText: beforeCompletion + match + ' ' + afterCursor,
                    newCursorPosition: beforeCompletion.length + match.length + 1
                };
            }
            
            const commonPrefix = this.findCommonPrefix(flagMatches);
            if (commonPrefix.length > currentPart.length) {
                const beforeCompletion = beforeCursor.substring(0, beforeCursor.length - currentPart.length);
                return {
                    newText: beforeCompletion + commonPrefix + afterCursor,
                    newCursorPosition: beforeCompletion.length + commonPrefix.length,
                    suggestions: flagMatches
                };
            }
            
            return {
                newText: beforeCursor + afterCursor,
                newCursorPosition: beforeCursor.length,
                suggestions: flagMatches
            };
        }
        
        // Command-specific argument completion
        switch (command) {
            case 'help':
                return this.completeHelpArguments(currentPart, beforeCursor, afterCursor);
            case 'echo':
                // Echo doesn't need specific completion beyond what user types
                return null;
            case 'uname':
                return this.completeUnameArguments(currentPart, beforeCursor, afterCursor);
            case 'ls':
                return this.completeLsArguments(parts, currentPart, beforeCursor, afterCursor);
            default:
                return null;
        }
    }

    completeHelpArguments(currentPart, beforeCursor, afterCursor) {
        const commands = this.commandRegistry.getAllCommands();
        const matches = commands.filter(cmd => cmd.startsWith(currentPart.toLowerCase()));
        
        if (matches.length === 0) {
            return null;
        }
        
        if (matches.length === 1) {
            const match = matches[0];
            const beforeCompletion = beforeCursor.substring(0, beforeCursor.length - currentPart.length);
            return {
                newText: beforeCompletion + match + ' ' + afterCursor,
                newCursorPosition: beforeCompletion.length + match.length + 1
            };
        }
        
        const commonPrefix = this.findCommonPrefix(matches);
        if (commonPrefix.length > currentPart.length) {
            const beforeCompletion = beforeCursor.substring(0, beforeCursor.length - currentPart.length);
            return {
                newText: beforeCompletion + commonPrefix + afterCursor,
                newCursorPosition: beforeCompletion.length + commonPrefix.length,
                suggestions: matches
            };
        }
        
        return {
            newText: beforeCursor + afterCursor,
            newCursorPosition: beforeCursor.length,
            suggestions: matches
        };
    }

    completeUnameArguments(currentPart, beforeCursor, afterCursor) {
        const unameOptions = ['-a', '--all'];
        const matches = unameOptions.filter(opt => opt.startsWith(currentPart));
        
        if (matches.length === 0) {
            return null;
        }
        
        if (matches.length === 1) {
            const match = matches[0];
            const beforeCompletion = beforeCursor.substring(0, beforeCursor.length - currentPart.length);
            return {
                newText: beforeCompletion + match + ' ' + afterCursor,
                newCursorPosition: beforeCompletion.length + match.length + 1
            };
        }
        
        return {
            newText: beforeCursor + afterCursor,
            newCursorPosition: beforeCursor.length,
            suggestions: matches
        };
    }

    completeLsArguments(parts, currentPart, beforeCursor, afterCursor) {
        // If no flags specified yet, suggest common flags
        const hasLFlag = parts.some(part => part.includes('l'));
        const hasAFlag = parts.some(part => part.includes('a'));
        
        if (currentPart.startsWith('-')) {
            const lsOptions = [];
            
            if (!hasLFlag && !hasAFlag) {
                lsOptions.push('-l', '-a', '-la', '-al');
            } else if (!hasLFlag) {
                lsOptions.push('-l');
            } else if (!hasAFlag) {
                lsOptions.push('-a');
            }
            
            const matches = lsOptions.filter(opt => opt.startsWith(currentPart));
            
            if (matches.length === 1) {
                const match = matches[0];
                const beforeCompletion = beforeCursor.substring(0, beforeCursor.length - currentPart.length);
                return {
                    newText: beforeCompletion + match + ' ' + afterCursor,
                    newCursorPosition: beforeCompletion.length + match.length + 1
                };
            }
            
            if (matches.length > 1) {
                return {
                    newText: beforeCursor + afterCursor,
                    newCursorPosition: beforeCursor.length,
                    suggestions: matches
                };
            }
        }
        
        // Fall back to file/directory completion
        return null;
    }

    findCommonPrefix(strings) {
        if (strings.length === 0) return '';
        if (strings.length === 1) return strings[0];
        
        let prefix = '';
        for (let i = 0; i < strings[0].length; i++) {
            const char = strings[0][i];
            if (strings.every(str => str[i] === char)) {
                prefix += char;
            } else {
                break;
            }
        }
        return prefix;
    }
}
