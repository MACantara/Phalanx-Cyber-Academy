# Terminal Application System

## Overview

The Terminal Application System provides a realistic Linux terminal emulator for Level 4: The White Hat Test. It features command processing, file system simulation, tab completion, command history, and a capture-the-flag (CTF) challenge interface for ethical hacking training.

## Architecture

### Core Components

#### 1. **TerminalApp** (`terminal-app.js`)
The main application class that extends WindowBase and provides the terminal interface.

**Key Responsibilities:**
- Terminal UI rendering
- Command input handling
- Output display management
- Event binding and keyboard shortcuts
- Tab completion handling
- Mobile keyboard support

**UI Structure:**
```javascript
createContent() {
    return `
        <div class="terminal-container">
            <div class="terminal-output">
                <!-- Command output displayed here -->
            </div>
            <div class="terminal-input-area">
                <span class="prompt">researcher@sandbox:~$ </span>
                <input type="text" id="command-input" />
            </div>
        </div>
    `;
}
```

#### 2. **CommandProcessor** (`command-processor.js`)
Processes terminal commands and coordinates command execution.

**Key Responsibilities:**
- Command parsing and execution
- Command history management
- Tab completion coordination
- File system integration
- Prompt generation
- Output management

**Command Flow:**
```
User Input → Command Parsing → Command Registry Lookup → Command Execution → Output Display
```

#### 3. **FileSystem** (`file-system.js`)
Simulates a Linux file system with directory structure and file contents.

**Key Responsibilities:**
- File system data management
- Directory navigation
- File reading and listing
- Path resolution
- Dynamic content loading
- Initialization and fallback handling

**File System Structure:**
```javascript
{
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
                                content: 'File content here',
                                size: 100
                            }
                        }
                    }
                }
            }
        }
    }
}
```

#### 4. **CommandRegistry** (`command-registry.js`)
Registers and manages available terminal commands.

**Key Responsibilities:**
- Command registration and lookup
- Path resolution utilities
- Command availability checking
- Dynamic command management

**Available Commands:**
- **File System**: `ls`, `cd`, `cat`, `pwd`, `find`, `grep`
- **User Info**: `whoami`, `sudo`
- **Utilities**: `clear`, `echo`, `history`, `help`
- **CTF Specific**: `hints`, `submit-flag`

#### 5. **CommandHistory** (`command-history.js`)
Manages command history for navigation and reuse.

**Key Responsibilities:**
- Command storage and retrieval
- History navigation (up/down arrows)
- History persistence
- Command search

#### 6. **TabCompletion** (`tab-completion.js`)
Provides intelligent tab completion for commands, files, and paths.

**Key Responsibilities:**
- Command completion
- File and directory completion
- Path completion
- Suggestion generation

## Command Processing

### Command Execution Flow
```javascript
async executeCommand(commandLine) {
    // Add to history
    this.history.addCommand(commandLine);
    
    // Parse command
    const parts = commandLine.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    // Display command in output
    this.addOutput(`${this.getPrompt()}${commandLine}`, 'command');
    
    // Execute command
    const commandInstance = this.commandRegistry.getCommand(command);
    if (commandInstance) {
        await commandInstance.execute(args);
    } else {
        this.addOutput(`bash: ${command}: command not found`, 'error');
    }
}
```

### Command Base Class
All terminal commands extend the BaseCommand class:

```javascript
class YourCommand extends BaseCommand {
    constructor(processor) {
        super(processor);
        this.name = 'your-command';
        this.description = 'Command description';
    }
    
    async execute(args) {
        // Command implementation
        this.addOutput('Command output');
    }
}
```

### Available Commands

#### File System Commands

**ls** - List directory contents
```bash
ls              # List current directory
ls -la          # List with details and hidden files
ls /path/to/dir # List specific directory
```

**cd** - Change directory
```bash
cd /home/researcher  # Change to directory
cd ..                # Go to parent directory
cd ~                 # Go to home directory
```

**cat** - Display file contents
```bash
cat filename.txt          # Display file
cat file1.txt file2.txt   # Display multiple files
```

**pwd** - Print working directory
```bash
pwd  # Show current directory path
```

**find** - Search for files
```bash
find /path -name "pattern"    # Find files by name
find /path -type d            # Find directories
```

**grep** - Search file contents
```bash
grep "pattern" filename.txt   # Search in file
grep -r "pattern" /path       # Recursive search
```

#### User Commands

**whoami** - Display current user
```bash
whoami  # Show username
```

**sudo** - Execute with superuser privileges
```bash
sudo command          # Execute with elevated privileges
sudo -l              # List sudo permissions
```

#### Utility Commands

**clear** - Clear terminal screen
```bash
clear  # Clear all output
```

**echo** - Display text
```bash
echo "text"           # Display text
echo $HOME           # Display environment variable
```

**history** - Show command history
```bash
history          # Show all history
history 10       # Show last 10 commands
```

**help** - Display help information
```bash
help              # Show all commands
help ls           # Show specific command help
```

#### CTF Commands

**hints** - Get challenge hints
```bash
hints                    # Show available hints
hints --challenge-1     # Get hint for specific challenge
```

**submit-flag** - Submit captured flags
```bash
submit-flag WHT{flag-value}              # Submit flag
submit-flag --challenges                 # Show available challenges
submit-flag --verify WHT{flag-value}     # Verify flag format
```

## File System Simulation

### File System Structure
The simulated file system mimics a Linux directory structure:

```
/
├── home/
│   └── researcher/
│       ├── readme.txt
│       ├── mission_brief.txt
│       ├── documents/
│       ├── tools/
│       └── logs/
├── var/
│   └── log/
├── etc/
└── tmp/
```

### File System Operations

#### Directory Listing
```javascript
async listDirectory(path, showHidden = false) {
    const dir = this.getDirectoryData(path);
    const items = [];
    
    for (const [name, item] of Object.entries(dir.contents)) {
        if (!showHidden && name.startsWith('.')) continue;
        
        items.push({
            name: name,
            type: item.type,
            size: item.size,
            suspicious: item.suspicious
        });
    }
    
    return items;
}
```

#### File Reading
```javascript
async readFile(directory, filename) {
    const file = this.getFileData(directory, filename);
    if (!file || file.type !== 'file') {
        return null;
    }
    
    return this.processEscapeSequences(file.content);
}
```

#### Path Resolution
```javascript
resolvePath(currentPath, target) {
    if (target.startsWith('/')) {
        return target;  // Absolute path
    }
    
    if (target === '..') {
        // Go to parent directory
        const parts = currentPath.split('/').filter(p => p);
        parts.pop();
        return '/' + parts.join('/');
    }
    
    if (target.startsWith('~/')) {
        return '/home/researcher' + target.substring(1);
    }
    
    // Relative path
    return currentPath + '/' + target;
}
```

### Dynamic Content
Some files have dynamic content loaded from the server:

```javascript
async getDynamicMissionBrief() {
    const response = await fetch('/api/level4/mission-brief');
    const data = await response.json();
    return data.content;
}
```

## Tab Completion

### Tab Completion Logic
```javascript
getTabCompletion(inputText, cursorPosition) {
    const parts = inputText.split(/\s+/);
    const currentPart = parts[parts.length - 1];
    
    // Complete command names
    if (parts.length === 1) {
        return this.completeCommand(currentPart);
    }
    
    // Complete file paths
    return this.completePath(currentPart, this.currentDirectory);
}
```

### Completion Types
- **Command completion**: Complete command names
- **File completion**: Complete file and directory names
- **Path completion**: Complete directory paths
- **Flag completion**: Complete command flags

### Suggestion Display
When multiple completions are available:
```javascript
showTabSuggestions(suggestions) {
    const commands = suggestions.filter(s => this.commandRegistry.hasCommand(s));
    const directories = suggestions.filter(s => s.endsWith('/'));
    const files = suggestions.filter(s => !s.endsWith('/') && s.includes('.'));
    
    this.addOutput('Commands: ' + commands.join('  '), 'text-blue-400');
    this.addOutput('Directories: ' + directories.join('  '), 'text-blue-400');
    this.addOutput('Files: ' + files.join('  '), 'text-blue-400');
}
```

## Command History

### History Management
```javascript
class CommandHistory {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
    }
    
    addCommand(command) {
        this.history.push(command);
        this.currentIndex = this.history.length;
    }
    
    getPrevious() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            return this.history[this.currentIndex];
        }
        return null;
    }
    
    getNext() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            return this.history[this.currentIndex];
        }
        return null;
    }
}
```

### History Navigation
- **Arrow Up**: Previous command
- **Arrow Down**: Next command
- **History Command**: Show all history

## Security Features

### Command Risk Assessment
```javascript
getCommandRisk(command) {
    const highRiskCommands = ['sudo', 'su', 'chmod 777', 'rm -rf', 'passwd'];
    const mediumRiskCommands = ['netstat', 'ps', 'kill', 'ssh'];
    
    if (highRiskCommands.some(cmd => command.includes(cmd))) {
        return 'high';
    } else if (mediumRiskCommands.some(cmd => command.includes(cmd))) {
        return 'medium';
    }
    return 'low';
}
```

### Security Event Logging
```javascript
if (this.isSecurityCommand(command)) {
    document.dispatchEvent(new CustomEvent('security-command-executed', {
        detail: { 
            command: command.trim(),
            result: result ? 'success' : 'failed',
            risk: this.getCommandRisk(command)
        }
    }));
}
```

### Sudo Simulation
```javascript
async execute(args) {
    if (!args.length) {
        this.addOutput('usage: sudo command [args]');
        return;
    }
    
    // Simulate sudo behavior
    this.addOutput(`[sudo] executing ${args.join(' ')} as root`);
    
    // Execute command with elevated privileges
    const command = args[0];
    const commandArgs = args.slice(1);
    // ... execute with sudo
}
```

## CTF Integration

### Flag Submission
```javascript
async execute(args) {
    if (args.length === 0) {
        this.addOutput('Usage: submit-flag WHT{flag-value}');
        return;
    }
    
    const flag = args[0];
    
    // Validate flag format
    if (!flag.startsWith('WHT{') || !flag.endsWith('}')) {
        this.addOutput('Invalid flag format. Expected: WHT{...}');
        return;
    }
    
    // Submit to server
    const response = await fetch('/api/level4/submit-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag })
    });
    
    const result = await response.json();
    this.addOutput(result.message);
}
```

### Challenge Tracking
```javascript
async execute(args) {
    const response = await fetch('/api/level4/challenges');
    const challenges = await response.json();
    
    this.addOutput('Available Challenges:');
    challenges.forEach(challenge => {
        const status = challenge.solved ? '✓' : '✗';
        this.addOutput(`  ${status} ${challenge.name}: ${challenge.description}`);
    });
}
```

### Hint System
```javascript
async execute(args) {
    const challengeId = args[0] || 'default';
    
    const response = await fetch(`/api/level4/hint/${challengeId}`);
    const hint = await response.json();
    
    this.addOutput(`Hint: ${hint.content}`);
}
```

## User Interface

### Terminal Styling
```css
.terminal-container {
    background: black;
    color: #4ade80;  /* green-400 */
    font-family: monospace;
    font-size: 0.875rem;
}

.terminal-output {
    overflow-y: auto;
    white-space: pre-wrap;
}

.command-input {
    background: transparent;
    border: none;
    color: #4ade80;
    font-family: monospace;
    outline: none;
}
```

### Prompt Format
```javascript
getPrompt() {
    const shortPath = this.currentDirectory.replace('/home/researcher', '~');
    return `${this.username}@${this.hostname}:${shortPath}$ `;
}

// Output: researcher@sandbox:~$
```

### Output Styling
- **Command**: Green with prompt
- **Error**: Red
- **Success**: Green
- **Info**: Blue
- **Warning**: Yellow

## Mobile Support

### Keyboard Handling
```javascript
// Handle mobile keyboard visibility
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        this.handleViewportResize();
    });
}

handleViewportResize() {
    // Scroll input into view when keyboard appears
    this.scrollInputIntoView();
}
```

### Touch Optimization
- Larger touch targets for input
- Automatic scroll to input on focus
- Viewport resize handling
- Responsive font sizes

## Performance Optimizations

### 1. **Lazy Loading**
```javascript
async waitForInitialization() {
    if (this.initialized) return;
    
    // Wait up to 5 seconds for initialization
    while (!this.initialized && (Date.now() - startTime) < 5000) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}
```

### 2. **Efficient Rendering**
```javascript
// Only append new output, don't re-render entire terminal
addOutput(text, className = '') {
    const output = this.windowElement.querySelector('#terminal-output');
    const line = document.createElement('div');
    line.className = className;
    line.textContent = text;
    output.appendChild(line);
}
```

### 3. **Command Caching**
- Command instances cached in registry
- File system data loaded once
- History stored in memory

## Error Handling

### Command Not Found
```javascript
const commandInstance = this.commandRegistry.getCommand(command);
if (!commandInstance) {
    this.addOutput(`bash: ${command}: command not found`, 'error');
    return;
}
```

### File Not Found
```javascript
const file = this.getFileData(directory, filename);
if (!file) {
    this.addOutput(`cat: ${filename}: No such file or directory`, 'error');
    return;
}
```

### Permission Denied
```javascript
if (!this.hasPermission(file, user)) {
    this.addOutput(`cat: ${filename}: Permission denied`, 'error');
    return;
}
```

### Initialization Failures
```javascript
try {
    await this.initializeFileSystem();
} catch (error) {
    console.error('Failed to initialize file system:', error);
    this.initializeFallbackFileSystem();
}
```

## Configuration Options

### Terminal Settings
```javascript
const terminalConfig = {
    fontSize: '0.875rem',
    fontFamily: 'monospace',
    colors: {
        background: 'black',
        text: '#4ade80',
        error: '#ef4444',
        warning: '#eab308',
        info: '#3b82f6'
    },
    historySize: 100,
    tabCompletionEnabled: true
};
```

### File System Settings
```javascript
const fileSystemConfig = {
    enableDynamicContent: true,
    enableHiddenFiles: true,
    maxFileSize: 1000000,
    enablePermissions: true
};
```

### Security Settings
```javascript
const securityConfig = {
    enableSudo: true,
    enableRiskAssessment: true,
    logSecurityCommands: true,
    maxRiskLevel: 'high'
};
```

## Best Practices

### 1. **Always Validate Input**
```javascript
// ✅ Good
if (!args.length) {
    this.addOutput('Usage: command [args]');
    return;
}

// ❌ Bad - Don't assume args exist
const filename = args[0];  // May be undefined
```

### 2. **Handle Errors Gracefully**
```javascript
// ✅ Good
try {
    await this.executeCommand(command);
} catch (error) {
    this.addOutput(`Error: ${error.message}`, 'error');
}

// ❌ Bad - Silent failures
await this.executeCommand(command);  // No error handling
```

### 3. **Provide Clear Feedback**
```javascript
// ✅ Good
this.addOutput(`Found ${count} matching files`, 'success');

// ❌ Bad - No feedback
// Silent operation
```

### 4. **Use Path Resolution**
```javascript
// ✅ Good
const resolvedPath = this.commandRegistry.resolvePath(
    this.currentDirectory,
    targetPath
);

// ❌ Bad - Don't assume absolute paths
const fullPath = targetPath;  // May be relative
```

## Troubleshooting

### Common Issues

**Commands not executing:**
- Verify command is registered in CommandRegistry
- Check command name spelling
- Ensure command class implements execute method
- Review console for JavaScript errors

**File system not loading:**
- Check JSON API endpoint
- Verify file system data format
- Ensure initialization completes
- Review fallback file system

**Tab completion not working:**
- Verify TabCompletion is initialized
- Check cursor position calculation
- Ensure file system is loaded
- Review completion logic

**History navigation not working:**
- Verify CommandHistory is initialized
- Check history array has entries
- Ensure currentIndex is correct
- Review keyboard event handling

**Mobile keyboard issues:**
- Verify visualViewport API support
- Check viewport resize handler
- Ensure scroll logic works
- Test on actual mobile device

### Debug Mode
Enable detailed logging:
```javascript
console.log('[Terminal] Command:', command);
console.log('[CommandProcessor] Current directory:', this.currentDirectory);
console.log('[FileSystem] File system data:', this.files);
console.log('[CommandRegistry] Available commands:', this.getAllCommands());
```

## Future Enhancements

### Planned Improvements
1. **Advanced shell features** - Pipes, redirects, background processes
2. **More commands** - Additional Linux commands
3. **File editing** - Built-in text editor (nano/vim simulation)
4. **Network commands** - Simulated network operations
5. **Process management** - Simulated process tree

### Scalability Considerations
- Support for larger file systems
- Improved command performance
- Enhanced tab completion
- Better mobile experience

## Related Documentation

- [Simulated PC System](./simulated-pc-system.md)
- [Window Management System](./window-management-system.md)
- [File System Simulation](./file-system-simulation.md)
- [Level 4 Documentation](../level-specific/level-4.md)

## Files and Locations

**Core Application:**
- `app/static/js/simulated-pc/levels/level-four/apps/terminal-app.js` - Main terminal app

**Terminal Functions:**
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-functions/command-processor.js` - Command processing
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-functions/file-system.js` - File system
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-functions/command-registry.js` - Command registry
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-functions/command-history.js` - Command history
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-functions/tab-completion.js` - Tab completion

**Terminal Commands:**
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/ls-command.js`
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/cd-command.js`
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/cat-command.js`
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/pwd-command.js`
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/whoami-command.js`
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/clear-command.js`
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/echo-command.js`
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/find-command.js`
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/grep-command.js`
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/help-command.js`
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/history-command.js`
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/hints-command.js`
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/submit-flag-command.js`
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/sudo-command.js`

**Data Files:**
- `app/static/js/simulated-pc/levels/level-four/data/index.js` - Level 4 data loader
