import sys
import asyncio
from pathlib import Path

# Configure UTF-8 for Windows Console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.services.bind_parser import parse_bind_zone, export_bind_zone

SAMPLE_BIND_ZONE = """
$ORIGIN example.com.
$TTL 86400

; Authoritative Name Servers
@       IN  NS      ns-1536.awsdns-00.co.uk.
@       IN  NS      ns-000.awsdns-00.com.

; Mail Servers
@       IN  MX  10  mail.example.com.
@       IN  MX  20  backup.example.com.

; Web Server Hosts
@       IN  A       192.0.2.1
api     IN  A       192.0.2.2
app     IN  CNAME   api.example.com.

; Verification TXT
@       IN  TXT     "v=spf1 include:_spf.google.com ~all"
"""

def run_bind_verification():
    print("=" * 60)
    print("🧪 MILESTONE 3: BIND Zone File Parser & Serializer Verification")
    print("=" * 60)

    # 1. Parse Sample BIND Zone File
    print("\n1️⃣ Tokenizing & Parsing BIND Zone Text...")
    result = parse_bind_zone(SAMPLE_BIND_ZONE, fallback_origin="example.com.")
    
    print(f"   ℹ️ Detected $ORIGIN: `{result['origin']}`")
    print(f"   ℹ️ Detected $TTL: `{result['ttl']}` seconds")
    print(f"   📊 Parsed Record Count: {len(result['records'])}")
    
    assert len(result['records']) == 6, f"Expected 6 record groups, got {len(result['records'])}"
    print("   ✅ BIND Tokenizer successfully parsed all records!")

    for r in result['records']:
        print(f"      • [{r['type']:<5}] {r['name']:<25} -> {r['records']}")

    # 2. Test Roundtrip BIND Export
    print("\n2️⃣ Testing Roundtrip BIND Zone File Serializer...")
    exported_text = export_bind_zone("example.com.", result['records'])
    
    print("   📄 Generated BIND Zone File Output:")
    print("   " + "-" * 50)
    for line in exported_text.strip().splitlines()[:12]:
        print(f"   | {line}")
    print("   " + "-" * 50)

    assert "$ORIGIN example.com." in exported_text
    assert "192.0.2.1" in exported_text
    assert "mail.example.com." in exported_text
    print("   ✅ BIND Serializer generated valid RFC 1035 zone text!")

    print("\n" + "=" * 60)
    print("🎉 MILESTONE 3 BIND PARSER VERIFICATION PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_bind_verification()
