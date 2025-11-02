from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from jose import JWTError, jwt

from app.core.config import settings


def verify_password(plain_password: str, stored_password: str) -> bool:
    """Verify password - plain text comparison (no encryption)"""
    return plain_password == stored_password


def get_password_hash(password: str) -> str:
    """Store password as plain text (no encryption)"""
    return password


def _create_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta],
    secret_key: str,
    token_type: str,
) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta if expires_delta else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": token_type})
    return jwt.encode(to_encode, secret_key, algorithm=settings.ALGORITHM)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    return _create_token(data, expires_delta, settings.SECRET_KEY, "access")


def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    refresh_delta = expires_delta or timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    return _create_token(data, refresh_delta, settings.REFRESH_SECRET_KEY, "refresh")


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    secrets = [
        (settings.SECRET_KEY, "access"),
        (settings.REFRESH_SECRET_KEY, "refresh"),
    ]

    for secret_key, token_type in secrets:
        try:
            payload = jwt.decode(token, secret_key, algorithms=[settings.ALGORITHM])
            payload.setdefault("type", token_type)
            return payload
        except JWTError:
            continue
    return None

