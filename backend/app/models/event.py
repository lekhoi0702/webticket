from sqlalchemy import Column, Integer, String, Text, Date, Time, Enum, Boolean, TIMESTAMP, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class EventCategory(str, enum.Enum):
    CONCERT = "concert"
    SPORTS = "sports"
    THEATER = "theater"
    CONFERENCE = "conference"
    FESTIVAL = "festival"
    WORKSHOP = "workshop"
    OTHER = "other"

class EventStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Event(Base):
    __tablename__ = "events"
    
    event_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organizer = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(Enum(EventCategory), default=EventCategory.OTHER, index=True)
    venue_name = Column(String(255), nullable=False)
    venue_address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True, index=True)
    event_date = Column(Date, nullable=False, index=True)
    event_time = Column(Time, nullable=False)
    event_end_date = Column(Date, nullable=True)
    event_end_time = Column(Time, nullable=True)
    image_url = Column(String(500), nullable=True)
    banner_url = Column(String(500), nullable=True)
    has_seat_map = Column(Boolean, default=False)
    seat_map_config = Column(JSON, nullable=True)
    status = Column(Enum(EventStatus), default=EventStatus.DRAFT, index=True)
    is_featured = Column(Boolean, default=False, index=True)
    total_capacity = Column(Integer, default=0)
    tickets_sold = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    ticket_types = relationship("TicketType", back_populates="event", cascade="all, delete-orphan")
    seats = relationship("Seat", back_populates="event", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="event")
    tickets = relationship("Ticket", back_populates="event")