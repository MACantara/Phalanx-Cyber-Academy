import re

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.config import settings
from app.dependencies import get_current_user
from app.errors import handle_supabase_error
from app.services.email_service import send_login_verification_code, send_signup_verification_code
from app.services.email_verification_service import EmailVerification
from app.services.login_attempt_service import LoginAttempt
from app.services.user_service import User
from app.supabase_client import get_supabase
from app.utils.timezone_utils import utc_now

router = APIRouter()


def _update_user_streak(user_id: int) -> None:
    """Update the user's daily login streak on a successful login/signup."""
    try:
        supabase = get_supabase()
        response = supabase.table("user_streaks").select("*").eq("user_id", user_id).execute()
        data = handle_supabase_error(response)
        today = utc_now().date()
        today_str = today.isoformat()
        if data:
            row = data[0]
            current = row.get("current_streak", 0)
            longest = row.get("longest_streak", 0)
            last = row.get("last_login_date")
            if last == today_str:
                return
            if last and (today - date.fromisoformat(str(last))).days == 1:
                current += 1
            else:
                current = 1
            longest = max(longest, current)
            supabase.table("user_streaks").update({
                "current_streak": current,
                "longest_streak": longest,
                "last_login_date": today_str,
                "updated_at": utc_now().isoformat(),
            }).eq("user_id", user_id).execute()
        else:
            supabase.table("user_streaks").insert({
                "user_id": user_id,
                "current_streak": 1,
                "longest_streak": 1,
                "last_login_date": today_str,
                "updated_at": utc_now().isoformat(),
            }).execute()
    except Exception:
        # Streak tracking is best-effort; do not fail authentication.
        pass


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real = request.headers.get("x-real-ip")
    if real:
        return real.strip()
    return request.client.host if request.client else "unknown"


def _is_valid_email(email: str) -> bool:
    return bool(re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email))


class LoginPayload(BaseModel):
    email: EmailStr

    @field_validator('email', mode='before')
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class VerifyPayload(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=10)
    code_type: str = "login"  # "login" or "signup"

    @field_validator('email', mode='before')
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator('code', mode='before')
    @classmethod
    def normalize_code(cls, v: str) -> str:
        return v.strip()


class SignupPayload(BaseModel):
    email: EmailStr
    username: str | None = None
    timezone: str = "UTC"
    cybersecurity_experience: str | None = None

    @field_validator('email', mode='before')
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


@router.post("/login")
def login(payload: LoginPayload, request: Request):
    """Send a passwordless login code to the user's email."""
    client_ip = _get_client_ip(request)
    user_agent = request.headers.get("user-agent")

    if LoginAttempt.is_ip_locked(client_ip, settings.max_login_attempts, settings.login_lockout_minutes):
        remaining = LoginAttempt.get_lockout_time_remaining(client_ip, settings.login_lockout_minutes)
        minutes = int(remaining.total_seconds() / 60) + 1 if remaining else settings.login_lockout_minutes
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed attempts. Try again in {minutes} minutes.",
        )

    user = User.find_by_email(payload.email)
    if not user or not user.is_active:
        # Don't reveal whether the user exists, but record the failed attempt.
        LoginAttempt.record_attempt(client_ip, payload.email, success=False, user_agent=user_agent)
        return {"status": "sent", "email": payload.email}

    verification = EmailVerification.create_verification(
        email=payload.email,
        code_type="login",
        user_id=user.id,
    )
    send_login_verification_code(payload.email, verification.verification_code)
    return {"status": "sent", "email": payload.email}


@router.post("/verify")
def verify(payload: VerifyPayload, request: Request):
    """Verify a passwordless login code and return the authenticated user."""
    client_ip = _get_client_ip(request)
    user_agent = request.headers.get("user-agent")
    verification = EmailVerification.find_valid_by_email_and_code(
        email=payload.email,
        code=payload.code,
        code_type=payload.code_type,
    )
    if not verification:
        LoginAttempt.record_attempt(client_ip, payload.email, success=False, user_agent=user_agent)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code",
        )

    if payload.code_type == "login":
        if not verification.user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification has no linked user",
            )
        user = User.find_by_id(verification.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        user.update_last_login()
        _update_user_streak(user.id)
        verification.mark_verified()
        LoginAttempt.record_attempt(client_ip, payload.email, success=True, user_agent=user_agent)
        return {"user": user.to_dict()}

    if payload.code_type == "signup":
        # Signup verification should be handled by /auth/verify-signup
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use /auth/verify-signup for signup codes",
        )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unknown code type",
    )


@router.post("/signup")
def signup(payload: SignupPayload):
    """Send a verification code to a new user's email."""
    existing = User.find_by_email(payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists. Please log in instead.",
        )

    # Validate username if provided.
    if payload.username and not _is_valid_username(payload.username):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Username must be 3-30 alphanumeric characters or underscores",
        )

    verification = EmailVerification.create_verification(
        email=payload.email,
        code_type="signup",
    )
    send_signup_verification_code(payload.email, verification.verification_code)
    return {"status": "sent", "email": payload.email}


class VerifySignupPayload(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=10)
    username: str | None = None
    timezone: str = "UTC"
    cybersecurity_experience: str | None = None

    @field_validator('email', mode='before')
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator('code', mode='before')
    @classmethod
    def normalize_code(cls, v: str) -> str:
        return v.strip()


@router.post("/verify-signup")
def verify_signup(payload: VerifySignupPayload, request: Request):
    """Verify a signup code and create the user account."""
    client_ip = _get_client_ip(request)
    user_agent = request.headers.get("user-agent")
    verification = EmailVerification.find_valid_by_email_and_code(
        email=payload.email,
        code=payload.code,
        code_type="signup",
    )
    if not verification:
        LoginAttempt.record_attempt(client_ip, payload.email, success=False, user_agent=user_agent)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code",
        )

    if payload.username and not _is_valid_username(payload.username):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Username must be 3-30 alphanumeric characters or underscores",
        )

    existing = User.find_by_email(payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists. Please log in instead.",
        )

    user = User.create(
        email=payload.email,
        username=payload.username,
        timezone=payload.timezone,
    )
    user.is_verified = True
    user.cybersecurity_experience = payload.cybersecurity_experience
    user.last_login = utc_now()
    user.onboarding_completed = bool(payload.username and payload.cybersecurity_experience)
    user.save()
    _update_user_streak(user.id)
    verification.mark_verified()
    LoginAttempt.record_attempt(client_ip, payload.email, success=True, user_agent=user_agent)
    return {"user": user.to_dict()}


@router.get("/verify-email/{token}")
def verify_email_token(
    token: str,
    request: Request,
    username: str | None = None,
    timezone: str = "UTC",
    cybersecurity_experience: str | None = None,
):
    """Legacy-style deep-link email verification using the verification token."""
    verification = EmailVerification.find_valid_by_token(token)
    if not verification:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    client_ip = _get_client_ip(request)
    user_agent = request.headers.get("user-agent")

    if verification.code_type == "login":
        user = User.find_by_id(verification.user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        user.update_last_login()
        _update_user_streak(user.id)
        verification.mark_verified()
        LoginAttempt.record_attempt(client_ip, user.email, success=True, user_agent=user_agent)
        return {"user": user.to_dict()}

    if verification.code_type == "signup":
        existing = User.find_by_email(verification.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists. Please log in instead.",
            )

        if username and not _is_valid_username(username):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Username must be 3-30 alphanumeric characters or underscores",
            )

        user = User.create(
            email=verification.email,
            username=username,
            timezone=timezone,
        )
        user.is_verified = True
        user.cybersecurity_experience = cybersecurity_experience
        user.last_login = utc_now()
        user.onboarding_completed = bool(username and cybersecurity_experience)
        user.save()
        _update_user_streak(user.id)
        verification.mark_verified()
        LoginAttempt.record_attempt(client_ip, user.email, success=True, user_agent=user_agent)
        return {"user": user.to_dict()}

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown code type")


@router.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    return {"user": user}


@router.post("/logout")
def logout():
    return {"status": "logged_out"}


class AvailabilityPayload(BaseModel):
    field: str
    value: str


@router.post("/check-availability")
def check_availability(payload: AvailabilityPayload):
    """Check if a username or email is already registered."""
    value = payload.value.strip().lower()
    field = payload.field.strip().lower()

    if field == "email":
        available = _is_valid_email(value) and User.find_by_email(value) is None
    elif field == "username":
        if not _is_valid_username(value):
            return {"available": False}
        available = User.find_by_username(value) is None
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid field")

    return {"available": available}


def _is_valid_username(username: str) -> bool:
    if not username:
        return True
    return bool(re.match(r"^[a-zA-Z0-9_]{3,30}$", username))
