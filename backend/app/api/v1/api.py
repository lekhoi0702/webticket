from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, events, tickets, orders, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(events.router, prefix="/events", tags=["Events"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["Tickets"])
api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])