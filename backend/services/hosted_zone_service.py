"""
Service Layer: Hosted Zone Business Logic
------------------------------------------
Decision: "Thin Routers" pattern (industry standard from Netflix Dispatch).
All DB queries, pagination, and search filtering live here — NOT in routers.
Routers only call service functions and return HTTP responses.
"""
import uuid
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, delete
from sqlalchemy.orm import selectinload

from backend.models import HostedZone, DNSRecord
from backend.schemas import HostedZoneCreate, HostedZoneUpdate


async def get_all_zones(
    db: AsyncSession,
    search: Optional[str] = None,
    zone_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 25,
) -> tuple[List[HostedZone], int]:
    """
    List Hosted Zones with optional search, type filter, and offset pagination.
    
    Decision: Offset-based pagination (skip/limit) chosen over cursor-based
    because Route53 UI uses simple page numbers, not infinite scroll.
    
    Decision: SQLAlchemy ilike() for case-insensitive search on the name column.
    This matches Route53's search-bar behaviour where typing 'example' finds 
    both 'Example.com.' and 'example.org.'.
    """
    query = select(HostedZone)

    # Dynamic filtering — only applied when parameters are provided
    if search:
        query = query.where(HostedZone.name.ilike(f"%{search}%"))
    if zone_type:
        query = query.where(HostedZone.zone_type == zone_type)

    # Total count for pagination metadata
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Actual paginated data
    query = query.offset(skip).limit(limit).order_by(HostedZone.created_at.desc())
    result = await db.execute(query)
    zones = result.scalars().all()

    return list(zones), total


async def get_zone_by_id(db: AsyncSession, zone_id: str) -> Optional[HostedZone]:
    """Fetch a single Hosted Zone by its ID."""
    result = await db.execute(select(HostedZone).where(HostedZone.id == zone_id))
    return result.scalar_one_or_none()


async def create_zone(db: AsyncSession, data: HostedZoneCreate) -> HostedZone:
    """
    Create a new Hosted Zone and seed default NS + SOA records.

    Decision: AWS Route53 automatically creates NS and SOA records for every
    new hosted zone. We replicate that behaviour here so the UI always shows
    at least 2 records immediately after creation.
    """
    zone = HostedZone(
        name=data.name,
        caller_reference=data.caller_reference or str(uuid.uuid4()),
        description=data.description,
        zone_type=data.zone_type,
        vpcs=data.vpcs or [],
        record_count=0,
    )
    db.add(zone)
    await db.flush()   # Get zone.id assigned before seeding records

    # Normalise domain name (ensure trailing dot)
    apex = data.name if data.name.endswith(".") else f"{data.name}."

    # Seed default NS record
    ns_record = DNSRecord(
        hosted_zone_id=zone.id,
        name=apex,
        type="NS",
        ttl=172800,
        records=[
            "ns-1.awsdns-01.com.",
            "ns-2.awsdns-01.net.",
            "ns-3.awsdns-01.org.",
            "ns-4.awsdns-01.co.uk.",
        ],
        routing_policy="Simple",
    )
    db.add(ns_record)

    # Seed default SOA record
    soa_record = DNSRecord(
        hosted_zone_id=zone.id,
        name=apex,
        type="SOA",
        ttl=900,
        records=[
            f"ns-1.awsdns-01.com. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"
        ],
        routing_policy="Simple",
    )
    db.add(soa_record)

    await db.flush()
    zone.record_count = 2
    await db.flush()
    await db.refresh(zone)
    return zone


async def update_zone(
    db: AsyncSession, zone: HostedZone, data: HostedZoneUpdate
) -> HostedZone:
    """Update mutable fields of a Hosted Zone (only description is editable)."""
    if data.description is not None:
        zone.description = data.description
    await db.flush()
    await db.refresh(zone)
    return zone


async def delete_zone(db: AsyncSession, zone: HostedZone) -> None:
    """
    Delete a Hosted Zone.
    
    Decision: SQLite CASCADE DELETE (enforced via PRAGMA foreign_keys=ON in database.py
    and ForeignKey(..., ondelete='CASCADE') in models.py) automatically deletes all
    child DNS records when a Hosted Zone is deleted. No manual record deletion needed.
    """
    await db.delete(zone)
    await db.flush()
