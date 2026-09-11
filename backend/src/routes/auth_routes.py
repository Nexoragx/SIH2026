from fastapi import APIRouter, Depends, Query, Request
from pymongo.database import Database

from src.db.db import get_db
from src.middlewares.auth_middleware import get_current_user, oauth2_scheme
from src.controllers.auth_controller import (
    AuthController,
    UserRegisterSchema,
    UserLoginSchema,
    AdminLoginSchema,
    DoctorLoginSchema,
    RefreshTokenSchema,
    RequestOtpSchema,
    VerifyOtpSchema,
    AssignObserverSchema,
    UnassignObserverSchema
)

router = APIRouter(prefix="/auth", tags=["Authentication & OAuth"])


@router.post("/request-otp", summary="Request Mobile OTP for Login/Registration")
def request_otp(data: RequestOtpSchema, db: Database = Depends(get_db)):
    """
    Sends a 5-digit verification OTP to the user's mobile number for passwordless authentication.
    """
    return AuthController.request_otp(data=data, db=db)


@router.post("/verify-otp", summary="Verify Mobile OTP and Generate JWT Session")
def verify_otp(data: VerifyOtpSchema, db: Database = Depends(get_db)):
    """
    Verifies the OTP submitted by the user and returns an authenticated JWT token pair.
    """
    return AuthController.verify_otp(data=data, db=db)


@router.post("/register", summary="Register a new citizen account")
def register(data: UserRegisterSchema, db: Database = Depends(get_db)):
    """
    Registers a new account in MongoDB.
    - Public registration creates only `victim` accounts.
    - Observer, psychiatrist, NGO, and administrator accounts are provisioned
      by an administrator and can only sign in with assigned credentials.
    """
    return AuthController.register(data=data, db=db)


@router.post("/login", summary="Login with email and password")
def login(data: UserLoginSchema, db: Database = Depends(get_db)):
    """
    Authenticates user against MongoDB and returns JWT access_token and refresh_token.
    """
    return AuthController.login(data=data, db=db)


@router.post("/admin/login", summary="Sign in to the administrator portal")
def admin_login(data: AdminLoginSchema, db: Database = Depends(get_db)):
    """Dedicated administrator login; returns a session only for role `admin`."""
    return AuthController.admin_login(data=data, db=db)


@router.post("/doctor/login", summary="Sign in to Tele-MANAS Psychiatrist Workstation")
def doctor_login(data: DoctorLoginSchema, db: Database = Depends(get_db)):
    """
    Dedicated Telepsychiatrist login using official Doctor ID (e.g. DOC-ANITA-101) and password.
    Public registration for doctors is disallowed; credentials are pre-provisioned.
    """
    return AuthController.doctor_login(data=data, db=db)


@router.post("/refresh", summary="Refresh access token")
def refresh(data: RefreshTokenSchema, db: Database = Depends(get_db)):
    """
    Generates a new access token using a valid refresh token.
    """
    return AuthController.refresh(data=data, db=db)


@router.post("/logout", summary="Logout and invalidate token")
def logout(
    token: str = Depends(oauth2_scheme),
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """
    Invalidates current JWT token in MongoDB blacklisted_tokens collection.
    """
    return AuthController.logout(token=token, db=db)


@router.get("/me", summary="Get current logged in user profile")
def get_current_profile(current_user: dict = Depends(get_current_user)):
    """
    Returns profile information of the currently authenticated user.
    """
    return {
        "id": current_user.get("id"),
        "email": current_user.get("email"),
        "full_name": current_user.get("full_name"),
        "role": current_user.get("role"),
        "phone": current_user.get("phone"),
        "district": current_user.get("district"),
        "state": current_user.get("state"),
        "assigned_observer": current_user.get("assigned_observer"),
        "oauth_provider": current_user.get("oauth_provider"),
        "created_at": current_user.get("created_at")
    }


@router.get("/admin/users", summary="Admin: List all registered citizens and beneficiaries")
def get_admin_users(db: Database = Depends(get_db)):
    """
    Lists all registered users/citizens for admin verification and observer assignment.
    """
    return AuthController.get_admin_users(db=db)


@router.get("/admin/observers", summary="Admin: List all accredited health observers")
def get_available_observers(db: Database = Depends(get_db)):
    """
    Lists all accredited observers and psychiatrists available for assignment.
    """
    return AuthController.get_available_observers(db=db)


@router.put("/admin/assign-observer", summary="Admin: Assign or change health observer for a user")
def assign_observer(data: AssignObserverSchema, db: Database = Depends(get_db)):
    """
    Assigns or changes an observer for a specific user.
    """
    return AuthController.assign_observer(data=data, db=db)


@router.put("/admin/unassign-observer", summary="Admin: Unassign observer from a user")
def unassign_observer(data: UnassignObserverSchema, db: Database = Depends(get_db)):
    """
    Removes observer assignment from a user.
    """
    return AuthController.unassign_observer(data=data, db=db)


@router.get("/oauth/login", summary="Get OAuth2 login URL")
def oauth_login():
    """
    Returns OAuth2 authorization URL for Google / SSO login.
    """
    return AuthController.get_oauth_login_url()


@router.get("/oauth/callback", summary="OAuth2 Callback Handler")
async def oauth_callback(code: str = Query(..., description="OAuth2 authorization code"), db: Database = Depends(get_db)):
    """
    OAuth2 callback endpoint that processes authorization code and returns JWT token pair.
    """
    return await AuthController.oauth_callback(code=code, db=db)

