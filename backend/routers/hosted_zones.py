"""
Router: Hosted Zones (Thin Router Pattern)
-------------------------------------------
Decision: Routers only handle HTTP concerns:
  1. Parse and validate incoming request (FastAPI + Pydantic does this automatically)
  2. Call the service function
  3. Return the HTTP response

All business logic and DB queries live in backend/services/hosted_zone_service.py
"""
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.schemas import HostedZoneCreate, HostedZoneUpdate, HostedZoneResponse
from backend.services import hosted_zone_service as svc

router = APIRouter(prefix="/api/hosted-zones", tags=["Hosted Zones"])

# Type alias for cleaner route signatures (Python 3.10+ Annotated pattern)
DB = Annotated[AsyncSession, Depends(get_db)]


@router.get("", summary="List all Hosted Zones")
async def list_hosted_zones(
    db: DB,
    search: Optional[str] = Query(None, description="Search by domain name"),
    zone_type: Optional[str] = Query(None, description="Filter by 'Public' or 'Private'"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(25, ge=1, le=100, description="Results per page"),
):
    """
    List all Hosted Zones with optional search, type filter, and pagination.
    Mirrors the Route53 hosted zones table: search bar + pagination.
    """
    skip = (page - 1) * limit
    zones, total = await svc.get_all_zones(db, search=search, zone_type=zone_type, skip=skip, limit=limit)
    return {
        "hosted_zones": [z.to_dict() for z in zones],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
    }


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create a Hosted Zone")
async def create_hosted_zone(db: DB, body: HostedZoneCreate):
    """Create a new Public or Private Hosted Zone."""
    zone = await svc.create_zone(db, body)
    return zone.to_dict()


@router.get("/{zone_id}", summary="Get a single Hosted Zone")
async def get_hosted_zone(zone_id: str, db: DB):
    """Retrieve details of a single Hosted Zone by ID."""
    zone = await svc.get_zone_by_id(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail=f"Hosted Zone '{zone_id}' not found.")
    return zone.to_dict()


@router.put("/{zone_id}", summary="Update a Hosted Zone")
async def update_hosted_zone(zone_id: str, body: HostedZoneUpdate, db: DB):
    """Update description of a Hosted Zone (only description is editable in Route53)."""
    zone = await svc.get_zone_by_id(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail=f"Hosted Zone '{zone_id}' not found.")
    updated = await svc.update_zone(db, zone, body)
    return updated.to_dict()


@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a Hosted Zone")
async def delete_hosted_zone(zone_id: str, db: DB):
    """
    Delete a Hosted Zone and all its DNS records via CASCADE DELETE.
    Mirrors Route53: deleting a zone removes all child records automatically.
    """
    zone = await svc.get_zone_by_id(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail=f"Hosted Zone '{zone_id}' not found.")
    await svc.delete_zone(db, zone)
