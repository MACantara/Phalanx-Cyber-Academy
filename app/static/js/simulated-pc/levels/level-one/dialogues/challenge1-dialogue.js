import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

export class Challenge1Dialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "Welcome to your first cybersecurity challenge! You'll be analyzing real news articles to develop critical thinking skills for identifying misinformation."
            },
            {
                text: "You'll be presented with 15 different news articles - some are real, and some are fake news designed to mislead readers."
            },
            {
                text: "For each article, read carefully and look for warning signs that might indicate misinformation."
            },
            {
                text: "Pay attention to sensational headlines, questionable sources, missing author credentials, and emotional manipulation tactics."
            },
            {
                text: "Watch for red flags like biased language, factual inaccuracies, and claims that seem too extreme to be true."
            },
            {
                text: "After reading each article, simply classify it as either 'Real News' or 'Fake News' using the buttons provided."
            },
            {
                text: "You'll get immediate feedback on whether your classification was correct, helping you learn from each decision."
            },
            {
                text: "Use the navigation buttons to move between articles at your own pace."
            },
            {
                text: "Remember: Real journalism includes proper sourcing, balanced reporting, and verifiable facts."
            },
            {
                text: "Take your time to analyze each article thoroughly before making your classification."
            }
        ];
    }

    async onComplete() {
        // Just mark the challenge as started - navigation is handled elsewhere
        localStorage.setItem('cyberquest_challenge1_started', 'true');
    }

    getFinalButtonText() {
        return 'Begin Article Classification';
    }

    static shouldAutoStart() {
        const challenge1Started = localStorage.getItem('cyberquest_challenge1_started');
        return !challenge1Started;
    }
}
