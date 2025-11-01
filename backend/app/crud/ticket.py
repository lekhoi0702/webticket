from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import random
import string
from app.crud.base import CRUDBase
from app.models.ticket import Ticket, TicketStatus
from app.schemas.ticket import TicketResponse

class CRUDTicket(CRUDBase[Ticket, dict, dict]):
    def generate_ticket_code(self) -> str:
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        return f"TKT-{timestamp}-{random_str}"
    
    def get_by_code(self, db: Session, *, ticket_code: str) -> Optional[Ticket]:
        return db.query(Ticket).filter(Ticket.ticket_code == ticket_code).first()
    
    def get_by_user(self, db: Session, *, user_id: int) -> List[Ticket]:
        return db.query(Ticket).filter(Ticket.user_id == user_id).order_by(Ticket.created_at.desc()).all()
    
    def get_by_order(self, db: Session, *, order_id: int) -> List[Ticket]:
        return db.query(Ticket).filter(Ticket.order_id == order_id).all()
    
    def get_by_event(self, db: Session, *, event_id: int) -> List[Ticket]:
        return db.query(Ticket).filter(Ticket.event_id == event_id).all()
    
    def check_in(self, db: Session, *, ticket_code: str) -> Optional[Ticket]:
        ticket = self.get_by_code(db, ticket_code=ticket_code)
        if ticket and ticket.status == TicketStatus.ACTIVE:
            ticket.status = TicketStatus.USED
            ticket.checked_in_at = datetime.utcnow()
            db.commit()
            db.refresh(ticket)
            return ticket
        return None
    
    def cancel_tickets_by_order(self, db: Session, *, order_id: int) -> int:
        tickets = self.get_by_order(db, order_id=order_id)
        count = 0
        for ticket in tickets:
            if ticket.status == TicketStatus.ACTIVE:
                ticket.status = TicketStatus.CANCELLED
                count += 1
        if count > 0:
            db.commit()
        return count

ticket = CRUDTicket(Ticket)