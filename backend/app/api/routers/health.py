from fastapi import APIRouter
from datetime import datetime

router = APIRouter(tags=["Health"])


@router.get("/health")
def check_health():
    return {
        "status": "healthy",
        "service": "CanteenIQ Decision Support API",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "mode": "Offline Local Decision Loop"
    }
