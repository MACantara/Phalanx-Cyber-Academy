# Player Data Analytics Ideas

## 1. General Usage Statistics
*These track how often and how long users engage with your platform.*

- **Session length**: Time spent per session or module.  
- **Time-on-task**: Time spent on specific challenges or learning objectives.  
- **Daily Active Users (DAU)**: Number of unique users who engage with the platform each day.
- **Weekly Active Users (WAU)**: Number of unique users who engage with the platform each week.
- **Monthly Active Users (MAU)**: Number of unique users who engage with the platform each month.
- **DAU/MAU ratio**: DAU divided by MAU to understand daily engagement.  
- **Retention rate**: Percentage of players who return after first use (e.g., Day 1, Day 7, Day 30).  
- **Session frequency**: How often an average user starts a session in a given time window (e.g., sessions per user per week).
- **Drop-off rate**: Where users quit the game or training (useful for funnel analysis).  
- **Churn rate**: Percentage of users who stop using the platform over a defined period (inverse indicator to retention).
- **Completion rate**: Percent of users who finish modules, levels, or the entire course.  

### Short calculation formulas (compact):

- **DAU** = count(unique users active on a given day)
- **WAU** = count(unique users active in the last 7 days)
- **MAU** = count(unique users active in the last 30 days)
- **DAU/MAU ratio** = DAU / MAU
- **Average session length** = total_session_time_seconds / total_sessions
- **Session frequency** = total_sessions / unique_users (for the chosen time window)
- **Retention rate (Day N)** = (users_active_on_day_N / users_in_cohort) * 100%
- **Churn rate** = ((users_at_period_start - users_at_period_end) / users_at_period_start) * 100%
- **Average interactions per user** = total_actions (clicks/choices/hints/messages) / unique_users
- **Average rating** = sum(all_ratings) / count(all_ratings)
- **NPS** = %promoters (9-10) - %detractors (0-6)

---

## 2. Gameplay Interaction
*Understand how users interact with the simulation mechanics and challenges.*

- **Levels completed**: Number and percentage of levels/challenges completed.  
- **Actions per session**: Number of meaningful actions taken per play session.  
- **Hint usage**: How often users request help or hints.  
- **Time to completion**: Average time taken to complete a level or scenario.  
- **Failure rate / Retry attempts**: How often users fail and retry specific challenges.  
- **Choices made**: Decisions taken in branching narratives or scenarios (useful for adaptive learning paths).  
- **Achievements/unlocks**: Gamified rewards achieved (badges, points, items).  

---

## 3. Engagement Quality Metrics (Subjective/Behavioral)
*Optional but useful for qualitative analysis.*

- **Net Promoter Score (NPS)**: Willingness to recommend the training to others.  
- **User feedback & rating**: Star/score ratings and qualitative comments collected after sessions or modules; tracked over time for trend analysis.

---

## 4. Backend & Technical Analytics
*For monitoring the health of the simulation itself and device-level data.*

- **Load times & errors**: How system performance affects engagement.  
- **Device/browser usage**: Optimizing UX for most-used platforms.  
- **Click paths**: Sequence of user interactions for UX flow analysis.  

---

## Cybersecurity-Specific Stats
*Tailored for cybersecurity training scenarios.*

### General Security Training Metrics
- **Simulation scenario success**: Win/loss or pass/fail outcomes in realistic security drills.

### Level-Specific Metrics

#### Level 1: The Misinformation Maze
- **Fact-check accuracy**: Percentage of correctly identified fake vs. real news articles
- **Misinformation detection speed**: Time taken to identify false information

#### Level 2: Shadow in the Inbox
- **Phishing email detection rate**: Percentage of phishing emails correctly identified
- **False positive rate**: Legitimate emails incorrectly flagged as phishing

#### Level 3: Malware Mayhem
- **Malware identification accuracy**: Correct identification of infected files/systems

#### Level 4: The White Hat Test
- **Vulnerability discovery rate**: Number and severity of vulnerabilities found
- **Ethical hacking methodology adherence**: Following proper penetration testing procedures
- **Responsible disclosure compliance**: Proper reporting of discovered vulnerabilities
- **Risk assessment accuracy**: Correct evaluation of vulnerability severity and impact
- **Documentation quality**: Completeness and clarity of security assessment reports

#### Level 5: The Hunt for The Null
- **Digital evidence collection**: Proper forensic procedures and chain of custody
- **Data analysis depth**: Thoroughness in examining digital artifacts
- **Timeline reconstruction accuracy**: Correct sequencing of security incidents
- **Attribution confidence**: Accuracy in identifying threat actors and methods
- **Investigation methodology**: Following proper digital forensics procedures

### Blue Team vs Red Team Mode Metrics
- **Asset protection rate**: Percentage of critical assets maintained at high integrity
- **Threat detection speed**: Time between AI attack initiation and player detection
- **Incident response effectiveness**: Success rate of defensive actions taken
- **Security control optimization**: Improvements made to firewall, endpoint, and access controls
- **AI attack success rate**: Percentage of AI attacks that succeeded vs. were blocked
- **Player action efficiency**: Ratio of effective defensive actions to total actions taken
- **Game duration performance**: How long players can maintain security vs. AI attacks
- **Alert prioritization accuracy**: Correct identification of high-priority security alerts
- **Recovery time objective (RTO)**: Speed of restoring compromised assets to secure state
- **Mean time to detection (MTTD)**: Average time to detect different types of attacks
- **Mean time to response (MTTR)**: Average time to respond to detected threats  
