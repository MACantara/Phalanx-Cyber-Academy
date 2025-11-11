# NLP-Enhanced Red Team AI Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     BLUE TEAM VS RED TEAM MODE                          │
│                         (Game Controller)                                │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ├──────────────────────────────┐
                             ↓                              ↓
┌──────────────────────────────────────┐   ┌──────────────────────────────┐
│      NLP Attack Analyzer             │   │     AI Engine (Q-Learning)   │
│  (nlp-attack-analyzer.js)            │   │      (ai-engine.js)          │
│                                      │   │                              │
│  • Context Analysis                  │   │  • State Representation      │
│  • Vulnerability Detection           │←──┤  • Action Selection          │
│  • MITRE ATT&CK Mapping             │   │  • Q-Table Updates           │
│  • Success Probability               │   │  • Reward Calculation        │
└──────────────────────────────────────┘   └──────────────┬───────────────┘
                                                           │
                                                           ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    Backend NLP API (Optional)                           │
│                  (red_team_nlp_api.py)                                  │
│                                                                         │
│  • /api/red-team-nlp/analyze-context                                   │
│  • /api/red-team-nlp/technique-info/<id>                               │
│  • /api/red-team-nlp/training-feedback                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

## NLP Analysis Flow

```
Game State Input
      ↓
┌─────────────────────┐
│ Generate State      │
│ Description         │
│                     │
│ "all assets secure, │
│  full controls      │
│  active, low alert" │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Analyze Defensive   │
│ Posture             │
│                     │
│ • Asset Integrity   │
│ • Control Status    │
│ • Alert Level       │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Identify            │
│ Vulnerabilities     │
│                     │
│ [weak_firewall,     │
│  no_monitoring]     │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Select Optimal      │
│ MITRE Techniques    │
│                     │
│ T1595, T1046, T1190 │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Calculate Success   │
│ Probability         │
│                     │
│ 0.75 (75%)          │
└─────────────────────┘
```

## Q-Learning Integration

```
┌───────────────────────────────────────────────────────────────┐
│                     Q-Learning Cycle                          │
└───────────────────────────────────────────────────────────────┘

State (s)                    NLP Analysis              Action (a)
────────                     ─────────────             ──────────
phase: 2                     vulnerabilities:          type: initial-access
timeRemaining: 12            - weak_firewall          technique: T1190
assetIntegrity: 4            - weak_endpoint          target: student-db
alertLevel: 1                successProb: 0.75         mitreId: T1190
controls: 2                                            nlpGuided: true
defenseStrength: 3           ┌─────────────────┐
vulnCount: 2        ────────→│  Action         │
attackVector: 1              │  Selection      │
                             │  (ε-greedy +    │
                             │   NLP guidance) │
        ↓                    └────────┬────────┘
                                      ↓
┌──────────────────┐                           ┌─────────────────┐
│  Execute Action  │                           │ Observe Reward  │
│                  │──────────────────────────→│                 │
│  - Send attack   │                           │ r = +1.2        │
│  - Update game   │                           │ (successful +   │
│  - Get feedback  │                           │  NLP bonus)     │
└──────────────────┘                           └────────┬────────┘
                                                        ↓
        ↑                                     ┌──────────────────┐
        │                                     │ Update Q-Table   │
        │                                     │                  │
        │←────────────────────────────────────│ Q(s,a) ← Q(s,a) +│
        │                                     │ α[r + γ max Q]   │
        │                                     └──────────────────┘
        │
New State (s')
────────────
phase: 3
...
```

## Attack Phase Progression

```
┌──────────────────┐
│  Reconnaissance  │ ──→ Network Scanning (T1595)
└────────┬─────────┘     Port Scanning (T1592)
         │
         ↓ Prerequisites Met
┌──────────────────┐
│  Initial Access  │ ──→ Phishing (T1566)
└────────┬─────────┘     Exploit Public App (T1190)
         │
         ↓ Prerequisites Met
┌──────────────────┐
│   Persistence    │ ──→ Registry Mod (T1547)
└────────┬─────────┘     Scheduled Task (T1053)
         │
         ↓ Prerequisites Met
┌──────────────────┐
│   Privilege      │ ──→ Process Injection (T1055)
│   Escalation     │     Token Manipulation (T1134)
└────────┬─────────┘
         │
         ↓ Prerequisites Met
┌──────────────────┐
│ Credential       │ ──→ Credential Dumping (T1003)
│ Access           │     Brute Force (T1110)
└────────┬─────────┘
         │
         ↓ Prerequisites Met
┌──────────────────┐
│    Discovery     │ ──→ System Info (T1082)
└────────┬─────────┘     Network Scan (T1046)
         │
         ↓ Prerequisites Met
┌──────────────────┐
│    Lateral       │ ──→ Remote Services (T1021)
│    Movement      │     Tool Transfer (T1570)
└────────┬─────────┘
         │
         ↓ Prerequisites Met
┌──────────────────┐
│   Collection     │ ──→ Local Data (T1005)
└────────┬─────────┘     Screen Capture (T1113)
         │
         ↓ Prerequisites Met
┌──────────────────┐
│  Exfiltration    │ ──→ C2 Transfer (T1041)
└────────┬─────────┘     Automated (T1020)
         │
         ↓ Prerequisites Met
┌──────────────────┐
│     Impact       │ ──→ Data Destruction (T1485)
└──────────────────┘     DDoS (T1498)
```

## Vulnerability to Technique Mapping

```
┌──────────────────────────┐      ┌────────────────────────────────┐
│   Weak Firewall          │──────→│ T1595 - Active Scanning        │
└──────────────────────────┘      │ T1046 - Network Service Scan   │
                                  │ T1190 - Exploit Public App     │
┌──────────────────────────┐      └────────────────────────────────┘
│   Weak Endpoint          │──────→│ T1055 - Process Injection      │
└──────────────────────────┘      │ T1543 - Service Creation       │
                                  │ T1113 - Screen Capture         │
┌──────────────────────────┐      └────────────────────────────────┘
│   Weak Access Control    │──────→│ T1110 - Brute Force            │
└──────────────────────────┘      │ T1134 - Token Manipulation     │
                                  │ T1021 - Remote Services        │
┌──────────────────────────┐      └────────────────────────────────┘
│   No Monitoring          │──────→│ T1070 - Indicator Removal      │
└──────────────────────────┘      │ T1036 - Masquerading           │
                                  │ T1082 - System Info Discovery  │
┌──────────────────────────┐      └────────────────────────────────┘
│   Compromised Assets     │──────→│ T1005 - Local Data Collection  │
└──────────────────────────┘      │ T1560 - Archive Data           │
                                  │ T1041 - Exfiltration Over C2   │
                                  └────────────────────────────────┘
```

## Decision Making Process

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI Decision Making                          │
└─────────────────────────────────────────────────────────────────┘

Step 1: Get Game State
      ↓
┌─────────────────────┐
│ Read current state  │ ──→ Assets, Controls, Alerts, Time
└──────────┬──────────┘
           ↓
Step 2: NLP Analysis
      ↓
┌─────────────────────┐
│ Analyze context     │ ──→ Vulnerabilities, Success Probability
└──────────┬──────────┘
           ↓
Step 3: Action Selection
      ↓
┌─────────────────────────────────────────────────────────────┐
│                    Decision Strategy                        │
│                                                             │
│  50% NLP-Guided (if confident)                             │
│  ├─→ Use recommended techniques                            │
│  └─→ Weight by contextual fit                              │
│                                                             │
│  30% Exploration (random)                                   │
│  ├─→ Try random actions                                    │
│  └─→ Learn new strategies                                  │
│                                                             │
│  20% Exploitation (Q-table)                                │
│  ├─→ Use best known action                                │
│  └─→ Maximize expected reward                              │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
Step 4: Execute Attack
      ↓
┌─────────────────────┐
│ Create attack data  │ ──→ MITRE ID, Target, IP, etc.
└──────────┬──────────┘
           ↓
Step 5: Learn from Result
      ↓
┌─────────────────────┐
│ Calculate reward    │ ──→ Success/Failure + NLP bonus
│ Update Q-table      │
└─────────────────────┘
```

## Data Flow Diagram

```
Player Actions          Game Controller          AI Engine
──────────────         ────────────────         ─────────
     │                        │                     │
     │ Block IP              │                     │
     ├──────────────────────→│                     │
     │                        │ handleIPBlock()    │
     │                        ├────────────────────→│
     │                        │                     │ Change IP
     │                        │                     │ Update Q-table
     │                        │                     │
     │                        │ New attack         │
     │                        │←────────────────────┤
     │                        │                     │
     │ Isolate Asset         │                     │
     ├──────────────────────→│                     │
     │                        │ updateGameState()  │
     │                        ├────────────────────→│
     │                        │                     │ NLP Analysis
     │                        │                     │ Adjust strategy
     │                        │                     │
     │ View Stats            │                     │
     ├──────────────────────→│                     │
     │                        │ getAIState()       │
     │                        ├────────────────────→│
     │                        │                     │
     │                        │ Stats data         │
     │                        │←────────────────────┤
     │ Display stats         │                     │
     │←───────────────────────┤                     │
     │                        │                     │
```

## Reward Function Flowchart

```
┌─────────────────┐
│ Attack Executed │
└────────┬────────┘
         │
         ↓
    ┌────────┐
    │Detected?│
    └───┬────┘
        │
    ┌───┴───┐
   No      Yes
    │       │
    ↓       ↓
┌────────┐ ┌──────────┐
│reward  │ │reward    │
│= +1    │ │= -1      │
└───┬────┘ └────┬─────┘
    │           │
    │           ↓
    │      ┌─────────────────┐
    │      │Correct isolation?│
    │      └────┬───────┬────┘
    │          Yes     No
    │           │       │
    │           ↓       │
    │      ┌─────────┐  │
    │      │reward   │  │
    │      │-= 0.5   │  │
    │      └────┬────┘  │
    │           │       │
    └───────────┴───────┘
                │
                ↓
         ┌──────────────┐
         │High-value     │
         │target?        │
         └──┬───────┬───┘
           Yes     No
            │       │
            ↓       │
       ┌─────────┐  │
       │reward   │  │
       │+= 0.5   │  │
       └────┬────┘  │
            │       │
            └───────┘
                │
                ↓
         ┌──────────────┐
         │NLP prediction │
         │accurate?      │
         └──┬───────┬───┘
           Yes     No
            │       │
            ↓       ↓
       ┌─────┐ ┌─────┐
       │+0.2 │ │-0.1 │
       └──┬──┘ └──┬──┘
          │       │
          └───┬───┘
              ↓
       ┌─────────────┐
       │Final Reward │
       └─────────────┘
```

## Component Interaction Sequence

```
Time ──→

Player              UI Manager      Game Controller    AI Engine        NLP Analyzer
  │                     │                  │               │                  │
  │ Start Game         │                  │               │                  │
  ├────────────────────→│                  │               │                  │
  │                     │ startGame()     │               │                  │
  │                     ├─────────────────→│               │                  │
  │                     │                  │ startAttack() │                  │
  │                     │                  ├──────────────→│                  │
  │                     │                  │               │ analyzeState()  │
  │                     │                  │               ├─────────────────→│
  │                     │                  │               │                  │
  │                     │                  │               │ recommendations │
  │                     │                  │               │←─────────────────┤
  │                     │                  │               │                  │
  │                     │                  │ attack event  │                  │
  │                     │                  │←──────────────┤                  │
  │                     │ updateUI()      │               │                  │
  │                     │←─────────────────┤               │                  │
  │ Alert displayed    │                  │               │                  │
  │←────────────────────┤                  │               │                  │
  │                     │                  │               │                  │
  │ Block IP           │                  │               │                  │
  ├────────────────────→│                  │               │                  │
  │                     │ playerAction()  │               │                  │
  │                     ├─────────────────→│               │                  │
  │                     │                  │ handleBlock() │                  │
  │                     │                  ├──────────────→│                  │
  │                     │                  │               │ updateQTable()  │
  │                     │                  │               │                  │
  │                     │                  │ XP awarded   │                  │
  │                     │ updateXP()      │←──────────────┤                  │
  │                     │←─────────────────┤               │                  │
  │ XP notification    │                  │               │                  │
  │←────────────────────┤                  │               │                  │
```

This architecture provides a comprehensive view of how the NLP-enhanced Red Team AI integrates natural language processing with Q-learning to create an intelligent, adaptive adversary for cybersecurity training.
