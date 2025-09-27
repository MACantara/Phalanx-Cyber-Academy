/**
 * Level 4: The White Hat Test - Apps exports
 * Central export file for all Level 4 application modules
 */

import { TerminalApp } from './terminal-app.js';

// Export terminal app
export { TerminalApp };

// Level 4 apps loaded flag
export const level4AppsLoaded = true;

// Load Level 4 CTF data from JSON files
let _level4DataCache = null;

export async function loadLevel4Data() {
    if (_level4DataCache !== null) {
        return _level4DataCache;
    }
    
    try {
        const response = await fetch('/api/level4/hosts-data');
        if (!response.ok) {
            throw new Error(`Failed to load Level 4 CTF data: ${response.status}`);
        }
        
        const data = await response.json();
        _level4DataCache = data;
        return data;
    } catch (error) {
        console.error('Error loading Level 4 CTF data:', error);
        // Fallback to direct file loading
        try {
            const { loadAllLevel4Data } = await import('/static/js/simulated-pc/levels/level-four/data/index.js');
            const data = await loadAllLevel4Data();
            _level4DataCache = data;
            return data;
        } catch (fallbackError) {
            console.error('Error loading fallback Level 4 CTF data:', fallbackError);
            return { fileSystem: {} };
        }
    }
}

// Get file system data for CTF
export function getCTFFileSystem(data) {
    if (!data || !data.fileSystem) {
        return {};
    }
    return data.fileSystem;
}

// Legacy compatibility - no longer needed for CTF
export function getRandomHosts(paths, count = 3) {
    console.warn('getRandomHosts is deprecated for CTF challenge');
    return [];
}

// Future exports will include:
// export { terminalConfig } from './terminal-config.js';
