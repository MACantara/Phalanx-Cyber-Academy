from datetime import datetime, timezone


def utc_now() -> datetime:
    """Return the current UTC time."""
    return datetime.now(timezone.utc)


def parse_datetime_aware(value):
    """Parse an ISO datetime string or return the existing datetime."""
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value)
        except ValueError:
            return None
    return None
