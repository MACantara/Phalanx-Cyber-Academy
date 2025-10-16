from datetime import datetime, timedelta
import secrets
import random
from typing import Optional, Dict, Any, List
from app.database import get_supabase, Tables, handle_supabase_error, DatabaseError
from app.utils.timezone_utils import parse_datetime_aware, utc_now, is_expired

class EmailVerification:
    def __init__(self, data: Dict[str, Any]):
        """Initialize EmailVerification from Supabase data."""
        self.id = data.get('id')
        self.user_id = data.get('user_id')
        self.email = data.get('email')
        self.token = data.get('token')
        self.verification_code = data.get('verification_code')
        self.code_type = data.get('code_type', 'signup')  # 'signup' or 'login'
        self.created_at = data.get('created_at')
        self.expires_at = data.get('expires_at')
        self.verified_at = data.get('verified_at')
        self.attempts = data.get('attempts', 0)
        
        # Convert string timestamps to datetime objects if needed
        if isinstance(self.created_at, str):
            self.created_at = parse_datetime_aware(self.created_at)
        if isinstance(self.expires_at, str):
            self.expires_at = parse_datetime_aware(self.expires_at)
        if isinstance(self.verified_at, str):
            self.verified_at = parse_datetime_aware(self.verified_at)
    
    def save(self):
        """Save email verification to database."""
        supabase = get_supabase()
        try:
            verification_data = {
                'user_id': self.user_id,
                'email': self.email,
                'token': self.token,
                'verification_code': self.verification_code,
                'code_type': self.code_type,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'expires_at': self.expires_at.isoformat() if self.expires_at else None,
                'verified_at': self.verified_at.isoformat() if self.verified_at else None,
                'attempts': self.attempts
            }
            
            if self.id:
                # Update existing verification
                response = supabase.table(Tables.EMAIL_VERIFICATIONS).update(verification_data).eq('id', self.id).execute()
                handle_supabase_error(response)
            else:
                # Create new verification
                response = supabase.table(Tables.EMAIL_VERIFICATIONS).insert(verification_data).execute()
                data = handle_supabase_error(response)
                if data and len(data) > 0:
                    self.id = data[0]['id']
        except Exception as e:
            raise DatabaseError(f"Failed to save email verification: {e}")
    
    def __repr__(self):
        return f'<EmailVerification for user {self.user_id}>'
    
    def is_expired(self):
        """Check if the verification token has expired."""
        return is_expired(self.expires_at, 0)  # Already expired if expires_at is in the past
    
    def get_status(self):
        """Get the current status of this email verification."""
        if self.verified_at:
            return 'Verified'
        elif self.is_expired():
            return 'Expired'
        else:
            return 'Pending'
    
    def get_user(self):
        """Get the user associated with this verification."""
        from app.models.user import User
        return User.find_by_id(self.user_id)
    
    def get_email(self):
        """Get the email from the associated user."""
        user = self.get_user()
        return user.email if user else None
    
    def get_username(self):
        """Get the username from the associated user."""
        user = self.get_user()
        return user.username if user else None
    
    def get_is_verified(self):
        """Get the verification status from the associated user."""
        user = self.get_user()
        return user.is_verified if user else False
    
    def verify(self):
        """Mark this email as verified by updating the user record."""
        from app.models.user import User
        
        # Get the user and mark them as verified
        user = User.find_by_id(self.user_id)
        if user:
            user.verify_email()
        
        # Mark this verification token as used
        self.verified_at = utc_now()
        self.save()
    
    def increment_attempts(self):
        """Increment verification attempts counter."""
        self.attempts += 1
        self.save()
    
    def is_max_attempts_reached(self, max_attempts: int = 5):
        """Check if max verification attempts reached."""
        return self.attempts >= max_attempts
    
    @classmethod
    def generate_code(cls) -> str:
        """Generate a 6-digit verification code."""
        return ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    @classmethod
    def create_verification(cls, user_id: int, email: str, code_type: str = 'signup') -> 'EmailVerification':
        """Create a new email verification entry with code."""
        supabase = get_supabase()
        try:
            # Remove any existing unverified tokens for this email and type
            if user_id:
                supabase.table(Tables.EMAIL_VERIFICATIONS).delete().eq('user_id', user_id).eq('code_type', code_type).is_('verified_at', 'null').execute()
            else:
                supabase.table(Tables.EMAIL_VERIFICATIONS).delete().eq('email', email).eq('code_type', code_type).is_('verified_at', 'null').execute()
            
            # Determine expiration based on code type
            if code_type == 'login':
                expiration_minutes = 15  # 15 minutes for login codes
            else:
                expiration_minutes = 1440  # 24 hours for signup verification
            
            verification_data = {
                'user_id': user_id,
                'email': email,
                'token': secrets.token_urlsafe(32),
                'verification_code': cls.generate_code(),
                'code_type': code_type,
                'created_at': utc_now(),
                'expires_at': utc_now() + timedelta(minutes=expiration_minutes),
                'verified_at': None,
                'attempts': 0
            }
            
            verification = cls(verification_data)
            verification.save()
            return verification
        except Exception as e:
            raise DatabaseError(f"Failed to create verification: {e}")
    
    @classmethod
    def get_by_token(cls, token: str) -> Optional['EmailVerification']:
        """Get verification entry by token."""
        supabase = get_supabase()
        try:
            response = supabase.table(Tables.EMAIL_VERIFICATIONS).select("*").eq('token', token).execute()
            data = handle_supabase_error(response)
            if data and len(data) > 0:
                return cls(data[0])
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to get verification by token: {e}")
    
    @classmethod
    def get_by_code(cls, email: str, code: str, code_type: str = 'login') -> Optional['EmailVerification']:
        """Get verification entry by email and code."""
        supabase = get_supabase()
        try:
            response = supabase.table(Tables.EMAIL_VERIFICATIONS).select("*").eq('email', email).eq('verification_code', code).eq('code_type', code_type).is_('verified_at', 'null').execute()
            data = handle_supabase_error(response)
            if data and len(data) > 0:
                # Return the most recent one
                sorted_data = sorted(data, key=lambda x: x.get('created_at', ''), reverse=True)
                return cls(sorted_data[0])
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to get verification by code: {e}")
    
    @classmethod
    def get_by_user_id(cls, user_id: int) -> List['EmailVerification']:
        """Get all verification entries for a specific user."""
        supabase = get_supabase()
        try:
            response = supabase.table(Tables.EMAIL_VERIFICATIONS).select("*").eq('user_id', user_id).order('created_at', desc=True).execute()
            data = handle_supabase_error(response)
            return [cls(verification_data) for verification_data in data]
        except Exception as e:
            raise DatabaseError(f"Failed to get verifications by user_id: {e}")
    
    @classmethod
    def get_all_verifications(cls, page: int = 1, per_page: int = 25, search: str = None) -> tuple:
        """Get paginated list of email verifications with optional filtering."""
        supabase = get_supabase()
        try:
            query = supabase.table(Tables.EMAIL_VERIFICATIONS).select("*", count='exact')
            
            # For search, we'll need to join with users table or filter after retrieval
            # For now, we'll get all and filter in Python if search is provided
            
            # Calculate offset
            offset = (page - 1) * per_page
            
            # Execute query with pagination
            response = query.order('created_at', desc=True).range(offset, offset + per_page - 1).execute()
            data = handle_supabase_error(response)
            
            verifications = [cls(verification_data) for verification_data in data]
            
            # Apply search filter if provided (filter by username or email from user)
            if search:
                filtered_verifications = []
                for verification in verifications:
                    user = verification.get_user()
                    if user and (search.lower() in user.username.lower() or search.lower() in user.email.lower()):
                        filtered_verifications.append(verification)
                verifications = filtered_verifications
            
            total_count = response.count if hasattr(response, 'count') else len(data)
            
            return verifications, total_count
        except Exception as e:
            raise DatabaseError(f"Failed to get all verifications: {e}")
    
    @classmethod
    def get_recent_verifications(cls, limit: int = 100) -> List['EmailVerification']:
        """Get recent email verifications."""
        supabase = get_supabase()
        try:
            response = supabase.table(Tables.EMAIL_VERIFICATIONS).select("*").order('created_at', desc=True).limit(limit).execute()
            data = handle_supabase_error(response)
            return [cls(verification_data) for verification_data in data]
        except Exception as e:
            raise DatabaseError(f"Failed to get recent verifications: {e}")
    
    @classmethod
    def is_email_verified(cls, user_id: int, email: str) -> bool:
        """Check if a specific email for a user is verified by checking the user record."""
        from app.models.user import User
        
        user = User.find_by_id(user_id)
        if user and user.email == email:
            return user.is_verified
        return False
    
    @classmethod
    def cleanup_expired_tokens(cls, days_old: int = 7) -> int:
        """Clean up expired verification tokens (unused tokens only)."""
        supabase = get_supabase()
        try:
            cutoff_date = (utc_now() - timedelta(days=days_old)).isoformat()
            response = supabase.table(Tables.EMAIL_VERIFICATIONS).delete().lt('expires_at', cutoff_date).is_('verified_at', 'null').execute()
            data = handle_supabase_error(response)
            return len(data) if data else 0
        except Exception as e:
            raise DatabaseError(f"Failed to cleanup expired tokens: {e}")
    
    @classmethod
    def count_verified_emails(cls) -> int:
        """Count verified emails by checking user records."""
        from app.models.user import User
        supabase = get_supabase()
        try:
            response = supabase.table(Tables.USERS).select("*", count='exact').eq('is_verified', True).execute()
            return response.count if hasattr(response, 'count') else 0
        except Exception as e:
            raise DatabaseError(f"Failed to count verified emails: {e}")
    
    @classmethod
    def count_pending_verifications(cls) -> int:
        """Count pending verifications by checking user records."""
        from app.models.user import User
        supabase = get_supabase()
        try:
            response = supabase.table(Tables.USERS).select("*", count='exact').eq('is_verified', False).execute()
            return response.count if hasattr(response, 'count') else 0
        except Exception as e:
            raise DatabaseError(f"Failed to count pending verifications: {e}")
