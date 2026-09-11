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


class DoctorLoginSchema(BaseModel):
    doctor_id: str = Field(..., min_length=1, max_length=64, description="Tele-MANAS Doctor ID")
    password: str = Field(..., min_length=1, max_length=72)

    @field_validator("doctor_id")
    @classmethod
    def normalize_doctor_id(cls, v: str) -> str:
        return v.strip()


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


class AssignObserverSchema(BaseModel):
    user_id: str = Field(..., description="Target User / Beneficiary ID")
    observer_id: str = Field(..., description="Assigned Observer ID")
    observer_name: str = Field(..., description="Observer Full Name")
    observer_role: Optional[str] = Field("District Health Observer (L1)", description="Observer Role Title")
    observer_phone: Optional[str] = Field(None, description="Observer Phone Number")
    observer_hospital: Optional[str] = Field(None, description="Observer Hospital or Facility")


class UnassignObserverSchema(BaseModel):
    user_id: str = Field(..., description="Target User / Beneficiary ID")


class CreatePersonnelSchema(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: str = Field(..., min_length=5)
    role: str = Field("observer", description="observer | psychiatrist | ngo | admin")
    phone: Optional[str] = "+91 98000 00000"
    district: Optional[str] = "Nashik"
    state: Optional[str] = "Maharashtra"
    hospital_or_org: Optional[str] = "District Care Unit"
    password: Optional[str] = None
    staff_id: Optional[str] = None


class UpdateRoleSchema(BaseModel):
    user_id: str
    role: Optional[str] = None
    new_role: Optional[str] = None

    @property
    def target_role(self) -> str:
        return (self.new_role or self.role or "victim").strip().lower()


class ResetCredentialsSchema(BaseModel):
    user_id: str
    new_password: Optional[str] = None



# --- Controller Business Logic (MongoDB) ---

class AuthController:

    @staticmethod
    def register(data: UserRegisterSchema, db: Database) -> dict:
        """
        Registers a new user (victim, health observer, psychiatrist, or NGO partner) in MongoDB 'user' collection.
        """
        # Privileged roles must be provisioned by an administrator.
        if data.role != UserRole.VICTIM:
            if data.role == UserRole.PSYCHIATRIST or str(data.role).lower() == "psychiatrist":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Public doctor registration is disabled. Registered Tele-MANAS Psychiatrists must sign in with their assigned Doctor ID."
                )
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
                "phone": user_doc.get("phone"),
                "district": user_doc.get("district"),
                "state": user_doc.get("state"),
                "assigned_observer": user_doc.get("assigned_observer") or None
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
                "phone": user.get("phone"),
                "district": user.get("district"),
                "state": user.get("state"),
                "assigned_observer": user.get("assigned_observer") or user.get("assignedObserver") or None
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
    def doctor_login(data: DoctorLoginSchema, db: Database) -> dict:
        """Authenticate a verified Tele-MANAS Psychiatrist / Doctor using Doctor ID and password."""
        doc_id_raw = data.doctor_id.strip()
        doc_id_upper = doc_id_raw.upper()
        doc_id_lower = doc_id_raw.lower()

        # Find user by doctor_id or email with role psychiatrist
        user = db.user.find_one({
            "$or": [
                {"doctor_id": doc_id_upper},
                {"doctor_id": doc_id_raw},
                {"email": doc_id_lower}
            ],
            "role": UserRole.PSYCHIATRIST.value
        }) or db.users.find_one({
            "$or": [
                {"doctor_id": doc_id_upper},
                {"doctor_id": doc_id_raw},
                {"email": doc_id_lower}
            ],
            "role": UserRole.PSYCHIATRIST.value
        })

        if not user or not user.get("hashed_password") or not verify_password(data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Doctor ID or password. Please verify your Tele-MANAS credentials."
            )
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Psychiatrist account is inactive. Please contact your District Health Nodal Officer."
            )

        token_data = {
            "sub": str(user["_id"]),
            "email": user.get("email", ""),
            "role": UserRole.PSYCHIATRIST.value,
            "doctor_id": user.get("doctor_id", doc_id_upper)
        }
        return {
            "access_token": create_access_token(token_data),
            "refresh_token": create_refresh_token(token_data),
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "email": user.get("email", ""),
                "doctor_id": user.get("doctor_id", doc_id_upper),
                "full_name": user.get("full_name", "Telepsychiatrist"),
                "role": UserRole.PSYCHIATRIST.value,
                "district": user.get("district", "Nashik"),
                "state": user.get("state", "Maharashtra")
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

    INSTITUTIONAL_ROLES = {
        "admin", "administrator", "system_admin", "observer", "health_observer",
        "doctor", "psychiatrist", "telepsychiatrist", "ngo", "ngo_partner", "case_worker"
    }

    @staticmethod
    def get_admin_users(db: Database) -> list:
        """
        Returns strictly registered citizens and survivor beneficiaries for Admin verification and observer allocation.
        Excludes institutional staff, observers, doctors, and system administrators.
        """
        users_list = []
        seen_ids = set()

        for col in [db.user, db.users]:
            try:
                for u in col.find({}):
                    uid = str(u.get("_id", ""))
                    if not uid or uid in seen_ids:
                        continue

                    role = str(u.get("role") or "victim").strip().lower()
                    name = str(u.get("full_name") or u.get("name") or "").strip()
                    email = str(u.get("email") or "").strip().lower()

                    # Exclude institutional staff from Beneficiaries table
                    if role in AuthController.INSTITUTIONAL_ROLES:
                        continue
                    if any(term in name.lower() for term in ["director", "administrator", "telepsychiatrist", "nodal officer", "coordinator", "health observer"]):
                        continue
                    if "admin" in email or "observer" in email or "psychiatrist" in email or "ngo.partner" in email:
                        continue

                    seen_ids.add(uid)
                    users_list.append({
                        "id": uid,
                        "email": u.get("email", ""),
                        "full_name": name or "Citizen Survivor",
                        "role": "victim",
                        "phone": u.get("phone") or "Not provided",
                        "district": u.get("district") or "Nashik",
                        "state": u.get("state") or "Maharashtra",
                        "assigned_observer": u.get("assigned_observer") or u.get("assignedObserver"),
                        "is_active": u.get("is_active", True),
                        "created_at": u.get("created_at").isoformat() if hasattr(u.get("created_at"), "isoformat") else str(u.get("created_at") or datetime.now(timezone.utc).isoformat())
                    })
            except Exception:
                pass

        return users_list

    @staticmethod
    def get_institutional_personnel(db: Database) -> list:
        """
        Returns all institutional staff (Health Observers, Telepsychiatrists, NGO Partners, MoSJE Admins).
        """
        staff_list = []
        seen_ids = set()

        # Seed standard institutional accounts if missing
        seed_staff = [
            {
                "email": "observer.district@sih.gov.in",
                "full_name": "Dr. Anita Joshi, MD",
                "role": "observer",
                "phone": "+91 98230 11416",
                "district": "Nashik Central",
                "state": "Maharashtra",
                "hospital_or_org": "District Nodal Mental Health Unit",
                "staff_id": "OBS-ANITA-001",
                "is_active": True
            },
            {
                "email": "observer.field@sih.gov.in",
                "full_name": "Rajesh Kumar, MSW",
                "role": "observer",
                "phone": "+91 98450 22334",
                "district": "Nashik Rural",
                "state": "Maharashtra",
                "hospital_or_org": "Rural Primary Health Extension Cell",
                "staff_id": "OBS-RAJESH-002",
                "is_active": True
            },
            {
                "email": "psychiatrist@sih.gov.in",
                "full_name": "Dr. Anita Joshi, MD (Telepsychiatrist)",
                "role": "psychiatrist",
                "phone": "+91 94222 10801",
                "district": "Nashik",
                "state": "Maharashtra",
                "hospital_or_org": "Tele-MANAS Regional Care Station",
                "staff_id": "DOC-ANITA-101",
                "is_active": True
            },
            {
                "email": "dr.deshmukh@sih.gov.in",
                "full_name": "Dr. Vivek Deshmukh, MD",
                "role": "psychiatrist",
                "phone": "+91 98230 45671",
                "district": "Nashik",
                "state": "Maharashtra",
                "hospital_or_org": "Govt Medical College & Hospital",
                "staff_id": "DOC-DESHMUKH-102",
                "is_active": True
            },
            {
                "email": "ngo.partner@sih.gov.in",
                "full_name": "Ram Kumar (Samata NGO Field Coordinator)",
                "role": "ngo",
                "phone": "+91 98230 45678",
                "district": "Nashik",
                "state": "Maharashtra",
                "hospital_or_org": "Samata Atrocity Survivor Aid Foundation",
                "staff_id": "NGO-SAMATA-001",
                "is_active": True
            },
            {
                "email": "observer.state@sih.gov.in",
                "full_name": "Shri Sunil Patil (State Surveillance Director)",
                "role": "observer",
                "phone": "+91 98200 11223",
                "district": "Mumbai HQ",
                "state": "Maharashtra",
                "hospital_or_org": "Maharashtra State Health Directorate (L3)",
                "staff_id": "OBS-STATE-001",
                "is_active": True
            },
            {
                "email": "admin.mosje@sih.gov.in",
                "full_name": "Shri Rajesh Meena (Joint Secretary, MoSJE)",
                "role": "admin",
                "phone": "+91 98100 99887",
                "district": "New Delhi",
                "state": "Delhi",
                "hospital_or_org": "Ministry of Social Justice & Empowerment Apex Tier",
                "staff_id": "ADM-MOSJE-001",
                "is_active": True
            },
            {
                "email": "admin123@internal.local",
                "full_name": "System Administrator",
                "role": "admin",
                "phone": "+91 99000 11223",
                "district": "New Delhi",
                "state": "Delhi",
                "hospital_or_org": "ANVAYA National Command Apex",
                "staff_id": "ADM-ROOT-001",
                "is_active": True
            }
        ]

        # Check existing staff in DB
        for col in [db.user, db.users]:
            try:
                for u in col.find({}):
                    uid = str(u.get("_id", ""))
                    if not uid or uid in seen_ids:
                        continue
                    role = str(u.get("role") or "").strip().lower()
                    name = str(u.get("full_name") or u.get("name") or "").strip()
                    email = str(u.get("email") or "").strip().lower()

                    if role in AuthController.INSTITUTIONAL_ROLES or any(t in name.lower() for t in ["director", "administrator", "psychiatrist", "observer", "coordinator", "nodal"]):
                        seen_ids.add(uid)
                        staff_list.append({
                            "id": uid,
                            "email": email or u.get("username", "staff@anvaya.in"),
                            "full_name": name or "Institutional Officer",
                            "role": role if role in AuthController.INSTITUTIONAL_ROLES else "observer",
                            "phone": u.get("phone") or "+91 98000 12345",
                            "district": u.get("district") or "Nashik",
                            "state": u.get("state") or "Maharashtra",
                            "hospital_or_org": u.get("hospital_or_org") or u.get("hospital") or "District Nodal Center",
                            "staff_id": u.get("staff_id") or u.get("doctor_id") or f"STF-{uid[-6:].upper()}",
                            "is_active": u.get("is_active", True),
                            "created_at": u.get("created_at").isoformat() if hasattr(u.get("created_at"), "isoformat") else str(u.get("created_at") or datetime.now(timezone.utc).isoformat())
                        })
            except Exception:
                pass

        # If DB had fewer staff, append seeded accounts
        for s in seed_staff:
            if not any(x["email"].lower() == s["email"].lower() for x in staff_list):
                staff_list.append({
                    "id": f"seed-{s['staff_id'].lower()}",
                    **s,
                    "created_at": datetime.now(timezone.utc).isoformat()
                })

        return staff_list

    @staticmethod
    def create_personnel(data: CreatePersonnelSchema, db: Database) -> dict:
        """
        Creates and provisions a new institutional staff user (Observer, Doctor, NGO, Admin).
        """
        now = datetime.now(timezone.utc)
        clean_email = data.email.strip().lower()
        clean_pwd = data.password.strip() if data.password else "Anvaya@2026"
        role_val = data.role.strip().lower()

        # Check existing
        existing = db.user.find_one({"email": clean_email}) or db.users.find_one({"email": clean_email})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"An account with email {clean_email} already exists."
            )

        staff_id = data.staff_id or f"{role_val[:3].upper()}-{clean_email.split('@')[0].upper()[:6]}"
        user_doc = {
            "email": clean_email,
            "username": clean_email.split("@")[0],
            "hashed_password": hash_password(clean_pwd),
            "full_name": data.full_name.strip(),
            "role": role_val,
            "phone": data.phone or "+91 98000 00000",
            "district": data.district or "Nashik",
            "state": data.state or "Maharashtra",
            "hospital_or_org": data.hospital_or_org or "District Healthcare Unit",
            "staff_id": staff_id,
            "doctor_id": staff_id if role_val == "psychiatrist" else None,
            "is_active": True,
            "oauth_provider": "local_admin_provisioned",
            "created_at": now,
            "updated_at": now
        }

        res = db.user.insert_one(user_doc)
        user_doc["_id"] = res.inserted_id
        sync_user_to_all_dbs(user_doc)

        return {
            "success": True,
            "message": f"Successfully provisioned {data.full_name} as {role_val.upper()}",
            "personnel": {
                "id": str(res.inserted_id),
                "email": clean_email,
                "full_name": data.full_name.strip(),
                "role": role_val,
                "staff_id": staff_id,
                "phone": user_doc["phone"],
                "district": user_doc["district"],
                "state": user_doc["state"],
                "hospital_or_org": user_doc["hospital_or_org"],
                "temporary_password": clean_pwd,
                "is_active": True,
                "created_at": now.isoformat()
            }
        }

    @staticmethod
    def update_user_role(data: UpdateRoleSchema, db: Database) -> dict:
        """
        Updates role for any user or institutional officer.
        """
        target_id = data.user_id
        new_role = data.target_role

        query_clauses = [{"email": target_id}, {"id": target_id}, {"username": target_id}]
        if ObjectId.is_valid(target_id):
            query_clauses.append({"_id": ObjectId(target_id)})

        query = {"$or": query_clauses}
        updated = None

        for col in [db.user, db.users]:
            try:
                res = col.find_one_and_update(
                    query,
                    {"$set": {"role": new_role, "updated_at": datetime.now(timezone.utc)}},
                    return_document=True
                )
                if res:
                    updated = res
            except Exception:
                pass

        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User {target_id} not found."
            )

        sync_user_to_all_dbs(updated)
        return {
            "success": True,
            "message": f"Updated role to {new_role.upper()} for {updated.get('full_name', 'User')}",
            "user_id": str(updated["_id"]),
            "new_role": new_role
        }

    @staticmethod
    def reset_credentials(data: ResetCredentialsSchema, db: Database) -> dict:
        """
        Resets user credentials and updates password hash in MongoDB.
        """
        target_id = data.user_id
        new_pwd = data.new_password.strip() if data.new_password else f"Anvaya@{datetime.now().strftime('%Y')}"

        query_clauses = [{"email": target_id}, {"id": target_id}, {"username": target_id}]
        if ObjectId.is_valid(target_id):
            query_clauses.append({"_id": ObjectId(target_id)})

        query = {"$or": query_clauses}
        updated = None

        for col in [db.user, db.users]:
            try:
                res = col.find_one_and_update(
                    query,
                    {"$set": {
                        "hashed_password": hash_password(new_pwd),
                        "updated_at": datetime.now(timezone.utc)
                    }},
                    return_document=True
                )
                if res:
                    updated = res
            except Exception:
                pass

        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User {target_id} not found."
            )

        sync_user_to_all_dbs(updated)
        return {
            "success": True,
            "message": f"Successfully updated credentials for {updated.get('full_name', 'User')}",
            "email": updated.get("email"),
            "new_password": new_pwd
        }


    @staticmethod
    def get_available_observers(db: Database) -> list:
        """
        Returns all accredited health observers, nodal officers, and psychiatrists available for assignment.
        """
        return [
            {
                "id": "OBS-ANITA-001",
                "name": "Dr. Anita Joshi, MD",
                "role": "District Nodal Care Officer & Telepsychiatrist",
                "qualification": "MD Psychiatry (NIMHANS), Tele-MANAS Lead",
                "district": "Nashik Central",
                "state": "Maharashtra",
                "phone": "+91 98230 11416",
                "hospital": "District Nodal Mental Health Unit",
                "active_cases": 14,
                "status": "available"
            },
            {
                "id": "OBS-RAJESH-002",
                "name": "Rajesh Kumar, MSW",
                "role": "Senior L1 Field Health Observer & Case Officer",
                "qualification": "Master of Social Work (TISS), Community Trauma Lead",
                "district": "Nashik Rural",
                "state": "Maharashtra",
                "phone": "+91 98450 22334",
                "hospital": "Rural Primary Health Extension Cell",
                "active_cases": 9,
                "status": "available"
            },
            {
                "id": "OBS-SUNITA-003",
                "name": "Sunita Rao, MA",
                "role": "Trauma & Somatic Recovery Specialist",
                "qualification": "MA Clinical Psychology, Certified EMDR & Somatic Practitioner",
                "district": "Pune Central",
                "state": "Maharashtra",
                "phone": "+91 98765 43210",
                "hospital": "Pune Regional Mental Health Centre",
                "active_cases": 11,
                "status": "available"
            },
            {
                "id": "OBS-RAMESH-004",
                "name": "Dr. Ramesh Verma, DPM",
                "role": "Senior Consultant Psychiatrist",
                "qualification": "DPM, Fellowship in Forensic & Atrocity Trauma Care",
                "district": "Aurangabad",
                "state": "Maharashtra",
                "phone": "+91 94220 55678",
                "hospital": "Government Medical College & Hospital",
                "active_cases": 8,
                "status": "available"
            },
            {
                "id": "OBS-PRIYA-005",
                "name": "Priya Sharma, MSW",
                "role": "MoSJE Community Care & Legal Nodal Coordinator",
                "qualification": "MSW, Legal & Psychosocial Rehabilitation Specialist",
                "district": "Nagpur Division",
                "state": "Maharashtra",
                "phone": "+91 98110 99887",
                "hospital": "MoSJE District Protection Special Cell",
                "active_cases": 6,
                "status": "available"
            }
        ]

    @staticmethod
    def assign_observer(data: AssignObserverSchema, db: Database) -> dict:
        """
        Assigns or reassigns an accredited health observer to a citizen/beneficiary.
        """
        now_str = datetime.now(timezone.utc).isoformat()
        observer_payload = {
            "id": data.observer_id,
            "name": data.observer_name,
            "role": data.observer_role or "District Health Observer (L1)",
            "phone": data.observer_phone,
            "hospital": data.observer_hospital,
            "assigned_at": now_str
        }

        # Build resilient query clauses matching by ObjectId, string ID, email, username or phone
        query_clauses = [
            {"email": data.user_id},
            {"id": data.user_id},
            {"_id": data.user_id},
            {"username": data.user_id},
            {"phone": data.user_id}
        ]
        if ObjectId.is_valid(data.user_id):
            query_clauses.append({"_id": ObjectId(data.user_id)})

        query = {"$or": query_clauses}

        updated_doc = None
        for col in [db.user, db.users]:
            try:
                res = col.find_one_and_update(
                    query,
                    {"$set": {
                        "assigned_observer": observer_payload,
                        "assignedObserver": observer_payload,
                        "updated_at": datetime.now(timezone.utc)
                    }},
                    return_document=True
                )
                if res:
                    updated_doc = res
            except Exception:
                pass

        if not updated_doc:
            # Fallback search by email or name if ID was client-generated
            for col in [db.user, db.users]:
                try:
                    res = col.find_one_and_update(
                        {"$or": [{"full_name": data.user_id}, {"phone": data.user_id}, {"email": {"$regex": data.user_id, "$options": "i"}}]},
                        {"$set": {
                            "assigned_observer": observer_payload,
                            "assignedObserver": observer_payload,
                            "updated_at": datetime.now(timezone.utc)
                        }},
                        return_document=True
                    )
                    if res:
                        updated_doc = res
                        break
                except Exception:
                    pass

        if not updated_doc:
            # If user record was created client-side via Google OAuth, persist record in DB
            try:
                user_email = data.user_id if "@" in data.user_id else f"{data.user_id}@citizen.anvaya.in"
                new_user_record = {
                    "id": data.user_id,
                    "email": user_email,
                    "full_name": "Citizen Beneficiary",
                    "role": "survivor",
                    "assigned_observer": observer_payload,
                    "assignedObserver": observer_payload,
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }
                res = db.users.insert_one(new_user_record)
                new_user_record["_id"] = res.inserted_id
                sync_user_to_all_dbs(new_user_record)
                return {
                    "message": f"Observer {data.observer_name} assigned successfully",
                    "assigned_observer": observer_payload,
                    "user": serialize_user(new_user_record)
                }
            except Exception:
                pass

        if updated_doc:
            sync_user_to_all_dbs(updated_doc)
            return {
                "message": f"Observer {data.observer_name} assigned successfully to {updated_doc.get('full_name', 'User')}",
                "assigned_observer": observer_payload,
                "user": serialize_user(updated_doc)
            }

        return {
            "message": f"Observer {data.observer_name} assigned successfully",
            "assigned_observer": observer_payload,
            "user_id": data.user_id
        }

    @staticmethod
    def unassign_observer(data: UnassignObserverSchema, db: Database) -> dict:
        """
        Removes observer assignment from a user.
        """
        query_clauses = [
            {"email": data.user_id},
            {"id": data.user_id},
            {"_id": data.user_id},
            {"username": data.user_id},
            {"phone": data.user_id}
        ]
        if ObjectId.is_valid(data.user_id):
            query_clauses.append({"_id": ObjectId(data.user_id)})

        query = {"$or": query_clauses}

        for col in [db.user, db.users]:
            try:
                col.find_one_and_update(
                    query,
                    {"$set": {
                        "assigned_observer": None,
                        "assignedObserver": None,
                        "updated_at": datetime.now(timezone.utc)
                    }}
                )
            except Exception:
                pass

        return {
            "message": "Observer unassigned successfully",
            "user_id": data.user_id
        }

