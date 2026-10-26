import os
import json
import shutil
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File
import pandas as pd

from app.core.config import SYNTHETIC_DATA_DIR, RAW_DATA_DIR, PROCESSED_DATA_DIR
from app.services.dataset_manager import load_dataset, get_dataset_path
from app.services.cleaner import DataCleaner
from app.database.db import save_dataset_metadata, list_datasets

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.get("")
def get_datasets():
    """Lists all available datasets with metadata."""
    datasets = []

    # Check synthetic dir
    for f in ["synthetic_transactions.csv", "synthetic_transactions_dirty.csv"]:
        path = SYNTHETIC_DATA_DIR / f
        if path.exists():
            df = load_dataset(f)
            manifest_file = SYNTHETIC_DATA_DIR / ("dataset_manifest.json" if "dirty" not in f else "dataset_manifest_dirty.json")
            cfg_hash = None
            if manifest_file.exists():
                with open(manifest_file, "r") as mf:
                    cfg_hash = json.load(mf).get("config_hash")

            datasets.append({
                "id": f,
                "name": "Benchmark Synthetic (Clean)" if "dirty" not in f else "Quality Challenge (Dirty)",
                "filename": f,
                "is_synthetic": True,
                "row_count": len(df),
                "config_hash": cfg_hash,
                "created_at": "2025-01-01T00:00:00"
            })

    # Check raw uploads
    if RAW_DATA_DIR.exists():
        for f in os.listdir(RAW_DATA_DIR):
            if f.endswith(".csv"):
                df = pd.read_csv(RAW_DATA_DIR / f)
                datasets.append({
                    "id": f,
                    "name": f"Uploaded: {f}",
                    "filename": f,
                    "is_synthetic": False,
                    "row_count": len(df),
                    "config_hash": None,
                    "created_at": "Uploaded"
                })

    return datasets


@router.get("/{dataset_id}/preview")
def preview_dataset(dataset_id: str, page: int = 1, page_size: int = 25):
    """Returns paginated preview rows and schema details."""
    df = load_dataset(dataset_id)
    if df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found or empty")

    total_rows = len(df)
    start_idx = (page - 1) * page_size
    end_idx = min(start_idx + page_size, total_rows)
    page_rows = df.iloc[start_idx:end_idx].fillna("").to_dict(orient="records")

    schema = [
        {"column": col, "dtype": str(df[col].dtype), "null_count": int(df[col].isna().sum())}
        for col in df.columns
    ]

    return {
        "dataset_id": dataset_id,
        "total_rows": total_rows,
        "page": page,
        "page_size": page_size,
        "schema": schema,
        "rows": page_rows
    }


@router.post("/{dataset_id}/clean")
def clean_dataset(dataset_id: str):
    """Runs the audit-trailed Data Studio cleaner and saves cleaned dataset."""
    df = load_dataset(dataset_id)
    if df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found")

    cleaner = DataCleaner(df)
    cleaned_df, quarantined_df, quality_report, log = cleaner.clean()

    # Save cleaned output
    out_name = f"cleaned_{dataset_id}"
    cleaned_path = PROCESSED_DATA_DIR / out_name
    cleaned_df.to_csv(cleaned_path, index=False)

    quarantine_name = f"quarantine_{dataset_id}"
    quarantined_path = PROCESSED_DATA_DIR / quarantine_name
    quarantined_df.to_csv(quarantined_path, index=False)

    return {
        "dataset_id": dataset_id,
        "cleaned_filename": out_name,
        "quarantined_filename": quarantine_name,
        "quality_report": quality_report,
        "transformation_log": log,
        "quarantined_sample": quarantined_df.head(20).fillna("").to_dict(orient="records")
    }


@router.get("/{dataset_id}/quality-score")
def get_quality_score(dataset_id: str):
    """Computes quality score breakdown without modifying data."""
    df = load_dataset(dataset_id)
    if df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found")

    cleaner = DataCleaner(df)
    _, _, quality_report, _ = cleaner.clean()
    return quality_report


@router.get("/{dataset_id}/lineage")
def get_data_lineage(dataset_id: str):
    """Returns data lineage trace (Raw -> Cleaning Steps -> Quarantined / Processed)."""
    df = load_dataset(dataset_id)
    cleaner = DataCleaner(df)
    _, quarantined_df, quality_report, log = cleaner.clean()

    nodes = [
        {"id": "raw", "label": f"Raw Dataset ({len(df)} rows)", "type": "input"},
        {"id": "cleaning", "label": "Data Studio Rule Engine", "type": "transform"},
        {"id": "quarantine", "label": f"Quarantine Table ({len(quarantined_df)} rows)", "type": "quarantine"},
        {"id": "processed", "label": f"Processed Analytics Data ({len(df) - len(quarantined_df)} rows)", "type": "output"}
    ]

    links = [
        {"source": "raw", "target": "cleaning"},
        {"source": "cleaning", "target": "quarantine"},
        {"source": "cleaning", "target": "processed"}
    ]

    return {
        "nodes": nodes,
        "links": links,
        "transformation_log": log,
        "quality_score": quality_report["overall_quality_score"]
    }


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Uploads external CSV dataset with schema validation."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    dest = RAW_DATA_DIR / file.filename
    with open(dest, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        df = pd.read_csv(dest)
        required = ["transaction_id", "transaction_date", "unit_price", "quantity"]
        missing = [c for c in required if c not in df.columns]
        if missing:
            os.remove(dest)
            raise HTTPException(status_code=422, detail=f"Uploaded CSV is missing mandatory columns: {missing}")

        return {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "row_count": len(df),
            "columns": list(df.columns)
        }
    except Exception as e:
        if dest.exists():
            os.remove(dest)
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")
