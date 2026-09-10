from datetime import datetime, timedelta, timezone
from typing import Optional, List, Callable
import jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
import bcrypt
from bson import ObjectId
from pymongo.database import Database

from src.config.config import settings
from src.db.db import get_db
from src.models.user_model import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/login",
    auto_error=False
)


# --- Password Hashing & Verification ---

def hash_password(password: str) -> str:
    """Hash plain password using bcrypt directly."""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password."""
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


# --- JWT Token Generation & Revocation ---

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a signed JWT access token.
    """
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": now,
        "type": "access"
    })
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a signed JWT refresh token.
    """
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire,
        "iat": now,
        "type": "refresh"
    })
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def is_token_blacklisted(token: str, db: Database) -> bool:
    """
    Checks if a JWT token has been explicitly invalidated in MongoDB.
    """
    found = db.blacklisted_tokens.find_one({"token": token})
    return found is not None


def blacklist_token(token: str, db: Database, expires_at: Optional[datetime] = None) -> dict:
    """
    Blacklists a JWT token in MongoDB.
    """
    doc = {
        "token": token,
        "blacklisted_at": datetime.now(timezone.utc),
        "expires_at": expires_at
    }
    result = db.blacklisted_tokens.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return doc


# --- Authentication Dependencies ---

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Database = Depends(get_db)
) -> dict:
    """
    FastAPI dependency: Validates access token and returns authenticated user document.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    # Check token revocation
    if is_token_blacklisted(token, db):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked/blacklisted. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id_str: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id_str is None or token_type != "access":
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    # Search in MongoDB 'user' collection (fallback to 'users') by ObjectId or string ID
    query = {"_id": ObjectId(user_id_str)} if ObjectId.is_valid(user_id_str) else {"id": user_id_str}
    user_doc = db.user.find_one(query) or db.users.find_one(query)
    
    if user_doc is None or not user_doc.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_doc["id"] = str(user_doc["_id"])
    return user_doc


def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Database = Depends(get_db)
) -> Optional[dict]:
    """
    FastAPI dependency: Optional user auth for anonymous/victim helpline or web access.
    """
    if not token or is_token_blacklisted(token, db):
        return None
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id_str: str = payload.get("sub")
        if not user_id_str:
            return None
        query = {"_id": ObjectId(user_id_str)} if ObjectId.is_valid(user_id_str) else {"id": user_id_str}
        user_doc = db.user.find_one(query) or db.users.find_one(query)
        if user_doc and user_doc.get("is_active", True):
            user_doc["id"] = str(user_doc["_id"])
            return user_doc
        return None
    except Exception:
        return None


def require_roles(allowed_roles: List[UserRole]) -> Callable:
    """
    Role-Based Access Control (RBAC) dependency factory for MongoDB user documents.
    """
    def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = current_user.get("role")
        allowed_values = [r.value if isinstance(r, UserRole) else str(r) for r in allowed_roles]
        if user_role not in allowed_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed_values}, current: {user_role}"
            )
        return current_user
    return role_checker
