import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

export class Level4WhiteHatTestDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "Welcome to Level 4: The White Hat Test. This is a comprehensive cybersecurity challenge focused on ethical penetration testing and responsible disclosure."
            },
            {
                text: "You'll be conducting a security assessment of TechCorp's web application infrastructure using professional methodologies."
            },
            {
                text: "Your mission is to discover 7 randomly selected security flags hidden throughout the system using various reconnaissance and analysis techniques."
            },
            {
                text: "Each challenge represents a different aspect of security research - from environment analysis to log investigation, from configuration review to forensic analysis."
            },
            {
                text: "Use the integrated Challenge Tracker in the top-right corner to submit discovered flags and monitor your progress throughout the assessment."
            },
            {
                text: "The terminal provides access to various security tools and commands. Explore the file system methodically to uncover hidden vulnerabilities and exposed information."
            },
            {
                text: "Remember: this is an authorized penetration test. All activities are within scope and conducted with proper permission for educational purposes."
            },
            {
                text: "Your findings will be automatically validated, and successful completion demonstrates proficiency in ethical hacking methodologies and responsible security research practices."
            },
            {
                text: "Successfully completing this assessment will earn you 350 XP in Ethical Hacking and showcase your readiness for advanced cybersecurity roles."
            },
            {
                text: "Begin your security assessment by using the Terminal to explore the TechCorp infrastructure. Good hunting, and remember - thorough documentation is key to professional security research."
            }
        ];
    }

    onComplete() {
        localStorage.setItem('cyberquest_level_4_started', 'true');
        localStorage.setItem('cyberquest_level_4_start_time', Date.now());
        
        // Start a backend session for Level 4
        this.startBackendSession();
        
        // Create and start challenge tracker
        this.createAndStartChallengeTracker();
        
        // Open the Terminal application for ethical hacking tools
        if (window.applicationLauncher) {
            setTimeout(async () => {
                await window.applicationLauncher.launchForLevel(4, 'terminal', 'Terminal');
            }, 500);
        }
    }

    async startBackendSession() {
        try {
            const response = await fetch('/levels/api/session/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    session_name: 'The White Hat Test',
                    level_id: 4
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Store session ID for completion tracking
                    localStorage.setItem('cyberquest_active_session_id', data.session_id);
                    window.currentSessionId = data.session_id;
                    console.log('[Level4WhiteHat] Backend session started:', data.session_id);
                } else {
                    console.error('[Level4WhiteHat] Failed to start session:', data.error);
                }
            } else {
                console.error('[Level4WhiteHat] Session start request failed:', response.status);
            }
        } catch (error) {
            console.error('[Level4WhiteHat] Error starting session:', error);
            // Continue without session ID - completion can still work
        }
    }

    async createAndStartChallengeTracker() {
        try {
            // Import and create challenge tracker
            const { Level4ChallengeTracker } = await import('../apps/challenge-tracker-app.js');
            const tracker = new Level4ChallengeTracker();
            
            // Make tracker globally accessible
            window.level4ChallengeTracker = tracker;
            
            // Create and append tracker element
            const trackerElement = tracker.createElement();
            document.body.appendChild(trackerElement);
            
            // Initialize tracker
            tracker.initialize();
            
            console.log('[Level4Dialog] Challenge tracker started');
        } catch (error) {
            console.error('[Level4Dialog] Failed to create challenge tracker:', error);
        }
    }

    getFinalButtonText() {
        return 'Start CTF Assessment';
    }

    static shouldAutoStart() {
        const level4Started = localStorage.getItem('cyberquest_level_4_started');
        const level3Completed = localStorage.getItem('cyberquest_level_3_completed');
        return level3Completed && !level4Started;
    }

    static startLevel4Dialogue(desktop) {
        const dialogue = new Level4WhiteHatTestDialogue(desktop);
        dialogue.start();
    }
}
