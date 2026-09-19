import httpx
from fastapi import HTTPException, Request, status

from .clerk_auth import verify_clerk_token
from .config import settings
from .services.user_service import User as UserService


def _bearer_token(request: Request) -> str:
    authorization = request.headers.get("Authorization", "")
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
        )
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required",
        )
    return token


def _fetch_clerk_user(clerk_user_id: str) -> dict:
    if not settings.clerk_secret_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="CLERK_SECRET_KEY is required to provision new profiles",
        )
    try:
        response = httpx.get(
            f"https://api.clerk.com/v1/users/{clerk_user_id}",
            headers={"Authorization": f"Bearer {settings.clerk_secret_key}"},
            timeout=10,
        )
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to fetch user from Clerk",
        ) from exc


def _primary_email(clerk_user: dict) -> str | None:
    primary_id = clerk_user.get("primary_email_address_id")
    addresses = clerk_user.get("email_addresses") or []
    for entry in addresses:
        if entry.get("id") == primary_id:
            return entry.get("email_address")
    return addresses[0].get("email_address") if addresses else None


def _provision_profile(clerk_user_id: str) -> UserService:
    clerk_user = _fetch_clerk_user(clerk_user_id)
    email = _primary_email(clerk_user)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Clerk user has no email address",
        )

    # Claim path: an existing profile with the same verified email adopts
    # this Clerk id (Supabase-era rows migrate on first login).
    existing = UserService.find_by_email(email)
    if existing:
        if existing.clerk_user_id and existing.clerk_user_id != clerk_user_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This email is already linked to a different account",
            )
        existing.clerk_user_id = clerk_user_id
        existing.save()
        return existing

    user = UserService(
        {
            "clerk_user_id": clerk_user_id,
            "email": email,
            "username": clerk_user.get("username"),
        }
    )
    user.save()
    return user


async def get_current_user(request: Request):
    token = _bearer_token(request)
    try:
        claims = verify_clerk_token(token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc

    clerk_user_id = claims.get("sub")
    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
        )

    user = UserService.find_by_clerk_user_id(clerk_user_id)
    if not user:
        user = _provision_profile(clerk_user_id)

    return user.to_dict()
