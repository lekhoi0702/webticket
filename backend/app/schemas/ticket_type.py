from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.models.ticket_type import TicketTypeStatus

class TicketTypeBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    price: Decimal = Field(..., ge=0, decimal_places=2)
    quantity_available: int = Field(..., gt=0)
    min_purchase: int = Field(1, ge=1)
    max_purchase: int = Field(10, ge=1)
    sale_start_date: Optional[datetime] = None
    sale_end_date: Optional[datetime] = None

class TicketTypeCreate(TicketTypeBase):
    event_id: int

class TicketTypeUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    quantity_available: Optional[int] = Field(None, gt=0)
    min_purchase: Optional[int] = Field(None, ge=1)
    max_purchase: Optional[int] = Field(None, ge=1)
    sale_start_date: Optional[datetime] = None
    sale_end_date: Optional[datetime] = None
    status: Optional[TicketTypeStatus] = None

class TicketTypeResponse(TicketTypeBase):
    ticket_type_id: int
    event_id: int
    quantity_sold: int
    status: TicketTypeStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
