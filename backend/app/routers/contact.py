from fastapi import APIRouter
from pydantic import BaseModel, EmailStr, Field

from app.services.contact_service import Contact

router = APIRouter()


class ContactPayload(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    subject: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=5000)


@router.post("/")
def submit_contact(payload: ContactPayload):
    contact = Contact.create(
        name=payload.name,
        email=payload.email,
        subject=payload.subject,
        message=payload.message,
    )
    return {"success": True, "contact": contact.to_dict()}
