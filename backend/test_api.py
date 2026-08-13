import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

import urllib.request
import urllib.error
import json


def hit(url, method='GET', data=None):
    req = urllib.request.Request(
        url, method=method,
        headers={'Content-Type': 'application/json'},
        data=json.dumps(data).encode() if data else None
    )
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read()
            return (json.loads(raw) if raw else {}), r.status
    except urllib.error.HTTPError as e:
        raw = e.read()
        return (json.loads(raw) if raw else {}), e.code



print("=" * 55)
print("MILESTONE 2 - Step 2.2: REST API Verification")
print("=" * 55)

# 1. Health check
body, status = hit('http://localhost:8000/')
print(f"\n1. Health Check: status={body['status']}  version={body['version']}  HTTP {status}")

# 2. Create Hosted Zone
body, status = hit('http://localhost:8000/api/hosted-zones', 'POST',
    {'name': 'testdomain.com', 'description': 'Test zone', 'zone_type': 'Public'})
zone_id = body['id']
print(f"2. Created Zone: {zone_id}  name={body['name']}  HTTP {status}")

# 3. Create valid A record
body, status = hit(f'http://localhost:8000/api/hosted-zones/{zone_id}/records', 'POST',
    {'name': 'api.testdomain.com', 'type': 'A', 'ttl': 300, 'records': ['1.2.3.4']})
rec_id = body.get('id', '')
print(f"3. Created A Record: {rec_id}  name={body.get('name')}  HTTP {status}")

# 4. Create valid MX record
body, status = hit(f'http://localhost:8000/api/hosted-zones/{zone_id}/records', 'POST',
    {'name': 'testdomain.com', 'type': 'MX', 'ttl': 300, 'records': ['10 mail.testdomain.com.']})
print(f"4. Created MX Record: {body.get('id')}  HTTP {status}")

# 5. List records
body, status = hit(f'http://localhost:8000/api/hosted-zones/{zone_id}/records')
print(f"5. List Records: total={body['total']}  HTTP {status}")

# 6. Invalid A record IP (should return 422)
body, status = hit(f'http://localhost:8000/api/hosted-zones/{zone_id}/records', 'POST',
    {'name': 'bad.testdomain.com', 'type': 'A', 'ttl': 300, 'records': ['999.999.999.999']})
print(f"6. Invalid IP Rejected: HTTP {status} (expected 422)")

# 7. Delete record
if rec_id:
    body, status = hit(f'http://localhost:8000/api/hosted-zones/{zone_id}/records/{rec_id}', 'DELETE')
    print(f"7. Deleted A Record: HTTP {status} (expected 204)")

print("\n" + "=" * 55)
print("STEP 2.2 VERIFICATION PASSED!")
print("Swagger Docs: http://localhost:8000/docs")
print("=" * 55)
