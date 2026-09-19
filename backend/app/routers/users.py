import re
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.dependencies import get_current_user
from app.services.user_service import User as UserService

router = APIRouter()


class UpdateProfilePayload(BaseModel):
    username: str | None = None
    timezone: str | None = None
    cybersecurity_experience: str | None = None
    onboarding_completed: bool | None = None


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
        username = payload.username.strip()
        if not re.match(r"^[a-zA-Z0-9_]{3,30}$", username):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Username must be 3-30 characters: letters, numbers, underscores",
            )
        taken = UserService.find_by_username(username)
        if taken and str(taken.id) != str(user["id"]):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username is already taken",
            )
        db_user.username = username
    if payload.timezone is not None:
        db_user.timezone = payload.timezone
    if payload.cybersecurity_experience is not None:
        db_user.cybersecurity_experience = payload.cybersecurity_experience
    if payload.onboarding_completed is not None:
        db_user.onboarding_completed = payload.onboarding_completed

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
