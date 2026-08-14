"""
FastAPI Application Entry Point
---------------------------------
Decision: main.py only handles:
  1. App factory (FastAPI instance + metadata)
  2. Lifespan event (DB init on startup)
  3. CORS middleware
  4. Router registration

All business logic lives in services/. All validation in schemas/.
This keeps main.py clean and scannable in <60 lines.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import init_db
from backend.seed_db import auto_seed_if_empty
from backend.routers import auth, hosted_zones, records, bind


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: Initialize SQLite database tables and auto-seed if empty.
    Shutdown: (nothing needed — aiosqlite handles connection cleanup).
    
    Decision: asynccontextmanager lifespan replaces deprecated @app.on_event("startup").
    This is the FastAPI 0.93+ recommended pattern.
    """
    await init_db()
    try:
        await auto_seed_if_empty()
    except Exception as e:
        print(f"Failed to auto-seed database: {e}")
    yield


app = FastAPI(
    title="AWS Route53 Clone API",
    description=(
        "A functional clone of the AWS Route53 DNS management service. "
        "Supports Hosted Zone CRUD and DNS Record management (A, AAAA, CNAME, MX, TXT, NS, PTR, SRV, CAA) "
        "with RFC 1035-compliant field validation."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS — restrict origins to local development and specific Vercel production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://assignment-aws-route53clone.vercel.app",
        "https://assignment-aws-route53-clone-one.vercel.app",
        "https://aws-route53-clone-likhit.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(hosted_zones.router)
app.include_router(records.router)
app.include_router(bind.router)


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "service": "AWS Route53 Clone API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }
