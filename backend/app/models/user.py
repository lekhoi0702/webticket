from sqlalchemy import Column, Integer, String, Enum, Boolean, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"

class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=True)
    email = Column(String(50), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER, index=True)
    email_verified = Column(Boolean, default=False)
    status = Column(Enum(UserStatus), default=UserStatus.ACTIVE, index=True)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    orders = relationship("Order", back_populates="user")
    tickets = relationship("Ticket", back_populates="user")