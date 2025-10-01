/**
 * Level 5 Data Index
 * Lightweight data utilities for Level 5 digital forensics investigation
 * Note: Data is now embedded directly in apps for better performance and simplicity
 */

// Level 5 now uses embedded data in each app for streamlined performance
console.log('Level 5 Data: Using embedded app data for optimal performance');

// Placeholder for any shared utilities (currently none needed)
export const level5Data = {
    message: 'Level 5 data is now embedded in individual apps for better performance'
};

// Utility function to check if Level 5 apps have embedded data
export function validateAppDataIntegrity() {
    return {
        message: 'Data validation is now handled within individual Level 5 apps',
        recommendation: 'Check app initialization logs for data loading status'
    };
}

// Legacy compatibility notice
export function getDataset(name) {
    console.warn(`getDataset('${name}') is deprecated. Data is now embedded in Level 5 apps.`);
    return null;
}

// Default export for backward compatibility
export default level5Data;
