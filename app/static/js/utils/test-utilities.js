/**
 * Test Script for Centralized Utilities
 * This file can be run in the browser console to test the utilities
 */

// Test the utilities
async function testCentralizedUtilities() {
    console.log('=== Testing Centralized XP and Session Management Utilities ===');
    
    try {
        // Import utilities (adjust path as needed)
        const utils = await import('/static/js/utils/index.js');
        const { gameProgressManager, xpCalculator, sessionManager } = utils;
        
        console.log('✓ Utilities imported successfully');
        
        // Test 1: XP Configuration Loading
        console.log('\n--- Test 1: XP Configuration Loading ---');
        const config = await xpCalculator.getConfig();
        console.log('Loaded configuration:', config);
        console.log('Configuration loaded from backend:', xpCalculator.isConfigLoaded());
        
        // Test 2: XP Calculation (client-side with backend config)
        console.log('\n--- Test 2: Client-side XP Calculation with Backend Config ---');
        const xpPreview = await xpCalculator.calculatePerformanceBasedXPAsync(4, 95, 600, 'hard');
        console.log('XP Preview (async):', xpPreview);
        console.log(`Expected ~385 XP (200 * 1.5 * 1.2 + 25), got ${xpPreview.xp_earned} XP`);
        
        const xpPreviewSync = xpCalculator.calculatePerformanceBasedXP(4, 95, 600, 'hard');
        console.log('XP Preview (sync):', xpPreviewSync);
        console.log('Sync vs Async match:', xpPreview.xp_earned === xpPreviewSync.xp_earned);
        
        // Test 3: Session Management
        console.log('\n--- Test 3: Session Management ---');
        
        // Start a test session
        console.log('Starting test session...');
        const session = await sessionManager.startSession('Test Level', 99);
        console.log('Session started:', session);
        
        // Wait 2 seconds to simulate gameplay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // End the session
        console.log('Ending test session...');
        const sessionEnd = await sessionManager.endSession(85, { test: true });
        console.log('Session ended:', sessionEnd);
        
        // Test 4: Game Progress Manager
        console.log('\n--- Test 4: Game Progress Manager ---');
        
        // Test level lifecycle
        console.log('Starting test level...');
        const levelData = await gameProgressManager.startLevel(99, 'Test Level', 'medium');
        console.log('Level started:', levelData);
        
        // Wait 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Complete the level
        console.log('Completing test level...');
        const completion = await gameProgressManager.completeLevel(90, { test_completion: true });
        console.log('Level completed:', completion);
        
        // Test 5: Utility Functions
        console.log('\n--- Test 5: Utility Functions ---');
        
        const timeSpent = gameProgressManager.getTimeSpent();
        const formattedTime = gameProgressManager.formatTime(timeSpent);
        console.log(`Time tracking: ${timeSpent}s = ${formattedTime}`);
        
        const sessionId = sessionManager.getActiveSessionId();
        console.log('Current session ID:', sessionId);
        
        // Test 6: Error Handling
        console.log('\n--- Test 6: Error Handling ---');
        
        try {
            // Try to complete a level without starting one
            await gameProgressManager.completeLevel(100);
            console.log('❌ Should have thrown an error');
        } catch (error) {
            console.log('✓ Error handling works:', error.message);
        }
        
        console.log('\n=== All Tests Completed Successfully! ===');
        
        return {
            config,
            xpPreview,
            xpPreviewSync,
            session,
            sessionEnd,
            levelData,
            completion,
            timeSpent,
            formattedTime
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

// Test XP calculation accuracy with backend configuration
async function testXPCalculationAccuracy() {
    console.log('\n=== XP Calculation Accuracy Tests ===');
    
    // Import the calculator (assuming it's available globally)
    if (typeof window !== 'undefined' && window.xpCalculator) {
        const calc = window.xpCalculator;
        
        // Test configuration loading
        console.log('Testing configuration loading...');
        const config = await calc.getConfig();
        console.log('Loaded configuration:', config);
        console.log('Configuration loaded:', calc.isConfigLoaded());
        
        // Test cases
        const testCases = [
            { level: 1, score: 100, time: 300, difficulty: 'easy', expected: '~125 XP' },
            { level: 2, score: 85, time: 600, difficulty: 'medium', expected: '~145 XP' },
            { level: 3, score: 75, time: 900, difficulty: 'intermediate', expected: '~205 XP' },
            { level: 4, score: 95, time: 600, difficulty: 'hard', expected: '~385 XP' },
            { level: 5, score: 90, time: 1200, difficulty: 'expert', expected: '~495 XP' }
        ];
        
        console.log('\nTesting XP calculations with backend config:');
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            
            // Test both sync and async versions
            const syncResult = calc.calculatePerformanceBasedXP(
                testCase.level, 
                testCase.score, 
                testCase.time, 
                testCase.difficulty
            );
            
            const asyncResult = await calc.calculatePerformanceBasedXPAsync(
                testCase.level, 
                testCase.score, 
                testCase.time, 
                testCase.difficulty
            );
            
            console.log(`Test ${i + 1}: Level ${testCase.level} (${testCase.difficulty})`);
            console.log(`  Score: ${testCase.score}%, Time: ${testCase.time}s`);
            console.log(`  Expected: ${testCase.expected}`);
            console.log(`  Sync result: ${syncResult.xp_earned} XP`);
            console.log(`  Async result: ${asyncResult.xp_earned} XP`);
            console.log(`  Breakdown: Base ${asyncResult.breakdown.base_xp} × Score ${asyncResult.breakdown.score_multiplier} × Time ${asyncResult.breakdown.time_multiplier} + Bonus ${asyncResult.breakdown.first_time_bonus}`);
            
            // Check if results match
            if (syncResult.xp_earned === asyncResult.xp_earned) {
                console.log('  ✓ Sync and async results match');
            } else {
                console.log('  ❌ Sync and async results differ');
            }
        }
        
        // Test API calculation
        console.log('\nTesting API calculation vs client-side:');
        try {
            const apiResult = await calc.calculateXPFromAPI(4, 95, 600, 'hard');
            const clientResult = await calc.calculatePerformanceBasedXPAsync(4, 95, 600, 'hard');
            
            console.log(`API result: ${apiResult.xp_earned} XP`);
            console.log(`Client result: ${clientResult.xp_earned} XP`);
            
            if (apiResult.xp_earned === clientResult.xp_earned) {
                console.log('✓ API and client calculations match perfectly');
            } else {
                console.log('⚠️ API and client calculations differ (this may be expected for first-time bonus)');
            }
        } catch (error) {
            console.log('❌ API calculation test failed:', error.message);
        }
        
        console.log('✓ XP calculation accuracy tests completed');
    } else {
        console.log('❌ XP Calculator not available globally');
    }
}

// Test session compatibility
function testSessionCompatibility() {
    console.log('\n=== Session Compatibility Tests ===');
    
    // Set up various localStorage keys that might exist
    localStorage.setItem('cyberquest_active_session_id', '12345');
    localStorage.setItem('active_session_id', '67890');
    window.currentSessionId = 54321;
    
    if (typeof window !== 'undefined' && window.sessionManager) {
        const sessionId = window.sessionManager.getActiveSessionId();
        console.log('Session ID compatibility test:', sessionId);
        console.log('Should prioritize existing session IDs');
        
        // Test migration
        window.sessionManager.migrateExistingSession('Test Migration', 1).then(session => {
            console.log('Migration test successful:', session);
        }).catch(error => {
            console.error('Migration test failed:', error);
        });
    } else {
        console.log('❌ Session Manager not available globally');
    }
    
    // Clean up test data
    localStorage.removeItem('cyberquest_active_session_id');
    localStorage.removeItem('active_session_id');
    if (typeof window !== 'undefined') {
        window.currentSessionId = null;
    }
}

// Test configuration reload
async function testConfigurationReload() {
    console.log('\n=== Configuration Reload Tests ===');
    
    if (typeof window !== 'undefined' && window.xpCalculator) {
        const calc = window.xpCalculator;
        
        console.log('Initial config loaded:', calc.isConfigLoaded());
        
        // Force reload configuration
        console.log('Reloading configuration...');
        const newConfig = await calc.reloadConfig();
        console.log('New configuration:', newConfig);
        console.log('Config reloaded successfully:', calc.isConfigLoaded());
        
        // Test that calculations still work after reload
        const testCalc = await calc.calculatePerformanceBasedXPAsync(1, 100, 300, 'easy');
        console.log('Test calculation after reload:', testCalc.xp_earned, 'XP');
        
        console.log('✓ Configuration reload test completed');
    } else {
        console.log('❌ XP Calculator not available globally');
    }
}

// Export test functions for manual use
if (typeof window !== 'undefined') {
    window.testCentralizedUtilities = testCentralizedUtilities;
    window.testXPCalculationAccuracy = testXPCalculationAccuracy;
    window.testSessionCompatibility = testSessionCompatibility;
    window.testConfigurationReload = testConfigurationReload;
    
    console.log('Utility tests available:');
    console.log('- testCentralizedUtilities(): Full integration test');
    console.log('- testXPCalculationAccuracy(): XP calculation verification with backend config');
    console.log('- testSessionCompatibility(): Session compatibility test');
    console.log('- testConfigurationReload(): Configuration reload test');
}

export { testCentralizedUtilities, testXPCalculationAccuracy, testSessionCompatibility, testConfigurationReload };