from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.seat import Seat, SeatStatus
from app.schemas.seat import SeatCreate, SeatUpdate

class CRUDSeat(CRUDBase[Seat, SeatCreate, SeatUpdate]):
    def get_by_event(self, db: Session, *, event_id: int) -> List[Seat]:
        return db.query(Seat).filter(Seat.event_id == event_id).all()
    
    def get_available_by_event(self, db: Session, *, event_id: int) -> List[Seat]:
        return db.query(Seat).filter(
            Seat.event_id == event_id,
            Seat.status == SeatStatus.AVAILABLE
        ).all()
    
    def get_by_section(self, db: Session, *, event_id: int, section: str) -> List[Seat]:
        return db.query(Seat).filter(
            Seat.event_id == event_id,
            Seat.section == section
        ).all()
    
    def book_seat(self, db: Session, *, seat_id: int, order_id: int) -> Optional[Seat]:
        seat = db.query(Seat).filter(Seat.seat_id == seat_id).first()
        if seat and seat.status == SeatStatus.AVAILABLE:
            seat.status = SeatStatus.BOOKED
            seat.order_id = order_id
            from datetime import datetime
            seat.booked_at = datetime.utcnow()
            db.commit()
            db.refresh(seat)
            return seat
        return None
    
    def bulk_create(self, db: Session, *, seats_data: List[SeatCreate]) -> List[Seat]:
        seats = [Seat(**seat_data.dict()) for seat_data in seats_data]
        db.bulk_save_objects(seats)
        db.commit()
        return seats

seat = CRUDSeat(Seat)
