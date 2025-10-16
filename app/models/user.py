from datetime import datetime, timedelta
from flask_login import UserMixin
import secrets
from typing import Optional, List, Dict, Any
from app.database import get_supabase, Tables, handle_supabase_error, DatabaseError
from app.utils.timezone_utils import parse_datetime_aware, utc_now, is_expired

class User(UserMixin):
    def __init__(self, data: Dict[str, Any]):
        """Initialize User from Supabase data."""
        self.id = data.get('id')
        self.username = data.get('username')
        self.email = data.get('email')
        self.password_hash = data.get('password_hash')  # Legacy field, kept for migration
        self._is_active = data.get('is_active', True)
        self.created_at = data.get('created_at')
        self.last_login = data.get('last_login')
        self.is_admin = data.get('is_admin', False)
        self.is_verified = data.get('is_verified', False)
        self.total_xp = data.get('total_xp', 0)
        self.timezone = data.get('timezone', 'UTC')  # Default to UTC if not set
        self.cybersecurity_experience = data.get('cybersecurity_experience')
        self.onboarding_completed = data.get('onboarding_completed', False)
        
        # Convert string timestamps to datetime objects if needed
        if isinstance(self.created_at, str):
            self.created_at = parse_datetime_aware(self.created_at)
        if isinstance(self.last_login, str):
            self.last_login = parse_datetime_aware(self.last_login)
    
    @property
    def is_active(self):
        """Get the is_active status."""
        return self._is_active
    
    @is_active.setter
    def is_active(self, value):
        """Set the is_active status."""
        self._is_active = bool(value)
    
    def save(self):
        """Save user to database."""
        supabase = get_supabase()
        try:
            user_data = {
                'username': self.username,
                'email': self.email,
                'password_hash': self.password_hash,  # Keep for migration compatibility
                'is_active': self.is_active,
                'is_admin': self.is_admin,
                'is_verified': self.is_verified,
                'total_xp': self.total_xp,
                'timezone': self.timezone,
                'cybersecurity_experience': self.cybersecurity_experience,
                'onboarding_completed': self.onboarding_completed,
                'last_login': self.last_login.isoformat() if self.last_login else None
            }
            
            if self.id:
                # Update existing user
                response = supabase.table(Tables.USERS).update(user_data).eq('id', self.id).execute()
                handle_supabase_error(response)
            else:
                # Create new user
                user_data['created_at'] = utc_now().isoformat()
                response = supabase.table(Tables.USERS).insert(user_data).execute()
                data = handle_supabase_error(response)
                if data and len(data) > 0:
                    self.id = data[0]['id']
                    self.created_at = parse_datetime_aware(data[0]['created_at'])
        except Exception as e:
            raise DatabaseError(f"Failed to save user: {e}")
    
    def update_last_login(self):
        """Update last login timestamp."""
        self.last_login = utc_now()
        self.save()
    
    def verify_email(self):
        """Mark user's email as verified."""
        self.is_verified = True
        self.save()
    
    def is_email_verified(self):
        """Check if user's email is verified."""
        return self.is_verified
    
    def complete_onboarding(self, username: str, experience: str):
        """Complete user onboarding process."""
        self.username = username
        self.cybersecurity_experience = experience
        self.onboarding_completed = True
        self.save()
    
    def needs_onboarding(self):
        """Check if user needs to complete onboarding."""
        return not self.onboarding_completed or not self.username
    
    def get_id(self):
        """Override UserMixin method to return user ID as string."""
        return str(self.id)
    
    @classmethod
    def create(cls, email: str, timezone: str = 'UTC', username: str = None) -> 'User':
        """Create a new user for passwordless authentication."""
        user_data = {
            'username': username,  # Can be None initially, set during onboarding
            'email': email,
            'password_hash': None,  # No password for passwordless auth
            'is_active': True,
            'is_admin': False,
            'is_verified': False,  # New users start unverified
            'total_xp': 0,
            'timezone': timezone,
            'cybersecurity_experience': None,
            'onboarding_completed': False if not username else True,  # Complete if username provided
            'created_at': utc_now(),
            'last_login': None
        }
        user = cls(user_data)
        user.save()
        return user
    
    @classmethod
    def find_by_id(cls, user_id: int) -> Optional['User']:
        """Find user by ID."""
        supabase = get_supabase()
        try:
            response = supabase.table(Tables.USERS).select("*").eq('id', user_id).execute()
            data = handle_supabase_error(response)
            if data and len(data) > 0:
                return cls(data[0])
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to find user by ID: {e}")
    
    @classmethod
    def find_by_username(cls, username: str) -> Optional['User']:
        """Find user by username."""
        supabase = get_supabase()
        try:
            response = supabase.table(Tables.USERS).select("*").eq('username', username).execute()
            data = handle_supabase_error(response)
            if data and len(data) > 0:
                return cls(data[0])
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to find user by username: {e}")
    
    @classmethod
    def find_by_email(cls, email: str) -> Optional['User']:
        """Find user by email."""
        supabase = get_supabase()
        try:
            response = supabase.table(Tables.USERS).select("*").eq('email', email).execute()
            data = handle_supabase_error(response)
            if data and len(data) > 0:
                return cls(data[0])
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to find user by email: {e}")
    
    @classmethod
    def find_by_username_or_email(cls, identifier: str) -> Optional['User']:
        """Find user by username or email."""
        supabase = get_supabase()
        try:
            response = supabase.table(Tables.USERS).select("*").or_(f"username.eq.{identifier},email.eq.{identifier}").execute()
            data = handle_supabase_error(response)
            if data and len(data) > 0:
                return cls(data[0])
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to find user by username or email: {e}")
    
    @classmethod
    def get_all_users(cls, page: int = 1, per_page: int = 25, search: str = None, status_filter: str = 'all') -> tuple:
        """Get paginated list of users with optional filtering."""
        supabase = get_supabase()
        try:
            query = supabase.table(Tables.USERS).select("*", count='exact')
            
            # Apply filters
            if search:
                query = query.or_(f"username.ilike.%{search}%,email.ilike.%{search}%")
            
            if status_filter == 'active':
                query = query.eq('is_active', True)
            elif status_filter == 'inactive':
                query = query.eq('is_active', False)
            elif status_filter == 'admin':
                query = query.eq('is_admin', True)
            
            # Calculate offset
            offset = (page - 1) * per_page
            
            # Execute query with pagination
            response = query.order('created_at', desc=True).range(offset, offset + per_page - 1).execute()
            data = handle_supabase_error(response)
            
            users = [cls(user_data) for user_data in data]
            total_count = response.count if hasattr(response, 'count') else len(data)
            
            return users, total_count
        except Exception as e:
            raise DatabaseError(f"Failed to get users: {e}")
    
    @classmethod
    def count_all(cls) -> int:
        """Count total users."""
        supabase = get_supabase()
        try:
            response = supabase.table(Tables.USERS).select("*", count='exact').execute()
            return response.count if hasattr(response, 'count') else 0
        except Exception as e:
            raise DatabaseError(f"Failed to count users: {e}")
    
    @classmethod
    def count_active(cls) -> int:
        """Count active users."""
        supabase = get_supabase()
        try:
            response = supabase.table(Tables.USERS).select("*", count='exact').eq('is_active', True).execute()
            return response.count if hasattr(response, 'count') else 0
        except Exception as e:
            raise DatabaseError(f"Failed to count active users: {e}")
    
    @classmethod
    def count_recent_registrations(cls, days: int = 30) -> int:
        """Count recent user registrations."""
        supabase = get_supabase()
        try:
            cutoff_date = (utc_now() - timedelta(days=days)).isoformat()
            response = supabase.table(Tables.USERS).select("*", count='exact').gte('created_at', cutoff_date).execute()
            return response.count if hasattr(response, 'count') else 0
        except Exception as e:
            raise DatabaseError(f"Failed to count recent registrations: {e}")
    
    @classmethod
    def count_verified_emails(cls) -> int:
        """Count users with verified emails."""
        supabase = get_supabase()
        try:
            response = supabase.table(Tables.USERS).select("*", count='exact').eq('is_verified', True).execute()
            return response.count if hasattr(response, 'count') else 0
        except Exception as e:
            raise DatabaseError(f"Failed to count verified emails: {e}")
    
    def __repr__(self):
        return f'<User {self.username}>'
