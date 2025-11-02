from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
# from app.core.security import create_access_token, create_refresh_token, decode_token  # Temporarily disabled - simplified login
from app.crud.user import user as user_crud
from app.schemas.user import UserCreate, UserResponse, UserLogin
# from app.schemas.token import Token  # Temporarily disabled - simplified login
# from app.api.deps import get_current_active_user  # Temporarily disabled for testing
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    """Register new user"""
    # Check if user exists
    if user_in.email:
        user = user_crud.get_by_email(db, email=user_in.email)
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    if user_in.username:
        user = user_crud.get_by_username(db, username=user_in.username)
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create user
    user = user_crud.create(db, obj_in=user_in)
    return user

@router.post("/login", response_model=UserResponse)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Login: Admin uses username, Customer uses email"""
    user = None
    
    # Admin must login with username
    if login_data.username:
        user = user_crud.authenticate(
            db,
            username=login_data.username,
            password=login_data.password
        )
        if user:
            role_val = user.role if isinstance(user.role, str) else (user.role.value if hasattr(user.role, 'value') else str(user.role))
            if role_val.lower() != "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Admin must login with username. This account is not an admin."
                )
    
    # Customer must login with email
    elif login_data.email:
        user = user_crud.authenticate(
            db,
            email=login_data.email,
            password=login_data.password
        )
        if user:
            role_val = user.role if isinstance(user.role, str) else (user.role.value if hasattr(user.role, 'value') else str(user.role))
            if role_val.lower() == "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Admin accounts must login with username, not email."
                )
    
    if not user:
        if login_data.username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
    
    if not user_crud.is_active(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return user

# @router.post("/refresh", response_model=Token)  # Temporarily disabled - simplified login
# def refresh_token(
#     refresh_token: str,
#     db: Session = Depends(get_db)
# ):
#     """Refresh access token"""
#     payload = decode_token(refresh_token)
#     
#     if not payload or payload.get("type") != "refresh":
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid refresh token"
#         )
#     
#     user_id = payload.get("sub")
#     user = db.query(User).filter(User.user_id == user_id).first()
#     
#     if not user or not user_crud.is_active(user):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="User not found or inactive"
#         )
#     
#     # Create new tokens
#     access_token = create_access_token(data={"sub": user.user_id})
#     new_refresh_token = create_refresh_token(data={"sub": user.user_id})
#     
#     return {
#         "access_token": access_token,
#         "refresh_token": new_refresh_token,
#         "token_type": "bearer"
#     }

@router.get("/me", response_model=UserResponse)
def get_me(
    db: Session = Depends(get_db),
):
    """Get current user info - requires authentication"""
    # Without authentication, return 401
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required. Please login first.",
        headers={"WWW-Authenticate": "Bearer"},
    )