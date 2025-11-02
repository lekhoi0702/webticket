from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.event import event as event_crud
from app.crud.ticket_type import ticket_type as ticket_type_crud
from app.crud.seat import seat as seat_crud
from app.schemas.event import EventCreate, EventUpdate, EventResponse, EventList
from app.schemas.ticket_type import TicketTypeResponse, TicketTypeCreate, TicketTypeUpdate
from app.schemas.seat import SeatResponse, SeatCreate, SeatUpdate
from app.schemas.common import PaginatedResponse
# from app.api.deps import require_admin  # Temporarily disabled for testing, get_optional_current_user
from app.models.event import EventCategory, EventStatus
from app.models.user import User
from app.utils.pagination import paginate

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[EventList])
def get_events(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    city: Optional[str] = None,
    status: Optional[str] = "published",
    is_featured: Optional[bool] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of events with filters and pagination"""
    try:
        skip = (page - 1) * size
        
        # Convert string status to enum if provided
        status_enum = None
        if status:
            try:
                status_enum = EventStatus(status.lower())
            except ValueError:
                # If invalid status, default to published
                status_enum = EventStatus.PUBLISHED
        
        # Convert string category to enum if provided
        category_enum = None
        if category:
            try:
                # Handle both uppercase (CONCERT) and lowercase (concert)
                category_str = category.lower()
                category_enum = EventCategory(category_str)
            except ValueError:
                # Try to match by name if value doesn't match
                try:
                    category_enum = EventCategory[category.upper()]
                except (KeyError, AttributeError):
                    category_enum = None
        
        events = event_crud.get_multi_with_filters(
            db,
            skip=skip,
            limit=size,
            category=category_enum,
            city=city,
            status=status_enum,
            is_featured=is_featured,
            from_date=from_date,
            to_date=to_date,
            search=search
        )
        
        total = event_crud.count_with_filters(
            db,
            category=category_enum,
            city=city,
            status=status_enum,
            is_featured=is_featured,
            from_date=from_date,
            to_date=to_date,
            search=search
        )
        
        return paginate(events, total, page, size)
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the full error for debugging
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error fetching events: {str(e)}")
        print(f"Traceback: {error_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching events: {str(e)}"
        )

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
    # current_user: User = Depends(require_admin)  # Temporarily disabled for testing
):
    """Create new event (Admin only)"""
    event = event_crud.create(db, obj_in=event_in)
    return event

@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event_in: EventUpdate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(require_admin)  # Temporarily disabled for testing
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
    # current_user: User = Depends(require_admin)  # Temporarily disabled for testing
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
    """Get all ticket types for an event"""
    # Check if event exists
    event = db.query(event_crud.model).filter(
        event_crud.model.event_id == event_id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    ticket_types = ticket_type_crud.get_by_event(db, event_id=event_id)
    return ticket_types

@router.post("/{event_id}/ticket-types", response_model=TicketTypeResponse, status_code=status.HTTP_201_CREATED)
def create_ticket_type(
    event_id: int,
    ticket_type_in: TicketTypeCreate,
    db: Session = Depends(get_db),
):
    """Create ticket type for an event"""
    # Check if event exists
    event = db.query(event_crud.model).filter(
        event_crud.model.event_id == event_id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    ticket_type_data = ticket_type_in.dict()
    ticket_type_data['event_id'] = event_id
    ticket_type = ticket_type_crud.create(db, obj_in=TicketTypeCreate(**ticket_type_data))
    return ticket_type

@router.put("/{event_id}/ticket-types/{ticket_type_id}", response_model=TicketTypeResponse)
def update_ticket_type(
    event_id: int,
    ticket_type_id: int,
    ticket_type_in: TicketTypeUpdate,
    db: Session = Depends(get_db),
):
    """Update ticket type"""
    # Check if event exists
    event = db.query(event_crud.model).filter(
        event_crud.model.event_id == event_id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    ticket_type = ticket_type_crud.get(db, id=ticket_type_id)
    if not ticket_type or ticket_type.event_id != event_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket type not found"
        )
    
    ticket_type = ticket_type_crud.update(db, db_obj=ticket_type, obj_in=ticket_type_in)
    return ticket_type

@router.delete("/{event_id}/ticket-types/{ticket_type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket_type(
    event_id: int,
    ticket_type_id: int,
    db: Session = Depends(get_db),
):
    """Delete ticket type"""
    # Check if event exists
    event = db.query(event_crud.model).filter(
        event_crud.model.event_id == event_id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    ticket_type = ticket_type_crud.get(db, id=ticket_type_id)
    if not ticket_type or ticket_type.event_id != event_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket type not found"
        )
    
    ticket_type_crud.delete(db, id=ticket_type_id)
    return None

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

@router.post("/{event_id}/seats", response_model=SeatResponse, status_code=status.HTTP_201_CREATED)
def create_seat(
    event_id: int,
    seat_in: SeatCreate,
    db: Session = Depends(get_db),
):
    """Create seat for an event"""
    # Check if event exists
    event = db.query(event_crud.model).filter(
        event_crud.model.event_id == event_id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    seat_data = seat_in.dict()
    seat_data['event_id'] = event_id
    seat = seat_crud.create(db, obj_in=SeatCreate(**seat_data))
    return seat

@router.post("/{event_id}/seats/bulk", response_model=List[SeatResponse], status_code=status.HTTP_201_CREATED)
def create_seats_bulk(
    event_id: int,
    seats_in: List[SeatCreate],
    db: Session = Depends(get_db),
):
    """Create multiple seats for an event"""
    # Check if event exists
    event = db.query(event_crud.model).filter(
        event_crud.model.event_id == event_id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    seats_data = []
    for seat_in in seats_in:
        seat_data = seat_in.dict()
        seat_data['event_id'] = event_id
        seats_data.append(SeatCreate(**seat_data))
    
    seats = seat_crud.bulk_create(db, seats_data=seats_data)
    return seats

@router.put("/{event_id}/seats/{seat_id}", response_model=SeatResponse)
def update_seat(
    event_id: int,
    seat_id: int,
    seat_in: SeatUpdate,
    db: Session = Depends(get_db),
):
    """Update seat"""
    # Check if event exists
    event = db.query(event_crud.model).filter(
        event_crud.model.event_id == event_id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    seat = seat_crud.get(db, id=seat_id)
    if not seat or seat.event_id != event_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seat not found"
        )
    
    seat = seat_crud.update(db, db_obj=seat, obj_in=seat_in)
    return seat

@router.delete("/{event_id}/seats/{seat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_seat(
    event_id: int,
    seat_id: int,
    db: Session = Depends(get_db),
):
    """Delete seat"""
    # Check if event exists
    event = db.query(event_crud.model).filter(
        event_crud.model.event_id == event_id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    seat = seat_crud.get(db, id=seat_id)
    if not seat or seat.event_id != event_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seat not found"
        )
    
    seat_crud.delete(db, id=seat_id)
    return None