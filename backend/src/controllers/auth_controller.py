import re
from datetime import datetime, timezone, timedelta
from typing import Optional
from pydantic import BaseModel, Field, field_validator
from fastapi import HTTPException, status
from bson import ObjectId
from pymongo.database import Database
import jwt

from src.config.config import settings
from src.models.user_model import UserRole, serialize_user
from src.middlewares.auth_middleware import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    blacklist_token,
    is_token_blacklisted,
)
from src.db.db import sync_user_to_all_dbs

# --- Pydantic Schemas for Auth Controller ---

class UserRegisterSchema(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    full_name: str
    role: Optional[UserRole] = UserRole.VICTIM
    phone: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", cleaned):
            raise ValueError("Please provide a valid email address (e.g. user@example.com).")
        return cleaned

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 1:
            raise ValueError("Full name cannot be empty.")
        return cleaned

    @field_validator("district", "state", "phone", mode="before")
    @classmethod
    def sanitize_optional_fields(cls, v):
        if isinstance(v, str):
            trimmed = v.strip()
            return trimmed if trimmed else None
        return v


class UserLoginSchema(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return v.strip().lower()


class RefreshTokenSchema(BaseModel):
    refresh_token: str


class TokenResponseSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


# --- Controller Business Logic (MongoDB) ---

class AuthController:

    @staticmethod
    def register(data: UserRegisterSchema, db: Database) -> dict:
        """
        Registers a new user (victim, health observer, psychiatrist, or NGO partner) in MongoDB 'user' collection.
        """
        existing_user = db.user.find_one({"email": data.email}) or db.users.find_one({"email": data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )

        now = datetime.now(timezone.utc)
        user_doc = {
            "email": data.email,
            "hashed_password": hash_password(data.password),
            "full_name": data.full_name,
            "role": data.role.value if isinstance(data.role, UserRole) else str(data.role),
            "phone": data.phone,
            "district": data.district,
            "state": data.state,
            "oauth_provider": "local",
            "oauth_id": None,
            "is_active": True,
            "created_at": now,
            "updated_at": now
        }
        # Insert directly into the MongoDB 'user' collection
        result = db.user.insert_one(user_doc)
        user_id_str = str(result.inserted_id)

        # Synchronize across databases ('Mental' and 'mental_health_db') and collections ('user' and 'users')
        user_doc["_id"] = result.inserted_id
        sync_user_to_all_dbs(user_doc)

        # Generate JWT token pair
        token_data = {
            "sub": user_id_str,
            "email": data.email,
            "role": user_doc["role"]
        }
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return {
            "message": "User registered successfully",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user_id_str,
                "email": user_doc["email"],
                "full_name": user_doc["full_name"],
                "role": user_doc["role"],
                "district": user_doc["district"],
                "state": user_doc["state"]
            }
        }

    @staticmethod
    def login(data: UserLoginSchema, db: Database) -> dict:
        """
        Authenticates user credentials against MongoDB 'user' collection and issues JWT tokens.
        """
        user = db.user.find_one({"email": data.email}) or db.users.find_one({"email": data.email})
        if not user or not user.get("hashed_password"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        if not verify_password(data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated."
            )

        user_id_str = str(user["_id"])
        token_data = {
            "sub": user_id_str,
            "email": user["email"],
            "role": user.get("role", "victim")
        }
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user_id_str,
                "email": user["email"],
                "full_name": user.get("full_name", ""),
                "role": user.get("role", "victim"),
                "district": user.get("district"),
                "state": user.get("state")
            }
        }

    @staticmethod
    def refresh(data: RefreshTokenSchema, db: Database) -> dict:
        """
        Refreshes an expired access token using a valid refresh token.
        """
        if is_token_blacklisted(data.refresh_token, db):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has been revoked."
            )

        try:
            payload = jwt.decode(
                data.refresh_token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            if payload.get("type") != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid token type for refresh."
                )
            user_id_str = payload.get("sub")
        except jwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token."
            )

        query = {"_id": ObjectId(user_id_str)} if ObjectId.is_valid(user_id_str) else {"id": user_id_str}
        user = db.user.find_one(query) or db.users.find_one(query)
        if not user or not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive."
            )

        token_data = {
            "sub": user_id_str,
            "email": user["email"],
            "role": user.get("role", "victim")
        }
        new_access_token = create_access_token(token_data)

        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }

    @staticmethod
    def logout(token: str, db: Database) -> dict:
        """
        Revokes a JWT token in MongoDB blacklisted_tokens collection.
        """
        blacklist_token(token, db)
        return {"message": "Successfully logged out. Token has been revoked."}

    @staticmethod
    def get_oauth_login_url() -> dict:
        """
        Returns OAuth2 authorization URL for Google / external provider sign-in.
        """
        google_auth_url = (
            "https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={settings.OAUTH_GOOGLE_CLIENT_ID}&"
            f"redirect_uri={settings.OAUTH_REDIRECT_URI}&"
            "response_type=code&"
            "scope=openid%20email%20profile&"
            "access_type=offline"
        )
        return {
            "provider": "google",
            "authorization_url": google_auth_url
        }

    @staticmethod
    async def oauth_callback(code: str, db: Database) -> dict:
        """
        Handles OAuth2 callback in MongoDB 'user' collection.
        """
        mock_email = f"victim_oauth_{code[:6]}@example.com"
        user = db.user.find_one({"email": mock_email}) or db.users.find_one({"email": mock_email})
        now = datetime.now(timezone.utc)
        if not user:
            user_doc = {
                "email": mock_email,
                "full_name": "OAuth Authenticated Victim",
                "role": UserRole.VICTIM.value,
                "oauth_provider": "google",
                "oauth_id": code,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            }
            res = db.user.insert_one(user_doc)
            user_doc["_id"] = res.inserted_id
            sync_user_to_all_dbs(user_doc)
            user_id_str = str(res.inserted_id)
            user = user_doc
        else:
            user_id_str = str(user["_id"])

        token_data = {
            "sub": user_id_str,
            "email": user["email"],
            "role": user.get("role", "victim")
        }
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return {
            "message": "OAuth authentication successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user_id_str,
                "email": user["email"],
                "full_name": user["full_name"],
                "role": user["role"]
            }
        }
