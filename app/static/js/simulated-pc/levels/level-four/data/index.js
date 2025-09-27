/**
 * Level 4: The White Hat Test - Data exports
 * Central export file for all Level 4 data modules
 */

// Individual JSON file loaders
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

// Load individual host data files
export async function loadVoteMainServer() {
    return await loadJSON('vote-main-server.json');
}

export async function loadVoteDatabaseServer() {
    return await loadJSON('vote-database-server.json');
}

export async function loadVoteAdminServer() {
    return await loadJSON('vote-admin-server.json');
}

export async function loadMunicipalityNetwork() {
    return await loadJSON('municipality-network.json');
}

// Load all Level 4 host data
export async function loadAllLevel4Hosts() {
    try {
        const [mainServer, dbServer, adminServer, network] = await Promise.all([
            loadVoteMainServer(),
            loadVoteDatabaseServer(),
            loadVoteAdminServer(),
            loadMunicipalityNetwork()
        ]);

        // Return in the same format as the consolidated JSON
        return {
            level4_municipality_hosts: [
                mainServer,
                dbServer,
                adminServer,
                network
            ].filter(host => host !== null) // Filter out any failed loads
        };
    } catch (error) {
        console.error('Error loading all Level 4 hosts:', error);
        return { level4_municipality_hosts: [] };
    }
}

// Data loading status
export const level4DataLoaded = true;
