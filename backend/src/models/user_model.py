import enum
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field

try:
    import email_validator
    from pydantic import EmailStr
except ImportError:
    EmailStr = str


class UserRole(str, enum.Enum):
    VICTIM = "victim"
    OBSERVER_DISTRICT = "observer_district"
    OBSERVER_STATE = "observer_state"
    OBSERVER_NATIONAL = "observer_national"
    PSYCHIATRIST = "psychiatrist"
    NGO_PARTNER = "ngo_partner"
    ADMIN = "admin"


class User(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    email: str
    hashed_password: Optional[str] = None
    full_name: str
    role: UserRole = UserRole.VICTIM
    phone: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    oauth_provider: str = "local"
    oauth_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda dt: dt.isoformat()}


def serialize_user(doc: dict) -> dict:
    """Helper to serialize a MongoDB user document into a clean API response dict."""
    if not doc:
        return {}
    user_dict = dict(doc)
    user_dict["id"] = str(user_dict.pop("_id", ""))
    user_dict.pop("hashed_password", None)
    return user_dict
