/**
 * Level 4: The White Hat Test - Data exports
 * Central export file for CTF file system data
 */

// Load CTF file system data
async function loadJSON(filename) {
    try {
        const response = await fetch(`/static/js/simulated-pc/levels/level-four/data/${filename}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return null;
    }
}

// Load CTF file system data
export async function loadCTFFileSystem() {
    return await loadJSON('ctf-file-system.json');
}

// Load all Level 4 CTF data
export async function loadAllLevel4Data() {
    try {
        const fileSystemData = await loadCTFFileSystem();

        if (!fileSystemData) {
            console.error('Failed to load CTF file system data');
            return { fileSystem: {} };
        }

        return fileSystemData;
    } catch (error) {
        console.error('Error loading all Level 4 CTF data:', error);
        return { fileSystem: {} };
    }
}

// Data loading status
export const level4DataLoaded = true;
