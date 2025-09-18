"""
Timezone-aware datetime utilities for CyberQuest application.

This module provides centralized timezone-aware datetime handling to replace 
naive datetime operations throughout the application. All functions return 
timezone-aware datetime objects using UTC as the standard timezone.

Key features:
- Consistent UTC timezone handling
- Parsing of various datetime string formats
- Safe conversion between timezone-aware and naive datetimes
- Utility functions for common datetime operations
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Any
import logging

logger = logging.getLogger(__name__)

# Standard timezone - all internal operations use UTC
UTC = timezone.utc

def utc_now() -> datetime:
    """
    Get current UTC datetime with timezone awareness.
    
    Returns:
        datetime: Current UTC datetime with timezone info
        
    Example:
        >>> now = utc_now()
        >>> print(now.tzinfo)  # timezone.utc
    """
    return datetime.now(UTC)

def utc_today() -> datetime:
    """
    Get today's date at midnight UTC with timezone awareness.
    
    Returns:
        datetime: Today's date at 00:00:00 UTC with timezone info
    """
    return datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)

def parse_datetime_aware(dt_input: Union[str, datetime, None]) -> Optional[datetime]:
    """
    Parse various datetime inputs into timezone-aware datetime objects.
    
    This function handles:
    - ISO format strings with/without timezone info
    - Existing datetime objects (converts naive to UTC)
    - None values
    - Common database datetime formats
    
    Args:
        dt_input: String, datetime object, or None
        
    Returns:
        datetime: Timezone-aware datetime in UTC, or None if input is None/invalid
        
    Examples:
        >>> parse_datetime_aware("2025-01-01T12:00:00Z")
        datetime(2025, 1, 1, 12, 0, tzinfo=timezone.utc)
        
        >>> parse_datetime_aware("2025-01-01T12:00:00")  # naive string
        datetime(2025, 1, 1, 12, 0, tzinfo=timezone.utc)
        
        >>> parse_datetime_aware(datetime(2025, 1, 1, 12, 0))  # naive datetime
        datetime(2025, 1, 1, 12, 0, tzinfo=timezone.utc)
    """
    if dt_input is None:
        return None
    
    # If it's already a datetime object
    if isinstance(dt_input, datetime):
        if dt_input.tzinfo is None:
            # Naive datetime - assume it's UTC
            return dt_input.replace(tzinfo=UTC)
        else:
            # Already timezone-aware - convert to UTC
            return dt_input.astimezone(UTC)
    
    # If it's a string, parse it
    if isinstance(dt_input, str):
        dt_str = dt_input.strip()
        if not dt_str:
            return None
        
        try:
            # Handle various timezone indicators
            if dt_str.endswith('Z'):
                # ISO format with Z (Zulu time = UTC)
                dt_str = dt_str[:-1] + '+00:00'
            elif not dt_str.endswith(('+00:00', '-00:00')) and 'T' in dt_str and '+' not in dt_str and '-' not in dt_str[-6:]:
                # ISO format without timezone - assume UTC
                dt_str = dt_str + '+00:00'
            
            # Parse with timezone info
            if '+' in dt_str[-6:] or '-' in dt_str[-6:]:
                dt = datetime.fromisoformat(dt_str)
                return dt.astimezone(UTC)
            else:
                # Fallback for formats without timezone
                dt = datetime.fromisoformat(dt_str)
                return dt.replace(tzinfo=UTC)
                
        except ValueError as e:
            logger.warning(f"Failed to parse datetime string '{dt_input}': {e}")
            return None
    
    logger.warning(f"Unsupported datetime input type: {type(dt_input)}")
    return None

def to_iso_string(dt: Optional[datetime]) -> Optional[str]:
    """
    Convert timezone-aware datetime to ISO format string.
    
    Args:
        dt: Timezone-aware datetime object or None
        
    Returns:
        str: ISO format string in UTC, or None if input is None
        
    Example:
        >>> dt = utc_now()
        >>> to_iso_string(dt)
        '2025-09-18T10:30:45.123456+00:00'
    """
    if dt is None:
        return None
    
    if dt.tzinfo is None:
        logger.warning("Converting naive datetime to UTC for ISO string")
        dt = dt.replace(tzinfo=UTC)
    
    # Convert to UTC and return ISO format
    return dt.astimezone(UTC).isoformat()

def to_database_string(dt: Optional[datetime]) -> Optional[str]:
    """
    Convert timezone-aware datetime to database storage format.
    
    This function ensures consistent storage format across all database operations.
    
    Args:
        dt: Timezone-aware datetime object or None
        
    Returns:
        str: UTC ISO format string suitable for database storage, or None
    """
    if dt is None:
        return None
    
    if dt.tzinfo is None:
        logger.warning("Converting naive datetime to UTC for database storage")
        dt = dt.replace(tzinfo=UTC)
    
    # Store in UTC with consistent format
    return dt.astimezone(UTC).isoformat()

def add_timezone_to_naive(dt: datetime, tz: timezone = UTC) -> datetime:
    """
    Add timezone info to a naive datetime object.
    
    Args:
        dt: Naive datetime object
        tz: Timezone to assign (defaults to UTC)
        
    Returns:
        datetime: Timezone-aware datetime object
        
    Raises:
        ValueError: If datetime already has timezone info
    """
    if dt.tzinfo is not None:
        raise ValueError("Datetime object already has timezone info")
    
    return dt.replace(tzinfo=tz)

def remove_timezone(dt: datetime) -> datetime:
    """
    Remove timezone info from a datetime object (convert to naive).
    
    Note: This function is provided for compatibility with legacy code
    that requires naive datetimes. New code should prefer timezone-aware datetimes.
    
    Args:
        dt: Timezone-aware datetime object
        
    Returns:
        datetime: Naive datetime object in UTC
    """
    if dt.tzinfo is None:
        return dt
    
    # Convert to UTC first, then remove timezone
    return dt.astimezone(UTC).replace(tzinfo=None)

def is_timezone_aware(dt: datetime) -> bool:
    """
    Check if a datetime object is timezone-aware.
    
    Args:
        dt: Datetime object to check
        
    Returns:
        bool: True if timezone-aware, False if naive
    """
    return dt.tzinfo is not None and dt.tzinfo.utcoffset(dt) is not None

def days_between(dt1: datetime, dt2: datetime) -> int:
    """
    Calculate days between two datetime objects.
    
    Both datetimes are converted to UTC dates for comparison.
    
    Args:
        dt1: First datetime
        dt2: Second datetime
        
    Returns:
        int: Number of days between the dates (positive if dt2 > dt1)
    """
    # Ensure both are timezone-aware
    if dt1.tzinfo is None:
        dt1 = dt1.replace(tzinfo=UTC)
    if dt2.tzinfo is None:
        dt2 = dt2.replace(tzinfo=UTC)
    
    # Convert to UTC dates and calculate difference
    date1 = dt1.astimezone(UTC).date()
    date2 = dt2.astimezone(UTC).date()
    
    return (date2 - date1).days

def hours_between(dt1: datetime, dt2: datetime) -> float:
    """
    Calculate hours between two datetime objects.
    
    Args:
        dt1: First datetime
        dt2: Second datetime
        
    Returns:
        float: Number of hours between the datetimes (positive if dt2 > dt1)
    """
    # Ensure both are timezone-aware
    if dt1.tzinfo is None:
        dt1 = dt1.replace(tzinfo=UTC)
    if dt2.tzinfo is None:
        dt2 = dt2.replace(tzinfo=UTC)
    
    # Convert to UTC and calculate difference
    utc_dt1 = dt1.astimezone(UTC)
    utc_dt2 = dt2.astimezone(UTC)
    
    delta = utc_dt2 - utc_dt1
    return delta.total_seconds() / 3600.0

def is_expired(dt: datetime, expiry_hours: float = 24.0) -> bool:
    """
    Check if a datetime is expired based on hours from now.
    
    Args:
        dt: Datetime to check
        expiry_hours: Hours after which the datetime is considered expired
        
    Returns:
        bool: True if expired, False otherwise
    """
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    
    now = utc_now()
    hours_diff = hours_between(dt, now)
    
    return hours_diff >= expiry_hours

def start_of_day(dt: datetime) -> datetime:
    """
    Get the start of day (00:00:00) for the given datetime in UTC.
    
    Args:
        dt: Input datetime
        
    Returns:
        datetime: Start of day in UTC with timezone info
    """
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    
    utc_dt = dt.astimezone(UTC)
    return utc_dt.replace(hour=0, minute=0, second=0, microsecond=0)

def end_of_day(dt: datetime) -> datetime:
    """
    Get the end of day (23:59:59.999999) for the given datetime in UTC.
    
    Args:
        dt: Input datetime
        
    Returns:
        datetime: End of day in UTC with timezone info
    """
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    
    utc_dt = dt.astimezone(UTC)
    return utc_dt.replace(hour=23, minute=59, second=59, microsecond=999999)

def format_relative_time(dt: datetime) -> str:
    """
    Format datetime as relative time string (e.g., "2 hours ago", "in 3 days").
    
    Args:
        dt: Datetime to format
        
    Returns:
        str: Human-readable relative time string
    """
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    
    now = utc_now()
    utc_dt = dt.astimezone(UTC)
    
    delta = now - utc_dt
    
    if delta.total_seconds() < 0:
        # Future time
        delta = -delta
        suffix = "from now"
    else:
        suffix = "ago"
    
    seconds = int(delta.total_seconds())
    
    if seconds < 60:
        return f"{seconds} second{'s' if seconds != 1 else ''} {suffix}"
    elif seconds < 3600:
        minutes = seconds // 60
        return f"{minutes} minute{'s' if minutes != 1 else ''} {suffix}"
    elif seconds < 86400:
        hours = seconds // 3600
        return f"{hours} hour{'s' if hours != 1 else ''} {suffix}"
    else:
        days = seconds // 86400
        return f"{days} day{'s' if days != 1 else ''} {suffix}"

def format_for_user_timezone(dt: datetime, user_timezone: str = 'UTC', format_string: str = '%Y-%m-%d %H:%M:%S') -> str:
    """
    Format datetime for display in user's timezone.
    
    Args:
        dt: UTC datetime to format (or string to parse first)
        user_timezone: User's timezone string (e.g., 'US/Eastern')
        format_string: Python datetime format string
        
    Returns:
        str: Formatted datetime string in user's timezone
    """
    if dt is None:
        return ""
    
    # Handle string inputs by parsing first
    if isinstance(dt, str):
        try:
            dt = parse_datetime_aware(dt)
        except Exception:
            return dt  # Return original string if parsing fails
    
    if dt.tzinfo is None:
        dt = add_timezone_to_naive(dt)
    
    try:
        # Convert to user's timezone
        if user_timezone and user_timezone != 'UTC':
            from zoneinfo import ZoneInfo
            user_tz = ZoneInfo(user_timezone)
            local_dt = dt.astimezone(user_tz)
        else:
            local_dt = dt.astimezone(UTC)
        
        return local_dt.strftime(format_string)
    except Exception:
        # Fallback to UTC if timezone conversion fails
        return dt.astimezone(UTC).strftime(format_string)

def format_for_user_timezone_with_tz(dt: datetime, user_timezone: str = 'UTC') -> str:
    """
    Format datetime for display in user's timezone with timezone abbreviation.
    
    Args:
        dt: UTC datetime to format (or string to parse first)
        user_timezone: User's timezone string
        
    Returns:
        str: Formatted datetime string with timezone abbreviation
    """
    if dt is None:
        return ""
    
    # Handle string inputs by parsing first
    if isinstance(dt, str):
        try:
            dt = parse_datetime_aware(dt)
        except Exception:
            return dt  # Return original string if parsing fails
    
    if dt.tzinfo is None:
        dt = add_timezone_to_naive(dt)
    
    try:
        # Convert to user's timezone
        if user_timezone and user_timezone != 'UTC':
            from zoneinfo import ZoneInfo
            user_tz = ZoneInfo(user_timezone)
            local_dt = dt.astimezone(user_tz)
        else:
            local_dt = dt.astimezone(UTC)
        
        # Format with timezone abbreviation
        return local_dt.strftime('%Y-%m-%d %H:%M:%S %Z')
    except Exception:
        # Fallback to UTC if timezone conversion fails
        return dt.astimezone(UTC).strftime('%Y-%m-%d %H:%M:%S UTC')

def get_common_timezones():
    """
    Get a list of common timezones for user selection.
    
    Returns:
        list: List of timezone strings sorted by offset and name
    """
    common_zones = [
        'UTC',
        'US/Eastern',
        'US/Central', 
        'US/Mountain',
        'US/Pacific',
        'US/Alaska',
        'US/Hawaii',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Europe/Rome',
        'Europe/Madrid',
        'Europe/Amsterdam',
        'Europe/Stockholm',
        'Europe/Moscow',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Asia/Hong_Kong',
        'Asia/Singapore',
        'Asia/Seoul',
        'Asia/Mumbai',
        'Asia/Dubai',
        'Australia/Sydney',
        'Australia/Melbourne',
        'Australia/Perth',
        'Canada/Eastern',
        'Canada/Central',
        'Canada/Mountain',
        'Canada/Pacific',
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'America/Toronto',
        'America/Vancouver',
        'America/Mexico_City',
        'America/Sao_Paulo',
        'America/Buenos_Aires',
        'Pacific/Auckland',
        'Africa/Cairo',
        'Africa/Johannesburg'
    ]
    
    return sorted(common_zones)

# Legacy compatibility functions for gradual migration
def utcnow() -> datetime:
    """
    Legacy compatibility function for datetime.utcnow().
    
    Returns timezone-aware UTC datetime instead of naive.
    
    Returns:
        datetime: Current UTC datetime with timezone info
        
    Deprecated: Use utc_now() instead for clarity.
    """
    logger.warning("utcnow() is deprecated, use utc_now() instead")
    return utc_now()

def parse_datetime_naive(dt_string: str) -> Optional[datetime]:
    """
    Legacy compatibility function that strips timezone info.
    
    This function is provided for backward compatibility with existing code
    that expects naive datetimes. New code should use parse_datetime_aware().
    
    Args:
        dt_string: Datetime string to parse
        
    Returns:
        datetime: Naive datetime object or None
        
    Deprecated: Use parse_datetime_aware() for new code.
    """
    logger.warning("parse_datetime_naive() is deprecated, use parse_datetime_aware() instead")
    
    dt_aware = parse_datetime_aware(dt_string)
    if dt_aware is None:
        return None
    
    return remove_timezone(dt_aware)