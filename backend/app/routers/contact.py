from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

from app.services.contact_service import Contact

router = APIRouter()


class ContactPayload(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


@router.post("/")
def submit_contact(payload: ContactPayload):
    contact = Contact.create(
        name=payload.name,
        email=payload.email,
        subject=payload.subject,
        message=payload.message,
    )
    return {"success": True, "contact": contact.to_dict()}
