from sqlalchemy import Column, Integer, String, DECIMAL, Enum, TIMESTAMP, ForeignKey, Text, CheckConstraint
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class PaymentMethod(str, enum.Enum):
    CREDIT_CARD = "credit_card"
    BANK_TRANSFER = "bank_transfer"
    E_WALLET = "e_wallet"
    CASH = "cash"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"

class Order(Base):
    __tablename__ = "orders"
    
    order_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False, index=True)
    event_id = Column(Integer, ForeignKey("events.event_id", ondelete="RESTRICT"), nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(20), nullable=True)
    subtotal = Column(DECIMAL(10, 2), nullable=False)
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    payment_method = Column(String(50), default="credit_card", index=True)
    payment_status = Column(String(50), default="pending", index=True)
    transaction_id = Column(String(255), nullable=True)
    paid_at = Column(TIMESTAMP, nullable=True)
    notes = Column(Text, nullable=True)
    order_status = Column(String(50), default="pending", index=True)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp(), index=True)
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    @hybrid_property
    def payment_method_enum(self):
        """Get payment_method as PaymentMethod enum"""
        if isinstance(self.payment_method, PaymentMethod):
            return self.payment_method
        if self.payment_method is None:
            return PaymentMethod.CREDIT_CARD
        try:
            return PaymentMethod(self.payment_method.lower())
        except (ValueError, AttributeError):
            return PaymentMethod.CREDIT_CARD
    
    @payment_method_enum.setter
    def payment_method_enum(self, value):
        """Set payment_method from PaymentMethod enum"""
        if isinstance(value, PaymentMethod):
            self.payment_method = value.value
        elif isinstance(value, str):
            self.payment_method = value.lower()
        else:
            self.payment_method = "credit_card"
    
    @hybrid_property
    def payment_status_enum(self):
        """Get payment_status as PaymentStatus enum"""
        if isinstance(self.payment_status, PaymentStatus):
            return self.payment_status
        if self.payment_status is None:
            return PaymentStatus.PENDING
        try:
            return PaymentStatus(self.payment_status.lower())
        except (ValueError, AttributeError):
            return PaymentStatus.PENDING
    
    @payment_status_enum.setter
    def payment_status_enum(self, value):
        """Set payment_status from PaymentStatus enum"""
        if isinstance(value, PaymentStatus):
            self.payment_status = value.value
        elif isinstance(value, str):
            self.payment_status = value.lower()
        else:
            self.payment_status = "pending"
    
    @hybrid_property
    def order_status_enum(self):
        """Get order_status as OrderStatus enum"""
        if isinstance(self.order_status, OrderStatus):
            return self.order_status
        if self.order_status is None:
            return OrderStatus.PENDING
        try:
            return OrderStatus(self.order_status.lower())
        except (ValueError, AttributeError):
            return OrderStatus.PENDING
    
    @order_status_enum.setter
    def order_status_enum(self, value):
        """Set order_status from OrderStatus enum"""
        if isinstance(value, OrderStatus):
            self.order_status = value.value
        elif isinstance(value, str):
            self.order_status = value.lower()
        else:
            self.order_status = "pending"
    
    # Constraints
    __table_args__ = (
        CheckConstraint('total_amount >= 0', name='chk_total_amount'),
    )
    
    # Relationships
    user = relationship("User", back_populates="orders")
    event = relationship("Event", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="order")