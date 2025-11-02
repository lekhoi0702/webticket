from sqlalchemy import Column, Integer, String, Text, DECIMAL, Enum, TIMESTAMP, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class TicketTypeStatus(str, enum.Enum):
    ACTIVE = "active"
    SOLD_OUT = "sold_out"
    INACTIVE = "inactive"

class TicketType(Base):
    __tablename__ = "ticket_types"
    
    ticket_type_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey("events.event_id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(DECIMAL(10, 2), nullable=False)
    quantity_available = Column(Integer, nullable=False)
    quantity_sold = Column(Integer, default=0)
    min_purchase = Column(Integer, default=1)
    max_purchase = Column(Integer, default=10)
    sale_start_date = Column(TIMESTAMP, nullable=True)
    sale_end_date = Column(TIMESTAMP, nullable=True)
    status = Column(Enum(TicketTypeStatus), default=TicketTypeStatus.ACTIVE, index=True)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Constraints
    __table_args__ = (
        CheckConstraint('quantity_sold <= quantity_available', name='chk_quantity'),
        CheckConstraint('price >= 0', name='chk_price'),
        CheckConstraint('min_purchase >= 1', name='chk_min_purchase'),
        CheckConstraint('max_purchase >= min_purchase', name='chk_max_purchase'),
    )
    
    # Relationships
    event = relationship("Event", back_populates="ticket_types")
    order_items = relationship("OrderItem", back_populates="ticket_type")