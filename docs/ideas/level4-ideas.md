# Level 4: The White Hat Test - Design Document

## Overview
**Scenario**: Ethical Hacking and Responsible Disclosure  
**Story Event**: The Academy tasks you with auditing SecureVote Pro, a municipal voting system. After uncovering a critical vulnerability, you face ethical dilemmas including bribery attempts and pressure tactics.  
**Goal**: Conduct professional security assessment, handle disclosure ethically, and demonstrate proper security researcher conduct.

---

## Technical/Gameplay Phase: Penetration Testing

### Network Reconnaissance
- **Tool Simulation**: Use simulated `nmap` commands in terminal to discover network architecture
- **Service Discovery**: Map voting system components (web server, database, admin panels)
- **Port Analysis**: Identify open services on ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 3306 (MySQL), 8080 (Admin Panel)
- **Interactive**: Click-to-scan different IP ranges and analyze results

### Web Application Security Testing
- **Vulnerability Scanner**: Simulate OWASP ZAP or Burp Suite interface
- **SQL Injection Discovery**: Find injection point in voter lookup form
- **Cross-Site Scripting (XSS)**: Discover stored XSS in voting results page
- **Directory Traversal**: Uncover exposed config files through path manipulation
- **Broken Authentication**: Test default admin credentials (admin/password)

### Critical Vulnerability Chain
1. **Local File Inclusion (LFI)** → Access config files
2. **Configuration Exposure** → Extract database credentials  
3. **Database Access** → View/modify voting records
4. **Privilege Escalation** → Admin panel access via JWT manipulation
5. **Vote Manipulation** → Ability to alter election results

### Advanced Testing Scenarios
- **Logic Flaw**: Double-voting vulnerability through session manipulation
- **Access Control**: Bypass voter verification through cookie modification
- **Timing Attack**: Extract voter information through response time analysis
- **CSRF**: Cross-site request forgery allowing unauthorized vote submission

---

## Ethical Dilemma Scenarios

### 1. Cryptocurrency Bribe Attempt
**Trigger**: After documenting the vulnerability  
**Contact**: Anonymous "hacktivist" group via encrypted message  
**Offer**: 2 BTC (~$50,000) to publicly disclose vulnerability before patch

**Dialogue Tree Options**:
- **Report to Authorities** → +100 Ethics XP, Law enforcement investigation
- **Ignore Message** → +50 Ethics XP, Continue normal disclosure
- **Engage with Group** → -200 Ethics XP, Potential legal consequences, alternate ending

### 2. Corporate Pressure Campaign
**Trigger**: SecureVote Inc. discovers you're the researcher  
**Contact**: CEO calls directly with settlement offer  
**Pressure**: $25,000 bonus + NDA to keep vulnerability private until "after election season"

**Options**:
- **Refuse and Continue Disclosure** → +150 Ethics XP, Company may retaliate
- **Accept Settlement** → -300 Ethics XP, Vulnerability remains unfixed
- **Negotiate Timeline** → +75 Ethics XP, Compromise on 30-day disclosure

### 3. Live Election Crisis
**Trigger**: Vulnerability discovered during active municipal election  
**Dilemma**: Fix immediately (disrupting election) vs. wait (risk exploitation)  
**Media Pressure**: Local news investigating "voting irregularities"

**Choices**:
- **Emergency Disclosure** → Immediate fix, potential vote invalidation
- **Wait Until Election Ends** → Risk of exploitation, maintain democratic process
- **Anonymous Tip to Election Officials** → Middle ground with moderate risk

### 4. Journalist Contact
**Trigger**: Tech journalist contacts you about "rumors of voting system flaws"  
**Pressure**: "The public has a right to know before the next election"  
**Stakes**: Article could trigger nationwide voting system reviews

**Response Options**:
- **Full Cooperation** → Public disclosure, maximum transparency
- **Redacted Information** → Limited disclosure protecting sensitive details  
- **No Comment** → Maintain responsible disclosure timeline
- **Misleading Information** → -500 Ethics XP, potentially dangerous

---

<!-- ## Documentation & Reporting Phase

### Professional Bug Bounty Report
**Interactive Form Fields**:
- **Vulnerability Type**: SQL Injection, XSS, Access Control, etc.
- **CVSS Score Calculator**: Impact vs. Exploitability matrix
- **Reproduction Steps**: Step-by-step technical writeup
- **Evidence Upload**: Screenshots, proof-of-concept code
- **Recommended Fix**: Technical remediation suggestions
- **Timeline Proposal**: Disclosure schedule recommendation

**Grading Criteria**:
- Technical accuracy (40%)
- Professional communication (30%)
- Ethical considerations (20%)
- Timeline reasonableness (10%)

### Disclosure Timeline Decision
**Options with Consequences**:
- **Immediate (0-day)**: Maximum security, potential system disruption
- **7-day Emergency**: Rapid response, limited testing time for vendor
- **30-day Standard**: Balanced approach, industry standard
- **90-day Extended**: Maximum vendor flexibility, higher exploitation risk

### Legal Risk Assessment
**In-Game Legal Brief**:
- Computer Fraud and Abuse Act (CFAA) implications
- Good faith research protections
- Authorized vs. unauthorized testing boundaries
- Documentation requirements for legal safety -->

---

## Learning & XP Mechanics

### Ethical Behavior Rewards
**Positive Actions (+XP)**:
- Following responsible disclosure protocols (+200 XP)
- Writing comprehensive technical reports (+150 XP)
- Refusing unethical financial offers (+300 XP)
- Protecting democratic processes (+250 XP)
- Coordinating with authorities when appropriate (+100 XP)

### Violation Penalties (-XP)
**Unethical Actions**:
- Selling vulnerability information (-500 XP)
- Exceeding authorized testing scope (-300 XP)
- Public disclosure without vendor notification (-400 XP)
- Accepting bribes or inappropriate compensation (-600 XP)
- Intentionally disrupting live systems (-800 XP)

### Strike System
- **Strike 1**: Warning dialogue, ethics refresher
- **Strike 2**: XP penalty, mandatory ethics training
- **Strike 3**: Level failure, restart required with ethics review

### Peer Review Challenge
**Simulated Security Community Review**:
- Submit report to mock security conference review board
- Receive feedback on technical accuracy and ethical approach
- Opportunity to revise and resubmit for bonus XP
- Public recognition for exemplary responsible disclosure

---

## Philosophical Reflection & Learning

### Critical Thinking Prompts
**Reflection Questions** (End of Level):
1. "How would you feel if this vulnerability was exploited in your hometown's election?"
2. "What's more important: immediate transparency or giving vendors time to fix issues?"
3. "How do you balance public safety with respecting democratic processes?"
4. "What responsibilities do security researchers have to society?"

### Cybersecurity Ethics Oath
**Ceremonial Moment**:
Player affirms commitment to:
- Use skills for protection, not exploitation
- Respect privacy and democratic institutions  
- Follow responsible disclosure practices
- Consider broader social impact of security research
- Maintain professional integrity under pressure

### Consequence Simulation
**Branching Narrative Endings**:

**Ethical Path**: 
- News headline: "Local Election Secured Thanks to Responsible Researcher"
- Vendor implements security improvements
- Player invited to speak at security conference
- Democratic integrity maintained

**Unethical Path**:
- News headline: "Voting System Compromised - Researcher Under Investigation" 
- Election results questioned, democratic trust damaged
- Legal consequences for researcher
- Long-term harm to security research community

**Mixed Results**:
- Partial success with compromise outcomes
- Lessons learned about complex ethical decisions
- Opportunity for reflection and improvement

---

## Implementation Technical Details

### Terminal Commands Simulation
```bash
# Network reconnaissance
nmap -sV -p- vote.municipality.gov
nmap --script vuln vote.municipality.gov

# Web application testing  
sqlmap -u "http://vote.municipality.gov/lookup?voter_id=123"
dirb http://vote.municipality.gov/admin/

# Vulnerability validation
curl -X POST http://vote.municipality.gov/vote --data "voter_id=123&candidate=1"
```

### Browser Integration
- **Simulated Vulnerability Scanner Interface**
- **Interactive Web Forms** for exploitation testing
- **Real-time Results Display** showing discovered vulnerabilities
- **Evidence Capture** system for documentation

### Dialogue System Enhancement
- **Branching conversation trees** with ethical weight
- **Consequence tracking** across multiple interactions
- **Pressure simulation** through timed decision-making
- **Character reputation system** affecting future opportunities

### Scoring Algorithm
```javascript
// Ethical decision scoring
const ethicsScore = (
  responsibleDisclosure * 0.3 +
  reportQuality * 0.2 +
  refusedBribes * 0.25 +
  timelinessBalance * 0.15 +
  publicInterestConsideration * 0.1
);
```

---

## Success Criteria & Badges

### Level Completion Requirements
- Discover at least 3 critical vulnerabilities
- Complete professional vulnerability report
- Navigate ethical dilemmas without major violations
- Demonstrate understanding of responsible disclosure

### Unlockable Badges
- **"White Hat Guardian"**: Complete level with perfect ethics score
- **"Investigative Excellence"**: Discover all hidden vulnerabilities  
- **"Democratic Defender"**: Protect election integrity under pressure
- **"Professional Researcher"**: Submit industry-standard quality report
- **"Ethics Under Fire"**: Refuse all unethical offers and pressure

### Advanced Challenge Mode
- **Time Pressure**: Complete assessment during election week
- **Limited Tools**: Work with restricted vulnerability scanner access
- **Public Scrutiny**: Handle media attention while maintaining ethics
- **International Incident**: Voting system used in multiple countries

This level design emphasizes the real-world complexity of ethical hacking while teaching practical penetration testing skills and reinforcing the critical importance of responsible disclosure in cybersecurity research.
