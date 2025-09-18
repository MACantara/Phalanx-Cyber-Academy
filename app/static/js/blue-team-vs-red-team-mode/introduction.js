// Introduction Page JavaScript for Blue Team vs Red Team Mode
class IntroductionManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startAnimations();
        
        console.log('🎮 Introduction Manager initialized');
    }
    
    setupEventListeners() {
        // Start simulation button
        const startButton = document.getElementById('start-simulation');
        if (startButton) {
            // Start simulation now routes to the tutorial first. The tutorial may
            // then redirect to the dashboard (using ?next=dashboard) when it
            // completes. This replaces the separate "Tutorial" button flow.
            startButton.addEventListener('click', () => this.startSimulation());
        }
        
    const tutorialButton = document.querySelector('a[href^="/blue-vs-red/tutorial"]');
        if (tutorialButton) {
            tutorialButton.addEventListener('click', (e) => {
                // Let the default navigation happen, just add loading feedback
                tutorialButton.innerHTML = '<i class="bi bi-hourglass-split animate-spin mr-2"></i>Loading Tutorial...';
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
    }
    
    startAnimations() {
        // Simple fade in for subtitle with safer selection
        setTimeout(() => {
            const subtitle = document.querySelector('section .text-xl');
            if (subtitle) {
                subtitle.style.opacity = '1';
                subtitle.style.transition = 'opacity 1s ease';
            }
        }, 1000);
        
        // Add hover effects to feature cards
        this.setupHoverEffects();
        
        // Ensure body doesn't have unnecessary overflow
        document.body.style.overflowX = 'hidden';
    }
    
    setupHoverEffects() {
        const featureCards = document.querySelectorAll('.bg-gray-800\\/50, .bg-blue-900\\/40, .bg-red-900\\/40');
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                card.style.transition = 'border-color 0.3s ease';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.borderColor = '';
            });
        });
    }
    
    startSimulation() {
        // Show loading state
        const startButton = document.getElementById('start-simulation');
        const originalContent = startButton.innerHTML;
        
    // Redirect to the tutorial first with a `next=dashboard` param.
        startButton.innerHTML = '<i class="bi bi-hourglass-split animate-spin mr-2"></i>Opening Tutorial...';
        startButton.disabled = true;

        // Redirect to tutorial with next target
        setTimeout(() => {
            const nextUrl = '/blue-vs-red/tutorial?next=dashboard';
            window.location.href = nextUrl;
        }, 400); // brief delay for visual feedback
    }
    
    handleKeyNavigation(e) {
        if (e.key === 'Enter') {
            this.startSimulation();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new IntroductionManager();
});

// Export for potential external use
window.IntroductionManager = IntroductionManager;
