from sqlalchemy import Column, Integer, String, DECIMAL, Enum, TIMESTAMP, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class SeatStatus(str, enum.Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    BOOKED = "booked"
    BLOCKED = "blocked"

class Seat(Base):
    __tablename__ = "seats"
    
    seat_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey("events.event_id", ondelete="CASCADE"), nullable=False, index=True)
    section = Column(String(50), nullable=False)
    row_label = Column(String(10), nullable=False)
    seat_number = Column(Integer, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    status = Column(Enum(SeatStatus), default=SeatStatus.AVAILABLE)
    order_id = Column(Integer, nullable=True)
    booked_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('event_id', 'section', 'row_label', 'seat_number', name='unique_seat'),
        CheckConstraint('price >= 0', name='chk_seat_price'),
    )
    
    # Relationships
    event = relationship("Event", back_populates="seats")
    order_items = relationship("OrderItem", back_populates="seat")