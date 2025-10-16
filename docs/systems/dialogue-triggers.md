# Dialogue Trigger Documentation

## Dialogue Flow Throughout Phalanx Cyber Academy Interface

### 1. **Level Dialogues** (Level-specific introduction dialogues)

#### **When Triggered:**
- **Level Start**: Automatically when user enters a specific level
- **Condition**: Level is specified in desktop initialization
- **Location**: Desktop initialization based on backend level data

#### **Trigger Points:**
```javascript
// In dialogue integration
if (this.desktop.level) {
    const levelNum = typeof this.desktop.level === 'object' ? this.desktop.level.id : this.desktop.level;
    if (this.levelDialogues.has(levelNum)) {
        await this.startLevelDialogue(levelNum);
    }
}
```

#### **Available Level Dialogues:**
- **Level 1**: `level1-misinformation-maze` - The Misinformation Maze
- **Level 2**: `level2-shadow-inbox` - Shadow in the Inbox  
- **Level 3**: `level3-malware-mayhem` - Malware Mayhem
- **Level 4**: `level4-white-hat-test` - The White Hat Test
- **Level 5**: `level5-hunt-for-the-null` - The Hunt for The Null

---

### 2. **Tutorial Intro Dialogue** (`tutorial-intro-dialogue.js`)

#### **When Triggered:**
- **Tutorial Start**: When tutorial system needs introduction
- **Condition**: Tutorial intro completion flag not set
- **Location**: Between tutorial initialization and hands-on tutorials

#### **Trigger Logic:**
```javascript
static shouldAutoStart() {
    return !localStorage.getItem('Phalanx Cyber Academy_tutorial_intro_completed');
}
```

#### **What Happens After:**
- Sets: `Phalanx Cyber Academy_tutorial_intro_completed = 'true'`
- **Auto-triggers**: Initial Tutorial (`startInitialTutorial()`)
- **Character**: Dr. Cipher (Instructor)
- **Purpose**: Bridge between level start and hands-on tutorials

---

### 3. **Mission Briefing Dialogue** (`mission-briefing-dialogue.js`)

#### **When Triggered:**
- **All Tutorials Complete**: After user finishes all 8 tutorials
- **Condition**: All tutorial completion flags are `true`
- **Location**: Post-tutorial completion check

#### **Trigger Conditions:**
```javascript
const allTutorialsCompleted = [
    'Phalanx Cyber Academy_tutorial_completed',           // Initial tutorial
    'Phalanx Cyber Academy_email_tutorial_completed',     // Email security
    'Phalanx Cyber Academy_browser_tutorial_completed',   // Web security  
    'Phalanx Cyber Academy_filemanager_tutorial_completed', // File security
    'Phalanx Cyber Academy_networkmonitor_tutorial_completed', // Network analysis
    'Phalanx Cyber Academy_securitytools_tutorial_completed',  // Security tools
    'Phalanx Cyber Academy_systemlogs_tutorial_completed',     // Log analysis
    'Phalanx Cyber Academy_terminal_tutorial_completed'        // Command line
].every(key => localStorage.getItem(key));
```

#### **What Happens After:**
- Sets: `Phalanx Cyber Academy_mission_briefing_completed = 'true'`
- **Ready for**: Live mission scenarios
- **Character**: Commander Steel
- **Purpose**: Transition from training to real scenarios

---

## **Integration Flow Summary:**

### **First Time User Journey:**
1. **Desktop Loads** → Check for level-specific dialogue
2. **Level Dialogue** → Level introduction and context setting
3. **Tutorial Intro** → Educational bridge (if needed)
4. **Initial Tutorial** → Desktop navigation training
5. **App Tutorials** → Individual application training (8 tutorials)
6. **Mission Briefing** → Ready for real scenarios
7. **Live Missions** → Actual cybersecurity challenges

### **Returning User Scenarios:**
- **Partial Progress**: Continues from where they left off
- **All Complete**: No auto-dialogues, ready for missions
- **Reset Training**: Manual restart triggers level dialogues again

### **Manual Triggers Available:**
- Emergency briefing for urgent scenarios
- Training reminders for skill refreshers
- Application-specific introductions
- Level-specific guidance

### **Event-Based Triggers:**
- Level entry (triggers level-specific dialogue)
- Application opening (could trigger app-specific dialogues)
- Tutorial completion (progress acknowledgment)
- Error scenarios (help and guidance)
- Achievement milestones (celebration and next steps)

This creates a **guided, narrative-driven learning experience** that seamlessly integrates story elements with hands-on cybersecurity training, starting directly with level-specific content!