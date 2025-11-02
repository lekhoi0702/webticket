from sqlalchemy import Column, Integer, String, Enum, Boolean, TIMESTAMP, TypeDecorator
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    customer = "customer"
    admin = "admin"

class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"

class EnumValueType(TypeDecorator):
    """Custom type to map enum values from database"""
    impl = String
    cache_ok = True
    
    def __init__(self, enum_class, length=50, *args, **kwargs):
        super().__init__(length=length, *args, **kwargs)
        self.enum_class = enum_class
    
    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, self.enum_class):
            return value.value
        # If it's already a string, return as is
        if isinstance(value, str):
            return value
        return str(value)
    
    def process_result_value(self, value, dialect):
        if value is None:
            return None
        # If already an enum instance, return it
        if isinstance(value, self.enum_class):
            return value
        # Map string value from database to enum member by value
        value_str = str(value).lower()
        for member in self.enum_class:
            if member.value.lower() == value_str:
                return member
        # Fallback: try case-insensitive match by name
        for member in self.enum_class:
            if member.name.lower() == value_str:
                return member
        # Last resort: return None if no match (shouldn't happen with valid data)
        return None

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=True)
    email = Column(String(50), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(String(50), default="customer", index=True)
    email_verified = Column(Boolean, default=False)
    status = Column(String(50), default="active", index=True)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    orders = relationship("Order", back_populates="user")
    tickets = relationship("Ticket", back_populates="user")
    
    @hybrid_property
    def role_enum(self):
        """Get role as UserRole enum"""
        if isinstance(self.role, UserRole):
            return self.role
        if self.role is None:
            return UserRole.customer
        try:
            return UserRole(self.role.lower())
        except (ValueError, AttributeError):
            return UserRole.customer
    
    @role_enum.setter
    def role_enum(self, value):
        """Set role from UserRole enum"""
        if isinstance(value, UserRole):
            self.role = value.value
        elif isinstance(value, str):
            self.role = value.lower()
        else:
            self.role = "customer"
    
    @hybrid_property
    def status_enum(self):
        """Get status as UserStatus enum"""
        if isinstance(self.status, UserStatus):
            return self.status
        if self.status is None:
            return UserStatus.ACTIVE
        try:
            return UserStatus(self.status.lower())
        except (ValueError, AttributeError):
            return UserStatus.ACTIVE
    
    @status_enum.setter
    def status_enum(self, value):
        """Set status from UserStatus enum"""
        if isinstance(value, UserStatus):
            self.status = value.value
        elif isinstance(value, str):
            self.status = value.lower()
        else:
            self.status = "active"