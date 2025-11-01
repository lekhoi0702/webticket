from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.user import user as user_crud
from app.schemas.user import UserResponse, UserUpdate
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user profile"""
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update current user profile"""
    user = user_crud.update(db, db_obj=current_user, obj_in=user_in)
    return user

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get user by ID (public info only)"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
