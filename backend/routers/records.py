"""
Router: DNS Records (Thin Router Pattern)
------------------------------------------
Nested under /api/hosted-zones/{zone_id}/records following REST conventions.
Zone ownership is enforced: record queries always scope to the zone_id parameter.
"""
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.schemas import DNSRecordCreate, DNSRecordUpdate
from backend.services import record_service as svc
from backend.services import hosted_zone_service as zone_svc

router = APIRouter(prefix="/api/hosted-zones/{zone_id}/records", tags=["DNS Records"])

DB = Annotated[AsyncSession, Depends(get_db)]


async def _get_zone_or_404(zone_id: str, db: AsyncSession):
    """Shared guard: ensure zone exists before any record operation."""
    zone = await zone_svc.get_zone_by_id(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail=f"Hosted Zone '{zone_id}' not found.")
    return zone


@router.get("", summary="List DNS Records for a Hosted Zone")
async def list_records(
    zone_id: str,
    db: DB,
    search: Optional[str] = Query(None, description="Search records by name"),
    record_type: Optional[str] = Query(None, description="Filter by record type (A, AAAA, MX...)"),
    page: int = Query(1, ge=1),
    limit: int = Query(300, ge=1, le=500),
):
    """
    List all DNS Records within a Hosted Zone.
    Supports name search and record type filtering (matching Route53 table filters).
    """
    await _get_zone_or_404(zone_id, db)
    skip = (page - 1) * limit
    records, total = await svc.get_records_for_zone(
        db, zone_id, search=search, record_type=record_type, skip=skip, limit=limit
    )
    return {
        "records": [r.to_dict() for r in records],
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create a DNS Record")
async def create_record(zone_id: str, body: DNSRecordCreate, db: DB):
    """
    Create a new DNS record within a Hosted Zone.
    Pydantic validation (RFC 1035) automatically rejects invalid values 
    with a 422 Unprocessable Entity response before reaching this handler.
    """
    await _get_zone_or_404(zone_id, db)
    record = await svc.create_record(db, zone_id, body)
    return record.to_dict()


@router.get("/{record_id}", summary="Get a single DNS Record")
async def get_record(zone_id: str, record_id: str, db: DB):
    """Retrieve a specific DNS record by ID within a zone."""
    await _get_zone_or_404(zone_id, db)
    record = await svc.get_record_by_id(db, zone_id, record_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Record '{record_id}' not found in zone '{zone_id}'.")
    return record.to_dict()


@router.put("/{record_id}", summary="Update a DNS Record")
async def update_record(zone_id: str, record_id: str, body: DNSRecordUpdate, db: DB):
    """Update TTL, values, or routing policy of an existing DNS record."""
    await _get_zone_or_404(zone_id, db)
    record = await svc.get_record_by_id(db, zone_id, record_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Record '{record_id}' not found.")
    updated = await svc.update_record(db, record, body)
    return updated.to_dict()


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a DNS Record")
async def delete_record(zone_id: str, record_id: str, db: DB):
    """Delete a DNS record and decrement the zone's record_count."""
    await _get_zone_or_404(zone_id, db)
    record = await svc.get_record_by_id(db, zone_id, record_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Record '{record_id}' not found.")
    await svc.delete_record(db, zone_id, record)
