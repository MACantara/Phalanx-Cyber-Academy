document.addEventListener('DOMContentLoaded', function() {
    // Enhanced client-side features for levels page
    console.log('Cybersecurity Levels page loaded with server-side tracking');
    
    // Smooth animations for level cards
    const levelCards = document.querySelectorAll('.level-card');
    levelCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Add hover effects for accessible/completed levels
        if (!card.classList.contains('cursor-not-allowed')) {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.02)';
                this.style.transition = 'transform 0.3s ease';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        }
    });
    
    // Progress bar animation
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        const targetWidth = progressBar.style.width;
        progressBar.style.width = '0%';
        setTimeout(() => {
            progressBar.style.width = targetWidth;
        }, 500);
    }
    
    // Add pulse animation to in-progress levels
    levelCards.forEach(card => {
        const status = card.dataset.status;
        if (status === 'in_progress') {
            const icon = card.querySelector('.level-icon');
            if (icon) {
                icon.classList.add('animate-pulse');
            }
        }
    });
    
    // Use centralized toast utility
    // Initialize toast manager if not already available
    if (!window.toastManager) {
        // Dynamically load toast manager if not available
        console.log('Toast manager not found, creating basic fallback');
    }
    
    // Wrapper function to maintain compatibility with existing code
    function showNotification(type, title, message, duration = 5000) {
        // Use centralized toast if available, otherwise fallback
        if (window.toastManager && window.toastManager.showToast) {
            const fullMessage = title && message ? `${title}: ${message}` : (title || message);
            window.toastManager.showToast(fullMessage, type);
        } else {
            // Fallback to basic notification if toast manager not available
            console.log(`Notification [${type}]: ${title || ''} - ${message || ''}`);
        }
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            const levelNum = parseInt(e.key);
            if (levelNum >= 1 && levelNum <= 5) {
                e.preventDefault();
                const levelCard = document.querySelector(`[data-level-id="${levelNum}"]`);
                if (levelCard) {
                    const button = levelCard.querySelector('.level-button');
                    if (button && !button.disabled) {
                        button.click();
                    }
                }
            }
        }
    });
    
    // Add keyboard shortcuts tooltip
    const keyboardHint = document.createElement('div');
    keyboardHint.className = 'fixed bottom-4 left-4 bg-gray-800 text-white px-3 py-2 rounded text-sm opacity-0 transition-opacity duration-300';
    keyboardHint.innerHTML = '<i class="bi bi-keyboard mr-2"></i>Ctrl + 1-5 to quick start levels';
    document.body.appendChild(keyboardHint);
    
    // Show keyboard hint on hover over level cards
    levelCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            keyboardHint.style.opacity = '0.8';
        });
        
        card.addEventListener('mouseleave', () => {
            keyboardHint.style.opacity = '0';
        });
    });
    
    // Performance monitoring for level start times
    window.CyberQuestPerformance = {
        startTimes: {},
        
        markLevelStart(levelId) {
            this.startTimes[levelId] = performance.now();
            console.log(`Level ${levelId} start marked`);
        },
        
        markLevelEnd(levelId) {
            if (this.startTimes[levelId]) {
                const duration = performance.now() - this.startTimes[levelId];
                console.log(`Level ${levelId} loading time: ${duration.toFixed(2)}ms`);
                
                // Send performance data if needed
                if (window.CyberQuestAPI) {
                    window.CyberQuestAPI.logAnalytics(levelId, 'performance', {
                        loading_time: duration,
                        timestamp: new Date().toISOString()
                    });
                }
                
                delete this.startTimes[levelId];
            }
        }
    };
    
    // Intercept level start clicks for performance tracking
    document.querySelectorAll('.level-button').forEach(button => {
        button.addEventListener('click', function() {
            const levelId = this.getAttribute('data-level-id') || 
                          this.closest('[data-level-id]')?.getAttribute('data-level-id');
            if (levelId) {
                window.CyberQuestPerformance.markLevelStart(parseInt(levelId));
            }
        });
    });
    
    // Expose notification function globally
    window.showNotification = showNotification;
    
    console.log('Enhanced levels page features initialized');
});
