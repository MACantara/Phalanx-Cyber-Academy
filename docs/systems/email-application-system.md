# Email Application System

## Overview

The Email Application System provides a comprehensive email client simulation for phishing detection and email security training. It features realistic email rendering, phishing identification mechanics, security classification, feedback systems, and completion tracking for Level 2: Shadow in the Inbox.

## Architecture

### Core Components

#### 1. **EmailApp** (`email-app.js`)
The main application class that extends WindowBase and orchestrates all email functionality.

**Key Responsibilities:**
- Email list rendering and display
- Folder management (Inbox, Spam)
- Email detail view
- User interaction handling
- Component coordination
- Initialization and state management

**Initialization Flow:**
```javascript
constructor() {
    super('email', 'Email Client');
    this.state = new EmailState();
    this.readTracker = new EmailReadTracker();
    this.feedbackStore = new InMemoryFeedbackStore();
    this.actionHandler = new EmailActionHandler(this);
    this.completionTracker = new EmailCompletionTracker(this);
}

async initialize() {
    await this.ensureInitialized();
    await this.state.loadFromServer();
    await this.readTracker.ensureLoaded();
    await this.actionHandler.feedback.loadSessionData();
    await this.checkForFreshStart();
}
```

#### 2. **EmailState** (`email-state.js`)
Manages email application state and delegates security operations.

**Key Responsibilities:**
- Folder navigation (Inbox, Spam)
- Email selection tracking
- Security operation delegation
- Statistics calculation
- State persistence

**State Management:**
```javascript
{
    currentFolder: 'inbox',        // Current active folder
    selectedEmailId: null,        // Currently selected email
    securityManager: EmailSecurityManager  // Security operations
}
```

#### 3. **EmailSecurityManager** (`email-security-manager.js`)
Handles email security classification and phishing detection.

**Key Responsibilities:**
- Phishing reporting and tracking
- Legitimate email marking
- Spam folder management
- Email status checking
- Classification progress tracking
- Training completion monitoring

**Security States:**
```javascript
{
    reportedPhishing: Set<emailId>,     // Emails reported as phishing
    legitimateEmails: Set<emailId>,     // Emails marked as legitimate
    spamEmails: Set<emailId>           // Emails in spam folder
}
```

#### 4. **EmailActionHandler** (`email-action-handler.js`)
Coordinates user actions and provides feedback.

**Key Responsibilities:**
- User action processing
- Feedback display
- Action validation
- UI updates
- Error handling

#### 5. **EmailReadTracker** (`email-read-tracker.js`)
Tracks which emails have been read by the user.

**Key Responsibilities:**
- Read state tracking
- First-time read detection
- Read persistence
- Read statistics

#### 6. **EmailCompletionTracker** (`email-completion-tracker.js`)
Monitors training completion and handles level completion flow.

**Key Responsibilities:**
- Completion status monitoring
- Level completion triggering
- Session summary display
- Completion dialogue coordination
- Score calculation

## Email Rendering

### Email List View
```javascript
createEmailListItem(email) {
    const isSelected = email.id === this.state.getSelectedEmailId();
    const isRead = this.readTracker.isRead(email.id);
    const status = this.state.getEmailStatus(email.id);
    
    return `
        <div class="email-item ${isSelected ? 'selected' : ''} ${isRead ? 'read' : 'unread'}"
             data-email-id="${email.id}">
            <div class="email-sender">${email.sender}</div>
            <div class="email-subject">${email.subject}</div>
            <div class="email-time">${email.time}</div>
            <div class="email-status ${status}">${status}</div>
        </div>
    `;
}
```

### Email Detail View
```javascript
createEmailDetail(email, currentFolder) {
    const status = this.state.getEmailStatus(email.id);
    
    return `
        <div class="email-detail">
            <div class="email-header">
                <div class="sender">${email.sender}</div>
                <div class="subject">${email.subject}</div>
                <div class="time">${email.time}</div>
            </div>
            <div class="email-body">${email.body}</div>
            <div class="email-actions">
                <button class="action-report" data-action="report">Report Phishing</button>
                <button class="action-trust" data-action="trust">Mark Legitimate</button>
                <button class="action-delete" data-action="delete">Delete</button>
            </div>
        </div>
    `;
}
```

### Folder Navigation
```javascript
// Folder tabs
<div class="email-folder ${currentFolder === 'inbox' ? 'active' : ''}" 
     data-folder="inbox">
    📧 Inbox (${inboxCount})
</div>
<div class="email-folder ${currentFolder === 'spam' ? 'active' : ''}" 
     data-folder="spam">
    🗑️ Spam (${spamCount})
</div>
```

## Security Classification

### Classification Actions

#### Report as Phishing
```javascript
async confirmPhishingReport(emailId) {
    // Evaluate user action
    await this.actionHandler.feedback.evaluateAction(email, 'report', 'User reported email as phishing');
    
    // Update security state
    await this.state.reportAsPhishing(emailId);
    
    // Show feedback
    this.actionHandler.showActionFeedback('Email reported as phishing!', 'success');
    
    // Update UI
    this.state.setFolder('inbox');
    this.updateContent();
}
```

#### Mark as Legitimate
```javascript
async markEmailAsLegitimate(emailId) {
    // Evaluate user action
    await this.actionHandler.feedback.evaluateAction(email, 'trust', 'User marked email as legitimate');
    
    // Update security state
    await this.state.markAsLegitimate(emailId);
    
    // Show feedback
    this.actionHandler.showActionFeedback('Email marked as legitimate!', 'success');
    
    // Update UI
    this.updateContent();
}
```

#### Delete Email
```javascript
async deleteEmail(emailId) {
    // Evaluate user action
    await this.actionHandler.feedback.evaluateAction(email, 'delete', 'User deleted email');
    
    // Move to spam
    await this.state.moveToSpam(emailId);
    
    // Show feedback
    this.actionHandler.showActionFeedback('Email deleted!', 'success');
    
    // Update UI
    this.state.setFolder('inbox');
    this.updateContent();
}
```

### Email Status System
- **unverified**: Email not yet classified
- **phishing**: Email reported as phishing
- **legitimate**: Email marked as legitimate
- **spam**: Email in spam folder

### Classification Progress
```javascript
getClassificationProgress() {
    const totalEmails = ALL_EMAILS.length;
    const classifiedEmails = this.reportedPhishing.size + this.legitimateEmails.size;
    const percentage = Math.round((classifiedEmails / totalEmails) * 100);
    
    return {
        total: totalEmails,
        classified: classifiedEmails,
        remaining: totalEmails - classifiedEmails,
        percentage: percentage
    };
}
```

## Feedback System

### Action Feedback
```javascript
showActionFeedback(message, type = 'info') {
    const feedback = document.createElement('div');
    feedback.className = `feedback-message ${type}`;
    feedback.textContent = message;
    
    // Display feedback
    document.querySelector('.email-content').appendChild(feedback);
    
    // Auto-remove after delay
    setTimeout(() => feedback.remove(), 3000);
}
```

### Feedback Types
- **success**: Successful action (report, trust, delete)
- **error**: Action failed or invalid
- **info**: General information
- **warning**: Warning or caution

### Performance Feedback
The system evaluates user actions and provides:
- Accuracy percentage
- Correct/incorrect action counts
- Improvement suggestions
- Learning progress

## Read Tracking

### Read State Management
```javascript
class EmailReadTracker {
    constructor() {
        this.readEmails = new Set();
    }
    
    async markAsRead(emailId) {
        this.readEmails.add(emailId);
        // Emit read event
        document.dispatchEvent(new CustomEvent('email-read', {
            detail: { emailId, timestamp: new Date().toISOString() }
        }));
    }
    
    isRead(emailId) {
        return this.readEmails.has(emailId);
    }
}
```

### Read Statistics
```javascript
getReadStats() {
    const totalEmails = ALL_EMAILS.length;
    const readCount = this.readEmails.size;
    const unreadCount = totalEmails - readCount;
    
    return {
        total: totalEmails,
        read: readCount,
        unread: unreadCount,
        readPercentage: Math.round((readCount / totalEmails) * 100)
    };
}
```

## Completion Tracking

### Completion Criteria
```javascript
checkCompletionStatus() {
    const allEmailIds = ALL_EMAILS.map(email => email.id);
    const processedEmails = allEmailIds.filter(emailId => {
        const status = securityManager.getEmailStatus(emailId);
        return status === 'phishing' || status === 'legitimate';
    });
    
    const completionPercentage = (processedEmails.length / allEmailIds.length) * 100;
    
    // Trigger completion when all emails processed
    if (completionPercentage === 100) {
        this.triggerLevelCompletion();
    }
}
```

### Completion Flow
```
User Processes All Emails
    ↓
Completion Status Check
    ↓
Calculate Score
    ↓
Mark Level Completed
    ↓
Show Completion Dialogue
    ↓
Display Session Summary
    ↓
Award XP (if passing score)
```

### Session Summary
```javascript
displayEmailSessionSummary(sessionStats, feedbackHistory) {
    const summary = {
        totalEmails: ALL_EMAILS.length,
        phishingDetected: sessionStats.correctPhishingReports,
        legitimateIdentified: sessionStats.correctLegitimateMarks,
        accuracy: sessionStats.accuracy,
        timeSpent: sessionStats.timeSpent,
        feedback: feedbackHistory
    };
    
    this.sessionSummary.showSessionSummary(summary);
}
```

## Email Data Structure

### Email Object Format
```javascript
{
    id: 'email-001',
    sender: 'sender@example.com',
    subject: 'Email Subject',
    body: 'Email body content',
    time: '2 hours ago',
    timestamp: '2025-01-15T10:30:00Z',
    isPhishing: true,              // Actual classification (hidden from user)
    phishingIndicators: [          // Clues for phishing detection
        'Urgent language',
        'Suspicious links',
        'Poor grammar'
    ]
}
```

### Email Loading
```javascript
// Load emails from JSON API
await loadEmailsFromCSV();

// Access loaded emails
const allEmails = [...ALL_EMAILS];
```

## User Interactions

### Email Selection
```javascript
// Click on email in list
emailList.addEventListener('click', (e) => {
    const emailId = e.target.closest('.email-item').dataset.emailId;
    this.state.selectEmail(emailId);
    this.updateContent();
});
```

### Folder Navigation
```javascript
// Click on folder tab
folderTabs.addEventListener('click', (e) => {
    const folder = e.target.dataset.folder;
    this.state.setFolder(folder);
    this.updateContent();
});
```

### Action Buttons
```javascript
// Click on action button
actionButtons.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    const emailId = this.state.getSelectedEmailId();
    
    switch (action) {
        case 'report':
            this.confirmPhishingReport(emailId);
            break;
        case 'trust':
            this.markEmailAsLegitimate(emailId);
            break;
        case 'delete':
            this.deleteEmail(emailId);
            break;
    }
});
```

## Performance Metrics

### Accuracy Calculation
```javascript
calculateAccuracy() {
    const totalActions = this.correctActions + this.incorrectActions;
    const accuracy = totalActions > 0 
        ? Math.round((this.correctActions / totalActions) * 100) 
        : 0;
    
    return {
        totalActions,
        correctActions,
        incorrectActions,
        accuracy
    };
}
```

### Session Statistics
```javascript
getSessionStats() {
    return {
        totalActions: this.actionCount,
        correctActions: this.correctCount,
        incorrectActions: this.incorrectCount,
        accuracy: this.calculateAccuracy(),
        timeSpent: this.getElapsedTime(),
        emailsProcessed: this.processedEmails.size
    };
}
```

## Integration Points

### Level 2 Integration
```javascript
// Level 2 completion dialogue
import('../../../levels/level-two/dialogues/email-security-completion-dialogue.js');

// Mark level as completed
await this.markLevelCompletedOnServer(score);

// Emit completion event
document.dispatchEvent(new CustomEvent('level-completed', {
    detail: { levelId: 2, score }
}));
```

### Network Monitoring Integration
```javascript
// Emit security events for network monitoring
document.dispatchEvent(new CustomEvent('email-reported-phishing', {
    detail: { emailId, timestamp }
}));
```

### XP System Integration
```javascript
// Award XP on completion
if (score >= passingScore) {
    await awardXP(2, score, timeSpent, 'medium');
}
```

## Performance Optimizations

### 1. **Lazy Loading**
```javascript
// Load email data only when needed
async ensureInitialized() {
    if (this.isInitialized) return;
    await this.initializeState();
}
```

### 2. **In-Memory Storage**
```javascript
// Use in-memory storage for session data
this.feedbackStore = new InMemoryFeedbackStore();
this.reportedPhishing = new Set();
```

### 3. **Efficient Rendering**
```javascript
// Only re-render when state changes
updateContent() {
    this.windowElement.querySelector('.email-content').innerHTML = this.createContent();
}
```

## Error Handling

### Initialization Failures
```javascript
try {
    await this.initializeState();
} catch (error) {
    console.warn('Failed to load email state:', error);
    // Show error message to user
    this.showError('Failed to load email data');
}
```

### Action Failures
```javascript
try {
    await this.confirmPhishingReport(emailId);
} catch (error) {
    console.error('Failed to report email:', error);
    this.showActionFeedback('Failed to report email', 'error');
}
```

### Data Validation
```javascript
validateEmail(email) {
    if (!email.id || !email.sender || !email.subject) {
        throw new Error('Invalid email data');
    }
    return true;
}
```

## Configuration Options

### Email Display
```javascript
const emailConfig = {
    showTimestamps: true,
    showSenderAvatar: false,
    enableRichText: false,
    maxEmailBodyLength: 1000
};
```

### Security Settings
```javascript
const securityConfig = {
    autoReportPhishing: false,
    showPhishingIndicators: true,
    enableConfirmationDialogs: true,
    minConfidenceThreshold: 0.7
};
```

### Completion Settings
```javascript
const completionConfig = {
    minActionsRequired: 5,
    minAccuracyRequired: 50,
    completionThreshold: 0.6,  // 60% of emails
    showSessionSummary: true
};
```

## Best Practices

### 1. **Always Check Email Status**
```javascript
// ✅ Good
const status = this.state.getEmailStatus(emailId);
if (status === 'unverified') {
    // Allow classification
}

// ❌ Bad - Don't assume status
this.state.reportAsPhishing(emailId); // May double-report
```

### 2. **Handle Read States**
```javascript
// ✅ Good
await this.readTracker.markAsRead(emailId);

// ❌ Bad - Don't skip read tracking
// Just showing email without tracking
```

### 3. **Provide Feedback**
```javascript
// ✅ Good
this.actionHandler.showActionFeedback('Email reported!', 'success');

// ❌ Bad - Silent actions
this.state.reportAsPhishing(emailId); // No user feedback
```

### 4. **Validate User Actions**
```javascript
// ✅ Good
if (this.state.canEmailBeRecategorized(emailId)) {
    await this.state.reportAsPhishing(emailId);
} else {
    this.showActionFeedback('Email already classified', 'warning');
}
```

## Troubleshooting

### Common Issues

**Emails not loading:**
- Check JSON API endpoint
- Verify email data format
- Check network connectivity
- Review console for import errors

**Classification not working:**
- Verify security manager initialization
- Check email ID validity
- Ensure email data is loaded
- Review event dispatching

**Completion not triggering:**
- Verify completion threshold
- Check all emails are processed
- Ensure completion tracker is initialized
- Review completion criteria

**Feedback not showing:**
- Verify action handler initialization
- Check feedback store is attached
- Ensure UI container exists
- Review CSS styling

**Read tracking not working:**
- Verify read tracker initialization
- Check email ID format
- Ensure read events are dispatched
- Review localStorage accessibility

### Debug Mode
Enable detailed logging:
```javascript
console.log('[EmailApp] Current state:', this.state);
console.log('[EmailSecurityManager] Phishing reports:', this.reportedPhishing);
console.log('[EmailCompletionTracker] Completion status:', this.hasTriggeredCompletion);
```

## Future Enhancements

### Planned Improvements
1. **Advanced phishing detection** - ML-based phishing indicators
2. **Email threading** - Group related emails
3. **Search functionality** - Search emails by content
4. **Attachment simulation** - Simulate email attachments
5. **Advanced filtering** - Custom email filters

### Scalability Considerations
- Support for 1000+ emails
- Improved search performance
- Enhanced attachment handling
- Better mobile experience

## Related Documentation

- [Simulated PC System](./simulated-pc-system.md)
- [Window Management System](./window-management-system.md)
- [Application Registry System](./application-registry-system.md)
- [Level 2 Documentation](../level-specific/level-2.md)

## Files and Locations

**Core Application:**
- `app/static/js/simulated-pc/desktop-components/desktop-applications/email-app.js` - Main email app

**Email Functions:**
- `app/static/js/simulated-pc/desktop-components/desktop-applications/email-functions/email-state.js` - State management
- `app/static/js/simulated-pc/desktop-components/desktop-applications/email-functions/email-security-manager.js` - Security operations
- `app/static/js/simulated-pc/desktop-components/desktop-applications/email-functions/email-action-handler.js` - Action handling
- `app/static/js/simulated-pc/desktop-components/desktop-applications/email-functions/email-read-tracker.js` - Read tracking
- `app/static/js/simulated-pc/desktop-components/desktop-applications/email-functions/email-completion-tracker.js` - Completion tracking
- `app/static/js/simulated-pc/desktop-components/desktop-applications/email-functions/email-session-summary.js` - Session summary

**Email Data:**
- `app/static/js/simulated-pc/levels/level-two/emails/email-registry.js` - Email data registry
- `app/static/js/simulated-pc/levels/level-two/data/legitimate_emails.json` - Legitimate email data
- `app/static/js/simulated-pc/levels/level-two/data/phishing_emails.json` - Phishing email data
