"""content platform: content_items library + levels.content

Adds the shared content-item library (`lib:kind:key` refs resolve against it)
and moves level content into the database so it can be authored and published
server-side (data.json files are read-only on serverless). Backfills
levels.content from backend/app/data/level_content/level_N/data.json.

Revision ID: 0002_content_platform
Revises: 0001_baseline
Create Date: 2026-09-20
"""

from pathlib import Path

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB, UUID

revision = "0002_content_platform"
down_revision = "0001_baseline"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "content_items",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("kind", sa.String(40), nullable=False, index=True),
        sa.Column("key", sa.String(120), nullable=False),
        sa.Column("data", JSONB, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("kind", "key", name="uq_content_items_kind_key"),
    )

    op.add_column("levels", sa.Column("content", JSONB, nullable=True))

    content_dir = Path(__file__).resolve().parents[2] / "app" / "data" / "level_content"
    if content_dir.is_dir():
        for level_dir in sorted(content_dir.iterdir()):
            data_file = level_dir / "data.json"
            if not level_dir.name.startswith("level_") or not data_file.is_file():
                continue
            try:
                level_id = int(level_dir.name.split("_", 1)[1])
            except ValueError:
                continue
            op.execute(
                sa.text("UPDATE levels SET content = CAST(:content AS jsonb) WHERE level_id = :lid").bindparams(
                    content=data_file.read_text(encoding="utf-8"), lid=level_id
                )
            )


def downgrade() -> None:
    op.drop_column("levels", "content")
    op.drop_table("content_items")
