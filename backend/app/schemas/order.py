from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, model_validator

from app.models.order import OrderStatus, PaymentMethod, PaymentStatus


class OrderItemCreate(BaseModel):
    ticket_type_id: Optional[int] = None
    seat_id: Optional[int] = None
    quantity: int = Field(1, ge=1)

    @model_validator(mode="after")
    def validate_identifiers(cls, data):
        if not data.ticket_type_id and not data.seat_id:
            raise ValueError("Either ticket_type_id or seat_id must be provided")
        if data.ticket_type_id and data.seat_id:
            raise ValueError("Provide only one of ticket_type_id or seat_id")
        return data


class OrderCreate(BaseModel):
    event_id: int
    customer_name: str = Field(..., max_length=255)
    customer_email: EmailStr
    customer_phone: Optional[str] = Field(None, max_length=20)
    payment_method: PaymentMethod
    notes: Optional[str] = None
    items: List[OrderItemCreate]

    @model_validator(mode="after")
    def validate_items(cls, data):
        if not data.items:
            raise ValueError("Order must contain at least one item")
        return data


class OrderItemResponse(BaseModel):
    order_item_id: int
    order_id: int
    ticket_type_id: Optional[int]
    seat_id: Optional[int]
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    order_id: int
    order_number: str
    user_id: int
    event_id: int
    customer_name: str
    customer_email: str
    customer_phone: Optional[str]
    subtotal: Decimal
    total_amount: Decimal
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    transaction_id: Optional[str]
    paid_at: Optional[datetime]
    notes: Optional[str]
    order_status: OrderStatus
    created_at: datetime
    updated_at: datetime
    order_items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True
