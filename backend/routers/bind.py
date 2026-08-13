"""
Router: BIND Import / Export & JSON Export Endpoints (Bonus Feature)
--------------------------------------------------------------------
Allows importing DNS records from standard RFC 1035 BIND zone files,
and exporting hosted zones into BIND .zone text or JSON formats.
"""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from backend.database import get_db
from backend.services import hosted_zone_service as zone_svc
from backend.services import record_service as rec_svc
from backend.services.bind_parser import parse_bind_zone, export_bind_zone
from backend.schemas import DNSRecordCreate

router = APIRouter(prefix="/api/hosted-zones/{zone_id}", tags=["BIND Import / Export"])

DB = Annotated[AsyncSession, Depends(get_db)]


class RawZoneImport(BaseModel):
    zone_text: str


@router.post("/import-bind", summary="Import records from BIND zone file")
async def import_bind_zone(
    zone_id: str,
    db: DB,
    file: UploadFile = File(None),
    body: RawZoneImport = None,
):
    """
    Import DNS records into a Hosted Zone from a BIND .zone file upload or raw text.
    Validates each record with Pydantic schemas before bulk insertion.
    """
    zone = await zone_svc.get_zone_by_id(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail=f"Hosted Zone '{zone_id}' not found.")

    zone_text = ""
    if file:
        content = await file.read()
        zone_text = content.decode("utf-8", errors="ignore")
    elif body and body.zone_text:
        zone_text = body.zone_text
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a .zone file upload or zone_text JSON payload.",
        )

    try:
        parsed = parse_bind_zone(zone_text, fallback_origin=zone.name)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse BIND zone file: {str(e)}",
        )

    imported_records = []
    skipped_count = 0

    for item in parsed.get("records", []):
        try:
            # Validate record data using Pydantic schema
            record_in = DNSRecordCreate(
                name=item["name"],
                type=item["type"],
                ttl=item["ttl"],
                records=item["records"],
                routing_policy=item.get("routing_policy", "Simple"),
            )
            created = await rec_svc.create_record(db, zone_id, record_in)
            imported_records.append(created.to_dict())
        except Exception:
            skipped_count += 1

    return {
        "message": f"Successfully imported {len(imported_records)} records into {zone.name}",
        "imported_count": len(imported_records),
        "skipped_count": skipped_count,
        "records": imported_records,
    }


@router.get("/export-bind", summary="Export Hosted Zone as BIND file")
async def export_bind(zone_id: str, db: DB):
    """
    Export all DNS records for a Hosted Zone in standard BIND .zone text format.
    Triggers a file download response in the browser.
    """
    zone = await zone_svc.get_zone_by_id(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail=f"Hosted Zone '{zone_id}' not found.")

    records, _ = await rec_svc.get_records_for_zone(db, zone_id, limit=500)
    record_dicts = [r.to_dict() for r in records]

    bind_text = export_bind_zone(zone.name, record_dicts)
    filename = f"{zone.name.rstrip('.')}.zone"

    return Response(
        content=bind_text,
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/export-json", summary="Export Hosted Zone as JSON")
async def export_json(zone_id: str, db: DB):
    """Export Hosted Zone metadata and all DNS records as structured JSON."""
    zone = await zone_svc.get_zone_by_id(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail=f"Hosted Zone '{zone_id}' not found.")

    records, total = await rec_svc.get_records_for_zone(db, zone_id, limit=500)

    return {
        "hosted_zone": zone.to_dict(),
        "total_records": total,
        "records": [r.to_dict() for r in records],
    }
