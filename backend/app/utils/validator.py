import re
from datetime import date, datetime
from typing import Optional
from fastapi import HTTPException, status

def validate_phone(phone: str) -> bool:
    """Validate phone number format"""
    # Simple validation for Vietnamese phone numbers
    pattern = r'^(\+84|0)[1-9]\d{8,9}$'
    return bool(re.match(pattern, phone))

def validate_date_range(start_date: date, end_date: Optional[date] = None) -> bool:
    """Validate date range"""
    if end_date and start_date > end_date:
        return False
    return True

def validate_event_dates(event_date: date, event_end_date: Optional[date] = None) -> None:
    """Validate event dates and raise exception if invalid"""
    if event_date < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event date cannot be in the past"
        )
    
    if event_end_date and event_date > event_end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event end date must be after start date"
        )