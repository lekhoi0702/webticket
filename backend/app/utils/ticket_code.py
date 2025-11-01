from datetime import datetime
import random
import string

def generate_ticket_code() -> str:
    """Generate unique ticket code"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"TKT-{timestamp}-{random_str}"

def generate_order_number() -> str:
    """Generate unique order number"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ORD-{timestamp}-{random_str}"
