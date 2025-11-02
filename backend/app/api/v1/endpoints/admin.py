from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime
from app.core.database import get_db
from app.crud.order import order as order_crud
from app.crud.ticket import ticket as ticket_crud
from app.schemas.order import OrderResponse
from app.schemas.user import UserResponse
from app.schemas.common import PaginatedResponse
# from app.api.deps import require_admin  # Temporarily disabled for testing
from app.models.user import User
from app.models.order import Order, OrderStatus, PaymentStatus
from app.models.ticket import Ticket, TicketStatus
from app.models.event import Event
from app.utils.pagination import paginate

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    # current_user: User = Depends(require_admin)  # Temporarily disabled for testing
):
    """Get dashboard statistics"""
    # Total orders
    total_orders = db.query(Order).count()
    
    # Total revenue
    total_revenue = db.query(func.sum(Order.total_amount)).filter(
        Order.payment_status.ilike(PaymentStatus.COMPLETED.value)
    ).scalar() or 0
    
    # Total tickets sold
    total_tickets = db.query(Ticket).filter(
        Ticket.status.in_([TicketStatus.ACTIVE, TicketStatus.USED])
    ).count()
    
    # Orders today
    today = datetime.now().date()
    orders_today = db.query(Order).filter(
        func.date(Order.created_at) == today
    ).count()
    
    # Revenue this month
    this_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0)
    revenue_this_month = db.query(func.sum(Order.total_amount)).filter(
        Order.payment_status.ilike(PaymentStatus.COMPLETED.value),
        Order.created_at >= this_month_start
    ).scalar() or 0
    
    # Upcoming events
    upcoming_events = db.query(Event).filter(
        Event.event_date >= datetime.now().date(),
        Event.status == "published"
    ).count()
    
    # Recent orders
    recent_orders = db.query(Order).order_by(
        desc(Order.created_at)
    ).limit(10).all()
    
    return {
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "total_tickets": total_tickets,
        "orders_today": orders_today,
        "revenue_this_month": float(revenue_this_month),
        "upcoming_events": upcoming_events,
        "recent_orders": recent_orders
    }

@router.get("/orders", response_model=PaginatedResponse[OrderResponse])
def get_all_orders(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[OrderStatus] = None,
    payment_status: Optional[PaymentStatus] = None,
    db: Session = Depends(get_db),
    # current_user: User = Depends(require_admin)  # Temporarily disabled for testing
):
    """Get all orders with filters (Admin only)"""
    skip = (page - 1) * size
    
    query = db.query(Order)
    
    if status:
        status_val = status.value if isinstance(status, OrderStatus) else str(status).lower()
        query = query.filter(Order.order_status.ilike(status_val))
    if payment_status:
        payment_status_val = payment_status.value if isinstance(payment_status, PaymentStatus) else str(payment_status).lower()
        query = query.filter(Order.payment_status.ilike(payment_status_val))
    
    total = query.count()
    orders = query.order_by(desc(Order.created_at)).offset(skip).limit(size).all()
    
    return paginate(orders, total, page, size)

@router.put("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    order_status: OrderStatus,
    payment_status: Optional[PaymentStatus] = None,
    db: Session = Depends(get_db),
    # current_user: User = Depends(require_admin)  # Temporarily disabled for testing
):
    """Update order status (Admin only)"""
    order = db.query(Order).filter(Order.order_id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    order.order_status = order_status.value if isinstance(order_status, OrderStatus) else str(order_status).lower()
    if payment_status:
        order.payment_status = payment_status.value if isinstance(payment_status, PaymentStatus) else str(payment_status).lower()
    
    db.commit()
    db.refresh(order)
    
    return order

@router.get("/users", response_model=PaginatedResponse[UserResponse])
def get_all_users(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    # current_user: User = Depends(require_admin)  # Temporarily disabled for testing
):
    """Get all users (Admin only)"""
    skip = (page - 1) * size
    
    total = db.query(User).count()
    users = db.query(User).offset(skip).limit(size).all()
    
    return paginate(users, total, page, size)

@router.get("/events/stats/{event_id}")
def get_event_stats(
    event_id: int,
    db: Session = Depends(get_db),
    # current_user: User = Depends(require_admin)  # Temporarily disabled for testing
):
    """Get statistics for a specific event"""
    event = db.query(Event).filter(Event.event_id == event_id).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Total tickets sold
    tickets_sold = db.query(Ticket).filter(
        Ticket.event_id == event_id,
        Ticket.status.in_([TicketStatus.ACTIVE, TicketStatus.USED])
    ).count()
    
    # Total revenue
    revenue = db.query(func.sum(Order.total_amount)).filter(
        Order.event_id == event_id,
        Order.payment_status.ilike(PaymentStatus.COMPLETED.value)
    ).scalar() or 0
    
    # Tickets by status
    tickets_by_status = db.query(
        Ticket.status, func.count(Ticket.ticket_id)
    ).filter(
        Ticket.event_id == event_id
    ).group_by(Ticket.status).all()
    
    return {
        "event": event,
        "tickets_sold": tickets_sold,
        "total_revenue": float(revenue),
        "capacity_percentage": (tickets_sold / event.total_capacity * 100) if event.total_capacity > 0 else 0,
        "tickets_by_status": {status: count for status, count in tickets_by_status}
    }