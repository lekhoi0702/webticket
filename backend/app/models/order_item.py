from sqlalchemy import Column, Integer, DECIMAL, TIMESTAMP, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class OrderItem(Base):
    __tablename__ = "order_items"
    
    order_item_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.order_id", ondelete="CASCADE"), nullable=False, index=True)
    ticket_type_id = Column(Integer, ForeignKey("ticket_types.ticket_type_id", ondelete="RESTRICT"), nullable=True, index=True)
    seat_id = Column(Integer, ForeignKey("seats.seat_id", ondelete="RESTRICT"), nullable=True, index=True)
    quantity = Column(Integer, default=1)
    unit_price = Column(DECIMAL(10, 2), nullable=False)
    subtotal = Column(DECIMAL(10, 2), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    # Constraints
    __table_args__ = (
        CheckConstraint('quantity > 0', name='chk_quantity_positive'),
        CheckConstraint('unit_price >= 0', name='chk_unit_price'),
        CheckConstraint('subtotal >= 0', name='chk_subtotal'),
    )
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
    ticket_type = relationship("TicketType", back_populates="order_items")
    seat = relationship("Seat", back_populates="order_items")
    tickets = relationship("Ticket", back_populates="order_item")