"""environment content + lesson progress

Moves per-level payloads out of the `levels.content` JSONB column into a
dedicated `level_content` table (draft/publish lifecycle, revision counter,
editor audit). Adds session checkpoint columns for resumable bite-sized
lessons, a `level_progress` rollup table (one row per profile+level —
progress, bests, resume anchor), and an idempotency key on `xp_history`
for per-lesson XP awards.

Revision ID: 0003_environment_content
Revises: 0002_content_platform
Create Date: 2026-09-22
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB, UUID

revision = "0003_environment_content"
down_revision = "0002_content_platform"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "level_content",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("level_id", sa.Integer, nullable=False, unique=True, index=True),
        sa.Column("payload", JSONB, nullable=True),
        sa.Column("draft", JSONB, nullable=True),
        sa.Column("schema_version", sa.String(40), server_default="1"),
        sa.Column("revision", sa.Integer, server_default="1", nullable=False),
        sa.Column(
            "updated_by",
            UUID(as_uuid=True),
            sa.ForeignKey("profiles.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "level_progress",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column(
            "profile_id",
            UUID(as_uuid=True),
            sa.ForeignKey("profiles.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("level_id", sa.Integer, nullable=False, index=True),
        sa.Column("lessons_done", sa.Integer, server_default="0", nullable=False),
        sa.Column("lessons_total", sa.Integer, nullable=True),
        sa.Column("best_score", sa.Integer, nullable=True),
        sa.Column("best_accuracy", sa.Float, nullable=True),
        sa.Column(
            "resume_session_id",
            sa.Integer,
            sa.ForeignKey("sessions.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("profile_id", "level_id", name="uq_level_progress_profile_level"),
    )

    op.add_column("sessions", sa.Column("state", JSONB, nullable=True))
    op.add_column(
        "sessions", sa.Column("lessons_completed", sa.Integer, server_default="0", nullable=False)
    )
    op.add_column("sessions", sa.Column("lessons_total", sa.Integer, nullable=True))

    op.add_column("xp_history", sa.Column("lesson_index", sa.Integer, nullable=True))
    # Idempotency key: a (session, lesson) award is written at most once.
    op.execute(
        sa.text(
            "CREATE UNIQUE INDEX uq_xp_lesson_award ON xp_history (session_id, lesson_index) "
            "WHERE reason = 'lesson_completion' AND lesson_index IS NOT NULL"
        )
    )

    # Backfill per-level payloads, then retire the column.
    op.execute(
        sa.text(
            "INSERT INTO level_content (level_id, payload, created_at, updated_at, published_at) "
            "SELECT level_id, content, now(), now(), now() FROM levels WHERE content IS NOT NULL"
        )
    )
    op.drop_column("levels", "content")

    # Backfill progress rollups from completed sessions: best score per
    # (profile, level), first completion timestamp, lessons unknown.
    op.execute(
        sa.text(
            "INSERT INTO level_progress (profile_id, level_id, best_score, completed_at, created_at, updated_at) "
            "SELECT DISTINCT ON (profile_id, level_id) profile_id, level_id, score, end_time, now(), now() "
            "FROM sessions WHERE level_id IS NOT NULL AND end_time IS NOT NULL AND score IS NOT NULL "
            "ORDER BY profile_id, level_id, score DESC"
        )
    )


def downgrade() -> None:
    op.add_column("levels", sa.Column("content", JSONB, nullable=True))
    op.execute(
        sa.text(
            "UPDATE levels SET content = lc.payload FROM level_content lc "
            "WHERE levels.level_id = lc.level_id"
        )
    )

    op.execute(sa.text("DROP INDEX IF EXISTS uq_xp_lesson_award"))
    op.drop_column("xp_history", "lesson_index")
    op.drop_column("sessions", "lessons_total")
    op.drop_column("sessions", "lessons_completed")
    op.drop_column("sessions", "state")
    op.drop_table("level_progress")
    op.drop_table("level_content")
