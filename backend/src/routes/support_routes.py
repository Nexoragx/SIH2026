"""
Support, Emergency & Schedule Endpoints for ANVAYA (SIH26094).
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from pymongo.database import Database
from pymongo import DESCENDING

from src.db.db import get_db
from src.middlewares.auth_middleware import get_optional_current_user, get_current_user
from src.services.support_service import SupportResourceService
from src.services.emergency_service import EmergencyService
from src.services.chat_service import ChatService

router = APIRouter(tags=["Support, Emergency & Scheduling"])


# --- Pydantic Schemas ---

class EmergencyDispatchRequest(BaseModel):
    case_id: Optional[str] = "CASE-SURVIVOR-CURRENT"
    location: Optional[str] = "District HQ / Registered Address"
    reason: Optional[str] = "Immediate Psychological Distress Intervention"
    caller_phone: Optional[str] = None


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    session_id: Optional[str] = None
    language: Optional[str] = "en"


class AlertCreateRequest(BaseModel):
    case_id: str
    category: str = "CRISIS"
    priority: str = "P0_CRITICAL"
    reason: str
    location: Optional[str] = None


# --- Endpoints ---

@router.get("/support/resources", summary="Get Verified Support & Helpline Directory")
def get_support_resources(
    category: Optional[str] = Query(None, description="Filter by category: mental_health, victim_support, emergency"),
    db: Database = Depends(get_db)
):
    """
    Returns list of verified government and institutional crisis resources (Tele-MANAS, NHAA, KIRAN, 108, NALSA).
    """
    SupportResourceService.seed_resources_if_empty(db)
    return SupportResourceService.get_all_resources(db=db, category=category)


@router.post("/emergency/dispatch", summary="Dispatch Emergency Intervention (SIH Demo Mode)")
def dispatch_emergency(
    payload: EmergencyDispatchRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Database = Depends(get_db)
):
    """
    Simulates emergency 108 response in safe DEMO MODE for SIH judging.
    Records request, creates observer alert, and logs dispatch without triggering real telephone dialers.
    """
    case_id = payload.case_id or (current_user.get("id") if current_user else "ANONYMOUS_CASE")
    phone = payload.caller_phone or (current_user.get("phone") if current_user else None)
    
    return EmergencyService.dispatch_emergency(
        case_id=case_id,
        location=payload.location or "Registered Victim Location",
        reason=payload.reason or "Critical Atrocity Survivor Safeguard",
        caller_phone=phone,
        db=db
    )


@router.post("/chat/message", summary="Empathetic Support Chatbot Message")
def chat_message(
    payload: ChatMessageRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Database = Depends(get_db)
):
    """
    Receives text message from victim, evaluates safety flags (self-harm, threats, suicide),
    and returns supportive, non-clinical companionship.
    """
    user_id = current_user.get("id") if current_user else None
    return ChatService.process_message(
        message=payload.message,
        user_id=user_id,
        session_id=payload.session_id,
        language=payload.language or "en",
        db=db
    )


@router.get("/checkins/schedule", summary="Get Periodic Check-in Schedule & Cadence")
def get_checkin_schedule(
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Database = Depends(get_db)
):
    """
    Returns adaptive check-in schedule (e.g. in 3, 7, or 14 days) based on recent distress level,
    along with completed sessions count and next due date.
    """
    user_id = current_user.get("id") if current_user else None
    now = datetime.now(timezone.utc)

    interval_days = 7  # default moderate cadence
    last_score = None
    completed_count = 0

    if user_id:
        try:
            reports = list(db.interview_reports.find({"victim_id": user_id}).sort("created_at", DESCENDING))
            completed_count = len(reports)
            if reports:
                last_score = reports[0].get("distress_score")
                if last_score and last_score >= 70:
                    interval_days = 3
                elif last_score and last_score <= 30:
                    interval_days = 14
        except Exception:
            pass

    next_due = now + timedelta(days=interval_days)

    return {
        "interval_days": interval_days,
        "cadence_label": f"Every {interval_days} days" if interval_days != 7 else "Weekly (7 days)",
        "next_due_date": next_due.strftime("%A, %d %b %Y"),
        "days_remaining": interval_days,
        "completed_sessions": completed_count,
        "status": "SCHEDULED",
        "can_start_early": True
    }


@router.get("/alerts", summary="Get Active System Alerts")
def get_alerts(
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Database = Depends(get_db)
):
    """
    Returns active alerts for the Health Observer dashboard.
    """
    query = {}
    if status:
        query["status"] = status
    cursor = db.alerts.find(query).sort("created_at", DESCENDING).limit(limit)
    alerts = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        if isinstance(doc.get("created_at"), datetime):
            doc["created_at"] = doc["created_at"].isoformat()
        alerts.append(doc)
    return {"alerts": alerts, "total": len(alerts)}


@router.post("/alerts", summary="Create Crisis Alert")
def create_alert(
    payload: AlertCreateRequest,
    db: Database = Depends(get_db)
):
    """
    Manually creates or records a crisis alert from the victim UI.
    """
    now = datetime.now(timezone.utc)
    doc = {
        "alert_id": f"ALT-{datetime.now().strftime('%H%M%S')}",
        "case_id": payload.case_id,
        "category": payload.category,
        "priority": payload.priority,
        "reason": payload.reason,
        "location": payload.location or "Not specified",
        "status": "OPEN",
        "created_at": now
    }
    res = db.alerts.insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    doc["created_at"] = now.isoformat()
    return {"success": True, "alert": doc}
