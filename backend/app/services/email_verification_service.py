"""
Email verification service
Manages one-time codes for passwordless login and signup.
"""
import secrets
from datetime import datetime, timedelta
from typing import Optional

from app.errors import DatabaseError, handle_supabase_error
from app.supabase_client import get_supabase
from app.utils.timezone_utils import utc_now


def _parse_datetime(value):
    if isinstance(value, str):
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    return value


MAX_CODE_ATTEMPTS = 5


class EmailVerification:
    def __init__(self, data: dict):
        self.id = data.get("id")
        self.user_id = data.get("user_id")
        self.email = data.get("email")
        self.token = data.get("token")
        self.verification_code = data.get("verification_code")
        self.code_type = data.get("code_type", "signup")
        self.created_at = _parse_datetime(data.get("created_at"))
        self.expires_at = _parse_datetime(data.get("expires_at"))
        self.verified_at = _parse_datetime(data.get("verified_at"))
        self.attempts = data.get("attempts", 0)

    def is_expired(self) -> bool:
        return utc_now() > self.expires_at if self.expires_at else True

    def is_max_attempts_reached(self) -> bool:
        return self.attempts >= MAX_CODE_ATTEMPTS

    @classmethod
    def _generate_code(cls, length: int = 6) -> str:
        return "".join(secrets.choice("0123456789") for _ in range(length))

    @classmethod
    def _generate_token(cls) -> str:
        return secrets.token_urlsafe(32)

    @classmethod
    def create_verification(
        cls,
        email: str,
        code_type: str,
        user_id: Optional[int] = None,
    ) -> "EmailVerification":
        try:
            supabase = get_supabase()
            # Invalidate any existing unverified code for this email/type.
            supabase.table("email_verifications").update({"verified_at": utc_now().isoformat()}).eq("email", email).eq("code_type", code_type).is_("verified_at", None).execute()

            token = cls._generate_token()
            code = cls._generate_code()
            expires_at = utc_now() + timedelta(minutes=15)
            verification_data = {
                "user_id": user_id,
                "email": email,
                "token": token,
                "verification_code": code,
                "code_type": code_type,
                "created_at": utc_now().isoformat(),
                "expires_at": expires_at.isoformat(),
                "attempts": 0,
            }
            response = supabase.table("email_verifications").insert(verification_data).execute()
            data = handle_supabase_error(response)
            if data and len(data) > 0:
                return cls(data[0])
            raise DatabaseError("No data returned from email verification creation")
        except Exception as e:
            raise DatabaseError(f"Failed to create verification: {e}")

    @classmethod
    def find_valid_by_email_and_code(
        cls,
        email: str,
        code: str,
        code_type: str,
    ) -> Optional["EmailVerification"]:
        try:
            supabase = get_supabase()
            response = (
                supabase.table("email_verifications")
                .select("*")
                .eq("email", email)
                .eq("code_type", code_type)
                .is_("verified_at", None)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            data = handle_supabase_error(response)
            if not data or len(data) == 0:
                return None

            verification = cls(data[0])
            if verification.is_expired() or verification.is_max_attempts_reached():
                return None

            if verification.verification_code != code:
                verification.increment_attempts()
                return None

            return verification
        except Exception as e:
            raise DatabaseError(f"Failed to find verification: {e}")

    @classmethod
    def find_valid_by_token(cls, token: str) -> Optional["EmailVerification"]:
        try:
            supabase = get_supabase()
            response = (
                supabase.table("email_verifications")
                .select("*")
                .eq("token", token)
                .is_("verified_at", None)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            data = handle_supabase_error(response)
            if not data or len(data) == 0:
                return None

            verification = cls(data[0])
            if verification.is_expired() or verification.is_max_attempts_reached():
                return None

            return verification
        except Exception as e:
            raise DatabaseError(f"Failed to find verification by token: {e}")

    def increment_attempts(self) -> None:
        self.attempts += 1
        try:
            supabase = get_supabase()
            supabase.table("email_verifications").update({"attempts": self.attempts}).eq("id", self.id).execute()
        except Exception as e:
            raise DatabaseError(f"Failed to update attempts: {e}")

    def mark_verified(self) -> None:
        self.verified_at = utc_now().isoformat()
        try:
            supabase = get_supabase()
            supabase.table("email_verifications").update({"verified_at": self.verified_at}).eq("id", self.id).execute()
        except Exception as e:
            raise DatabaseError(f"Failed to mark verification as verified: {e}")
