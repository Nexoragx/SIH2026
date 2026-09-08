from fastapi import APIRouter, Depends, Query, Request
from pymongo.database import Database

from src.db.db import get_db
from src.middlewares.auth_middleware import get_current_user, oauth2_scheme
from src.controllers.auth_controller import (
    AuthController,
    UserRegisterSchema,
    UserLoginSchema,
    RefreshTokenSchema
)

router = APIRouter(prefix="/auth", tags=["Authentication & OAuth"])


@router.post("/register", summary="Register a new victim or official")
def register(data: UserRegisterSchema, db: Database = Depends(get_db)):
    """
    Registers a new account in MongoDB.
    - Role options: `victim`, `observer_district`, `observer_state`, `observer_national`, `psychiatrist`, `ngo_partner`
    """
    return AuthController.register(data=data, db=db)


@router.post("/login", summary="Login with email and password")
def login(data: UserLoginSchema, db: Database = Depends(get_db)):
    """
    Authenticates user against MongoDB and returns JWT access_token and refresh_token.
    """
    return AuthController.login(data=data, db=db)


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
        "oauth_provider": current_user.get("oauth_provider"),
        "created_at": current_user.get("created_at")
    }


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
