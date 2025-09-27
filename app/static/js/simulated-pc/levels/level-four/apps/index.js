/**
 * Level 4: The White Hat Test - Apps exports
 * Central export file for all Level 4 application modules
 */

import { TerminalApp } from './terminal-app.js';

// Export terminal app
export { TerminalApp };

// Level 4 apps loaded flag
export const level4AppsLoaded = true;

// Load Level 4 data from JSON files
let _level4DataCache = null;

export async function loadLevel4Data() {
    if (_level4DataCache !== null) {
        return _level4DataCache;
    }
    
    try {
        const response = await fetch('/api/level4/hosts-data');
        if (!response.ok) {
            throw new Error(`Failed to load Level 4 data: ${response.status}`);
        }
        
        const data = await response.json();
        _level4DataCache = data;
        return data;
    } catch (error) {
        console.error('Error loading Level 4 data:', error);
        // Fallback to individual JSON files via data index
        try {
            const { loadAllLevel4Hosts } = await import('/static/js/simulated-pc/levels/level-four/data/index.js');
            const data = await loadAllLevel4Hosts();
            _level4DataCache = data;
            return data;
        } catch (fallbackError) {
            console.error('Error loading fallback Level 4 data:', fallbackError);
            return { level4_municipality_hosts: [] };
        }
    }
}

// Get random hosts for variety (similar to Level 3)
export function getRandomHosts(hosts, count = 3) {
    if (!hosts || hosts.length <= count) {
        return hosts || [];
    }
    
    const shuffled = [...hosts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Future exports will include:
// export { terminalConfig } from './terminal-config.js';
