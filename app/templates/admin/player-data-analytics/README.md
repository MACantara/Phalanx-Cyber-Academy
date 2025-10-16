# Player Data Analytics MVP

## Overview
This MVP implementation provides comprehensive player data analytics for the Phalanx Cyber Academy cybersecurity training platform based on the metrics defined in `docs/ideas/player-data-analytics-ideas.md`.

## Features

### 1. Main Dashboard (`/admin/player-analytics`)
- **General Usage Statistics**: DAU, WAU, MAU, session metrics, retention rates
- **Level Completion Overview**: Visual completion rates for all 5 levels
- **Engagement Quality**: NPS scores, ratings, user feedback
- **Weekly Trends Chart**: Interactive Chart.js visualization
- **Quick Performance Metrics**: Completion rates, drop-off, churn, interactions

### 2. Level Analytics (`/admin/player-analytics/levels`)
- **Level-specific metrics** for each cybersecurity scenario:
  - **Level 1 (Misinformation Maze)**: Fact-checking accuracy, detection speed, critical thinking scores
  - **Level 2 (Shadow in the Inbox)**: Phishing detection, false positives, social engineering resistance
  - **Level 3 (Malware Mayhem)**: Malware identification, quarantine effectiveness, cleanup thoroughness
  - **Level 4 (White Hat Test)**: Vulnerability discovery, ethical methodology, responsible disclosure
  - **Level 5 (Hunt for The Null)**: Digital forensics, evidence collection, timeline reconstruction

### 3. Blue vs Red Team Analytics (`/admin/player-analytics/blue-vs-red`)
- **Game Overview**: Total games, average duration, win rates, asset protection
- **Defense Performance**: Threat detection speed, incident response, security controls
- **Attack Metrics**: AI success rates, MTTD, MTTR, RTO
- **Asset Protection**: Individual protection rates for each critical asset
- **Attack Pattern Analysis**: Success/detection rates by attack phase

## Implementation Details

### Routes Added to `app/routes/admin.py`:
- `@admin_bp.route('/player-analytics')` - Main dashboard
- `@admin_bp.route('/player-analytics/levels')` - Level-specific analytics
- `@admin_bp.route('/player-analytics/blue-vs-red')` - Blue vs Red Team metrics

### Templates Created:
- `app/templates/admin/player-data-analytics/dashboard.html` - Main analytics dashboard
- `app/templates/admin/player-data-analytics/levels.html` - Level performance details
- `app/templates/admin/player-data-analytics/blue-vs-red.html` - Blue vs Red Team metrics
- `app/templates/admin/player-data-analytics/components/header.html` - Reusable header component

### Admin Header Integration:
- Added "Player Analytics" button to `app/templates/admin/dashboard/components/header.html`
- Purple-themed button with bar chart icon for easy access

## Dummy Data
All metrics use realistic dummy data that demonstrates:
- Typical learning curve (decreasing completion rates for harder levels)
- Realistic cybersecurity training metrics (70-90% ranges for most skills)
- Authentic Blue vs Red Team performance data
- Weekly trends showing normal engagement patterns

## Next Steps for Production
1. **Database Integration**: Replace dummy data with actual database queries
2. **Real-time Updates**: Add WebSocket or AJAX for live dashboard updates
3. **Filtering & Date Ranges**: Add date pickers and filtering options
4. **Export Functionality**: CSV/PDF export for analytics reports
5. **User-specific Analytics**: Drill down to individual player performance
6. **Alerts & Notifications**: Set up thresholds for important metrics

## Dependencies
- **Chart.js**: Used for interactive charts (loaded via CDN)
- **Tailwind CSS**: For styling and responsive design
- **Bootstrap Icons**: For iconography
- **Flask**: Backend routing and template rendering

## Usage
1. Access as admin user: `/admin/player-analytics`
2. Navigate between sections using the top navigation buttons
3. View comprehensive metrics across all cybersecurity training scenarios
4. Use data for improving training content and identifying learning gaps

## Security
- All routes protected with `@admin_required` decorator
- Database access checks in place
- No sensitive user data exposed in analytics (aggregated metrics only)
