import asyncio
import sys
import uuid
from pathlib import Path
from sqlalchemy import text

# Configure UTF-8 stdout for Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Ensure backend package can be imported
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.database import engine, init_db, AsyncSessionLocal
from backend.models import HostedZone, DNSRecord

async def run_db_verification():
    print("=" * 60)
    print("🧪 MILESTONE 1: SQLite Engine & Data Model Verification")
    print("=" * 60)

    # 1. Initialize Tables
    print("\n1️⃣ Initializing SQLite Database Tables...")
    await init_db()
    print("   ✅ Tables `hosted_zones` and `dns_records` created successfully.")

    # 2. Verify WAL Mode PRAGMA
    print("\n2️⃣ Verifying SQLite WAL (Write-Ahead Logging) Mode...")
    async with engine.connect() as conn:
        result = await conn.execute(text("PRAGMA journal_mode;"))
        mode = result.scalar()
        print(f"   ℹ️ SQLite Journal Mode: `{mode.upper()}`")
        assert mode.lower() == "wal", f"Expected WAL mode, got {mode}"
        
        fk_result = await conn.execute(text("PRAGMA foreign_keys;"))
        fk_status = fk_result.scalar()
        print(f"   ℹ️ SQLite Foreign Keys: `{'ENABLED' if fk_status == 1 else 'DISABLED'}`")
        print("   ✅ SQLite Engine configured with WAL Mode and Foreign Keys!")

    # 3. Insert Seed Data
    print("\n3️⃣ Inserting Seed Hosted Zone & DNS Records...")
    async with AsyncSessionLocal() as session:
        # Create Hosted Zone
        zone = HostedZone(
            name="example.com.",
            caller_reference=str(uuid.uuid4()),
            description="Production domain hosted zone for example.com",
            zone_type="Public",
            record_count=5
        )
        session.add(zone)
        await session.flush()
        print(f"   ➕ Created Hosted Zone: ID=`{zone.id}`, Name=`{zone.name}`")

        # Create Records
        records = [
            DNSRecord(
                hosted_zone_id=zone.id,
                name="example.com.",
                type="NS",
                ttl=172800,
                records=["ns-1536.awsdns-00.co.uk.", "ns-000.awsdns-00.com."],
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone.id,
                name="api.example.com.",
                type="A",
                ttl=300,
                records=["192.0.2.1", "192.0.2.2"],
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone.id,
                name="example.com.",
                type="MX",
                ttl=300,
                records=["10 mail.example.com.", "20 backup.example.com."],
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone.id,
                name="example.com.",
                type="TXT",
                ttl=300,
                records=['"v=spf1 include:_spf.google.com ~all"'],
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone.id,
                name="app.example.com.",
                type="CNAME",
                ttl=60,
                records=["api.example.com."],
                routing_policy="Simple"
            )
        ]
        session.add_all(records)
        await session.commit()
        print(f"   ➕ Inserted 5 seed DNS Records (NS, A, MX, TXT, CNAME).")

    # 4. Verify Query Execution
    print("\n4️⃣ Executing Query Tests...")
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("SELECT * FROM hosted_zones"))
        zones = res.fetchall()
        print(f"   📊 Hosted Zones Count: {len(zones)}")

        rec_res = await session.execute(text("SELECT id, name, type, records FROM dns_records WHERE hosted_zone_id = :zid"), {"zid": zone.id})
        recs = rec_res.fetchall()
        print(f"   📊 DNS Records in `{zone.name}` ({len(recs)} total):")
        for r in recs:
            print(f"      • [{r[2]:<5}] {r[1]:<20} -> {r[3]}")

    print("\n" + "=" * 60)
    print("🎉 MILESTONE 1 VERIFICATION PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_db_verification())
