# AWS Route 53 Console Clone

A full-stack, pixel-perfect clone of the **AWS Route 53 Web Console** built with **Next.js 14**, **FastAPI**, and **SQLite**. Recreates the authentic Route 53 user workflows, table UI, search/filtering, modals, green success notifications, BIND zone import/export, and session management.

---

## 🚀 Getting Started

### Quick Start (Automated Windows Launcher)
Double-click `start_dev.bat` in the root directory:
```cmd
start_dev.bat
```
This script automatically clears ports `8000` and `3000`, starts the FastAPI backend, and launches the Next.js frontend server.

### Manual Launch

#### 1. Backend Setup (FastAPI + SQLite)
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- **Backend API**: `http://localhost:8000`
- **Swagger Interactive API Documentation**: `http://localhost:8000/docs`

#### 2. Frontend Setup (Next.js 14)
```bash
cd frontend
npm install
npm run dev
```
- **Frontend App**: `http://localhost:3000`

---

## 🏗️ Architecture Overview

```
                        ┌─────────────────────────────────────┐
                        │      Next.js 14 Frontend            │
                        │  (TypeScript, Tailwind CSS, Lucide) │
                        └──────────────────┬──────────────────┘
                                           │  REST API Calls
                                           ▼
                        ┌─────────────────────────────────────┐
                        │        FastAPI Backend              │
                        │     (Python, Pydantic v2)           │
                        └──────────────────┬──────────────────┘
                                           │  Async SQLAlchemy
                                           ▼
                        ┌─────────────────────────────────────┐
                        │         SQLite Database             │
                        │          (route53.db)               │
                        └─────────────────────────────────────┘
```

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide icons, custom AWS UI components matching AWS Console v2.
- **Backend**: FastAPI with async SQLAlchemy 2.0 and Pydantic schemas enforcing RFC 1035 domain name validation.
- **Database**: SQLite (`route53.db`) with foreign key enforcement and WAL mode for maximum reliability.

---

## 🗄️ Database Schema

```sql
-- Hosted Zones Table
CREATE TABLE hosted_zones (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    caller_reference VARCHAR(64) UNIQUE NOT NULL,
    description TEXT,
    zone_type VARCHAR(16) NOT NULL DEFAULT 'Public',
    vpcs JSON,
    record_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DNS Records Table
CREATE TABLE dns_records (
    id VARCHAR(32) PRIMARY KEY,
    hosted_zone_id VARCHAR(32) NOT NULL REFERENCES hosted_zones(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(16) NOT NULL,
    ttl INTEGER NOT NULL DEFAULT 300,
    records JSON NOT NULL,
    routing_policy VARCHAR(32) NOT NULL DEFAULT 'Simple',
    weight INTEGER,
    region VARCHAR(32),
    health_check_id VARCHAR(64),
    set_identifier VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/hosted-zones` | List all hosted zones (supports search, filter, pagination) |
| `POST` | `/api/hosted-zones` | Create a new hosted zone (seeds default NS + SOA records) |
| `GET` | `/api/hosted-zones/{id}` | Retrieve details of a hosted zone |
| `PUT` | `/api/hosted-zones/{id}` | Update description of a hosted zone |
| `DELETE` | `/api/hosted-zones/{id}` | Delete a hosted zone and all child records (CASCADE) |
| `GET` | `/api/hosted-zones/{id}/records` | List DNS records within a hosted zone |
| `POST` | `/api/hosted-zones/{id}/records` | Create a new DNS record (`A`, `AAAA`, `CNAME`, `MX`, `TXT`, `NS`, `PTR`, `SRV`, `CAA`) |
| `PUT` | `/api/hosted-zones/{id}/records/{rec_id}` | Update TTL, values, or routing policy of a DNS record |
| `DELETE` | `/api/hosted-zones/{id}/records/{rec_id}` | Delete a DNS record |
| `POST` | `/api/hosted-zones/{id}/import-bind` | Import DNS records from BIND zone file content |
| `GET` | `/api/hosted-zones/{id}/export-bind` | Export hosted zone as a standard BIND zone file |
| `GET` | `/api/hosted-zones/{id}/export-json` | Export hosted zone as a JSON document |

---

## ⭐ Bonus & Advanced Features

1. **BIND Import & Export**: Import records directly from BIND zone files and export zones in BIND or JSON format.
2. **AWS Modal Security**: Delete confirmation modals require typing `delete` before enabling execution.
3. **Keyboard Shortcuts**: Press `Alt+S`, `/`, or `Ctrl+K` from anywhere in the console to instantly focus top header search.
4. **Auto-seeded DNS Records**: Creating a zone automatically provisions default `NS` (with 4 nameservers) and `SOA` records.
5. **Bulk Operations**: Bulk checkbox selection and bulk deletion for zones and records.
