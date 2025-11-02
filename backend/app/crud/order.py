from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import random
import string
from app.crud.base import CRUDBase
from app.models.order import Order, OrderStatus, PaymentStatus
from app.schemas.order import OrderCreate

class CRUDOrder(CRUDBase[Order, OrderCreate, dict]):
    def generate_order_number(self) -> str:
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"ORD-{timestamp}-{random_str}"
    
    def get_by_user(self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
        return db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    
    def get_by_order_number(self, db: Session, *, order_number: str) -> Optional[Order]:
        return db.query(Order).filter(Order.order_number == order_number).first()
    
    def update_payment_status(
        self, db: Session, *, order_id: int, status: PaymentStatus, transaction_id: Optional[str] = None
    ) -> Optional[Order]:
        order = db.query(Order).filter(Order.order_id == order_id).first()
        if order:
            status_val = status.value if isinstance(status, PaymentStatus) else str(status).lower()
            order.payment_status = status_val
            if transaction_id:
                order.transaction_id = transaction_id
            if status_val.lower() == PaymentStatus.COMPLETED.value.lower():
                order.paid_at = datetime.utcnow()
                order.order_status = OrderStatus.CONFIRMED.value
            db.commit()
            db.refresh(order)
        return order
    
    def cancel_order(self, db: Session, *, order_id: int) -> Optional[Order]:
        order = db.query(Order).filter(Order.order_id == order_id).first()
        if order:
            order.order_status = OrderStatus.CANCELLED.value
            order.payment_status = PaymentStatus.CANCELLED.value
            db.commit()
            db.refresh(order)
        return order

order = CRUDOrder(Order)