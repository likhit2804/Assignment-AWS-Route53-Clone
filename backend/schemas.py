import re
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime

# Enums
RecordType = Literal["A", "AAAA", "CNAME", "MX", "TXT", "NS", "PTR", "SRV", "CAA"]
RoutingPolicy = Literal["Simple", "Weighted", "Latency", "Failover", "Geolocation", "Multivalue Answer"]
ZoneType = Literal["Public", "Private"]

# -------------------------------------------------------------------
# PRE-COMPILED REGEX PATTERNS (Industry Best Practice for Performance)
# -------------------------------------------------------------------
RE_IPV4 = re.compile(r'^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.){3}(25[0-5]|(2[0-4]|1\d|[1-9]|)\d)$')
RE_IPV6 = re.compile(r'^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$')
RE_FQDN = re.compile(r'^(?!:\/\/)(?=.{1,253}$)(([a-zA-Z0-9-_]{1,63}\.)+[a-zA-Z]{2,}\.?)$')

# -------------------------------------------------------------------
# HOSTED ZONE SCHEMAS
# -------------------------------------------------------------------

class HostedZoneBase(BaseModel):
    name: str = Field(..., example="example.com.", description="Domain name (FQDN with trailing dot)")
    description: Optional[str] = Field(None, example="Production Hosted Zone")
    zone_type: ZoneType = Field("Public", description="Public or Private Hosted Zone")
    vpcs: Optional[List[str]] = Field(default=[], description="AWS VPC IDs for Private Hosted Zones")

    @field_validator("name", mode="after")
    @classmethod
    def validate_domain_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Hosted Zone domain name cannot be empty.")
        if not v.endswith("."):
            v += "."
        if len(v) > 253:
            raise ValueError(f"Domain name exceeds RFC 1035 limit of 253 characters (got {len(v)}).")
        if not RE_FQDN.match(v):
            raise ValueError(f"Invalid domain name format per RFC 1035: '{v}'")
        return v

class HostedZoneCreate(HostedZoneBase):
    caller_reference: Optional[str] = Field(None, description="Unique reference string for request idempotency")

class HostedZoneUpdate(BaseModel):
    description: Optional[str] = None

class HostedZoneResponse(HostedZoneBase):
    id: str
    caller_reference: str
    record_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# -------------------------------------------------------------------
# DNS RECORD SCHEMAS & RFC VALIDATORS
# -------------------------------------------------------------------

class DNSRecordBase(BaseModel):
    name: str = Field(..., example="api.example.com.", description="Record domain name")
    type: RecordType = Field(..., example="A", description="DNS Record Type")
    ttl: int = Field(300, ge=0, le=2147483647, description="Time-To-Live in seconds")
    records: List[str] = Field(..., example=["192.0.2.1"], description="List of record values")
    routing_policy: RoutingPolicy = Field("Simple", description="AWS Route53 Routing Policy")
    weight: Optional[int] = Field(None, ge=0, le=255, description="Weight for Weighted Routing Policy")
    region: Optional[str] = Field(None, description="AWS Region for Latency Routing Policy")
    health_check_id: Optional[str] = Field(None, description="Health Check ID")
    set_identifier: Optional[str] = Field(None, description="Set Identifier for Routing Policy")

    @field_validator("name", mode="after")
    @classmethod
    def validate_record_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Record name cannot be empty.")
        if not v.endswith("."):
            v += "."
        if len(v) > 253:
            raise ValueError(f"Record domain name exceeds RFC 1035 limit of 253 characters.")
        return v

    @model_validator(mode="after")
    def validate_record_values_per_type(self):
        rec_type = self.type
        values = self.records

        if not values:
            raise ValueError(f"At least one value is required for record type '{rec_type}'.")

        for val in values:
            val_str = val.strip()
            if rec_type == "A":
                if not RE_IPV4.match(val_str):
                    raise ValueError(f"Invalid IPv4 address '{val_str}' for A record.")
            
            elif rec_type == "AAAA":
                if not RE_IPV6.match(val_str) and ":" not in val_str:
                    raise ValueError(f"Invalid IPv6 address '{val_str}' for AAAA record.")

            elif rec_type in ["CNAME", "NS", "PTR"]:
                if len(values) > 1 and rec_type == "CNAME":
                    raise ValueError("CNAME records cannot have multiple values.")
                if not RE_FQDN.match(val_str):
                    raise ValueError(f"Invalid target domain '{val_str}' for {rec_type} record.")

            elif rec_type == "MX":
                parts = val_str.split(maxsplit=1)
                if len(parts) != 2 or not parts[0].isdigit():
                    raise ValueError(f"MX record value '{val_str}' must be formatted as '<priority> <host>' (e.g., '10 mail.example.com.').")
                prio = int(parts[0])
                if not (0 <= prio <= 65535):
                    raise ValueError(f"MX priority must be between 0 and 65535, got {prio}.")

            elif rec_type == "SRV":
                parts = val_str.split(maxsplit=3)
                if len(parts) != 4 or not (parts[0].isdigit() and parts[1].isdigit() and parts[2].isdigit()):
                    raise ValueError(f"SRV record value '{val_str}' must be formatted as '<priority> <weight> <port> <target>'.")

        return self

class DNSRecordCreate(DNSRecordBase):
    pass

class DNSRecordUpdate(BaseModel):
    ttl: Optional[int] = Field(None, ge=0, le=2147483647)
    records: Optional[List[str]] = None
    routing_policy: Optional[RoutingPolicy] = None
    weight: Optional[int] = None
    region: Optional[str] = None
    health_check_id: Optional[str] = None
    set_identifier: Optional[str] = None

class DNSRecordResponse(DNSRecordBase):
    id: str
    hosted_zone_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
