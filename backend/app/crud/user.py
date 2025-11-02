from typing import Optional, Union, Dict, Any
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.user import User, UserRole, UserStatus
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()
    
    def get_by_username(self, db: Session, *, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()
    
    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        db_obj = User(
            email=obj_in.email,
            username=obj_in.username,
            password_hash=get_password_hash(obj_in.password),
            full_name=obj_in.full_name,
            phone=obj_in.phone,
            role=obj_in.role.value if isinstance(obj_in.role, UserRole) else str(obj_in.role)
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def authenticate(
        self, db: Session, *, username: str = None, email: str = None, password: str
    ) -> Optional[User]:
        user = None
        if username:
            user = self.get_by_username(db, username=username)
        elif email:
            user = self.get_by_email(db, email=email)
        else:
            return None
        
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user
    
    def is_active(self, user: User) -> bool:
        status_val = user.status if isinstance(user.status, str) else user.status.value if hasattr(user.status, 'value') else str(user.status)
        return status_val.lower() == UserStatus.ACTIVE.value.lower()
    
    def is_admin(self, user: User) -> bool:
        role_val = user.role if isinstance(user.role, str) else user.role.value if hasattr(user.role, 'value') else str(user.role)
        return role_val.lower() == UserRole.admin.value.lower()
    
    def update_password(self, db: Session, *, user: User, new_password: str) -> User:
        user.password_hash = get_password_hash(new_password)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    def update(
        self,
        db: Session,
        *,
        db_obj: User,
        obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        """Update user - email cannot be updated"""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True) if hasattr(obj_in, 'model_dump') else obj_in.dict(exclude_unset=True)
        
        # Remove email from update_data - email cannot be updated
        if "email" in update_data:
            update_data.pop("email")
        
        # Handle password separately if provided
        if "password" in update_data:
            update_data["password_hash"] = get_password_hash(update_data.pop("password"))
        
        # Check username uniqueness (only if username is being changed)
        if "username" in update_data and update_data["username"] is not None:
            # Only update if username is actually changing
            if update_data["username"] != db_obj.username:
                existing_user = self.get_by_username(db, username=update_data["username"])
                if existing_user and existing_user.user_id != db_obj.user_id:
                    raise ValueError("Username already taken")
            else:
                # Remove username from update_data if it's the same to avoid unnecessary update
                update_data.pop("username")
        elif "username" in update_data and update_data["username"] is None:
            # If username is None in update but not None in db_obj, we still want to update it
            pass  # Keep it in update_data
        
        # Update only fields that are actually in update_data
        for field, value in update_data.items():
            if field != "password":  # password already handled as password_hash
                # Handle enum fields
                if field == "role" and isinstance(value, UserRole):
                    setattr(db_obj, field, value.value)
                elif field == "status" and isinstance(value, UserStatus):
                    setattr(db_obj, field, value.value)
                else:
                    setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

user = CRUDUser(User)