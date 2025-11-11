# NLP-Enhanced Red Team AI - Quick Reference

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start Application
```bash
python run.py
```

### 3. Navigate to Blue vs Red Team Mode
```
http://localhost:5000/blue-vs-red/
```

## Key Files

### JavaScript Files
- `nlp-attack-analyzer.js` - NLP context analyzer
- `ai-engine.js` - Enhanced Q-learning AI
- `game-controller.js` - Game orchestration
- `ui-manager.js` - UI updates

### Python Files
- `red_team_nlp_api.py` - Backend NLP API
- `blue_team_vs_red_team_mode/__init__.py` - Game routes

### Documentation
- `nlp-enhanced-red-team-ai.md` - Full documentation
- `blue-team-vs-red-team-xp-tracking-system.md` - XP system

## Debug Console Commands

Open browser console and try these:

```javascript
// Get AI state
window.gameController.aiEngine.getAIState()

// Export Q-table
window.gameController.aiEngine.exportQTable()

// Export NLP stats
window.gameController.aiEngine.exportNLPStats()

// Get current IP info
window.gameController.aiEngine.getCurrentIPInfo()

// Get difficulty
window.gameController.aiEngine.getDifficulty()
```

## Common Tasks

### Add New MITRE Technique

1. Edit `nlp-attack-analyzer.js`:
```javascript
'T1234': {
    id: 'T1234',
    name: 'New Technique',
    description: 'Technique Description',
    prerequisites: ['phase_complete'],
    successFactors: ['vulnerability_type']
}
```

2. Add to backend (optional):
```python
MITRE_TECHNIQUES['T1234'] = {
    'tactic': 'tactic-name',
    'name': 'New Technique',
    'severity': 'high'
}
```

### Adjust AI Difficulty

Edit `ai-engine.js`:
```javascript
// More aggressive
this.explorationRate = 0.1;  // Less exploration
this.learningRate = 0.2;     // Faster learning

// More defensive
this.explorationRate = 0.5;  // More exploration
this.learningRate = 0.05;    // Slower learning
```

### Modify Reward Function

Edit `ai-engine.js` in `calculateReward()`:
```javascript
// Increase penalties
if (detected) {
    reward = -2;  // Harsher penalty
}

// Add custom bonuses
if (customCondition) {
    reward += customBonus;
}
```

### Add New Vulnerability Detection

Edit `nlp-attack-analyzer.js` in `identifyVulnerabilities()`:
```javascript
if (gameState.newCondition) {
    vulnerabilities.push('new_vulnerability');
}
```

## API Usage Examples

### Analyze Context from Frontend
```javascript
const response = await fetch('/api/red-team-nlp/analyze-context', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        gameState: gameState,
        currentPhase: 'initial-access',
        completedPhases: ['reconnaissance']
    })
});
const data = await response.json();
console.log(data.recommended_techniques);
```

### Get Technique Info
```javascript
const response = await fetch('/api/red-team-nlp/technique-info/T1566');
const data = await response.json();
console.log(data.technique);
```

### Send Training Feedback
```javascript
await fetch('/api/red-team-nlp/training-feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        predictedSuccess: 0.75,
        actualSuccess: true,
        techniqueUsed: 'T1566',
        context: { /* context */ },
        reward: 1.2
    })
});
```

## Troubleshooting

### AI Not Attacking
**Check:**
1. Game is running: `gameState.isRunning === true`
2. AI engine started: `aiEngine.isAttacking === true`
3. Console for errors

**Fix:**
```javascript
window.gameController.startGame();
```

### NLP Not Working
**Check:**
1. Module imported: Check console for import errors
2. Analyzer initialized: `aiEngine.nlpAnalyzer !== undefined`

**Fix:**
```javascript
// Verify import
console.log(window.gameController.aiEngine.nlpAnalyzer);
```

### Q-Learning Not Learning
**Check:**
1. Rewards are being calculated
2. Q-table is updating: `aiEngine.qTable.size > 0`
3. Exploration rate: `aiEngine.explorationRate`

**Fix:**
```javascript
// Reset and restart
window.gameController.resetGame();
window.gameController.startGame();
```

### Backend API Not Responding
**Check:**
1. Flask app running
2. Blueprint registered
3. Route correct: `/api/red-team-nlp/*`

**Fix:**
```bash
# Restart Flask
python run.py
```

## Performance Optimization

### Reduce NLP Frequency
```javascript
// In ai-engine.js, analyze less frequently
if (this.attackCount % 5 === 0) {
    nlpAnalysis = this.nlpAnalyzer.analyzeGameState(...);
}
```

### Limit Q-Table Size
```javascript
// Add in updateQTable()
if (this.qTable.size > 10000) {
    // Prune old entries
    this.pruneQTable();
}
```

### Cache NLP Results
```javascript
this.nlpCache = new Map();

// In analyzeGameState()
const cacheKey = this.stateToString(state);
if (this.nlpCache.has(cacheKey)) {
    return this.nlpCache.get(cacheKey);
}
```

## Testing Checklist

- [ ] AI starts attacking after game start
- [ ] NLP analysis appears in console
- [ ] MITRE technique IDs displayed
- [ ] Q-learning rewards calculated
- [ ] Attack phases progress correctly
- [ ] IP blocking works
- [ ] Asset integrity decreases on successful attacks
- [ ] XP awarded correctly
- [ ] API endpoints respond
- [ ] Backend logs show activity

## Configuration

### Environment Variables
```bash
# .env file
ENABLE_NLP_API=true
NLP_LOG_LEVEL=DEBUG
AI_LEARNING_RATE=0.1
AI_EXPLORATION_RATE=0.3
```

### Game Settings
```javascript
// In dashboard.html or game-controller.js
const CONFIG = {
    AI_ATTACK_INTERVAL: 3000,    // ms between attacks
    NLP_CONFIDENCE_THRESHOLD: 0.7,
    MAX_Q_TABLE_SIZE: 10000,
    ENABLE_CONSOLE_LOGGING: true
};
```

## Resources

- **MITRE ATT&CK**: https://attack.mitre.org/
- **Q-Learning Tutorial**: https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning/
- **NLP Basics**: https://www.nltk.org/book/
- **Flask Blueprints**: https://flask.palletsprojects.com/en/2.3.x/blueprints/

## Support

For issues or questions:
1. Check console logs
2. Review full documentation
3. Test with different scenarios
4. Enable debug logging

## Version History

- **v1.0** - Initial NLP-enhanced AI implementation
  - NLP attack pattern analyzer
  - Q-learning integration
  - MITRE ATT&CK framework
  - Backend API support
