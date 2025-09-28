/**
 * Level 4: The White Hat Test - Apps exports
 * Central export file for all Level 4 application modules
 */

import { TerminalApp } from './terminal-app.js';
import { Level4ChallengeTracker, createLevel4ChallengeTracker } from './challenge-tracker-app.js';

// Export terminal app and challenge tracker
export { TerminalApp, Level4ChallengeTracker, createLevel4ChallengeTracker };

// Level 4 apps loaded flag
export const level4AppsLoaded = true;

// Cache for loaded data
let _level4DataCache = null;
let _ctfFlagsCache = null;

// Load Level 4 CTF data from JSON files
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

// Load CTF flags configuration
export async function loadCTFFlags() {
    if (_ctfFlagsCache !== null) {
        return _ctfFlagsCache;
    }
    
    try {
        const response = await fetch('/static/js/simulated-pc/levels/level-four/data/ctf-flags.json');
        if (!response.ok) {
            throw new Error(`Failed to load CTF flags: ${response.status}`);
        }
        
        const flagsData = await response.json();
        _ctfFlagsCache = flagsData;
        return flagsData;
    } catch (error) {
        console.error('Error loading CTF flags:', error);
        // Return fallback flag structure
        return {
            ctf_flags: {
                total_flags: 7,
                flags: {},
                metadata: {
                    error: 'Failed to load flags configuration'
                }
            }
        };
    }
}

// Get specific flag information
export async function getFlagInfo(flagId) {
    const flagsData = await loadCTFFlags();
    return flagsData?.ctf_flags?.flags?.[flagId] || null;
}

// Get all flag values for validation
export async function getAllFlags() {
    const flagsData = await loadCTFFlags();
    const flags = flagsData?.ctf_flags?.flags || {};
    const flagValues = {};
    
    for (const [key, flagInfo] of Object.entries(flags)) {
        flagValues[key] = flagInfo.value;
    }
    
    return flagValues;
}

// Get flag descriptions for UI
export async function getFlagDescriptions() {
    const flagsData = await loadCTFFlags();
    const flags = flagsData?.ctf_flags?.flags || {};
    const descriptions = {};
    
    for (const [key, flagInfo] of Object.entries(flags)) {
        descriptions[key] = flagInfo.description;
    }
    
    return descriptions;
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
