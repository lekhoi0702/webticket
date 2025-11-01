from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.models.seat import SeatStatus

class SeatBase(BaseModel):
    section: str = Field(..., max_length=50)
    row_label: str = Field(..., max_length=10)
    seat_number: int = Field(..., gt=0)
    price: Decimal = Field(..., ge=0, decimal_places=2)

class SeatCreate(SeatBase):
    event_id: int

class SeatUpdate(BaseModel):
    price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    status: Optional[SeatStatus] = None

class SeatResponse(SeatBase):
    seat_id: int
    event_id: int
    status: SeatStatus
    order_id: Optional[int] = None
    booked_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True