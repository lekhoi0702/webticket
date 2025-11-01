from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.order import order as order_crud
from app.schemas.order import OrderCreate, OrderResponse
from app.schemas.common import MessageResponse, PaginatedResponse
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.order import Order, OrderStatus, PaymentStatus
from app.services.booking import BookingService
from app.utils.pagination import paginate

router = APIRouter()

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create new order"""
    try:
        order = BookingService.create_order(
            db=db,
            user_id=current_user.user_id,
            order_in=order_in
        )
        return order
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/", response_model=PaginatedResponse[OrderResponse])
def get_my_orders(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's orders"""
    skip = (page - 1) * size
    
    orders = order_crud.get_by_user(
        db,
        user_id=current_user.user_id,
        skip=skip,
        limit=size
    )
    
    total = db.query(Order).filter(Order.user_id == current_user.user_id).count()
    
    return paginate(orders, total, page, size)

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get order by ID"""
    order = db.query(Order).filter(Order.order_id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user owns this order
    if order.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this order"
        )
    
    return order

@router.get("/number/{order_number}", response_model=OrderResponse)
def get_order_by_number(
    order_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get order by order number"""
    order = order_crud.get_by_order_number(db, order_number=order_number)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user owns this order
    if order.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this order"
        )
    
    return order

@router.put("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Cancel order"""
    order = db.query(Order).filter(Order.order_id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user owns this order
    if order.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this order"
        )
    
    # Check if order can be cancelled
    if order.order_status == OrderStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order is already cancelled"
        )
    
    if order.payment_status == PaymentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel paid order. Please request refund."
        )
    
    try:
        order = BookingService.cancel_order(db=db, order_id=order_id)
        return order
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{order_id}/payment", response_model=OrderResponse)
def confirm_payment(
    order_id: int,
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Confirm payment for order"""
    order = db.query(Order).filter(Order.order_id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user owns this order
    if order.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this order"
        )
    
    if order.payment_status == PaymentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment already completed"
        )
    
    # Update payment status
    order = order_crud.update_payment_status(
        db,
        order_id=order_id,
        status=PaymentStatus.COMPLETED,
        transaction_id=transaction_id
    )
    
    # TODO: Send confirmation email
    # await EmailService.send_order_confirmation(order, order.tickets)
    
    return order

