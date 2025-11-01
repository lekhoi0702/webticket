rom slugify import slugify
from sqlalchemy.orm import Session
from typing import Type
from app.core.database import Base

def generate_slug(text: str, model: Type[Base], db: Session, field_name: str = "slug") -> str:
    """
    Generate unique slug from text
    
    Args:
        text: Text to convert to slug
        model: SQLAlchemy model class
        db: Database session
        field_name: Name of the slug field in the model
    
    Returns:
        Unique slug string
    """
    base_slug = slugify(text)
    slug = base_slug
    counter = 1
    
    while db.query(model).filter(getattr(model, field_name) == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    return slug