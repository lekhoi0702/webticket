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
            role=obj_in.role
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def authenticate(
        self, db: Session, *, username: str = None, email: str = None, password: str
    ) -> Optional[User]:
        if email:
            user = self.get_by_email(db, email=email)
        elif username:
            user = self.get_by_username(db, username=username)
        else:
            return None
        
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user
    
    def is_active(self, user: User) -> bool:
        return user.status == UserStatus.ACTIVE
    
    def is_admin(self, user: User) -> bool:
        return user.role == UserRole.ADMIN
    
    def update_password(self, db: Session, *, user: User, new_password: str) -> User:
        user.password_hash = get_password_hash(new_password)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

user = CRUDUser(User)