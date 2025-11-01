from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.event import event as event_crud
from app.crud.ticket_type import ticket_type as ticket_type_crud
from app.crud.seat import seat as seat_crud
from app.schemas.event import EventCreate, EventUpdate, EventResponse, EventList
from app.schemas.ticket_type import TicketTypeResponse
from app.schemas.seat import SeatResponse
from app.schemas.common import PaginatedResponse
from app.api.deps import require_admin, get_optional_current_user
from app.models.event import EventCategory, EventStatus
from app.models.user import User
from app.utils.pagination import paginate

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[EventList])
def get_events(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    category: Optional[EventCategory] = None,
    city: Optional[str] = None,
    status: Optional[EventStatus] = EventStatus.PUBLISHED,
    is_featured: Optional[bool] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of events with filters and pagination"""
    skip = (page - 1) * size
    
    events = event_crud.get_multi_with_filters(
        db,
        skip=skip,
        limit=size,
        category=category,
        city=city,
        status=status,
        is_featured=is_featured,
        from_date=from_date,
        to_date=to_date,
        search=search
    )
    
    total = event_crud.count_with_filters(
        db,
        category=category,
        city=city,
        status=status,
        is_featured=is_featured,
        from_date=from_date,
        to_date=to_date,
        search=search
    )
    
    return paginate(events, total, page, size)

@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    """Get event by ID"""
    event = db.query(event_crud.model).filter(
        event_crud.model.event_id == event_id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    return event

@router.get("/slug/{slug}", response_model=EventResponse)
def get_event_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """Get event by slug"""
    event = event_crud.get_by_slug(db, slug=slug)
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    return event

@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create new event (Admin only)"""
    event = event_crud.create(db, obj_in=event_in)
    return event

@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event_in: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update event (Admin only)"""
    event = db.query(event_crud.model).filter(
        event_crud.model.event_id == event_id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    event = event_crud.update(db, db_obj=event, obj_in=event_in)
    return event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete event (Admin only)"""
    event = db.query(event_crud.model).filter(
        event_crud.model.event_id == event_id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    event_crud.delete(db, id=event_id)
    return None

@router.get("/{event_id}/ticket-types", response_model=List[TicketTypeResponse])
def get_event_ticket_types(
    event_id: int,
    db: Session = Depends(get_db)
):
    """Get ticket types for an event"""
    # Check if event exists
    event = db.query(event_crud.model).filter(
        event_crud.model.event_id == event_id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    ticket_types = ticket_type_crud.get_available_by_event(db, event_id=event_id)
    return ticket_types

@router.get("/{event_id}/seats", response_model=List[SeatResponse])
def get_event_seats(
    event_id: int,
    section: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get seats for an event"""
    # Check if event exists
    event = db.query(event_crud.model).filter(
        event_crud.model.event_id == event_id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if section:
        seats = seat_crud.get_by_section(db, event_id=event_id, section=section)
    else:
        seats = seat_crud.get_by_event(db, event_id=event_id)
    
    return seats