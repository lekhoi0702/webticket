from sqlalchemy import Column, Integer, String, DECIMAL, Enum, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class TicketStatus(str, enum.Enum):
    ACTIVE = "active"
    USED = "used"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class Ticket(Base):
    __tablename__ = "tickets"
    
    ticket_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_code = Column(String(100), unique=True, nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id", ondelete="RESTRICT"), nullable=False, index=True)
    order_item_id = Column(Integer, ForeignKey("order_items.order_item_id", ondelete="RESTRICT"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False, index=True)
    event_id = Column(Integer, ForeignKey("events.event_id", ondelete="RESTRICT"), nullable=False, index=True)
    ticket_type_name = Column(String(100), nullable=True)
    seat_info = Column(String(100), nullable=True)
    price = Column(DECIMAL(10, 2), nullable=False)
    status = Column(Enum(TicketStatus), default=TicketStatus.ACTIVE, index=True)
    checked_in_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    order = relationship("Order", back_populates="tickets")
    order_item = relationship("OrderItem", back_populates="tickets")
    user = relationship("User", back_populates="tickets")
    event = relationship("Event", back_populates="tickets")