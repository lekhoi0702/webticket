from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import date
from slugify import slugify
from app.crud.base import CRUDBase
from app.models.event import Event, EventStatus, EventCategory
from app.schemas.event import EventCreate, EventUpdate

class CRUDEvent(CRUDBase[Event, EventCreate, EventUpdate]):
    def get_by_slug(self, db: Session, *, slug: str) -> Optional[Event]:
        return db.query(Event).filter(Event.slug == slug).first()
    
    def create(self, db: Session, *, obj_in: EventCreate) -> Event:
        # Generate unique slug
        base_slug = slugify(obj_in.title)
        slug = base_slug
        counter = 1
        while self.get_by_slug(db, slug=slug):
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        db_obj = Event(
            **obj_in.dict(),
            slug=slug
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_multi_with_filters(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        category: Optional[EventCategory] = None,
        city: Optional[str] = None,
        status: Optional[EventStatus] = None,
        is_featured: Optional[bool] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
        search: Optional[str] = None
    ) -> List[Event]:
        query = db.query(Event)
        
        if category:
            query = query.filter(Event.category == category)
        if city:
            query = query.filter(Event.city == city)
        if status:
            query = query.filter(Event.status == status)
        if is_featured is not None:
            query = query.filter(Event.is_featured == is_featured)
        if from_date:
            query = query.filter(Event.event_date >= from_date)
        if to_date:
            query = query.filter(Event.event_date <= to_date)
        if search:
            query = query.filter(
                or_(
                    Event.title.contains(search),
                    Event.description.contains(search)
                )
            )
        
        return query.order_by(Event.event_date.desc()).offset(skip).limit(limit).all()
    
    def count_with_filters(
        self,
        db: Session,
        *,
        category: Optional[EventCategory] = None,
        city: Optional[str] = None,
        status: Optional[EventStatus] = None,
        is_featured: Optional[bool] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
        search: Optional[str] = None
    ) -> int:
        query = db.query(Event)
        
        if category:
            query = query.filter(Event.category == category)
        if city:
            query = query.filter(Event.city == city)
        if status:
            query = query.filter(Event.status == status)
        if is_featured is not None:
            query = query.filter(Event.is_featured == is_featured)
        if from_date:
            query = query.filter(Event.event_date >= from_date)
        if to_date:
            query = query.filter(Event.event_date <= to_date)
        if search:
            query = query.filter(
                or_(
                    Event.title.contains(search),
                    Event.description.contains(search)
                )
            )
        
        return query.count()

event = CRUDEvent(Event)