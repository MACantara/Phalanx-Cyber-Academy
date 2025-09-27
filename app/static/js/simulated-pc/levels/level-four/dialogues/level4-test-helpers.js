/**
 * Level 4 Test Helpers
 * Easy access to Level 4 features for testing and debugging
 */

// Global helper functions for Level 4 testing
window.Level4TestHelpers = {
    // Progress management
    getProgress() {
        const keys = Object.keys(localStorage).filter(key => key.includes('level4') || key.includes('ethics_oath'));
        const data = {};
        keys.forEach(key => {
            data[key] = localStorage.getItem(key);
        });
        return data;
    },

    resetProgress() {
        const keys = Object.keys(localStorage).filter(key => key.includes('level4') || key.includes('ethics_oath'));
        keys.forEach(key => localStorage.removeItem(key));
        console.log('Level 4 progress reset');
    },

    // Force Level 4 mode (for testing outside normal level progression)
    enableLevel4Mode() {
        localStorage.setItem('cyberquest_level_4_started', 'true');
        localStorage.removeItem('cyberquest_level_4_completed');
        console.log('Level 4 mode enabled.');
    },

    // Show current ethics score
    getEthicsScore() {
        return parseInt(localStorage.getItem('cyberquest_level4_ethics_score') || '0');
    },

    // Show all Level 4 localStorage data
    getLevel4Data() {
        const keys = Object.keys(localStorage).filter(key => key.includes('level4') || key.includes('ethics_oath'));
        const data = {};
        keys.forEach(key => {
            data[key] = localStorage.getItem(key);
        });
        return data;
    },

    // Print help information
    help() {
        console.log(`
Level 4 Test Helpers:

Progress Management:
- Level4TestHelpers.getProgress()          // Get current progress
- Level4TestHelpers.resetProgress()        // Reset all progress
- Level4TestHelpers.getEthicsScore()       // Get current ethics score
- Level4TestHelpers.getLevel4Data()        // Get all Level 4 data

Testing:
- Level4TestHelpers.enableLevel4Mode()     // Force enable Level 4
        `);
    }
};
