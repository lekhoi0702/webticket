from sqlalchemy import Column, Integer, String, DECIMAL, Enum, TIMESTAMP, ForeignKey, Text, CheckConstraint
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
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.CREDIT_CARD)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, index=True)
    transaction_id = Column(String(255), nullable=True)
    paid_at = Column(TIMESTAMP, nullable=True)
    notes = Column(Text, nullable=True)
    order_status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, index=True)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp(), index=True)
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Constraints
    __table_args__ = (
        CheckConstraint('total_amount >= 0', name='chk_total_amount'),
    )
    
    # Relationships
    user = relationship("User", back_populates="orders")
    event = relationship("Event", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="order")