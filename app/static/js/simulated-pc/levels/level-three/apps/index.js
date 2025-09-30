/**
 * Level 3: Malware Mayhem - Apps exports
 * Central export file for all Level 3 application modules
 */

// Export Level 3 Timer
export { Level3TimerApp, createLevel3Timer } from './timer.js';

// Export Level 3 Applications (Simplified for timed gameplay)
export { MalwareScannerApp as Level3MalwareScannerApp } from './malware-scanner.js';
export { ProcessMonitorApp as Level3ProcessMonitorApp } from './process-monitor.js';

// Export Data Manager
export { level3DataManager, Level3DataManager } from '../data/index.js';

export const level3AppsLoaded = true;
