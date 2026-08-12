import sys
from pathlib import Path
from pydantic import ValidationError

# Configure UTF-8 for Windows Console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.schemas import HostedZoneCreate, DNSRecordCreate

def test_validation():
    print("=" * 60)
    print("🧪 STEP 2.1: Pydantic v2 DNS Record Validation Test")
    print("=" * 60)

    # 1. Test Valid Hosted Zone
    print("\n1️⃣ Testing Valid Hosted Zone Creation...")
    zone_data = HostedZoneCreate(name="example.com", description="Test Zone")
    print(f"   ✅ Auto-appended trailing dot: `{zone_data.name}`")
    assert zone_data.name == "example.com."

    # 2. Test Valid A Record
    print("\n2️⃣ Testing Valid A Record...")
    a_rec = DNSRecordCreate(name="api.example.com", type="A", ttl=300, records=["192.0.2.1", "192.0.2.2"])
    print(f"   ✅ Valid A Record created for `{a_rec.name}` -> {a_rec.records}")

    # 3. Test Invalid A Record IP
    print("\n3️⃣ Testing Invalid A Record IP (999.999.999.999)...")
    try:
        DNSRecordCreate(name="bad.example.com", type="A", ttl=300, records=["999.999.999.999"])
        print("   ❌ FAILED: Invalid IP was accepted!")
        sys.exit(1)
    except ValidationError as e:
        print(f"   ✅ Successfully caught 422 Validation Error: {e.errors()[0]['msg']}")

    # 4. Test Valid MX Record
    print("\n4️⃣ Testing Valid MX Record...")
    mx_rec = DNSRecordCreate(name="example.com", type="MX", ttl=300, records=["10 mail.example.com."])
    print(f"   ✅ Valid MX Record created -> {mx_rec.records}")

    # 5. Test Invalid MX Record format (missing priority)
    print("\n5️⃣ Testing Invalid MX Record format (missing priority)...")
    try:
        DNSRecordCreate(name="example.com", type="MX", ttl=300, records=["mail.example.com."])
        print("   ❌ FAILED: Malformed MX record was accepted!")
        sys.exit(1)
    except ValidationError as e:
        print(f"   ✅ Successfully caught 422 Validation Error: {e.errors()[0]['msg']}")

    print("\n" + "=" * 60)
    print("🎉 STEP 2.1 SCHEMAS VALIDATION TEST PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    test_validation()
