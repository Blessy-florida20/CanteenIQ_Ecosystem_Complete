"""
CanteenIQ Configuration Settings
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"
SYNTHETIC_DATA_DIR = DATA_DIR / "synthetic"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
RAW_DATA_DIR = DATA_DIR / "raw"
OUTPUTS_DIR = BASE_DIR / "outputs"
REPORTS_DIR = OUTPUTS_DIR / "reports"
MODELS_DIR = BASE_DIR / "models"
DB_PATH = DATA_DIR / "metadata.db"

# Ensure all directories exist
for d in [DATA_DIR, SYNTHETIC_DATA_DIR, PROCESSED_DATA_DIR, RAW_DATA_DIR, OUTPUTS_DIR, REPORTS_DIR, MODELS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]
