from pydantic import BaseModel, Field, validator, model_validator
from typing import Optional, List
from datetime import date, time, datetime
from app.models.event import EventCategory, EventStatus

class EventBase(BaseModel):
    organizer: str = Field(..., max_length=255)
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: EventCategory = EventCategory.OTHER
    venue_name: str = Field(..., max_length=255)
    venue_address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    event_date: date
    event_time: time
    event_end_date: Optional[date] = None
    event_end_time: Optional[time] = None
    image_url: Optional[str] = Field(None, max_length=500)
    banner_url: Optional[str] = Field(None, max_length=500)

class EventCreate(EventBase):
    has_seat_map: bool = False
    seat_map_config: Optional[dict] = None
    is_featured: bool = False
    total_capacity: int = Field(0, ge=0)

class EventUpdate(BaseModel):
    organizer: Optional[str] = Field(None, max_length=255)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[EventCategory] = None
    venue_name: Optional[str] = Field(None, max_length=255)
    venue_address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    event_date: Optional[date] = None
    event_time: Optional[time] = None
    event_end_date: Optional[date] = None
    event_end_time: Optional[time] = None
    image_url: Optional[str] = Field(None, max_length=500)
    banner_url: Optional[str] = Field(None, max_length=500)
    status: Optional[EventStatus] = None
    is_featured: Optional[bool] = None

class EventResponse(EventBase):
    event_id: int
    slug: str
    has_seat_map: bool
    seat_map_config: Optional[dict] = None
    status: EventStatus
    is_featured: bool
    total_capacity: int
    tickets_sold: int
    created_at: datetime
    updated_at: datetime
    
    @model_validator(mode="before")
    @classmethod
    def convert_enums(cls, data):
        """Convert string category/status to enum for response"""
        if isinstance(data, dict):
            if "category" in data and isinstance(data["category"], str):
                try:
                    data["category"] = EventCategory(data["category"].lower())
                except ValueError:
                    data["category"] = EventCategory.OTHER
            if "status" in data and isinstance(data["status"], str):
                try:
                    data["status"] = EventStatus(data["status"].lower())
                except ValueError:
                    data["status"] = EventStatus.DRAFT
        return data
    
    class Config:
        from_attributes = True

class EventList(BaseModel):
    event_id: int
    title: str
    slug: str
    category: EventCategory
    city: Optional[str]
    event_date: date
    event_time: time
    venue_name: str
    image_url: Optional[str]
    status: EventStatus
    is_featured: bool
    tickets_sold: int
    total_capacity: int
    
    @model_validator(mode="before")
    @classmethod
    def convert_enums(cls, data):
        """Convert string category/status to enum for response"""
        if isinstance(data, dict):
            if "category" in data and isinstance(data["category"], str):
                try:
                    data["category"] = EventCategory(data["category"].lower())
                except ValueError:
                    data["category"] = EventCategory.OTHER
            if "status" in data and isinstance(data["status"], str):
                try:
                    data["status"] = EventStatus(data["status"].lower())
                except ValueError:
                    data["status"] = EventStatus.PUBLISHED
        return data
    
    class Config:
        from_attributes = True