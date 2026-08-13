import asyncio
import sys
import random
from pathlib import Path

# Add backend directory to path so it can import models/database
sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend.database import AsyncSessionLocal, engine, Base
from backend.models import HostedZone, DNSRecord, generate_zone_id, generate_record_id

async def seed():
    print("Initializing clean database schema...")
    async with engine.begin() as conn:
        # Drop existing tables and recreate them to ensure fresh seed
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    print("Seeding hosted zones and records...")
    async with AsyncSessionLocal() as session:
        async with session.begin():
            # 1. Main example.com zone (Public Zone) with 35 DNS records to test records pagination
            zone_id_1 = generate_zone_id()
            zone_1 = HostedZone(
                id=zone_id_1,
                name="example.com",
                caller_reference="ref-example-com-seed",
                description="Production zone for example.com website and APIs",
                zone_type="Public",
                record_count=35
            )
            session.add(zone_1)

            # Standard base records for example.com
            records_1 = [
                DNSRecord(
                    id=generate_record_id(),
                    hosted_zone_id=zone_id_1,
                    name="example.com.",
                    type="NS",
                    ttl=172800,
                    records=["ns-1.awsdns-01.com.", "ns-2.awsdns-01.net.", "ns-3.awsdns-01.org.", "ns-4.awsdns-01.co.uk."],
                    routing_policy="Simple"
                ),
                DNSRecord(
                    id=generate_record_id(),
                    hosted_zone_id=zone_id_1,
                    name="example.com.",
                    type="SOA",
                    ttl=900,
                    records=["ns-1.awsdns-01.com. hostmaster.example.com. 1 7200 900 1209600 86400"],
                    routing_policy="Simple"
                ),
                DNSRecord(
                    id=generate_record_id(),
                    hosted_zone_id=zone_id_1,
                    name="example.com.",
                    type="TXT",
                    ttl=3600,
                    records=['"v=spf1 include:_spf.google.com ~all"'],
                    routing_policy="Simple"
                )
            ]

            # Generate 32 additional records inside example.com to test pagination
            record_types = ["A", "AAAA", "CNAME", "TXT", "MX"]
            for i in range(1, 33):
                name_prefix = f"service-{i:02d}"
                rec_type = random.choice(record_types)
                
                if rec_type == "A":
                    val = f"192.0.2.{i}"
                elif rec_type == "AAAA":
                    val = f"2001:db8::{i:x}"
                elif rec_type == "CNAME":
                    val = f"cdn-endpoint-{i:02d}.cloudfront.net."
                elif rec_type == "MX":
                    val = f"{10 * (i % 3 + 1)} mail-{i:02d}.example.com."
                else:  # TXT
                    val = f'"mock-txt-value-for-record-{i:02d}"'

                records_1.append(DNSRecord(
                    id=generate_record_id(),
                    hosted_zone_id=zone_id_1,
                    name=f"{name_prefix}.example.com.",
                    type=rec_type,
                    ttl=300,
                    records=[val],
                    routing_policy="Simple"
                ))
            
            session.add_all(records_1)

            # 2. Main internal.net (Private Zone)
            zone_id_2 = generate_zone_id()
            zone_2 = HostedZone(
                id=zone_id_2,
                name="internal.net",
                caller_reference="ref-internal-net-seed",
                description="Private VPC domain for microservices communication",
                zone_type="Private",
                vpcs=[{"vpc_id": "vpc-0a8b9c1d2e3f4a5b6", "vpc_region": "us-east-1"}],
                record_count=4
            )
            session.add(zone_2)

            records_2 = [
                DNSRecord(
                    id=generate_record_id(),
                    hosted_zone_id=zone_id_2,
                    name="internal.net.",
                    type="NS",
                    ttl=172800,
                    records=["ns-1.awsdns-01.com.", "ns-2.awsdns-01.net.", "ns-3.awsdns-01.org.", "ns-4.awsdns-01.co.uk."],
                    routing_policy="Simple"
                ),
                DNSRecord(
                    id=generate_record_id(),
                    hosted_zone_id=zone_id_2,
                    name="internal.net.",
                    type="SOA",
                    ttl=900,
                    records=["ns-1.awsdns-01.com. hostmaster.internal.net. 1 7200 900 1209600 86400"],
                    routing_policy="Simple"
                ),
                DNSRecord(
                    id=generate_record_id(),
                    hosted_zone_id=zone_id_2,
                    name="db.internal.net.",
                    type="A",
                    ttl=60,
                    records=["10.0.1.24"],
                    routing_policy="Simple"
                ),
                DNSRecord(
                    id=generate_record_id(),
                    hosted_zone_id=zone_id_2,
                    name="cache.internal.net.",
                    type="CNAME",
                    ttl=300,
                    records=["redis-cluster.internal.net."],
                    routing_policy="Simple"
                )
            ]
            session.add_all(records_2)

            # 3. Create 23 other Hosted Zones (mix of Public and Private) to test Hosted Zones pagination
            tlds = ["com", "org", "net", "io", "co", "dev", "sh"]
            for i in range(1, 24):
                z_name = f"dev-cluster-{i:02d}.{random.choice(tlds)}"
                z_type = "Private" if i % 4 == 0 else "Public"
                z_desc = f"Staging cluster {i:02d} sandbox zone"
                
                z_id = generate_zone_id()
                zone = HostedZone(
                    id=z_id,
                    name=z_name,
                    caller_reference=f"ref-dev-cluster-{i:02d}-seed",
                    description=z_desc,
                    zone_type=z_type,
                    vpcs=[{"vpc_id": f"vpc-1122334455aa{i:02d}", "vpc_region": "us-west-2"}] if z_type == "Private" else None,
                    record_count=2
                )
                session.add(zone)

                # Base records for this zone
                records_z = [
                    DNSRecord(
                        id=generate_record_id(),
                        hosted_zone_id=z_id,
                        name=f"{z_name}.",
                        type="NS",
                        ttl=172800,
                        records=["ns-1.awsdns-01.com.", "ns-2.awsdns-01.net."],
                        routing_policy="Simple"
                    ),
                    DNSRecord(
                        id=generate_record_id(),
                        hosted_zone_id=z_id,
                        name=f"{z_name}.",
                        type="SOA",
                        ttl=900,
                        records=[f"ns-1.awsdns-01.com. hostmaster.{z_name}. 1 7200 900 1209600 86400"],
                        routing_policy="Simple"
                    )
                ]
                session.add_all(records_z)

        await session.commit()
    print("Database successfully seeded with 25 Hosted Zones and 35 DNS Records inside example.com!")

if __name__ == "__main__":
    asyncio.run(seed())
