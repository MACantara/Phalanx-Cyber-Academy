from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator

from app.dependencies import get_current_user
from app.services.user_service import User as UserService

router = APIRouter()


class UpdateProfilePayload(BaseModel):
    username: str | None = None
    timezone: str | None = None
    cybersecurity_experience: str | None = None
    onboarding_completed: bool | None = None
    email: EmailStr | None = None

    @field_validator('email', mode='before')
    @classmethod
    def normalize_email(cls, v: str | None) -> str | None:
        if isinstance(v, str):
            return v.strip().lower()
        return v


@router.get("/me")
def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    return {"user": user}


@router.put("/me")
def update_profile(
    payload: UpdateProfilePayload,
    user: Dict[str, Any] = Depends(get_current_user),
):
    db_user = UserService.find_by_id(user["id"])
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.username is not None:
        db_user.username = payload.username
    if payload.timezone is not None:
        db_user.timezone = payload.timezone
    if payload.cybersecurity_experience is not None:
        db_user.cybersecurity_experience = payload.cybersecurity_experience
    if payload.onboarding_completed is not None:
        db_user.onboarding_completed = payload.onboarding_completed
    if payload.email is not None and payload.email != db_user.email:
        existing = UserService.find_by_email(payload.email)
        if existing and existing.id != db_user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )
        db_user.email = payload.email

    db_user.save()
    return {"success": True, "user": db_user.to_dict()}


@router.get("/")
def list_users(
    page: int = 1,
    per_page: int = 25,
    search: str | None = None,
    status_filter: str = "all",
    user: Dict[str, Any] = Depends(get_current_user),
):
    if not user.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin required")

    users, total = UserService.get_all_users(
        page=page,
        per_page=per_page,
        search=search,
        status_filter=status_filter,
    )
    return {"users": [u.to_dict() for u in users], "total": total}


@router.get("/{user_id}")
def get_user(
    user_id: str,
    user: Dict[str, Any] = Depends(get_current_user),
):
    if not user.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin required")

    target = UserService.find_by_id(user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"user": target.to_dict()}
