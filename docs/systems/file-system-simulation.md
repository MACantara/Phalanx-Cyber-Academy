# File System Simulation

## Overview

The File System Simulation provides a realistic Linux file system environment for the Terminal Application in Level 4. It simulates directory structures, file operations, permissions, and path resolution to provide an authentic command-line experience.

## Architecture

### Core Components

#### 1. **FileSystem** (`file-system.js`)
The main file system class that manages the simulated file system.

**Key Responsibilities:**
- File system data management
- Directory navigation and listing
- File reading and access
- Path resolution and normalization
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

## File System Data Structure

### Directory Object
```javascript
{
    type: 'directory',
    contents: {
        'filename': {
            type: 'file',
            content: 'File content',
            size: 100,
            hidden: false,
            suspicious: false
        }
    }
}
```

### File Object
```javascript
{
    type: 'file',
    content: 'File content here',
    size: 100,
    hidden: false,
    suspicious: false,
    permissions: 'rw-r--r--',
    owner: 'researcher',
    group: 'users',
    modified: '2025-01-15T10:30:00Z'
}
```

## File System Operations

### Directory Listing
```javascript
async listDirectory(path, showHidden = false) {
    await this.waitForInitialization();
    
    const dir = this.getDirectoryData(path);
    if (!dir || dir.type !== 'directory') {
        return [];
    }
    
    const items = [];
    
    // Add . and .. for hidden file display
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
```

### File Reading
```javascript
async readFile(directory, filename) {
    await this.waitForInitialization();
    
    // Special handling for dynamic content
    if (filename === 'mission_brief.txt') {
        return await this.getDynamicMissionBrief();
    }
    
    const file = this.getFileData(directory, filename);
    if (!file || file.type !== 'file') {
        return null;
    }
    
    // Process escape sequences
    return this.processEscapeSequences(file.content);
}
```

### Directory Navigation
```javascript
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
        return target;  // Absolute path
    }
    
    if (target.startsWith('~/')) {
        return '/home/researcher' + target.substring(1);
    }
    
    // Relative path
    if (currentPath === '/') {
        return '/' + target;
    }
    return currentPath + '/' + target;
}
```

## Path Resolution

### Path Types
- **Absolute Paths**: Start with `/` (e.g., `/home/researcher`)
- **Relative Paths**: Relative to current directory (e.g., `documents`)
- **Home Paths**: Start with `~/` (e.g., `~/documents`)
- **Parent Directory**: `..` (go up one level)
- **Current Directory**: `.` (stay in current directory)

### Path Normalization
```javascript
normalizePath(path) {
    // Remove duplicate slashes
    let normalized = path.replace(/\/+/g, '/');
    
    // Ensure starts with /
    if (!normalized.startsWith('/')) {
        normalized = '/' + normalized;
    }
    
    // Remove trailing slash unless root
    if (normalized.length > 1 && normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
    }
    
    return normalized;
}
```

### Path Parsing
```javascript
parseFilePath(filePath) {
    const lastSlash = filePath.lastIndexOf('/');
    if (lastSlash === -1) {
        return { directory: '/', filename: filePath };
    }
    
    const directory = filePath.substring(0, lastSlash) || '/';
    const filename = filePath.substring(lastSlash + 1);
    
    return { directory, filename };
}
```

## Dynamic Content

### Dynamic File Loading
```javascript
async getDynamicMissionBrief() {
    try {
        const response = await fetch('/api/level4/mission-brief');
        if (!response.ok) {
            throw new Error(`Failed to load mission brief: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
            return data.content;
        }
    } catch (error) {
        console.error('Error loading dynamic mission brief:', error);
        // Fallback to static content
        return this.getFileData('/home/researcher', 'mission_brief.txt')?.content;
    }
}
```

### Content Processing
```javascript
processEscapeSequences(content) {
    if (typeof content !== 'string') {
        return content;
    }
    
    // Process escape sequences
    return content
        .replace(/\\n/g, '\n')    // Newlines
        .replace(/\\t/g, '\t')    // Tabs
        .replace(/\\r/g, '\r')    // Carriage returns
        .replace(/\\\\/g, '\\');  // Backslashes
}
```

## File System Initialization

### Data Loading
```javascript
async initializeFileSystem() {
    try {
        const data = await loadAllLevel4Data();
        if (data && data.fileSystem) {
            this.files = data.fileSystem;
            this.initialized = true;
        } else {
            console.error('Failed to load file system data');
            this.initializeFallbackFileSystem();
        }
    } catch (error) {
        console.error('Error loading file system:', error);
        this.initializeFallbackFileSystem();
    }
}
```

### Fallback System
```javascript
initializeFallbackFileSystem() {
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
                                    content: 'File system data failed to load.',
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
```

### Initialization Wait
```javascript
async waitForInitialization() {
    if (this.initialized) return;
    
    // Wait up to 5 seconds for initialization
    const startTime = Date.now();
    while (!this.initialized && (Date.now() - startTime) < 5000) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!this.initialized) {
        console.warn('File system initialization timeout');
        this.initializeFallbackFileSystem();
    }
}
```

## Directory Operations

### Directory Existence Check
```javascript
async directoryExists(path) {
    await this.waitForInitialization();
    
    const dir = this.getDirectoryData(path);
    return dir && dir.type === 'directory';
}
```

### Directory Data Retrieval
```javascript
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
```

### File Data Retrieval
```javascript
getFileData(directory, filename) {
    const dirData = this.getDirectoryData(directory);
    if (!dirData || dirData.type !== 'directory') {
        return null;
    }
    
    const contents = dirData.contents || {};
    return contents[filename] || null;
}
```

## File Operations

### File Size Calculation
```javascript
getFileSize(path) {
    const file = this.getFile(path);
    if (file && file.type === 'file') {
        return file.size;
    }
    return 0;
}
```

### File Type Detection
```javascript
getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const types = {
        'txt': 'text/plain',
        'json': 'application/json',
        'log': 'text/plain',
        'exe': 'application/x-executable',
        'sh': 'application/x-shellscript'
    };
    
    return types[extension] || 'application/octet-stream';
}
```

### File Permissions
```javascript
getFilePermissions(path) {
    const file = this.getFile(path);
    if (file) {
        return file.permissions || 'rw-r--r--';
    }
    return '---------';
}
```

## Special Features

### Hidden Files
```javascript
// Hidden files start with '.'
if (name.startsWith('.')) {
    item.hidden = true;
}
```

### Suspicious Files
```javascript
// Files marked as suspicious for training
{
    name: 'suspicious.exe',
    type: 'file',
    suspicious: true,
    riskLevel: 'high'
}
```

### System Files
```javascript
// System files in /etc, /var, etc.
{
    '/etc/passwd': {
        type: 'file',
        content: 'root:x:0:0:root:/root:/bin/bash',
        permissions: 'rw-r--r--'
    }
}
```

## Error Handling

### Invalid Path Handling
```javascript
getDirectoryData(path) {
    if (path === '/') {
        return this.files['/'];
    }
    
    const parts = path.split('/').filter(part => part !== '');
    let current = this.files['/'];
    
    for (const part of parts) {
        if (!current || !current.contents || !current.contents[part]) {
            return null;  // Invalid path
        }
        current = current.contents[part];
    }
    
    return current;
}
```

### File Not Found Handling
```javascript
async readFile(directory, filename) {
    const file = this.getFileData(directory, filename);
    if (!file || file.type !== 'file') {
        return null;  // File not found
    }
    
    return this.processEscapeSequences(file.content);
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

## Performance Optimizations

### 1. **Lazy Loading**
```javascript
// Only load file system data when needed
async waitForInitialization() {
    if (this.initialized) return;
    // ... wait for initialization
}
```

### 2. **Path Caching**
```javascript
// Cache resolved paths for repeated access
this.pathCache = new Map();

if (this.pathCache.has(path)) {
    return this.pathCache.get(path);
}
```

### 3. **Efficient Navigation**
```javascript
// Direct object property access
const contents = dir.contents || {};
const file = contents[filename];
```

## Configuration Options

### File System Settings
```javascript
const fileSystemConfig = {
    enableDynamicContent: true,
    enableHiddenFiles: true,
    enablePermissions: true,
    maxFileSize: 10000000,
    maxPathLength: 4096,
    enableCaseSensitivity: false
};
```

### Path Settings
```javascript
const pathConfig = {
    enableNormalization: true,
    enableResolution: true,
    enableValidation: true,
    maxDepth: 10,
    rootDirectory: '/'
};
```

### Security Settings
```javascript
const securityConfig = {
    enableSandbox: true,
    restrictAccess: true,
    enableAuditLogging: true,
    maxFileSize: 100000000
};
```

## Best Practices

### 1. **Always Validate Paths**
```javascript
// ✅ Good
const normalizedPath = this.normalizePath(userPath);
const data = this.getDirectoryData(normalizedPath);

// ❌ Bad - Don't trust user input
const data = this.getDirectoryData(userPath);  // May be invalid
```

### 2. **Handle Initialization**
```javascript
// ✅ Good
await this.waitForInitialization();
const data = this.getDirectoryData(path);

// ❌ Bad - Don't assume initialization
const data = this.getDirectoryData(path);  // May not be ready
```

### 3. **Check File Types**
```javascript
// ✅ Good
if (file.type === 'file') {
    // Handle file
} else if (file.type === 'directory') {
    // Handle directory
}

// ❌ Bad - Don't assume file type
await this.readFile(directory, filename);  // May be directory
```

### 4. **Process Content**
```javascript
// ✅ Good
const processedContent = this.processEscapeSequences(rawContent);

// ❌ Bad - Don't use raw content
return file.content;  // May have escape sequences
```

## Troubleshooting

### Common Issues

**Files not loading:**
- Verify file system data structure
- Check initialization completion
- Ensure data loader is working
- Review console for JavaScript errors

**Path resolution failing:**
- Verify path format and structure
- Check normalization logic
- Ensure root directory exists
- Review path parsing logic

**Hidden files not showing:**
- Verify hidden file flag
- Check showHidden parameter
- Ensure filename format is correct
- Review listing logic

**Dynamic content not loading:**
- Verify API endpoint is accessible
- Check fetch request handling
- Ensure fallback logic works
- Review error handling

**Permissions not working:**
- Verify permission data structure
- Check permission calculation logic
- Ensure permission display is correct
- Review permission system

### Debug Mode
Enable detailed logging:
```javascript
console.log('[FileSystem] Files:', this.files);
console.log('[FileSystem] Current path:', currentPath);
console.log('[FileSystem] Initialized:', this.initialized);
console.log('[FileSystem] Directory data:', dirData);
```

## Future Enhancements

### Planned Improvements
1. **Advanced permissions** - Full Unix permission system
2. **Symbolic links** - Link support and resolution
3. **File attributes** - Extended attributes and metadata
4. **File compression** - Compressed file support
5. **Mount points** - Virtual file system mounting

### Scalability Considerations
- Support for larger file systems
- Improved path resolution performance
- Enhanced file operations
- Better memory management

## Related Documentation

- [Terminal Application System](./terminal-application-system.md)
- [Simulated PC System](./simulated-pc-system.md)
- [Level 4 Documentation](../level-specific/level-4.md)

## Files and Locations

**Core File System:**
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/terminal-functions/file-system.js` - File system implementation

**Data Files:**
- `app/static/js/simulated-pc/levels/level-four/data/index.js` - Level 4 data loader
