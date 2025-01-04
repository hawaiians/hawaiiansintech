from typing import Optional
from fastapi import APIRouter, HTTPException
from backend.firebase_config import db
from backend.models import MemberPublic
from fastapi import APIRouter, HTTPException, Query
from backend.models import MemberPublic

router = APIRouter(prefix="/members", tags=["members"])


@router.get("", response_model=dict)
async def list_members(
    limit: int = Query(default=10, le=100), cursor: Optional[str] = Query(default=None)
):
    base_query = db.collection("members").where("status", "==", "approved")

    if cursor:
        cursor_doc = db.collection("members").document(cursor).get()
        if not cursor_doc.exists:
            raise HTTPException(status_code=400, detail="Invalid cursor")
        base_query = base_query.start_after(cursor_doc)

    docs = base_query.limit(limit + 1).stream()

    members = []
    for i, doc in enumerate(docs):
        if i < limit:
            member_data = doc.to_dict()
            member_data["id"] = doc.id
            members.append(MemberPublic(**member_data))

    # Pagination metadata
    total_query = base_query.count()
    total = total_query.get()[0][0].value
    has_more = len(members) == limit
    next_cursor = members[-1].id if has_more and members else None

    return {
        "members": members,
        "next_cursor": next_cursor,
        "has_more": has_more,
        "total": total,
    }


@router.get("/{member_id}", response_model=MemberPublic)
def get_member(member_id: str):
    doc_ref = db.collection("members").document(member_id)
    doc = doc_ref.get()
    if doc.exists:
        return MemberPublic(**doc.to_dict())
    raise HTTPException(status_code=404, detail="member not found")
