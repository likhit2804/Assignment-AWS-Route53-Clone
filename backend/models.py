import uuid
import json
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Index, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

def generate_zone_id() -> str:
    """Generate AWS Route53 style Hosted Zone ID prefix (e.g. Z0123456789ABC)."""
    return f"Z{uuid.uuid4().hex[:14].upper()}"

def generate_record_id() -> str:
    """Generate unique record identifier."""
    return f"R{uuid.uuid4().hex[:14].upper()}"

class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id = Column(String(32), primary_key=True, default=generate_zone_id)
    name = Column(String(255), nullable=False, index=True)
    caller_reference = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    zone_type = Column(String(20), nullable=False, default="Public")  # "Public" or "Private"
    vpcs = Column(JSON, nullable=True)  # List of VPC IDs for Private Hosted Zones
    record_count = Column(Integer, nullable=False, default=2)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationship to DNS Records
    records = relationship("DNSRecord", back_populates="hosted_zone", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "caller_reference": self.caller_reference,
            "description": self.description,
            "zone_type": self.zone_type,
            "vpcs": self.vpcs or [],
            "record_count": self.record_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class DNSRecord(Base):
    __tablename__ = "dns_records"

    id = Column(String(32), primary_key=True, default=generate_record_id)
    hosted_zone_id = Column(String(32), ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(10), nullable=False, index=True)  # A, AAAA, CNAME, MX, TXT, NS, PTR, SRV, CAA
    ttl = Column(Integer, nullable=False, default=300)
    records = Column(JSON, nullable=False)  # Stored as JSON list of strings
    routing_policy = Column(String(50), nullable=False, default="Simple")  # Simple, Weighted, Latency, Failover
    weight = Column(Integer, nullable=True)
    region = Column(String(50), nullable=True)
    health_check_id = Column(String(100), nullable=True)
    set_identifier = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationship back to HostedZone
    hosted_zone = relationship("HostedZone", back_populates="records")

    __table_args__ = (
        Index("idx_records_zone_type", "hosted_zone_id", "type"),
        Index("idx_records_zone_name", "hosted_zone_id", "name"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "hosted_zone_id": self.hosted_zone_id,
            "name": self.name,
            "type": self.type,
            "ttl": self.ttl,
            "records": self.records if isinstance(self.records, list) else json.loads(self.records or "[]"),
            "routing_policy": self.routing_policy,
            "weight": self.weight,
            "region": self.region,
            "health_check_id": self.health_check_id,
            "set_identifier": self.set_identifier,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
