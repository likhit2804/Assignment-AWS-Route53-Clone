"""
Service Layer: DNS Record Business Logic
-----------------------------------------
Decision: Service layer abstracts all SQLAlchemy queries from HTTP routers.
"""
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update

from backend.models import DNSRecord, HostedZone
from backend.schemas import DNSRecordCreate, DNSRecordUpdate


async def get_records_for_zone(
    db: AsyncSession,
    zone_id: str,
    search: Optional[str] = None,
    record_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 300,
) -> tuple[List[DNSRecord], int]:
    """
    Fetch DNS records for a Hosted Zone with optional type filter and name search.
    
    Decision: Default limit=300 mirrors real AWS Route53 which loads up to 300 
    records in the records table view per zone. For zones with >300 records, 
    offset pagination kicks in.
    
    Decision: Compound index `idx_records_zone_type` on (hosted_zone_id, type)
    means filtering by both zone + type uses a B-tree O(log N) scan even 
    against millions of records across thousands of zones.
    """
    query = select(DNSRecord).where(DNSRecord.hosted_zone_id == zone_id)

    if search:
        query = query.where(DNSRecord.name.ilike(f"%{search}%"))
    if record_type:
        query = query.where(DNSRecord.type == record_type.upper())

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    query = query.offset(skip).limit(limit).order_by(DNSRecord.name.asc(), DNSRecord.type.asc())
    result = await db.execute(query)
    records = result.scalars().all()

    return list(records), total


async def get_record_by_id(
    db: AsyncSession, zone_id: str, record_id: str
) -> Optional[DNSRecord]:
    """Fetch a single DNS record by zone_id + record_id (prevents cross-zone access)."""
    result = await db.execute(
        select(DNSRecord).where(
            DNSRecord.id == record_id,
            DNSRecord.hosted_zone_id == zone_id
        )
    )
    return result.scalar_one_or_none()


async def create_record(
    db: AsyncSession, zone_id: str, data: DNSRecordCreate
) -> DNSRecord:
    """Create a new DNS Record and increment the zone's record_count."""
    record = DNSRecord(
        hosted_zone_id=zone_id,
        name=data.name,
        type=data.type,
        ttl=data.ttl,
        records=data.records,
        routing_policy=data.routing_policy,
        weight=data.weight,
        region=data.region,
        health_check_id=data.health_check_id,
        set_identifier=data.set_identifier,
    )
    db.add(record)
    await db.flush()

    # Increment record_count on the parent HostedZone
    await db.execute(
        update(HostedZone)
        .where(HostedZone.id == zone_id)
        .values(record_count=HostedZone.record_count + 1)
    )
    await db.refresh(record)
    return record


async def update_record(
    db: AsyncSession, record: DNSRecord, data: DNSRecordUpdate
) -> DNSRecord:
    """Update mutable fields of a DNS Record."""
    if data.ttl is not None:
        record.ttl = data.ttl
    if data.records is not None:
        record.records = data.records
    if data.routing_policy is not None:
        record.routing_policy = data.routing_policy
    if data.weight is not None:
        record.weight = data.weight
    if data.region is not None:
        record.region = data.region
    if data.health_check_id is not None:
        record.health_check_id = data.health_check_id
    if data.set_identifier is not None:
        record.set_identifier = data.set_identifier
    await db.flush()
    await db.refresh(record)
    return record


async def delete_record(db: AsyncSession, zone_id: str, record: DNSRecord) -> None:
    """Delete a DNS record and decrement the parent zone's record_count."""
    await db.delete(record)
    await db.execute(
        update(HostedZone)
        .where(HostedZone.id == zone_id)
        .values(record_count=HostedZone.record_count - 1)
    )
    await db.flush()
