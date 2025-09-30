import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

/**
 * Level 5 Completion Dialogue - Hunt for The Null Investigation Complete
 */
export class Level5CompletionDialogue extends BaseDialogue {
    constructor(desktop, investigationTracker, character = 'instructor') {
        super(desktop, character);
        this.investigationTracker = investigationTracker;
        this.investigationStats = investigationTracker?.getStatus() || {};
        this.setupMessages();
    }

    setupMessages() {
        const score = this.investigationStats.investigationScore || 0;
        const maxScore = 500;
        const complianceScore = this.investigationStats.complianceScore || 0;
        const objectivesCompleted = this.investigationStats.objectivesCompleted?.length || 0;
        const evidenceAnalyzed = this.investigationStats.evidenceAnalyzed?.length || 0;

        // Determine performance level
        let performanceLevel = 'novice';
        let performanceMessage = '';
        
        if (score >= 450) {
            performanceLevel = 'expert';
            performanceMessage = 'Outstanding work! You\'ve demonstrated expert-level digital forensics skills.';
        } else if (score >= 350) {
            performanceLevel = 'proficient';
            performanceMessage = 'Excellent investigation! You\'ve shown strong forensic analysis capabilities.';
        } else if (score >= 250) {
            performanceLevel = 'competent';
            performanceMessage = 'Good work! You\'ve successfully identified The Null with solid evidence.';
        } else {
            performanceLevel = 'developing';
            performanceMessage = 'You\'ve made progress, but there\'s room to improve your forensic methodology.';
        }

        this.messages = [
            {
                text: `Congratulations, Digital Forensics Investigator! You've successfully completed "The Hunt for The Null" investigation.`,
            },
            {
                text: `Your forensic analysis has yielded crucial evidence in this cyber crime case. Let me review your investigation results...`,
            },
            {
                text: `**INVESTIGATION SUMMARY**\n\n📊 **Final Score:** ${score}/${maxScore} points\n🎯 **Objectives Completed:** ${objectivesCompleted}/5\n🔍 **Evidence Analyzed:** ${evidenceAnalyzed}/4\n📋 **Compliance Score:** ${complianceScore}%`,
            },
            {
                text: `${performanceMessage}\n\nYour investigation has provided valuable insights into The Null's activities and methodology.`,
            },
            {
                text: `The digital evidence you've collected and analyzed will be crucial for the prosecution of this case. Your forensic report documents the timeline, identifies the perpetrator, and establishes a clear chain of custody.`,
            },
            {
                text: `Now, let's review the detailed workflow analysis of your investigation to identify what went well and areas for improvement in your forensic methodology.`,
            }
        ];
    }

    onComplete() {
        console.log('[Level5CompletionDialogue] Dialogue completed, showing workflow summary');
        
        // Show the workflow summary after dialogue
        this.showWorkflowSummary();
    }

    async showWorkflowSummary() {
        try {
            // Import and show the workflow summary
            const { Level5WorkflowSummary } = await import('../components/level5-workflow-summary.js');
            
            const summaryStats = {
                score: this.investigationStats.investigationScore || 0,
                totalPossible: 500,
                objectivesCompleted: this.investigationStats.objectivesCompleted?.length || 0,
                evidenceAnalyzed: this.investigationStats.evidenceAnalyzed?.length || 0,
                correctActions: this.investigationStats.correctActions || 0,
                incorrectActions: this.investigationStats.incorrectActions || 0,
                complianceScore: this.investigationStats.complianceScore || 0,
                forensicActions: this.investigationTracker?.forensicActions || [],
                correctActionsList: this.investigationTracker?.correctActions || [],
                incorrectActionsList: this.investigationTracker?.incorrectActions || []
            };
            
            Level5WorkflowSummary.createAndShow(this.investigationTracker, summaryStats);
            
        } catch (error) {
            console.error('[Level5CompletionDialogue] Failed to show workflow summary:', error);
            
            // Fallback: redirect to levels
            setTimeout(() => {
                window.location.href = '/levels';
            }, 2000);
        }
    }

    getFinalButtonText() {
        return 'View Investigation Analysis →';
    }

    // Static method to start the dialogue
    static startLevel5CompletionDialogue(desktop, investigationTracker) {
        const dialogue = new Level5CompletionDialogue(desktop, investigationTracker);
        dialogue.start();
        return dialogue;
    }
}

export default Level5CompletionDialogue;