"""
Seed level_content from bundled data.json files.

Idempotent: levels that already have a payload are skipped unless --force
is passed. The JSON files are the bootstrap seed; once seeded, the database
is authoritative and files serve only as the read-path fallback.

    python -m app.seeds.level_content           # fill gaps
    python -m app.seeds.level_content --force   # overwrite all from files
"""
import json
import sys
from pathlib import Path

from sqlalchemy import select

from app.db import session_scope
from app.models import LevelContent
from app.services.level_content_service import upsert_payload

CONTENT_DIR = Path(__file__).resolve().parent.parent / "data" / "level_content"


def seed(force: bool = False) -> list[str]:
    results: list[str] = []
    if not CONTENT_DIR.is_dir():
        return ["no level_content directory — nothing to seed"]

    for level_dir in sorted(CONTENT_DIR.iterdir()):
        data_file = level_dir / "data.json"
        if not level_dir.name.startswith("level_") or not data_file.is_file():
            continue
        try:
            level_id = int(level_dir.name.split("_", 1)[1])
        except ValueError:
            continue

        payload = json.loads(data_file.read_text(encoding="utf-8"))
        with session_scope() as s:
            existing = s.execute(
                select(LevelContent.payload).where(LevelContent.level_id == level_id)
            ).scalar_one_or_none()

        if existing is not None and not force:
            results.append(f"level_{level_id}: skipped (already seeded)")
            continue
        upsert_payload(level_id, payload)
        results.append(f"level_{level_id}: {'reseeded' if existing is not None else 'seeded'}")
    return results


if __name__ == "__main__":
    for line in seed("--force" in sys.argv):
        print(line)
