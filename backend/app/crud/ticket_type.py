from typing import List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.ticket_type import TicketType, TicketTypeStatus
from app.schemas.ticket_type import TicketTypeCreate, TicketTypeUpdate

class CRUDTicketType(CRUDBase[TicketType, TicketTypeCreate, TicketTypeUpdate]):
    def get_by_event(self, db: Session, *, event_id: int) -> List[TicketType]:
        return db.query(TicketType).filter(TicketType.event_id == event_id).all()
    
    def get_available_by_event(self, db: Session, *, event_id: int) -> List[TicketType]:
        return db.query(TicketType).filter(
            TicketType.event_id == event_id,
            TicketType.status == TicketTypeStatus.ACTIVE,
            TicketType.quantity_sold < TicketType.quantity_available
        ).all()
    
    def increase_sold(self, db: Session, *, ticket_type_id: int, quantity: int) -> TicketType:
        ticket_type = db.query(TicketType).filter(TicketType.ticket_type_id == ticket_type_id).first()
        if ticket_type:
            ticket_type.quantity_sold += quantity
            if ticket_type.quantity_sold >= ticket_type.quantity_available:
                ticket_type.status = TicketTypeStatus.SOLD_OUT
            db.commit()
            db.refresh(ticket_type)
        return ticket_type

ticket_type = CRUDTicketType(TicketType)