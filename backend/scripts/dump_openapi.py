"""Dump the FastAPI OpenAPI spec to frontend/openapi.json for orval."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app  # noqa: E402

out = Path(__file__).resolve().parent.parent.parent / "frontend" / "openapi.json"
out.write_text(json.dumps(app.openapi(), indent=2))
print(f"wrote {out}")
