from datetime import datetime, timedelta
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, HashingError
from flask_login import UserMixin
import secrets
from typing import Optional, List, Dict, Any
from app.database import get_supabase, Tables, handle_supabase_error, DatabaseError
from app.utils.timezone_utils import parse_datetime_aware, utc_now, is_expired

ph = PasswordHasher()

class User(UserMixin):
    def __init__(self, data: Dict[str, Any]):
        """Initialize User from Supabase data."""
        self.id = data.get('id')
        self.username = data.get('username')
        self.email = data.get('email')
        self.password_hash = data.get('password_hash')
        self._is_active = data.get('is_active', True)
        self.created_at = data.get('created_at')
        self.last_login = data.get('last_login')
        self.is_admin = data.get('is_admin', False)
        self.is_verified = data.get('is_verified', False)
        self.total_xp = data.get('total_xp', 0)
        self.timezone = data.get('timezone', 'UTC')  # Default to UTC if not set
        
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
    
    def set_password(self, password):
        """Hash and set password using Argon2."""
        try:
            self.password_hash = ph.hash(password)
        except HashingError:
            raise ValueError("Error hashing password")
    
    def check_password(self, password):
        """Verify password against stored hash."""
        try:
            ph.verify(self.password_hash, password)
            return True
        except VerifyMismatchError:
            return False
    
    def save(self):
        """Save user to database."""
        supabase = get_supabase()
        try:
            user_data = {
                'username': self.username,
                'email': self.email,
                'password_hash': self.password_hash,
                'is_active': self.is_active,
                'is_admin': self.is_admin,
                'is_verified': self.is_verified,
                'total_xp': self.total_xp,
                'timezone': self.timezone,
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
    
    def generate_reset_token(self):
        """Generate a password reset token."""
        # Deactivate any existing tokens
        supabase = get_supabase()
        try:
            supabase.table(Tables.PASSWORD_RESET_TOKENS).update({
                'is_active': False
            }).eq('user_id', self.id).execute()
            
            # Create new token
            reset_token = PasswordResetToken.create(self.id)
            return reset_token.token
        except Exception as e:
            raise DatabaseError(f"Failed to generate reset token: {e}")
    
    def get_id(self):
        """Override UserMixin method to return user ID as string."""
        return str(self.id)
    
    @classmethod
    def create(cls, username: str, email: str, password: str, timezone: str = 'UTC') -> 'User':
        """Create a new user with automatic timezone detection."""
        user_data = {
            'username': username,
            'email': email,
            'password_hash': None,
            'is_active': True,
            'is_admin': False,
            'is_verified': False,  # New users start unverified
            'total_xp': 0,
            'timezone': timezone,
            'created_at': utc_now(),
            'last_login': None
        }
        user = cls(user_data)
        user.set_password(password)
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
    
    def __repr__(self):
        return f'<User {self.username}>'


class PasswordResetToken:
    def __init__(self, data: Dict[str, Any]):
        """Initialize PasswordResetToken from Supabase data."""
        self.id = data.get('id')
        self.user_id = data.get('user_id')
        self.token = data.get('token')
        self.created_at = data.get('created_at')
        self.expires_at = data.get('expires_at')
        self.is_active = data.get('is_active', True)
        self.used_at = data.get('used_at')
        
        # Convert string timestamps to datetime objects if needed
        if isinstance(self.created_at, str):
            self.created_at = parse_datetime_aware(self.created_at)
        if isinstance(self.expires_at, str):
            self.expires_at = parse_datetime_aware(self.expires_at)
        if isinstance(self.used_at, str):
            self.used_at = parse_datetime_aware(self.used_at)
    
    def save(self):
        """Save token to database."""
        supabase = get_supabase()
        try:
            token_data = {
                'user_id': self.user_id,
                'token': self.token,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'expires_at': self.expires_at.isoformat() if self.expires_at else None,
                'is_active': self.is_active,
                'used_at': self.used_at.isoformat() if self.used_at else None
            }
            
            if self.id:
                # Update existing token
                response = supabase.table(Tables.PASSWORD_RESET_TOKENS).update(token_data).eq('id', self.id).execute()
                handle_supabase_error(response)
            else:
                # Create new token
                response = supabase.table(Tables.PASSWORD_RESET_TOKENS).insert(token_data).execute()
                data = handle_supabase_error(response)
                if data and len(data) > 0:
                    self.id = data[0]['id']
        except Exception as e:
            raise DatabaseError(f"Failed to save password reset token: {e}")
    
    def is_valid(self):
        """Check if token is valid (active and not expired)."""
        return (self.is_active and 
                not self.used_at and 
                not is_expired(self.expires_at, 0))
    
    def use_token(self):
        """Mark token as used."""
        self.used_at = utc_now()
        self.is_active = False
        self.save()
    
    def get_user(self) -> Optional['User']:
        """Get the user associated with this token."""
        return User.find_by_id(self.user_id)
    
    @property
    def user(self) -> Optional['User']:
        """Property to access the user (for backward compatibility)."""
        return self.get_user()
    
    @classmethod
    def create(cls, user_id: int) -> 'PasswordResetToken':
        """Create a new password reset token."""
        from datetime import timedelta
        
        token_data = {
            'user_id': user_id,
            'token': secrets.token_urlsafe(32),
            'created_at': utc_now(),
            'expires_at': utc_now() + timedelta(hours=1),
            'is_active': True,
            'used_at': None
        }
        
        token = cls(token_data)
        token.save()
        return token
    
    @classmethod
    def find_valid_token(cls, token: str) -> Optional['PasswordResetToken']:
        """Find a valid token by token string."""
        supabase = get_supabase()
        try:
            response = supabase.table(Tables.PASSWORD_RESET_TOKENS).select("*").eq('token', token).execute()
            data = handle_supabase_error(response)
            if data and len(data) > 0:
                reset_token = cls(data[0])
                if reset_token.is_valid():
                    return reset_token
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to find valid token: {e}")
    
    def __repr__(self):
        return f'<PasswordResetToken {self.token[:8]}...>'
