"""
Timezone-aware datetime utilities for Phalanx Cyber Academy application.

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

def get_timezones():
    """
    Get a comprehensive list of timezones based on the IANA Time Zone Database.
    
    Returns:
        list: List of timezone strings sorted alphabetically
    """
    timezones = [
        'Africa/Abidjan',
        'Africa/Accra',
        'Africa/Addis_Ababa',
        'Africa/Algiers',
        'Africa/Asmara',
        'Africa/Asmera',
        'Africa/Bamako',
        'Africa/Bangui',
        'Africa/Banjul',
        'Africa/Bissau',
        'Africa/Blantyre',
        'Africa/Brazzaville',
        'Africa/Bujumbura',
        'Africa/Cairo',
        'Africa/Casablanca',
        'Africa/Ceuta',
        'Africa/Conakry',
        'Africa/Dakar',
        'Africa/Dar_es_Salaam',
        'Africa/Djibouti',
        'Africa/Douala',
        'Africa/El_Aaiun',
        'Africa/Freetown',
        'Africa/Gaborone',
        'Africa/Harare',
        'Africa/Johannesburg',
        'Africa/Juba',
        'Africa/Kampala',
        'Africa/Khartoum',
        'Africa/Kigali',
        'Africa/Kinshasa',
        'Africa/Lagos',
        'Africa/Libreville',
        'Africa/Lome',
        'Africa/Luanda',
        'Africa/Lubumbashi',
        'Africa/Lusaka',
        'Africa/Malabo',
        'Africa/Maputo',
        'Africa/Maseru',
        'Africa/Mbabane',
        'Africa/Mogadishu',
        'Africa/Monrovia',
        'Africa/Nairobi',
        'Africa/Ndjamena',
        'Africa/Niamey',
        'Africa/Nouakchott',
        'Africa/Ouagadougou',
        'Africa/Porto-Novo',
        'Africa/Sao_Tome',
        'Africa/Timbuktu',
        'Africa/Tripoli',
        'Africa/Tunis',
        'Africa/Windhoek',
        'America/Adak',
        'America/Anchorage',
        'America/Anguilla',
        'America/Antigua',
        'America/Araguaina',
        'America/Argentina/Buenos_Aires',
        'America/Argentina/Catamarca',
        'America/Argentina/ComodRivadavia',
        'America/Argentina/Cordoba',
        'America/Argentina/Jujuy',
        'America/Argentina/La_Rioja',
        'America/Argentina/Mendoza',
        'America/Argentina/Rio_Gallegos',
        'America/Argentina/Salta',
        'America/Argentina/San_Juan',
        'America/Argentina/San_Luis',
        'America/Argentina/Tucuman',
        'America/Argentina/Ushuaia',
        'America/Aruba',
        'America/Asuncion',
        'America/Atikokan',
        'America/Atka',
        'America/Bahia',
        'America/Bahia_Banderas',
        'America/Barbados',
        'America/Belem',
        'America/Belize',
        'America/Blanc-Sablon',
        'America/Boa_Vista',
        'America/Bogota',
        'America/Boise',
        'America/Buenos_Aires',
        'America/Cambridge_Bay',
        'America/Campo_Grande',
        'America/Cancun',
        'America/Caracas',
        'America/Catamarca',
        'America/Cayenne',
        'America/Cayman',
        'America/Chicago',
        'America/Chihuahua',
        'America/Ciudad_Juarez',
        'America/Coral_Harbour',
        'America/Cordoba',
        'America/Costa_Rica',
        'America/Coyhaique',
        'America/Creston',
        'America/Cuiaba',
        'America/Curacao',
        'America/Danmarkshavn',
        'America/Dawson',
        'America/Dawson_Creek',
        'America/Denver',
        'America/Detroit',
        'America/Dominica',
        'America/Edmonton',
        'America/Eirunepe',
        'America/El_Salvador',
        'America/Ensenada',
        'America/Fort_Nelson',
        'America/Fort_Wayne',
        'America/Fortaleza',
        'America/Glace_Bay',
        'America/Godthab',
        'America/Goose_Bay',
        'America/Grand_Turk',
        'America/Grenada',
        'America/Guadeloupe',
        'America/Guatemala',
        'America/Guayaquil',
        'America/Guyana',
        'America/Halifax',
        'America/Havana',
        'America/Hermosillo',
        'America/Indiana/Indianapolis',
        'America/Indiana/Knox',
        'America/Indiana/Marengo',
        'America/Indiana/Petersburg',
        'America/Indiana/Tell_City',
        'America/Indiana/Vevay',
        'America/Indiana/Vincennes',
        'America/Indiana/Winamac',
        'America/Indianapolis',
        'America/Inuvik',
        'America/Iqaluit',
        'America/Jamaica',
        'America/Jujuy',
        'America/Juneau',
        'America/Kentucky/Louisville',
        'America/Kentucky/Monticello',
        'America/Knox_IN',
        'America/Kralendijk',
        'America/La_Paz',
        'America/Lima',
        'America/Los_Angeles',
        'America/Louisville',
        'America/Lower_Princes',
        'America/Maceio',
        'America/Managua',
        'America/Manaus',
        'America/Marigot',
        'America/Martinique',
        'America/Matamoros',
        'America/Mazatlan',
        'America/Mendoza',
        'America/Menominee',
        'America/Merida',
        'America/Metlakatla',
        'America/Mexico_City',
        'America/Miquelon',
        'America/Moncton',
        'America/Monterrey',
        'America/Montevideo',
        'America/Montreal',
        'America/Montserrat',
        'America/Nassau',
        'America/New_York',
        'America/Nipigon',
        'America/Nome',
        'America/Noronha',
        'America/North_Dakota/Beulah',
        'America/North_Dakota/Center',
        'America/North_Dakota/New_Salem',
        'America/Nuuk',
        'America/Ojinaga',
        'America/Panama',
        'America/Pangnirtung',
        'America/Paramaribo',
        'America/Phoenix',
        'America/Port-au-Prince',
        'America/Port_of_Spain',
        'America/Porto_Acre',
        'America/Porto_Velho',
        'America/Puerto_Rico',
        'America/Punta_Arenas',
        'America/Rainy_River',
        'America/Rankin_Inlet',
        'America/Recife',
        'America/Regina',
        'America/Resolute',
        'America/Rio_Branco',
        'America/Rosario',
        'America/Santa_Isabel',
        'America/Santarem',
        'America/Santiago',
        'America/Santo_Domingo',
        'America/Sao_Paulo',
        'America/Scoresbysund',
        'America/Shiprock',
        'America/Sitka',
        'America/St_Barthelemy',
        'America/St_Johns',
        'America/St_Kitts',
        'America/St_Lucia',
        'America/St_Thomas',
        'America/St_Vincent',
        'America/Swift_Current',
        'America/Tegucigalpa',
        'America/Thule',
        'America/Thunder_Bay',
        'America/Tijuana',
        'America/Toronto',
        'America/Tortola',
        'America/Vancouver',
        'America/Virgin',
        'America/Whitehorse',
        'America/Winnipeg',
        'America/Yakutat',
        'America/Yellowknife',
        'Antarctica/Casey',
        'Antarctica/Davis',
        'Antarctica/DumontDUrville',
        'Antarctica/Macquarie',
        'Antarctica/Mawson',
        'Antarctica/McMurdo',
        'Antarctica/Palmer',
        'Antarctica/Rothera',
        'Antarctica/South_Pole',
        'Antarctica/Syowa',
        'Antarctica/Troll',
        'Antarctica/Vostok',
        'Arctic/Longyearbyen',
        'Asia/Aden',
        'Asia/Almaty',
        'Asia/Amman',
        'Asia/Anadyr',
        'Asia/Aqtau',
        'Asia/Aqtobe',
        'Asia/Ashgabat',
        'Asia/Ashkhabad',
        'Asia/Atyrau',
        'Asia/Baghdad',
        'Asia/Bahrain',
        'Asia/Baku',
        'Asia/Bangkok',
        'Asia/Barnaul',
        'Asia/Beirut',
        'Asia/Bishkek',
        'Asia/Brunei',
        'Asia/Calcutta',
        'Asia/Chita',
        'Asia/Choibalsan',
        'Asia/Chongqing',
        'Asia/Chungking',
        'Asia/Colombo',
        'Asia/Dacca',
        'Asia/Damascus',
        'Asia/Dhaka',
        'Asia/Dili',
        'Asia/Dubai',
        'Asia/Dushanbe',
        'Asia/Famagusta',
        'Asia/Gaza',
        'Asia/Harbin',
        'Asia/Hebron',
        'Asia/Ho_Chi_Minh',
        'Asia/Hong_Kong',
        'Asia/Hovd',
        'Asia/Irkutsk',
        'Asia/Istanbul',
        'Asia/Jakarta',
        'Asia/Jayapura',
        'Asia/Jerusalem',
        'Asia/Kabul',
        'Asia/Kamchatka',
        'Asia/Karachi',
        'Asia/Kashgar',
        'Asia/Kathmandu',
        'Asia/Katmandu',
        'Asia/Khandyga',
        'Asia/Kolkata',
        'Asia/Krasnoyarsk',
        'Asia/Kuala_Lumpur',
        'Asia/Kuching',
        'Asia/Kuwait',
        'Asia/Macao',
        'Asia/Macau',
        'Asia/Magadan',
        'Asia/Makassar',
        'Asia/Manila',
        'Asia/Muscat',
        'Asia/Nicosia',
        'Asia/Novokuznetsk',
        'Asia/Novosibirsk',
        'Asia/Omsk',
        'Asia/Oral',
        'Asia/Phnom_Penh',
        'Asia/Pontianak',
        'Asia/Pyongyang',
        'Asia/Qatar',
        'Asia/Qostanay',
        'Asia/Qyzylorda',
        'Asia/Rangoon',
        'Asia/Riyadh',
        'Asia/Saigon',
        'Asia/Sakhalin',
        'Asia/Samarkand',
        'Asia/Seoul',
        'Asia/Shanghai',
        'Asia/Singapore',
        'Asia/Srednekolymsk',
        'Asia/Taipei',
        'Asia/Tashkent',
        'Asia/Tbilisi',
        'Asia/Tehran',
        'Asia/Tel_Aviv',
        'Asia/Thimbu',
        'Asia/Thimphu',
        'Asia/Tokyo',
        'Asia/Tomsk',
        'Asia/Ujung_Pandang',
        'Asia/Ulaanbaatar',
        'Asia/Ulan_Bator',
        'Asia/Urumqi',
        'Asia/Ust-Nera',
        'Asia/Vientiane',
        'Asia/Vladivostok',
        'Asia/Yakutsk',
        'Asia/Yangon',
        'Asia/Yekaterinburg',
        'Asia/Yerevan',
        'Atlantic/Azores',
        'Atlantic/Bermuda',
        'Atlantic/Canary',
        'Atlantic/Cape_Verde',
        'Atlantic/Faeroe',
        'Atlantic/Faroe',
        'Atlantic/Jan_Mayen',
        'Atlantic/Madeira',
        'Atlantic/Reykjavik',
        'Atlantic/South_Georgia',
        'Atlantic/St_Helena',
        'Atlantic/Stanley',
        'Australia/ACT',
        'Australia/Adelaide',
        'Australia/Brisbane',
        'Australia/Broken_Hill',
        'Australia/Canberra',
        'Australia/Currie',
        'Australia/Darwin',
        'Australia/Eucla',
        'Australia/Hobart',
        'Australia/LHI',
        'Australia/Lindeman',
        'Australia/Lord_Howe',
        'Australia/Melbourne',
        'Australia/North',
        'Australia/NSW',
        'Australia/Perth',
        'Australia/Queensland',
        'Australia/South',
        'Australia/Sydney',
        'Australia/Tasmania',
        'Australia/Victoria',
        'Australia/West',
        'Australia/Yancowinna',
        'Brazil/Acre',
        'Brazil/DeNoronha',
        'Brazil/East',
        'Brazil/West',
        'Canada/Atlantic',
        'Canada/Central',
        'Canada/Eastern',
        'Canada/Mountain',
        'Canada/Newfoundland',
        'Canada/Pacific',
        'Canada/Saskatchewan',
        'Canada/Yukon',
        'CET',
        'Chile/Continental',
        'Chile/EasterIsland',
        'CST6CDT',
        'Cuba',
        'EET',
        'Egypt',
        'Eire',
        'EST',
        'EST5EDT',
        'Etc/GMT',
        'Etc/GMT+0',
        'Etc/GMT+1',
        'Etc/GMT+10',
        'Etc/GMT+11',
        'Etc/GMT+12',
        'Etc/GMT+2',
        'Etc/GMT+3',
        'Etc/GMT+4',
        'Etc/GMT+5',
        'Etc/GMT+6',
        'Etc/GMT+7',
        'Etc/GMT+8',
        'Etc/GMT+9',
        'Etc/GMT-0',
        'Etc/GMT-1',
        'Etc/GMT-10',
        'Etc/GMT-11',
        'Etc/GMT-12',
        'Etc/GMT-13',
        'Etc/GMT-14',
        'Etc/GMT-2',
        'Etc/GMT-3',
        'Etc/GMT-4',
        'Etc/GMT-5',
        'Etc/GMT-6',
        'Etc/GMT-7',
        'Etc/GMT-8',
        'Etc/GMT-9',
        'Etc/GMT0',
        'Etc/Greenwich',
        'Etc/UCT',
        'Etc/Universal',
        'Etc/UTC',
        'Etc/Zulu',
        'Europe/Amsterdam',
        'Europe/Andorra',
        'Europe/Astrakhan',
        'Europe/Athens',
        'Europe/Belfast',
        'Europe/Belgrade',
        'Europe/Berlin',
        'Europe/Bratislava',
        'Europe/Brussels',
        'Europe/Bucharest',
        'Europe/Budapest',
        'Europe/Busingen',
        'Europe/Chisinau',
        'Europe/Copenhagen',
        'Europe/Dublin',
        'Europe/Gibraltar',
        'Europe/Guernsey',
        'Europe/Helsinki',
        'Europe/Isle_of_Man',
        'Europe/Istanbul',
        'Europe/Jersey',
        'Europe/Kaliningrad',
        'Europe/Kiev',
        'Europe/Kirov',
        'Europe/Kyiv',
        'Europe/Lisbon',
        'Europe/Ljubljana',
        'Europe/London',
        'Europe/Luxembourg',
        'Europe/Madrid',
        'Europe/Malta',
        'Europe/Mariehamn',
        'Europe/Minsk',
        'Europe/Monaco',
        'Europe/Moscow',
        'Europe/Nicosia',
        'Europe/Oslo',
        'Europe/Paris',
        'Europe/Podgorica',
        'Europe/Prague',
        'Europe/Riga',
        'Europe/Rome',
        'Europe/Samara',
        'Europe/San_Marino',
        'Europe/Sarajevo',
        'Europe/Saratov',
        'Europe/Simferopol',
        'Europe/Skopje',
        'Europe/Sofia',
        'Europe/Stockholm',
        'Europe/Tallinn',
        'Europe/Tirane',
        'Europe/Tiraspol',
        'Europe/Ulyanovsk',
        'Europe/Uzhgorod',
        'Europe/Vaduz',
        'Europe/Vatican',
        'Europe/Vienna',
        'Europe/Vilnius',
        'Europe/Volgograd',
        'Europe/Warsaw',
        'Europe/Zagreb',
        'Europe/Zaporozhye',
        'Europe/Zurich',
        'Factory',
        'GB',
        'GB-Eire',
        'GMT',
        'GMT+0',
        'GMT-0',
        'GMT0',
        'Greenwich',
        'Hongkong',
        'HST',
        'Iceland',
        'Indian/Antananarivo',
        'Indian/Chagos',
        'Indian/Christmas',
        'Indian/Cocos',
        'Indian/Comoro',
        'Indian/Kerguelen',
        'Indian/Mahe',
        'Indian/Maldives',
        'Indian/Mauritius',
        'Indian/Mayotte',
        'Indian/Reunion',
        'Iran',
        'Israel',
        'Jamaica',
        'Japan',
        'Kwajalein',
        'Libya',
        'MET',
        'Mexico/BajaNorte',
        'Mexico/BajaSur',
        'Mexico/General',
        'MST',
        'MST7MDT',
        'Navajo',
        'NZ',
        'NZ-CHAT',
        'Pacific/Apia',
        'Pacific/Auckland',
        'Pacific/Bougainville',
        'Pacific/Chatham',
        'Pacific/Chuuk',
        'Pacific/Easter',
        'Pacific/Efate',
        'Pacific/Enderbury',
        'Pacific/Fakaofo',
        'Pacific/Fiji',
        'Pacific/Funafuti',
        'Pacific/Galapagos',
        'Pacific/Gambier',
        'Pacific/Guadalcanal',
        'Pacific/Guam',
        'Pacific/Honolulu',
        'Pacific/Johnston',
        'Pacific/Kanton',
        'Pacific/Kiritimati',
        'Pacific/Kosrae',
        'Pacific/Kwajalein',
        'Pacific/Majuro',
        'Pacific/Marquesas',
        'Pacific/Midway',
        'Pacific/Nauru',
        'Pacific/Niue',
        'Pacific/Norfolk',
        'Pacific/Noumea',
        'Pacific/Pago_Pago',
        'Pacific/Palau',
        'Pacific/Pitcairn',
        'Pacific/Pohnpei',
        'Pacific/Ponape',
        'Pacific/Port_Moresby',
        'Pacific/Rarotonga',
        'Pacific/Saipan',
        'Pacific/Samoa',
        'Pacific/Tahiti',
        'Pacific/Tarawa',
        'Pacific/Tongatapu',
        'Pacific/Truk',
        'Pacific/Wake',
        'Pacific/Wallis',
        'Pacific/Yap',
        'Poland',
        'Portugal',
        'PRC',
        'PST8PDT',
        'ROC',
        'ROK',
        'Singapore',
        'Turkey',
        'UCT',
        'Universal',
        'US/Alaska',
        'US/Aleutian',
        'US/Arizona',
        'US/Central',
        'US/East-Indiana',
        'US/Eastern',
        'US/Hawaii',
        'US/Indiana-Starke',
        'US/Michigan',
        'US/Mountain',
        'US/Pacific',
        'US/Samoa',
        'UTC',
        'W-SU',
        'WET',
        'Zulu'
    ]
    
    return timezones

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