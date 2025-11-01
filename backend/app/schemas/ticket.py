from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.models.ticket import TicketStatus

class TicketResponse(BaseModel):
    ticket_id: int
    ticket_code: str
    order_id: int
    user_id: int
    event_id: int
    ticket_type_name: Optional[str]
    seat_info: Optional[str]
    price: Decimal
    status: TicketStatus
    checked_in_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TicketCheckIn(BaseModel):
    ticket_code: str