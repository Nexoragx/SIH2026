from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


class BlacklistedToken(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    token: str
    blacklisted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda dt: dt.isoformat()}


def serialize_token(doc: dict) -> dict:
    """Helper to serialize a MongoDB blacklisted token document."""
    if not doc:
        return {}
    token_dict = dict(doc)
    token_dict["id"] = str(token_dict.pop("_id", ""))
    return token_dict
