"""
Content library service — resolves `lib:kind:key` content refs inside level
environment payloads against the shared content_items table.

A ref is a string of the form `lib:<kind>:<key>` placed anywhere a content
item would appear (e.g. inside `content.mail.emails`). Resolution walks the
payload once, batch-fetches every referenced item in a single query, and
substitutes the item's `data`. Unresolvable refs are left in place — the
frontend's schema validation rejects malformed slices, so a bad ref fails
loudly at load instead of silently rendering a string.
"""
import re
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import select, tuple_

from app.db import session_scope
from app.models import ContentItem

_REF_RE = re.compile(r"^lib:([a-z_]+):([A-Za-z0-9_-]+)$")

CONTENT_KINDS = ("emails", "articles", "files", "sites", "scenes", "evidence")


def _collect(node: Any, refs: set) -> None:
    if isinstance(node, dict):
        for v in node.values():
            _collect(v, refs)
    elif isinstance(node, list):
        for v in node:
            _collect(v, refs)
    elif isinstance(node, str):
        m = _REF_RE.match(node)
        if m:
            refs.add((m.group(1), m.group(2)))


def _substitute(node: Any, items: Dict[Tuple[str, str], dict]) -> Any:
    if isinstance(node, dict):
        return {k: _substitute(v, items) for k, v in node.items()}
    if isinstance(node, list):
        return [_substitute(v, items) for v in node]
    if isinstance(node, str):
        m = _REF_RE.match(node)
        if m and (m.group(1), m.group(2)) in items:
            return items[(m.group(1), m.group(2))]
    return node


def resolve_content_refs(content: Any) -> Any:
    """Return a copy of `content` with every resolvable lib:kind:key ref
    replaced by the referenced item's data."""
    refs: set = set()
    _collect(content, refs)
    if not refs:
        return content
    with session_scope() as s:
        rows = s.execute(
            select(ContentItem.kind, ContentItem.key, ContentItem.data).where(
                tuple_(ContentItem.kind, ContentItem.key).in_(list(refs))
            )
        ).all()
    items = {(kind, key): data for kind, key, data in rows}
    return _substitute(content, items)


def list_items(kind: Optional[str] = None) -> List[Dict[str, Any]]:
    with session_scope() as s:
        q = select(ContentItem).order_by(ContentItem.kind, ContentItem.key)
        if kind:
            q = q.where(ContentItem.kind == kind)
        rows = s.execute(q).scalars().all()
        return [_item_to_dict(r) for r in rows]


def get_item(item_id: str) -> Optional[Dict[str, Any]]:
    import uuid as _uuid

    with session_scope() as s:
        row = s.get(ContentItem, _uuid.UUID(item_id))
        return _item_to_dict(row) if row else None


def upsert_item(kind: str, key: str, data: Dict[str, Any]) -> Dict[str, Any]:
    with session_scope() as s:
        row = s.execute(
            select(ContentItem).where(ContentItem.kind == kind, ContentItem.key == key)
        ).scalar_one_or_none()
        if row:
            row.data = data
        else:
            row = ContentItem(kind=kind, key=key, data=data)
            s.add(row)
        s.flush()
        return _item_to_dict(row)


def update_item(item_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    import uuid as _uuid

    with session_scope() as s:
        row = s.get(ContentItem, _uuid.UUID(item_id))
        if not row:
            return None
        row.data = data
        s.flush()
        return _item_to_dict(row)


def delete_item(item_id: str) -> bool:
    import uuid as _uuid

    with session_scope() as s:
        row = s.get(ContentItem, _uuid.UUID(item_id))
        if not row:
            return False
        s.delete(row)
        return True


def _item_to_dict(row: ContentItem) -> Dict[str, Any]:
    return {
        "id": str(row.id),
        "kind": row.kind,
        "key": row.key,
        "data": row.data,
        "created_at": row.created_at,
        "updated_at": row.updated_at,
    }
