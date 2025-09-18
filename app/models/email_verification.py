from datetime import datetime, timedelta
import secrets
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
        self.created_at = data.get('created_at')
        self.expires_at = data.get('expires_at')
        self.verified_at = data.get('verified_at')
        
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
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'expires_at': self.expires_at.isoformat() if self.expires_at else None,
                'verified_at': self.verified_at.isoformat() if self.verified_at else None
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
        return f'<EmailVerification {self.email} for user {self.user_id}>'
    
    def is_expired(self):
        """Check if the verification token has expired."""
        return is_expired(self.expires_at, 0)  # Already expired if expires_at is in the past
    
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
    
    @classmethod
    def create_verification(cls, user_id: int, email: str) -> 'EmailVerification':
        """Create a new email verification entry."""
        supabase = get_supabase()
        try:
            # Remove any existing unverified tokens for this user/email combo
            supabase.table(Tables.EMAIL_VERIFICATIONS).delete().eq('user_id', user_id).eq('email', email).is_('verified_at', 'null').execute()
            
            verification_data = {
                'user_id': user_id,
                'email': email,
                'token': secrets.token_urlsafe(32),
                'created_at': utc_now(),
                'expires_at': utc_now() + timedelta(hours=24),  # 24 hour expiration
                'verified_at': None
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
