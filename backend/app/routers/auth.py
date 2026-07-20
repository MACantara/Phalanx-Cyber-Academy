import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

from app.services.user_service import User

router = APIRouter()


class AvailabilityPayload(BaseModel):
    field: str
    value: str

    @field_validator('field', 'value', mode='before')
    @classmethod
    def normalize(cls, v: str) -> str:
        return v.strip().lower()


@router.post('/check-availability')
def check_availability(payload: AvailabilityPayload):
    '''Check if a username or email is already registered.'''
    field = payload.field
    value = payload.value

    if field == 'email':
        available = _is_valid_email(value) and User.find_by_email(value) is None
    elif field == 'username':
        if not _is_valid_username(value):
            return {'available': False}
        available = User.find_by_username(value) is None
    else:
        raise HTTPException(status_code=400, detail='Invalid field')

    return {'available': available}


def _is_valid_email(email: str) -> bool:
    return bool(re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email))


def _is_valid_username(username: str) -> bool:
    if not username:
        return True
    return bool(re.match(r'^[a-zA-Z0-9_]{3,30}$', username))
