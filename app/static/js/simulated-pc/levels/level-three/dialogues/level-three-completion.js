import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

export class LevelThreeCompletionDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            { text: 'Outstanding work, Agent! You\'ve successfully completed Level 3: Malware Mayhem under intense time pressure. Your rapid cybersecurity response saved the gaming championship!' },
            { text: 'You demonstrated exceptional skills in the three critical phases: eliminating malicious processes, performing comprehensive malware scans, and recovering encrypted files using advanced decryption tools.' },
            { text: 'Your swift action prevented catastrophic damage to the organization\'s reputation and avoided financial ruin. The tournament can continue thanks to your expertise!' },
            { text: 'You\'ve earned 250 XP in Advanced Threat Response and unlocked the \'Malware Hunter\' and \'Crisis Response Specialist\' badges. Your ability to work effectively under pressure is remarkable.' },
            { text: 'Remember: In real cybersecurity incidents, time is everything. Every minute of delay allows attackers to cause more damage, steal more data, and spread further through networks.' },
            { text: 'You\'re now ready for the most challenging cybersecurity scenarios. Your proven ability to handle high-stakes, time-critical incidents makes you invaluable to any security team!' }
        ];
    }

    async onComplete() {
        // Mark Level 3 as completed and update progress
        localStorage.setItem('cyberquest_level_3_completed', 'true');
        localStorage.setItem('cyberquest_current_level', '4');
        
        // Award XP and badges
        const currentXP = parseInt(localStorage.getItem('cyberquest_xp_threat_response') || '0');
        localStorage.setItem('cyberquest_xp_threat_response', (currentXP + 250).toString());
        
        const badges = JSON.parse(localStorage.getItem('cyberquest_badges') || '[]');
        if (!badges.includes('malware-hunter')) {
            badges.push('malware-hunter');
        }
        if (!badges.includes('crisis-response-specialist')) {
            badges.push('crisis-response-specialist');
        }
        localStorage.setItem('cyberquest_badges', JSON.stringify(badges));
        
        // Show session summary modal instead of shutdown sequence
        await this.showSessionSummaryModal();
    }

    async showSessionSummaryModal() {
        try {
            // Import and create the Level 3 session summary
            const { Level3SessionSummary } = await import('../level3-session-summary.js');
            
            // Get the timer reference
            const timer = window.level3Timer;
            if (!timer) {
                console.error('[LevelThreeCompletion] No timer available for session summary');
                // Fallback to direct navigation
                await this.showShutdownSequenceAndNavigate();
                return;
            }
            
            // Create and show the session summary
            const sessionSummary = new Level3SessionSummary(timer);
            
            // If there's an existing session summary instance, use its data
            if (window.level3SessionSummary) {
                sessionSummary.sessionData = window.level3SessionSummary.sessionData;
                sessionSummary.stageCompletionTimes = window.level3SessionSummary.stageCompletionTimes;
                sessionSummary.totalActions = window.level3SessionSummary.totalActions;
                sessionSummary.accurateActions = window.level3SessionSummary.accurateActions;
                sessionSummary.stagesCompleted = window.level3SessionSummary.stagesCompleted;
            }
            
            // Show the session summary modal
            await sessionSummary.showSessionSummary();
            
        } catch (error) {
            console.error('[LevelThreeCompletion] Failed to show session summary:', error);
            // Fallback to original shutdown sequence
            await this.showShutdownSequenceAndNavigate();
        }
    }

    async showShutdownSequenceAndNavigate() {
        // Create shutdown overlay
        const shutdownOverlay = document.createElement('div');
        shutdownOverlay.className = 'fixed inset-0 bg-black z-50';
        shutdownOverlay.style.zIndex = '9999';
        document.body.appendChild(shutdownOverlay);
        
        try {
            // Import and run shutdown sequence
            const { ShutdownSequence } = await import('../../../shutdown-sequence.js');
            
            // Run shutdown sequence
            await ShutdownSequence.runShutdown(shutdownOverlay);
            
            // After shutdown completes, navigate to levels overview
            this.navigateToLevelsOverview();
            
        } catch (error) {
            console.error('Failed to run shutdown sequence:', error);
            // Fallback to direct navigation if shutdown fails
            setTimeout(() => {
                this.navigateToLevelsOverview();
            }, 1000);
        } finally {
            // Clean up shutdown overlay
            if (shutdownOverlay.parentNode) {
                shutdownOverlay.remove();
            }
        }
    }

    navigateToLevelsOverview() {
        // Navigate to levels overview in the actual browser (not simulated browser)
        window.location.href = '/levels';
    }

    getFinalButtonText() {
        return 'Continue to Advanced Training';
    }

    getCharacterName() {
        // Force return the instructor name with proper fallback
        if (this.desktop?.dialogueManager) {
            const name = this.desktop.dialogueManager.getCharacterName(this.character);
            return name && name !== 'System' ? name : 'Dr. Cipher';
        }
        
        // Fallback to instructor name
        return 'Dr. Cipher';
    }

    getCharacterAvatar() {
        // Force return the instructor avatar with proper fallback
        if (this.desktop?.dialogueManager) {
            const avatar = this.desktop.dialogueManager.getCharacterAvatar(this.character);
            return avatar && !avatar.includes('default.png') ? avatar : '/static/images/avatars/Cipher_Neutral_Talking.gif';
        }
        
        // Fallback to instructor avatar
        return '/static/images/avatars/Cipher_Neutral_Talking.gif';
    }

    static shouldAutoStart() {
        const levelCompleted = localStorage.getItem('cyberquest_level_3_completed');
        const decryptionCompleted = localStorage.getItem('cyberquest_level_3_decryption_completed');
        return decryptionCompleted && !levelCompleted;
    }
    
    // Listen for decryption completion event
    static setupEventListeners(desktop) {
        window.addEventListener('level3-decryption-complete', () => {
            if (LevelThreeCompletionDialogue.shouldAutoStart()) {
                const dialogue = new LevelThreeCompletionDialogue(desktop);
                dialogue.start();
            }
        });
    }

    // Manual trigger for testing
    static triggerCompletion(desktop) {
        console.log('[LevelThreeCompletion] Manual completion trigger called');
        const dialogue = new LevelThreeCompletionDialogue(desktop);
        dialogue.start();
    }
}
