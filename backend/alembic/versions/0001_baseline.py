"""baseline: full v4 schema + seed data

Creates the 11 application tables (profiles, contact_submissions, levels,
sessions, xp_history, badges, user_badges, user_streaks, bvr_game_states,
admin_audit_logs, scheduled_jobs) and seeds levels + badges, matching the
end-state of supabase_schema.sql + migrations/ minus auth.users/RLS.

Revision ID: 0001_baseline
Revises:
Create Date: 2026-09-19
"""

import sqlalchemy as sa
from alembic import op

from app.models import Base

revision = "0001_baseline"
down_revision = None
branch_labels = None
depends_on = None


LEVELS_SEED = """
INSERT INTO public.levels (level_id, name, description, category, icon, estimated_time, xp_reward, skills, difficulty, unlocked, coming_soon, updated_at) VALUES
(1, 'The Misinformation Maze', 'Navigate through fake news and stop misinformation from influencing an election.', 'Information Literacy', 'bi-newspaper', '15 minutes', 100, '["Critical Thinking", "Source Verification", "Fact Checking"]'::jsonb, 'easy', true, false, NOW()),
(2, 'Shadow in the Inbox', 'Spot phishing attempts and practice safe email protocols while defending against social engineering.', 'Email Security', 'bi-envelope-exclamation', '20 minutes', 150, '["Phishing Detection", "Email Analysis", "Social Engineering"]'::jsonb, 'medium', true, false, NOW()),
(3, 'Malware Mayhem', 'Isolate infections and perform digital cleanup during a gaming tournament under pressure.', 'Threat Detection', 'bi-bug', '25 minutes', 200, '["Malware Recognition", "System Security", "Threat Analysis"]'::jsonb, 'intermediate', true, false, NOW()),
(4, 'Network Reconnaissance', 'Map the tournament network, find open ports, and locate the rogue host.', 'Ethical Hacking', 'bi-terminal', '15 minutes', 150, '["Network Reconnaissance", "Port Scanning", "Host Discovery"]'::jsonb, 'medium', true, false, NOW()),
(5, 'Responsible Vulnerability Disclosure', 'Report exposed credentials privately and coordinate a safe disclosure timeline.', 'Ethical Hacking', 'bi-shield-check', '15 minutes', 150, '["Responsible Disclosure", "Credential Exposure", "Ethical Hacking"]'::jsonb, 'medium', true, false, NOW()),
(6, 'Evidence Acquisition & Chain of Custody', 'Collect digital evidence safely and document an unbroken chain of custody.', 'Digital Forensics', 'bi-lock', '15 minutes', 200, '["Chain of Custody", "Evidence Acquisition", "Hash Verification"]'::jsonb, 'medium', true, false, NOW()),
(7, 'Evidence Analysis', 'Examine the laptop, memory dump, and network logs to find the operator.', 'Digital Forensics', 'bi-magnifying-glass', '20 minutes', 250, '["Digital Forensics", "Memory Analysis", "Log Analysis"]'::jsonb, 'hard', true, false, NOW()),
(8, 'Forensic Report & Identify The Null', 'Write a compliant forensic report and name the operator behind the incident.', 'Digital Forensics', 'bi-file-earmark-text', '20 minutes', 250, '["Forensic Reporting", "Incident Response", "NIST SP 800-86"]'::jsonb, 'hard', true, false, NOW())
ON CONFLICT (level_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    icon = EXCLUDED.icon,
    estimated_time = EXCLUDED.estimated_time,
    xp_reward = EXCLUDED.xp_reward,
    skills = EXCLUDED.skills,
    difficulty = EXCLUDED.difficulty,
    unlocked = EXCLUDED.unlocked,
    coming_soon = EXCLUDED.coming_soon,
    updated_at = EXCLUDED.updated_at
"""

BADGES_SEED = """
INSERT INTO public.badges (name, description, icon, xp_threshold, category) VALUES
    ('First Steps', 'Earned your first XP.', 'target', 1, 'progress'),
    ('Novice Defender', 'Reached 100 XP.', 'shield', 100, 'progress'),
    ('Cyber Scout', 'Reached 500 XP.', 'search', 500, 'progress'),
    ('Guardian', 'Reached 1,000 XP.', 'award', 1000, 'progress'),
    ('Elite Operator', 'Reached 5,000 XP.', 'star', 5000, 'progress'),
    ('Phalanx Legend', 'Reached 10,000 XP.', 'crown', 10000, 'progress')
ON CONFLICT (name) DO NOTHING
"""


def upgrade() -> None:
    Base.metadata.create_all(op.get_bind(), checkfirst=True)
    op.execute(sa.text(LEVELS_SEED))
    op.execute(sa.text(BADGES_SEED))


def downgrade() -> None:
    Base.metadata.drop_all(op.get_bind(), checkfirst=True)
