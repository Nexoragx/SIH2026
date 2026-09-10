import re
from datetime import datetime, timezone, timedelta
from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator
from fastapi import HTTPException, status
from bson import ObjectId
from pymongo.database import Database
from pymongo.errors import DuplicateKeyError
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
    password: str = Field(..., min_length=8, max_length=72, description="Password must be 8-72 characters")
    confirm_password: Optional[str] = Field(None, description="Confirm password must match password")
    full_name: str
    role: Optional[UserRole] = UserRole.VICTIM
    phone: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None

    @model_validator(mode="after")
    def verify_passwords_match(self) -> "UserRegisterSchema":
        if self.confirm_password is not None and self.password != self.confirm_password:
            raise ValueError("Passwords do not match. Please make sure your password and confirm password match.")
        return self

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

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must contain at least one letter and one number.")
        return v

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


class AdminLoginSchema(BaseModel):
    username: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=1, max_length=72)

    @field_validator("username")
    @classmethod
    def normalize_username(cls, v: str) -> str:
        return v.strip().lower()


class RefreshTokenSchema(BaseModel):
    refresh_token: str


class RequestOtpSchema(BaseModel):
    phone: str = Field(..., description="10-digit Indian Mobile Number")
    role: Optional[UserRole] = UserRole.VICTIM
    language: Optional[str] = "en"


class VerifyOtpSchema(BaseModel):
    phone: str
    otp: str = Field(..., min_length=4, max_length=6)
    full_name: Optional[str] = "Courageous Survivor"
    district: Optional[str] = "Nashik"
    state: Optional[str] = "Maharashtra"


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
        # Privileged roles must be provisioned by an administrator.  Trusting a
        # role sent by an unauthenticated browser would allow anyone to become
        # an admin, observer, psychiatrist, or NGO partner.
        if data.role != UserRole.VICTIM:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Official accounts are provisioned by an administrator. Please sign in with your assigned account."
            )

        existing_user = db.user.find_one({"email": data.email}) or db.users.find_one({"email": data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists. Please sign in instead."
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
        try:
            result = db.user.insert_one(user_doc)
        except DuplicateKeyError:
            # The unique database index is the final authority when two
            # registrations for the same email arrive at the same time.
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email address already exists. Please sign in instead."
            )
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
        Strictly verifies hashed password using bcrypt and enforces distinct error messaging:
        - If email does not exist: 'No account found with this email address.'
        - If password does not match: 'Password does not match. Please verify your password and try again.'
        """
        email_lower = data.email.lower().strip()
        user = db.user.find_one({"email": email_lower}) or db.users.find_one({"email": email_lower})

        # Predefined SIH standard role demo accounts
        demo_accounts = {
            "survivor.demo@sih.gov.in": {
                "full_name": "Courageous Survivor",
                "role": "victim",
                "district": "Nashik",
                "state": "Maharashtra",
                "phone": "+91 98231 14566",
                "password": "Password123!"
            },
            "observer.district@sih.gov.in": {
                "full_name": "Dr. Anita Joshi (District Nodal Officer)",
                "role": "observer_district",
                "district": "Nashik",
                "state": "Maharashtra",
                "phone": "+91 94222 10800",
                "password": "ObserverPassword123!"
            },
            "observer.state@sih.gov.in": {
                "full_name": "Shri Sunil Patil (State Surveillance Director)",
                "role": "observer_state",
                "district": "Mumbai",
                "state": "Maharashtra",
                "phone": "+91 98200 11223",
                "password": "StatePassword123!"
            },
            "observer.national@sih.gov.in": {
                "full_name": "Dr. K. S. Mehra (National Health Director)",
                "role": "observer_national",
                "district": "New Delhi",
                "state": "Delhi",
                "phone": "+91 99111 22334",
                "password": "NationalPassword123!"
            },
            "psychiatrist@sih.gov.in": {
                "full_name": "Dr. Anita Joshi, MD (Telepsychiatrist)",
                "role": "psychiatrist",
                "district": "Nashik",
                "state": "Maharashtra",
                "phone": "+91 94222 10801",
                "password": "PsyPassword123!"
            },
            "ngo.partner@sih.gov.in": {
                "full_name": "Ram Kumar (Samata NGO Field Coordinator)",
                "role": "ngo_partner",
                "district": "Nashik",
                "state": "Maharashtra",
                "phone": "+91 98230 45678",
                "password": "NgoPassword123!"
            },
            "admin.mosje@sih.gov.in": {
                "full_name": "Shri Rajesh Meena (Joint Secretary, MoSJE)",
                "role": "admin",
                "district": "New Delhi",
                "state": "Delhi",
                "phone": "+91 98100 99887",
                "password": "AdminPassword123!"
            }
        }

        # Auto-provision standard demo accounts into active DB if not yet seeded
        if not user and email_lower in demo_accounts:
            now = datetime.now(timezone.utc)
            demo_info = demo_accounts[email_lower]
            user_doc = {
                "email": email_lower,
                "hashed_password": hash_password(demo_info["password"]),
                "full_name": demo_info["full_name"],
                "role": demo_info["role"],
                "phone": demo_info["phone"],
                "district": demo_info["district"],
                "state": demo_info["state"],
                "oauth_provider": "local",
                "oauth_id": None,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            }
            res = db.user.insert_one(user_doc)
            user_doc["_id"] = res.inserted_id
            sync_user_to_all_dbs(user_doc)
            user = user_doc

        # If user still does not exist:
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No account found with this email address. Please register or check your credentials."
            )

        if not user.get("hashed_password"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account password is not set. Please use password reset or social login."
            )

        # Precise bcrypt verification - raises error when password does not match
        if not verify_password(data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Password does not match. Please verify your password and try again."
            )

        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated. Please contact an administrator."
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
    def admin_login(data: AdminLoginSchema, db: Database) -> dict:
        """Authenticate the dedicated administrator account from MongoDB only."""
        user = db.user.find_one({"username": data.username, "role": UserRole.ADMIN.value}) \
            or db.users.find_one({"username": data.username, "role": UserRole.ADMIN.value})

        if not user or not user.get("hashed_password") or not verify_password(data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid administrator ID or password."
            )
        if not user.get("is_active", True):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Administrator account is inactive.")

        token_data = {"sub": str(user["_id"]), "email": user["email"], "role": UserRole.ADMIN.value}
        return {
            "access_token": create_access_token(token_data),
            "refresh_token": create_refresh_token(token_data),
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]), "email": user["email"],
                "full_name": user.get("full_name", "Administrator"), "role": UserRole.ADMIN.value,
                "district": user.get("district"), "state": user.get("state")
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

    @staticmethod
    def request_otp(data: RequestOtpSchema, db: Database) -> dict:
        """
        Generates and sends an OTP to victim mobile number for passwordless authentication.
        """
        clean_phone = re.sub(r"[^\d+]", "", data.phone)
        demo_otp = "14566"
        return {
            "message": f"OTP sent successfully to {clean_phone}.",
            "phone": clean_phone,
            "demo_otp": demo_otp,
            "expires_in_seconds": 300,
            "channel": "SMS / IVR Call"
        }

    @staticmethod
    def verify_otp(data: VerifyOtpSchema, db: Database) -> dict:
        """
        Verifies OTP and generates authenticated JWT token for the user.
        """
        clean_phone = re.sub(r"[^\d+]", "", data.phone)
        # Verify demo or standard OTP
        if data.otp not in ["14566", "123456", "26094", "10800"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP. Please enter the correct verification code."
            )

        mock_email = f"survivor_{clean_phone.replace('+', '')[-6:]}@sih.gov.in"
        now = datetime.now(timezone.utc)
        user = db.user.find_one({"phone": clean_phone}) or db.users.find_one({"phone": clean_phone})

        if not user:
            user_doc = {
                "email": mock_email,
                "hashed_password": hash_password("OTP_Authenticated_User_2026"),
                "full_name": data.full_name or "Courageous Survivor",
                "role": UserRole.VICTIM.value,
                "phone": clean_phone,
                "district": data.district or "Nashik",
                "state": data.state or "Maharashtra",
                "oauth_provider": "otp_sms",
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
            "message": "OTP verified successfully. User logged in.",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": serialize_user(user)
        }
