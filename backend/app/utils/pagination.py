import math
from typing import Any, Iterable


def paginate(items: Iterable[Any], total: int, page: int, size: int) -> dict:
    pages = math.ceil(total / size) if size else 0
    return {
        "items": list(items),
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }
