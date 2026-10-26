"""
CanteenIQ FastAPI Application Entrypoint
Wires routers, CORS middleware, database lifecycle, and OpenAPI specification.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import CORS_ORIGINS
from app.database.db import init_db
from app.api.routers import (
    health,
    datasets,
    analytics,
    models,
    planner,
    simulator,
    novelty,
    decisions,
    reports
)


# Ensure SQLite database tables are initialized
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="CanteenIQ Decision Support API",
    description="Intelligent institutional canteen sales analytics, demand forecasting, discrete-event queue simulation, and prescriptive decision-support loop.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global validation error handler for consistent JSON format
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "Invalid request parameter or payload structure.",
            "details": exc.errors()
        }
    )

import os
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Mount API Routers
app.include_router(health.router, prefix="/api")
app.include_router(datasets.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(models.router, prefix="/api")
app.include_router(planner.router, prefix="/api")
app.include_router(simulator.router, prefix="/api")
app.include_router(novelty.router, prefix="/api")
app.include_router(decisions.router, prefix="/api")
app.include_router(reports.router, prefix="/api")

# Serve Frontend static assets from frontend/dist
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Allow /docs and /openapi.json to reach FastAPI
        if full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "message": "Welcome to CanteenIQ Decision Support System API",
            "docs_url": "/docs",
            "health_check": "/api/health"
        }
