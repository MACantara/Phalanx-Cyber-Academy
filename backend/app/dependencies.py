from fastapi import Header, HTTPException, status
from .supabase_client import get_supabase


async def get_current_user(x_user_id: int | None = Header(None)):
    if x_user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="X-User-Id header required",
        )

    supabase = get_supabase()
    response = (
        supabase.table("users").select("*").eq("id", x_user_id).single().execute()
    )

    if not getattr(response, "data", None):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return response.data
