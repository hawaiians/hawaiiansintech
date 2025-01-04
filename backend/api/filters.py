from typing import TypeVar, Type, Dict, Any, List
from fastapi import APIRouter
from backend.firebase_config import db
from backend.models import Focus, Filter, Industry

router = APIRouter(prefix="/filters", tags=["filters"])

T = TypeVar("T", bound=Filter)


async def get_filter_docs(
    collection_name: str, status: str, filter_cls: Type[T]
) -> List[T]:  # Changed from list[T] to List[T]
    base_query = db.collection(collection_name).where("status", "==", status)
    docs = base_query.stream()

    items: List[T] = []
    for doc in docs:
        item_data = filter_cls(**doc.to_dict(), id=doc.id)
        items.append(item_data)

    return items


@router.get("/focuses", response_model=dict)
async def list_focuses():
    return {
        "focuses": await get_filter_docs("focuses", "approved", Focus),
    }


@router.get("/industries", response_model=dict)
async def list_industries():
    return {
        "industries": await get_filter_docs("industries", "approved", Industry),
    }
