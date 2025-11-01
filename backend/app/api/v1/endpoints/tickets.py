from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.ticket import ticket as ticket_crud
from app.schemas.ticket import TicketResponse, TicketCheckIn
from app.schemas.common import MessageResponse
from app.api.deps import get_current_active_user, require_admin
from app.models.user import User
from app.models.ticket import Ticket, TicketStatus

router = APIRouter()

@router.get("/", response_model=List[TicketResponse])
def get_my_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's tickets"""
    tickets = ticket_crud.get_by_user(db, user_id=current_user.user_id)
    return tickets

@router.get("/{ticket_code}", response_model=TicketResponse)
def get_ticket(
    ticket_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get ticket by code"""
    ticket = ticket_crud.get_by_code(db, ticket_code=ticket_code)
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check if user owns this ticket
    if ticket.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this ticket"
        )
    
    return ticket

@router.post("/checkin", response_model=TicketResponse)
def checkin_ticket(
    checkin_data: TicketCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Check-in ticket (Admin only)"""
    ticket = ticket_crud.check_in(db, ticket_code=checkin_data.ticket_code)
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket not found or already used"
        )
    
    return ticket

@router.get("/verify/{ticket_code}", response_model=TicketResponse)
def verify_ticket(
    ticket_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Verify ticket validity (Admin only)"""
    ticket = ticket_crud.get_by_code(db, ticket_code=ticket_code)
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    return ticket
