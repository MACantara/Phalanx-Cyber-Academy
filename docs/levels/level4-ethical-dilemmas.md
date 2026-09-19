# Level 4: The White Hat Test - Ethical Dilemma Integration

## Overview

The ethical dilemma scenarios from LEVEL4_IDEAS.md have been fully implemented and integrated with the vulnerability scanner app. These scenarios will trigger automatically during Level 4 gameplay based on user actions.

## Implementation Details

### Dialogue Files Created

1. **CryptocurrencyBribeDialogue** - Triggers after vulnerability report generation
2. **CorporatePressureDialogue** - Triggers after bribe choice (if ethical choice made)
3. **LiveElectionCrisisDialogue** - Triggers randomly during active scanning phase
4. **JournalistContactDialogue** - Triggers after corporate pressure choice
5. **EthicsOathDialogue** - Triggers after all major choices are made
6. **ConsequenceEndingDialogue** - Shows final outcomes based on all choices

### Integration Points

The dialogues are triggered through the `Level4DilemmaManager` which is initialized in the vulnerability scanner app when Level 4 is active. The manager monitors for:

- **Report Generation**: Triggers cryptocurrency bribe scenario
- **Scan Completion**: Increments scan counter for crisis scenario trigger
- **Nmap Integration**: Tracks advanced tool usage
- **Choice Completion**: Manages dialogue cascade

### Automatic Triggers

1. **After Report Generation**: Cryptocurrency bribe offer (2 second delay)
2. **After 2+ Scans**: Live election crisis scenario (potential trigger)
3. **After Ethical Choices**: Corporate pressure and journalist contact (cascading)
4. **After All Choices**: Ethics oath ceremony and consequence ending

### Testing and Manual Triggers

For testing purposes, the following methods are available in the browser console:

```javascript
// Get reference to vulnerability scanner app
const vulnApp = document.querySelector('#vulnerability-scanner-container')?._vulnerabilityApp;

// Trigger specific dilemmas manually
vulnApp?.triggerLevel4Dilemma('bribe');        // Cryptocurrency bribe
vulnApp?.triggerLevel4Dilemma('corporate');    // Corporate pressure
vulnApp?.triggerLevel4Dilemma('crisis');       // Election crisis
vulnApp?.triggerLevel4Dilemma('journalist');   // Journalist contact
vulnApp?.triggerLevel4Dilemma('oath');         // Ethics oath
vulnApp?.triggerLevel4Dilemma('consequence');  // Final consequences

// Check current progress
vulnApp?.getLevel4Progress();

// Reset progress for testing
vulnApp?.resetLevel4Progress();
```

### Ethics Scoring System

- **Positive Actions**: Responsible disclosure (+200), Refusing bribes (+300), Professional integrity (+150)
- **Negative Actions**: Accepting bribes (-500), Unethical disclosure (-400), Misleading information (-500)
- **Mixed Actions**: Negotiations and compromises (varying XP)

### Choice Tracking

All choices are stored in localStorage with keys:
- `cyberquest_level4_choice_bribe`
- `cyberquest_level4_choice_corporate`
- `cyberquest_level4_choice_crisis`
- `cyberquest_level4_choice_media`
- `cyberquest_ethics_oath_taken`

### Branching Narrative Endings

Based on choice combinations:
- **Ethical Hero**: All positive choices → Award ceremony, professional recognition
- **Fallen Researcher**: Corruption path → Legal consequences, career destruction
- **Compromised Professional**: Mixed choices → Career limitations, lessons learned
- **Mixed Results**: Varied outcomes → Learning opportunities, room for improvement

## Usage Instructions

1. **Start Level 4**: The dilemma manager automatically initializes when Level 4 begins
2. **Generate Reports**: Use the vulnerability scanner's report generation features to trigger scenarios
3. **Make Ethical Choices**: Each dialogue presents multiple options with clear consequences
4. **Complete Assessment**: Progress through all scenarios to reach the ethics oath ceremony
5. **Review Outcomes**: Final consequence dialogue shows the impact of all decisions

## Character Avatars

The following avatar files should be placed in `/static/images/avatars/`:
- `anonymous-hacker.png` - For cryptocurrency bribe contact
- `corporate-ceo.png` - For SecureVote CEO
- `election-official.png` - For election commissioner
- `journalist.png` - For tech journalist
- `narrator.png` - For consequence endings

## Reflection Questions

Built into the system are philosophical reflection prompts:
1. "How would you feel if this vulnerability was exploited in your hometown's election?"
2. "What's more important: immediate transparency or giving vendors time to fix issues?"
3. "How do you balance public safety with respecting democratic processes?"
4. "What responsibilities do security researchers have to society?"

## Educational Value

This implementation teaches:
- **Responsible Disclosure Protocols**
- **Professional Ethics Under Pressure**
- **Balancing Competing Interests**
- **Long-term Consequences of Ethical Choices**
- **Real-world Security Research Challenges**

The system successfully transforms the technical vulnerability scanning process into an immersive ethical decision-making experience that prepares students for real-world cybersecurity responsibilities.
