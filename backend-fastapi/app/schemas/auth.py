from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import Name


class RegisterIn(BaseModel):
    full_name: Name
    email: EmailStr


class MagicLinkIn(BaseModel):
    email: EmailStr


class VerifyIn(BaseModel):
    token: str = Field(min_length=1)
