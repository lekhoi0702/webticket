from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from decimal import Decimal
from app.models.order import Order, OrderStatus, PaymentStatus
from app.models.order_item import OrderItem
from app.models.ticket import Ticket, TicketStatus
from app.models.event import Event
from app.models.ticket_type import TicketType
from app.models.seat import Seat, SeatStatus
from app.schemas.order import OrderCreate, OrderItemCreate
from app.crud.ticket import ticket as ticket_crud
from app.crud.ticket_type import ticket_type as ticket_type_crud
from app.crud.seat import seat as seat_crud
from app.utils.ticket_code import generate_order_number, generate_ticket_code

class BookingService:
    @staticmethod
    def create_order(
        db: Session,
        user_id: int,
        order_in: OrderCreate
    ) -> Order:
        """Create order with items and tickets"""
        
        # Validate event exists
        event = db.query(Event).filter(Event.event_id == order_in.event_id).first()
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        # Calculate totals and validate items
        subtotal = Decimal(0)
        order_items_data = []
        
        for item in order_in.items:
            if item.ticket_type_id:
                # Validate ticket type
                ticket_type = db.query(TicketType).filter(
                    TicketType.ticket_type_id == item.ticket_type_id
                ).first()
                
                if not ticket_type:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Ticket type {item.ticket_type_id} not found"
                    )
                
                # Check availability
                available = ticket_type.quantity_available - ticket_type.quantity_sold
                if available < item.quantity:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Not enough tickets available for {ticket_type.name}"
                    )
                
                item_total = ticket_type.price * item.quantity
                order_items_data.append({
                    'ticket_type_id': item.ticket_type_id,
                    'seat_id': None,
                    'quantity': item.quantity,
                    'unit_price': ticket_type.price,
                    'subtotal': item_total
                })
                subtotal += item_total
                
            elif item.seat_id:
                # Validate seat
                seat = db.query(Seat).filter(Seat.seat_id == item.seat_id).first()
                
                if not seat:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Seat {item.seat_id} not found"
                    )
                
                if seat.status != SeatStatus.AVAILABLE:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Seat {item.seat_id} is not available"
                    )
                
                order_items_data.append({
                    'ticket_type_id': None,
                    'seat_id': item.seat_id,
                    'quantity': 1,
                    'unit_price': seat.price,
                    'subtotal': seat.price
                })
                subtotal += seat.price
        
        # Create order
        order = Order(
            order_number=generate_order_number(),
            user_id=user_id,
            event_id=order_in.event_id,
            customer_name=order_in.customer_name,
            customer_email=order_in.customer_email,
            customer_phone=order_in.customer_phone,
            subtotal=subtotal,
            total_amount=subtotal,
            payment_method=order_in.payment_method.value if hasattr(order_in.payment_method, 'value') else str(order_in.payment_method).lower() if order_in.payment_method else "credit_card",
            payment_status=PaymentStatus.PENDING.value,
            order_status=OrderStatus.PENDING.value,
            notes=order_in.notes
        )
        db.add(order)
        db.flush()  # Get order_id without committing
        
        # Create order items and tickets
        for item_data in order_items_data:
            order_item = OrderItem(
                order_id=order.order_id,
                **item_data
            )
            db.add(order_item)
            db.flush()
            
            # Create tickets
            quantity = item_data['quantity']
            for _ in range(quantity):
                ticket = Ticket(
                    ticket_code=generate_ticket_code(),
                    order_id=order.order_id,
                    order_item_id=order_item.order_item_id,
                    user_id=user_id,
                    event_id=order_in.event_id,
                    price=item_data['unit_price'],
                    status=TicketStatus.ACTIVE
                )
                
                # Set ticket details
                if item_data['ticket_type_id']:
                    ticket_type = db.query(TicketType).filter(
                        TicketType.ticket_type_id == item_data['ticket_type_id']
                    ).first()
                    ticket.ticket_type_name = ticket_type.name
                    
                    # Update ticket type sold quantity
                    ticket_type.quantity_sold += 1
                    
                elif item_data['seat_id']:
                    seat = db.query(Seat).filter(Seat.seat_id == item_data['seat_id']).first()
                    ticket.seat_info = f"{seat.section}-{seat.row_label}-{seat.seat_number}"
                    
                    # Update seat status
                    seat.status = SeatStatus.BOOKED
                    seat.order_id = order.order_id
                
                db.add(ticket)
        
        # Update event tickets sold
        event.tickets_sold += sum(item['quantity'] for item in order_items_data)
        
        db.commit()
        db.refresh(order)
        
        return order
    
    @staticmethod
    def cancel_order(db: Session, order_id: int) -> Order:
        """Cancel order and release tickets/seats"""
        order = db.query(Order).filter(Order.order_id == order_id).first()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        order_status_val = order.order_status if isinstance(order.order_status, str) else (order.order_status.value if hasattr(order.order_status, 'value') else str(order.order_status))
        if order_status_val.lower() == OrderStatus.CANCELLED.value.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order already cancelled"
            )
        
        # Cancel tickets
        tickets = db.query(Ticket).filter(Ticket.order_id == order_id).all()
        for ticket in tickets:
            ticket.status = TicketStatus.CANCELLED
        
        # Release seats
        seats = db.query(Seat).filter(Seat.order_id == order_id).all()
        for seat in seats:
            seat.status = SeatStatus.AVAILABLE
            seat.order_id = None
            seat.booked_at = None
        
        # Update ticket type quantities
        order_items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
        for item in order_items:
            if item.ticket_type_id:
                ticket_type = db.query(TicketType).filter(
                    TicketType.ticket_type_id == item.ticket_type_id
                ).first()
                if ticket_type:
                    ticket_type.quantity_sold -= item.quantity
        
        # Update event tickets sold
        event = db.query(Event).filter(Event.event_id == order.event_id).first()
        if event:
            total_quantity = sum(item.quantity for item in order_items)
            event.tickets_sold -= total_quantity
        
        # Update order status
        order.order_status = OrderStatus.CANCELLED.value
        order.payment_status = PaymentStatus.CANCELLED.value
        
        db.commit()
        db.refresh(order)
        
        return order