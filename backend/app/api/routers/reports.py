import os
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse

from app.core.config import REPORTS_DIR
from app.services.reports import ReportGenerator

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("/generate")
def generate_report(
    report_type: str = Query("excel", pattern="^(excel|pdf|docx|pptx)$"),
    dataset_id: str = Query("synthetic_transactions.csv")
):
    """Generates official CanteenIQ report deliverables (Excel, PDF, Word, PowerPoint)."""
    gen = ReportGenerator(dataset_id=dataset_id)

    if report_type == "excel":
        path = gen.generate_excel_workbook()
    elif report_type == "pdf":
        path = gen.generate_pdf_report()
    elif report_type == "docx":
        path = gen.generate_docx_academic_report()
    else: # pptx
        path = gen.generate_pptx_presentation()

    return {
        "report_type": report_type,
        "filename": path.name,
        "message": f"Report '{path.name}' generated successfully.",
        "download_url": f"/api/reports/{path.name}/download"
    }


@router.get("")
def list_generated_reports():
    """Lists all available reports in outputs directory."""
    files = []
    if REPORTS_DIR.exists():
        for f in os.listdir(REPORTS_DIR):
            f_path = REPORTS_DIR / f
            if f_path.is_file():
                files.append({
                    "filename": f,
                    "size_bytes": os.path.getsize(f_path),
                    "modified_time": os.path.getmtime(f_path),
                    "download_url": f"/api/reports/{f}/download"
                })
    return files


@router.get("/{filename}/download")
def download_report(filename: str):
    """Downloads a generated report file."""
    # Prevent path traversal
    safe_filename = os.path.basename(filename)
    f_path = REPORTS_DIR / safe_filename
    if not f_path.exists():
        raise HTTPException(status_code=404, detail="Requested report file does not exist")

    media_types = {
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".pdf": "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    }
    ext = os.path.splitext(safe_filename)[1].lower()
    media_type = media_types.get(ext, "application/octet-stream")

    return FileResponse(
        path=str(f_path),
        filename=safe_filename,
        media_type=media_type
    )
